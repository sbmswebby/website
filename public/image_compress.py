import os
from pathlib import Path
from PIL import Image

# Constants
INPUT_FOLDER = Path("./")  # Current directory
OUTPUT_FOLDER = Path("./compressed_images")
MAX_SIZE_KB = 150
MIN_QUALITY = 20  # Lowest acceptable quality
START_QUALITY = 85  # Initial quality guess


def compress_to_webp(input_path: Path, output_path: Path, max_size_kb: int) -> None:
    """
    Compresses an image to WebP format under the given size constraint.
    """
    img = Image.open(input_path).convert("RGB")

    quality = START_QUALITY
    step = 5  # decrement step for quality adjustment

    while quality >= MIN_QUALITY:
        img.save(output_path, "WEBP", quality=quality, method=6)
        size_kb = os.path.getsize(output_path) / 1024
        if size_kb <= max_size_kb:
            print(f"[OK] {input_path.name} → {output_path.name} ({size_kb:.1f} KB, q={quality})")
            return
        quality -= step

    print(f"[WARN] {input_path.name} could not be reduced below {max_size_kb} KB "
          f"(final size {size_kb:.1f} KB at q={quality + step})")


def main():
    OUTPUT_FOLDER.mkdir(exist_ok=True)

    for file in INPUT_FOLDER.glob("*.jp*g"):  # matches .jpg and .jpeg
        output_file = OUTPUT_FOLDER / f"{file.stem}.webp"
        compress_to_webp(file, output_file, MAX_SIZE_KB)


if __name__ == "__main__":
    main()
