import os
from PIL import Image, ExifTags

# ======== Configuration ========
# Automatically use the folder where this script is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
IMAGE_FOLDER = SCRIPT_DIR
OUTPUT_FOLDER = os.path.join(IMAGE_FOLDER, "rotated images")
# ================================

# Ensure output folder exists
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# EXIF orientation key mapping
EXIF_ORIENTATION_TAG = None
for tag, value in ExifTags.TAGS.items():
    if value == "Orientation":
        EXIF_ORIENTATION_TAG = tag
        break


def auto_rotate_image(image_path: str, save_path: str) -> None:
    """Open an image, check EXIF orientation or dimensions, rotate if necessary, and save it."""
    try:
        with Image.open(image_path) as img:
            exif = img._getexif()
            rotated = False

            # --- Check EXIF orientation ---
            if exif is not None and EXIF_ORIENTATION_TAG in exif:
                orientation = exif[EXIF_ORIENTATION_TAG]
                rotation_map = {
                    3: 180,
                    6: 270,  # 90° CW
                    8: 90    # 90° CCW
                }
                if orientation in rotation_map:
                    img = img.rotate(rotation_map[orientation], expand=True)
                    rotated = True
                    print(f"🔄 Rotated (EXIF): {os.path.basename(image_path)} by {rotation_map[orientation]}°")
            else:
                # --- Fallback: detect by dimensions (for WebP etc.) ---
                width, height = img.size
                if width > height:
                    img = img.rotate(90, expand=True)
                    rotated = True
                    print(f"🔄 Rotated (Fallback): {os.path.basename(image_path)} by 90°")

            # --- Save rotated image ---
            img.save(save_path)
            if not rotated:
                print(f"✅ Already upright: {os.path.basename(image_path)}")

    except Exception as e:
        print(f"❌ Error processing {image_path}: {e}")


def process_folder(folder: str) -> None:
    """Process all image files in the given folder."""
    supported_ext = (".jpg", ".jpeg", ".png", ".webp")
    for filename in os.listdir(folder):
        if filename.lower().endswith(supported_ext):
            input_path = os.path.join(folder, filename)
            output_path = os.path.join(OUTPUT_FOLDER, filename)
            auto_rotate_image(input_path, output_path)


if __name__ == "__main__":
    print(f"📁 Scanning folder: {IMAGE_FOLDER}")
    print(f"📂 Rotated images will be saved in: {OUTPUT_FOLDER}")
    process_folder(IMAGE_FOLDER)
    print("✅ Done! All rotated images saved.")
