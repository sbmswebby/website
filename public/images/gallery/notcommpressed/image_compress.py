import os
from pathlib import Path
from PIL import Image

# Config
INPUT_FOLDER = Path("./")  # current directory
OUTPUT_FOLDER = Path("./compressed_images")
MAX_SIZE_KB = 150
MIN_QUALITY = 20

# Target pixel areas (like your TS code)
TARGET_AREAS = {
    "main": 1_500_000,   # ~1500x1000
    "thumb": 90_000,     # ~300x300
    "default": 800_000,  # ~900x900
}


def resize_to_target(img: Image.Image, target_area: int) -> Image.Image:
    """Resize image so that its pixel area <= target_area, preserving aspect ratio."""
    orig_w, orig_h = img.size
    orig_area = orig_w * orig_h

    if orig_area <= target_area:
        return img  # no resize needed

    scale_factor = (target_area / orig_area) ** 0.5
    new_w = max(1, round(orig_w * scale_factor))
    new_h = max(1, round(orig_h * scale_factor))
    return img.resize((new_w, new_h), Image.Resampling.LANCZOS)


def compress_image(input_path: Path, output_path: Path, variant: str = "default") -> None:
    """Shrink + compress an image into WebP, ensuring size <= MAX_SIZE_KB."""
    img = Image.open(input_path).convert("RGB")

    # Step 1: shrink dimensions if needed
    target_area = TARGET_AREAS.get(variant, TARGET_AREAS["default"])
    img = resize_to_target(img, target_area)

    # Step 2: compress at initial quality
    quality = 80 if variant == "main" else 75
    step_factor = 0.9

    while quality >= MIN_QUALITY:
        img.save(output_path, "WEBP", quality=int(quality), method=6)
        size_kb = os.path.getsize(output_path) / 1024

        print(f"[{input_path.name}] -> {img.size[0]}x{img.size[1]} "
              f"q={int(quality)} => {size_kb:.1f} KB (target ≤ {MAX_SIZE_KB} KB)")

        if size_kb <= MAX_SIZE_KB:
            print(f" ✅ Success: {output_path.name} ({size_kb:.1f} KB)\n")
            return

        quality *= step_factor

    print(f" ⚠️ Warning: {input_path.name} could not be reduced below {MAX_SIZE_KB} KB "
          f"(last size {size_kb:.1f} KB)\n")


def main():
    OUTPUT_FOLDER.mkdir(exist_ok=True)

    for file in INPUT_FOLDER.glob("*.jp*g"):  # matches .jpg and .jpeg
        output_file = OUTPUT_FOLDER / f"{file.stem}.webp"
        compress_image(file, output_file, variant="main")  # change to "thumb" if needed


if __name__ == "__main__":
    main()
