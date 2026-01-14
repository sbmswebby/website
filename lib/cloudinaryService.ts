// lib/generation/cloudinaryService.ts
import { canvasToFile } from "@/lib/certificate_and_id/canvasUtils";

export class CloudinaryService {
  /**
   * Uploads a file from browser to Cloudinary via API route.
   * Now includes client-side compression to save bandwidth.
   */
  static async uploadFile(file: File, folder: string): Promise<string> {
    // 1. Compress the file first
    console.log(`[CloudinaryService] ⏳ Original size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    const compressedFile = await this.compressImage(file);
    console.log(`[CloudinaryService] ✅ Compressed size: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);

    // 2. Convert the smaller file to Base64
    console.log('[CloudinaryService] ⏳ Converting to Base64...');
    const base64 = await this.fileToBase64(compressedFile);
    
    console.log(`[CloudinaryService] ⏳ Uploading to folder: "${folder}"...`);
    const url = await this.uploadBase64(base64, folder);
    console.log('[CloudinaryService] ✅ Upload successful:', url);

    return url;
  }

  /**
   * Internal method to resize and compress images using Canvas
   */
private static async compressImage(file: File): Promise<File> {
  // Don't compress if it's not an image
  if (!file.type.startsWith('image/')) return file;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Lowering MAX_SIZE to 800px (Plenty for profile photos/ID cards)
        const MAX_SIZE = 800; 
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // This ensures a clean background if the source is a transparent PNG
        if (ctx) {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
        }

        // 1. We force 'image/jpeg' even if the input was PNG
        // 2. We lower quality to 0.6 (60%)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // We rename the extension to .jpg to ensure servers treat it as a small file
              const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
              resolve(new File([blob], newFileName, { type: 'image/jpeg' }));
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.6 
        );
      };
    };
    reader.onerror = () => resolve(file);
  });
}

  /**
   * Uploads a canvas element by converting to File first.
   */
  static async uploadCanvas(
    canvas: HTMLCanvasElement,
    filename: string,
    folder: string
  ): Promise<string> {
    console.log('[CloudinaryService] ⏳ Converting canvas to File...');
    const file = await canvasToFile(canvas, filename);
    // This calls uploadFile which now handles compression automatically
    return this.uploadFile(file, folder);
  }

  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  private static async uploadBase64(base64: string, folder: string): Promise<string> {
    const res = await fetch("/api/upload_image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: base64, folder }),
    });

    const data = await res.json();
    if (!res.ok || !data.url) throw new Error(data.error || "Cloudinary upload failed");
    return data.url as string;
  }
}