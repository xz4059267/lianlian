import contextlib
import json
import math
import os
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
    cache_root = os.path.join(
        os.environ.get("LOCALAPPDATA") or tempfile.gettempdir(),
        "LianLianWrongbook",
    )
    os.environ.setdefault("PADDLEOCR_HOME", os.path.join(cache_root, "paddleocr"))
    os.environ.setdefault("PADDLE_PDX_CACHE_HOME", os.path.join(cache_root, "paddlex"))
    os.environ.setdefault("FLAGS_use_onednn", "0")
    os.environ.setdefault("FLAGS_use_mkldnn", "0")


def get_ocr():
    global OCR_INSTANCE
    if OCR_INSTANCE is not None:
        return OCR_INSTANCE

    configure_environment()
    ocr_version = os.environ.get("OCR_VERSION", "PP-OCRv4")
    ocr_lang = os.environ.get("OCR_LANG", "ch")

    with contextlib.redirect_stdout(sys.stderr):
        from paddleocr import PaddleOCR

        # use_textline_orientation=False is PaddleOCR 3.x's equivalent of use_angle_cls=False.
        OCR_INSTANCE = PaddleOCR(
            lang=ocr_lang,
            ocr_version=ocr_version,
            use_doc_orientation_classify=False,
            use_doc_unwarping=False,
            use_textline_orientation=False,
            device="cpu",
            engine="paddle_static",
            enable_mkldnn=False,
            cpu_threads=4,
            enable_cinn=False,
            engine_config={
                "paddle_static": {
                    "run_mode": "paddle",
                    "device_type": "cpu",
                    "device_id": None,
                    "cpu_threads": 4,
                    "enable_new_ir": False,
                    "enable_cinn": False,
                    "delete_pass": [],
                    "mkldnn_cache_capacity": 1,
                }
            },
        )

    return OCR_INSTANCE


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
        if hasattr(ocr, "predict"):
            with contextlib.redirect_stdout(sys.stderr):
                predictions = ocr.predict(ocr_path)
            blocks = []
            for prediction in predictions:
                blocks.extend(normalize_from_prediction(prediction))
        else:
            with contextlib.redirect_stdout(sys.stderr):
                legacy_result = ocr.ocr(ocr_path, cls=False)
            blocks = normalize_from_legacy(legacy_result)
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
