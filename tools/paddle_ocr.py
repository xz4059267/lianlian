import contextlib
import json
import math
import os
import re
import sys
import tempfile
import time


OCR_INSTANCE = None


def to_plain(value):
    if hasattr(value, "tolist"):
        return value.tolist()
    if isinstance(value, dict):
        return {key: to_plain(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [to_plain(item) for item in value]
    return value


def result_to_dict(result):
    result = to_plain(result)
    if isinstance(result, dict):
        if isinstance(result.get("res"), dict):
            return result["res"]
        return result

    for attr in ("json", "res"):
        value = getattr(result, attr, None)
        if callable(value):
            value = value()
        value = to_plain(value)
        if isinstance(value, dict):
            if isinstance(value.get("res"), dict):
                return value["res"]
            return value

    if hasattr(result, "__dict__"):
        return to_plain(result.__dict__)
    return {}


def box_from_poly(poly):
    points = to_plain(poly)
    if not isinstance(points, list):
        return None

    xs = []
    ys = []
    for point in points:
        if isinstance(point, (list, tuple)) and len(point) >= 2:
            x = as_number(point[0])
            y = as_number(point[1])
            if x is not None and y is not None:
                xs.append(x)
                ys.append(y)

    if not xs or not ys:
        return None
    left = min(xs)
    top = min(ys)
    right = max(xs)
    bottom = max(ys)
    return box_from_edges(left, top, right, bottom)


def box_from_edges(left, top, right, bottom):
    values = [left, top, right, bottom]
    if not all(isinstance(value, (int, float)) and math.isfinite(value) for value in values):
        return None

    x = max(0, int(math.floor(left)))
    y = max(0, int(math.floor(top)))
    w = int(math.ceil(right - left))
    h = int(math.ceil(bottom - top))
    if w <= 0 or h <= 0:
        return None
    return {"x": x, "y": y, "w": w, "h": h}


def as_number(value):
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return number if math.isfinite(number) else None


def normalize_from_prediction(prediction):
    data = result_to_dict(prediction)
    texts = data.get("rec_texts") or data.get("texts") or []
    boxes = data.get("rec_boxes") or data.get("dt_boxes") or data.get("boxes") or []
    polys = data.get("rec_polys") or data.get("dt_polys") or []

    blocks = []
    for index, text in enumerate(texts):
        text = str(text or "").strip()
        if not text:
            continue

        box = None
        if index < len(boxes):
            raw_box = to_plain(boxes[index])
            if isinstance(raw_box, list) and len(raw_box) >= 4 and all(as_number(item) is not None for item in raw_box[:4]):
                left, top, right, bottom = [as_number(item) for item in raw_box[:4]]
                box = box_from_edges(left, top, right, bottom)
            else:
                box = box_from_poly(raw_box)

        if box is None and index < len(polys):
            box = box_from_poly(polys[index])

        if box is not None:
            blocks.append({"text": text, **box})

    return blocks


def normalize_from_legacy(result):
    plain = to_plain(result)
    pages = plain if isinstance(plain, list) else []
    blocks = []

    for page in pages:
        lines = page if isinstance(page, list) else []
        for line in lines:
            if not isinstance(line, list) or len(line) < 2:
                continue
            box = box_from_poly(line[0])
            text_info = line[1]
            text = ""
            if isinstance(text_info, (list, tuple)) and text_info:
                text = str(text_info[0] or "").strip()
            elif isinstance(text_info, str):
                text = text_info.strip()
            if text and box is not None:
                blocks.append({"text": text, **box})

    return blocks


def configure_environment():
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    cache_root = os.path.join(
        os.environ.get("LOCALAPPDATA") or tempfile.gettempdir(),
        "LianLianWrongbook",
    )
    os.environ.setdefault("PADDLEOCR_HOME", os.path.join(cache_root, "paddleocr"))
    os.environ.setdefault("PADDLE_PDX_CACHE_HOME", os.path.join(project_root, ".paddlex-onnx"))
    os.environ.setdefault("PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK", "True")
    os.environ.setdefault("PADDLE_PDX_MODEL_SOURCE", "BOS")
    # ONNX Runtime avoids the Paddle static-model loader failures seen on
    # Windows while keeping the detector and recognizer resident in memory.


def get_ocr():
    global OCR_INSTANCE
    if OCR_INSTANCE is not None:
        return OCR_INSTANCE

    configure_environment()
    detection_model = os.environ.get("OCR_DETECTION_MODEL", "PP-OCRv6_tiny_det")
    recognition_model = os.environ.get("OCR_RECOGNITION_MODEL", "PP-OCRv6_tiny_rec")

    with contextlib.redirect_stdout(sys.stderr):
        from paddleocr import TextDetection, TextRecognition

        common_options = dict(
            device="cpu",
            engine="onnxruntime",
            cpu_threads=8,
        )
        OCR_INSTANCE = {
            "detector": TextDetection(
                model_name=detection_model,
                limit_side_len=int(os.environ.get("OCR_DETECTION_MAX_SIDE", "1800")),
                limit_type="max",
                **common_options,
            ),
            "recognizer": TextRecognition(
                model_name=recognition_model,
                **common_options,
            ),
        }

    return OCR_INSTANCE


def prediction_polys(predictions):
    polys = []
    for prediction in predictions:
        data = result_to_dict(prediction)
        for poly in to_plain(data.get("dt_polys") or []):
            box = box_from_poly(poly)
            if box is not None:
                polys.append(box)
    return polys


def group_detection_boxes_into_lines(boxes, image_width):
    ordered = sorted(boxes, key=lambda box: (box["y"] + box["h"] / 2, box["x"]))
    rows = []
    for box in ordered:
        center_y = box["y"] + box["h"] / 2
        target = None
        for row in reversed(rows[-5:]):
            tolerance = max(4, min(row["averageHeight"], box["h"]) * 0.65)
            if abs(center_y - row["centerY"]) <= tolerance:
                target = row
                break
        if target is None:
            rows.append({"boxes": [box], "centerY": center_y, "averageHeight": box["h"]})
            continue
        target["boxes"].append(box)
        target["centerY"] = sum(item["y"] + item["h"] / 2 for item in target["boxes"]) / len(target["boxes"])
        target["averageHeight"] = sum(item["h"] for item in target["boxes"]) / len(target["boxes"])

    lines = []
    max_join_gap = max(12, image_width * 0.045)
    for row in rows:
        segments = []
        current = []
        for box in sorted(row["boxes"], key=lambda item: item["x"]):
            current_right = max((item["x"] + item["w"] for item in current), default=box["x"])
            if current and box["x"] - current_right > max_join_gap:
                segments.append(current)
                current = []
            current.append(box)
        if current:
            segments.append(current)
        for segment in segments:
            left = min(item["x"] for item in segment)
            top = min(item["y"] for item in segment)
            right = max(item["x"] + item["w"] for item in segment)
            bottom = max(item["y"] + item["h"] for item in segment)
            lines.append({"x": left, "y": top, "w": right - left, "h": bottom - top})
    return sorted(lines, key=lambda line: (line["y"], line["x"]))


def select_question_number_lines(lines, image_width, image_height):
    if not lines:
        return [], 0
    lefts = sorted(line["x"] for line in lines)
    content_left = lefts[min(len(lefts) - 1, max(0, int(len(lefts) * 0.12)))]
    number_column_right = content_left + max(42, image_width * 0.07)
    candidates = [line for line in lines if line["x"] <= number_column_right]
    # Never discard ordinary left-column rows merely to meet a fixed quota.
    # A hard cap only protects against pathological non-document images.
    safety_limit = max(32, int(os.environ.get("OCR_ANCHOR_SAFETY_LIMIT", "64")))
    if len(candidates) > safety_limit:
        bin_height = max(1, image_height / float(safety_limit))
        sampled = []
        for bin_index in range(safety_limit):
            top = bin_index * bin_height
            bottom = image_height if bin_index == safety_limit - 1 else (bin_index + 1) * bin_height
            in_bin = [line for line in candidates if top <= line["y"] + line["h"] / 2 < bottom]
            if in_bin:
                sampled.append(max(in_bin, key=lambda line: line["w"]))
        candidates = sampled
    return sorted(candidates, key=lambda line: (line["y"], line["x"])), content_left


def recognized_text(prediction):
    data = result_to_dict(prediction)
    value = data.get("rec_text")
    if isinstance(value, list):
        value = value[0] if value else ""
    text = repair_gbk_mojibake(str(value or "").strip())
    # A tiny printed dot is occasionally dropped while the number and stem
    # are read correctly. Restore only the unambiguous line-start form; the
    # server still applies its natural-language and left-column validation.
    return re.sub(r"^(\d{1,3})\s*(?=[\u4e00-\u9fff\"'\u201c])", r"\1. ", text)


def repair_gbk_mojibake(text):
    """Repair PP-OCR ONNX text returned as Latin-1-rendered GBK bytes."""
    if not text or re.search(r"[\u4e00-\u9fff]", text):
        return text
    if not re.search(r"[\u0080-\u00ff]", text):
        return text
    try:
        repaired = text.encode("latin1").decode("gbk")
    except (UnicodeEncodeError, UnicodeDecodeError):
        return text
    return repaired if re.search(r"[\u4e00-\u9fff]", repaired) else text


def crop_line_strip(image, line, content_left, width_ratio):
    from PIL import Image
    import numpy as np

    image_width, image_height = image.size
    pad_x = max(4, int(line["h"] * 0.3))
    pad_y = max(3, int(line["h"] * 0.2))
    left = max(0, min(line["x"] - pad_x, content_left - int(image_width * 0.012)))
    top = max(0, line["y"] - pad_y)
    right = min(
        image_width,
        line["x"] + line["w"] + pad_x,
        left + max(80, int(image_width * width_ratio)),
    )
    bottom = min(image_height, line["y"] + line["h"] + pad_y)
    crop = image.crop((left, top, right, bottom))
    if crop.height < 32:
        scale = 32 / float(max(1, crop.height))
        crop = crop.resize((max(1, int(round(crop.width * scale))), 32), Image.Resampling.BICUBIC)
    return np.asarray(crop)


def needs_wide_anchor_refinement(text):
    value = str(text or "").strip()
    if not value or re.match(r"^[\uFF08(]\s*\d+\s*[\uFF09)]", value):
        return False
    if not re.match(r"^(?:\u7b2c\s*)?\d{1,3}(?:\s*\u9898|[.\uFF0E\u3001:]|\s|$|(?=[\u4e00-\u9fff]))", value):
        return False
    chinese_count = len(re.findall(r"[\u4e00-\u9fff]", value))
    return chinese_count < 3 or len(value) < 8


def run_anchor_ocr(ocr, image_path):
    from PIL import Image
    import numpy as np

    detection_started_at = time.perf_counter()
    with contextlib.redirect_stdout(sys.stderr):
        detection_predictions = ocr["detector"].predict(image_path)
    detection_ms = int((time.perf_counter() - detection_started_at) * 1000)
    detected_boxes = prediction_polys(detection_predictions)
    image = Image.open(image_path).convert("RGB")
    image_width, image_height = image.size
    lines = group_detection_boxes_into_lines(detected_boxes, image_width)
    candidates, content_left = select_question_number_lines(lines, image_width, image_height)

    # Pass one reads only the number column. This keeps every candidate row
    # cheap; rows that look numbered are the only ones expanded in pass two.
    prefix_ratio = float(os.environ.get("OCR_ANCHOR_PREFIX_RATIO", "0.055"))
    prefix_crops = [crop_line_strip(image, line, content_left, prefix_ratio) for line in candidates]
    texts = []
    recognition_started_at = time.perf_counter()
    if prefix_crops:
        with contextlib.redirect_stdout(sys.stderr):
            recognition_predictions = ocr["recognizer"].predict(
                prefix_crops,
                batch_size=min(16, len(prefix_crops)),
            )
        texts = [recognized_text(prediction) for prediction in recognition_predictions]

    refinement_indexes = [
        index for index, text in enumerate(texts) if needs_wide_anchor_refinement(text)
    ]
    if refinement_indexes:
        wide_ratio = float(os.environ.get("OCR_ANCHOR_WIDE_RATIO", "0.26"))
        wide_crops = [
            crop_line_strip(image, candidates[index], content_left, wide_ratio)
            for index in refinement_indexes
        ]
        with contextlib.redirect_stdout(sys.stderr):
            wide_predictions = ocr["recognizer"].predict(
                wide_crops,
                batch_size=min(8, len(wide_crops)),
            )
        wide_texts = [recognized_text(prediction) for prediction in wide_predictions]
        for result_index, candidate_index in enumerate(refinement_indexes):
            if result_index < len(wide_texts) and wide_texts[result_index]:
                texts[candidate_index] = wide_texts[result_index]
    recognition_ms = int((time.perf_counter() - recognition_started_at) * 1000)
    image.close()

    candidate_text = {id(line): texts[index] if index < len(texts) else "" for index, line in enumerate(candidates)}
    blocks = []
    for line in lines:
        # Geometry-only rows still participate in crop completeness checks. The
        # neutral marker cannot be mistaken for a question number.
        text = candidate_text.get(id(line)) or "内容区域"
        blocks.append({"text": text, **line})
    return blocks, len(detected_boxes), len(candidates), len(refinement_indexes), detection_ms, recognition_ms


def prepare_ocr_image(image_path, max_side):
    from PIL import Image

    max_side = int(max_side or 1800)
    image = Image.open(image_path)
    width, height = image.size
    longest = max(width, height)
    if max_side <= 0 or longest <= max_side:
        image.close()
        return image_path, width, height, width, height, None

    scale = max_side / float(longest)
    ocr_width = max(1, int(round(width * scale)))
    ocr_height = max(1, int(round(height * scale)))
    resized = image.convert("RGB").resize((ocr_width, ocr_height), Image.Resampling.LANCZOS)
    temp_file = tempfile.NamedTemporaryFile(prefix="lian-ocr-resized-", suffix=".jpg", delete=False)
    temp_path = temp_file.name
    temp_file.close()
    resized.save(temp_path, "JPEG", quality=92)
    resized.close()
    image.close()
    return temp_path, width, height, ocr_width, ocr_height, temp_path


def scale_blocks(blocks, scale_x, scale_y, original_width, original_height):
    scaled = []
    for block in blocks:
        x = int(round(block["x"] * scale_x))
        y = int(round(block["y"] * scale_y))
        w = int(round(block["w"] * scale_x))
        h = int(round(block["h"] * scale_y))
        x = max(0, min(x, original_width))
        y = max(0, min(y, original_height))
        w = max(1, min(w, original_width - x))
        h = max(1, min(h, original_height - y))
        scaled.append({"text": block["text"], "x": x, "y": y, "w": w, "h": h})
    return scaled


def run_ocr(image_path, max_side=None):
    started_at = time.perf_counter()
    ocr = get_ocr()
    max_side = max_side or int(os.environ.get("OCR_MAX_SIDE", "1800"))
    ocr_path, original_width, original_height, ocr_width, ocr_height, cleanup_path = prepare_ocr_image(image_path, max_side)

    try:
        blocks, detected_count, recognized_line_count, refined_line_count, detection_ms, recognition_ms = run_anchor_ocr(ocr, ocr_path)
    finally:
        if cleanup_path:
            with contextlib.suppress(OSError):
                os.remove(cleanup_path)

    if ocr_width != original_width or ocr_height != original_height:
        blocks = scale_blocks(
            blocks,
            original_width / float(ocr_width),
            original_height / float(ocr_height),
            original_width,
            original_height,
        )

    blocks.sort(key=lambda block: (block["y"], block["x"]))
    return {
        "blocks": blocks,
        "resized": ocr_width != original_width or ocr_height != original_height,
        "originalSize": {"width": original_width, "height": original_height},
        "ocrSize": {"width": ocr_width, "height": ocr_height},
        "detectedLineCount": detected_count,
        "recognizedLineCount": recognized_line_count,
        "refinedLineCount": refined_line_count,
        "detectionMs": detection_ms,
        "recognitionMs": recognition_ms,
        "elapsedMs": int((time.perf_counter() - started_at) * 1000),
    }


def run_server():
    get_ocr()
    print(json.dumps({"ready": True}, ensure_ascii=False), flush=True)
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        request_id = None
        try:
            request = json.loads(line)
            request_id = request.get("id")
            result = run_ocr(request["imagePath"], request.get("maxSide"))
            result["id"] = request_id
            print(json.dumps(result, ensure_ascii=False), flush=True)
        except Exception as error:
            print(
                json.dumps(
                    {
                        "id": request_id,
                        "error": str(error),
                    },
                    ensure_ascii=False,
                ),
                flush=True,
            )


def main():
    if len(sys.argv) >= 2 and sys.argv[1] == "--server":
        run_server()
        return

    if len(sys.argv) < 2:
        print(json.dumps({"blocks": []}, ensure_ascii=False))
        return

    image_path = sys.argv[1]
    print(json.dumps(run_ocr(image_path), ensure_ascii=False))


if __name__ == "__main__":
    main()
