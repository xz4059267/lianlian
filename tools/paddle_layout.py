import contextlib
import json
import math
import os
import sys
import tempfile
import time


LAYOUT_INSTANCE = None


def to_plain(value):
    if hasattr(value, "tolist"):
        return value.tolist()
    if isinstance(value, dict):
        return {key: to_plain(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [to_plain(item) for item in value]
    return value


def result_to_dict(result):
    for attr in ("json", "res"):
        value = getattr(result, attr, None)
        if callable(value):
            value = value()
        value = to_plain(value)
        if isinstance(value, dict):
            return value.get("res") if isinstance(value.get("res"), dict) else value
    value = to_plain(result)
    if isinstance(value, dict):
        return value.get("res") if isinstance(value.get("res"), dict) else value
    return {}


def as_number(value):
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return number if math.isfinite(number) else None


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
    os.environ.setdefault("FLAGS_use_onednn", "0")
    os.environ.setdefault("FLAGS_use_mkldnn", "0")


def get_layout():
    global LAYOUT_INSTANCE
    if LAYOUT_INSTANCE is not None:
        return LAYOUT_INSTANCE

    configure_environment()
    model_name = os.environ.get("LAYOUT_MODEL", "PP-DocLayoutV2")
    with contextlib.redirect_stdout(sys.stderr):
        from paddleocr import LayoutDetection

        LAYOUT_INSTANCE = LayoutDetection(
            model_name=model_name,
            device="cpu",
            engine="onnxruntime",
            enable_hpi=False,
            cpu_threads=int(os.environ.get("LAYOUT_CPU_THREADS", "6")),
            threshold=float(os.environ.get("LAYOUT_THRESHOLD", "0.24")),
            layout_nms=True,
        )
    return LAYOUT_INSTANCE


def prepare_layout_image(image_path, max_side):
    from PIL import Image

    image = Image.open(image_path)
    width, height = image.size
    longest = max(width, height)
    if max_side <= 0 or longest <= max_side:
        image.close()
        return image_path, width, height, width, height, None

    scale = max_side / float(longest)
    layout_width = max(1, int(round(width * scale)))
    layout_height = max(1, int(round(height * scale)))
    resized = image.convert("RGB").resize(
        (layout_width, layout_height),
        Image.Resampling.LANCZOS,
    )
    temp_file = tempfile.NamedTemporaryFile(
        prefix="lian-layout-resized-",
        suffix=".jpg",
        delete=False,
    )
    temp_path = temp_file.name
    temp_file.close()
    resized.save(temp_path, "JPEG", quality=92)
    resized.close()
    image.close()
    return temp_path, width, height, layout_width, layout_height, temp_path


def normalize_regions(predictions, scale_x, scale_y, original_width, original_height):
    regions = []
    for prediction in predictions:
        data = result_to_dict(prediction)
        for raw_box in data.get("boxes") or []:
            coordinate = to_plain(raw_box.get("coordinate") or raw_box.get("bbox") or [])
            if not isinstance(coordinate, list) or len(coordinate) < 4:
                continue
            left, top, right, bottom = [as_number(item) for item in coordinate[:4]]
            if None in (left, top, right, bottom):
                continue
            left = max(0, min(original_width, int(math.floor(left * scale_x))))
            top = max(0, min(original_height, int(math.floor(top * scale_y))))
            right = max(left + 1, min(original_width, int(math.ceil(right * scale_x))))
            bottom = max(top + 1, min(original_height, int(math.ceil(bottom * scale_y))))
            regions.append(
                {
                    "label": str(raw_box.get("label") or "unknown"),
                    "score": float(raw_box.get("score") or 0),
                    "x": left,
                    "y": top,
                    "w": right - left,
                    "h": bottom - top,
                }
            )
    return sorted(regions, key=lambda region: (region["y"], region["x"]))


def run_layout(image_path, max_side=None):
    started_at = time.perf_counter()
    model = get_layout()
    max_side = int(max_side or os.environ.get("LAYOUT_MAX_SIDE", "1600"))
    (
        layout_path,
        original_width,
        original_height,
        layout_width,
        layout_height,
        cleanup_path,
    ) = prepare_layout_image(image_path, max_side)

    inference_started_at = time.perf_counter()
    try:
        with contextlib.redirect_stdout(sys.stderr):
            predictions = model.predict(layout_path, batch_size=1)
    finally:
        if cleanup_path:
            with contextlib.suppress(OSError):
                os.remove(cleanup_path)
    inference_ms = int((time.perf_counter() - inference_started_at) * 1000)
    regions = normalize_regions(
        predictions,
        original_width / float(layout_width),
        original_height / float(layout_height),
        original_width,
        original_height,
    )
    return {
        "regions": regions,
        "resized": layout_width != original_width or layout_height != original_height,
        "originalSize": {"width": original_width, "height": original_height},
        "layoutSize": {"width": layout_width, "height": layout_height},
        "inferenceMs": inference_ms,
        "elapsedMs": int((time.perf_counter() - started_at) * 1000),
    }


def run_server():
    get_layout()
    print(json.dumps({"ready": True}, ensure_ascii=False), flush=True)
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        request_id = None
        try:
            request = json.loads(line)
            request_id = request.get("id")
            result = run_layout(request["imagePath"], request.get("maxSide"))
            result["id"] = request_id
            print(json.dumps(result, ensure_ascii=False), flush=True)
        except Exception as error:
            print(
                json.dumps({"id": request_id, "error": str(error)}, ensure_ascii=False),
                flush=True,
            )


def main():
    if len(sys.argv) >= 2 and sys.argv[1] == "--server":
        run_server()
        return
    if len(sys.argv) < 2:
        print(json.dumps({"regions": []}, ensure_ascii=False))
        return
    print(json.dumps(run_layout(sys.argv[1]), ensure_ascii=False))


if __name__ == "__main__":
    main()
