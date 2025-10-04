// lib/generation/cloudinaryService.ts
import { canvasToFile } from "@/lib/certificate_and_id/canvasUtils";

export class CloudinaryService {
  /**
   * Uploads a file from browser to Cloudinary via API route.
   * @param file File object from input or canvas
   * @param folder Cloudinary folder name
   */
  static async uploadFile(file: File, folder: string): Promise<string> {
    console.log('[CloudinaryService] ⏳ Converting file to Base64...');
    const base64 = await this.fileToBase64(file);
    console.log('[CloudinaryService] ✅ File converted to Base64 successfully');

    console.log(`[CloudinaryService] ⏳ Uploading file to Cloudinary folder: "${folder}"...`);
    const url = await this.uploadBase64(base64, folder);
    console.log('[CloudinaryService] ✅ File uploaded successfully, URL:', url);

    return url;
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
    console.log('[CloudinaryService] ✅ Canvas converted to File:', filename);

    return this.uploadFile(file, folder);
  }

  /**
   * Converts a file to base64 (for sending to API).
   */
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        console.log('[CloudinaryService] 🔹 FileReader loaded file successfully');
        resolve(reader.result as string);
      };
      reader.onerror = (err) => {
        console.error('[CloudinaryService] ❌ FileReader failed to load file:', err);
        reject(err);
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Sends base64 image to our `/api/upload_image` route.
   * The API will handle converting to buffer and uploading to Cloudinary.
   */
  private static async uploadBase64(
    base64: string,
    folder: string
  ): Promise<string> {
    console.log('[CloudinaryService] ⏳ Sending Base64 data to /api/upload_image...');
    const res = await fetch("/api/upload_image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: base64, folder }),
    });

    const data = await res.json();

    if (!res.ok || !data.url) {
      console.error('[CloudinaryService] ❌ Upload failed:', data.error || 'Unknown error');
      throw new Error(data.error || "Cloudinary upload failed");
    }

    console.log('[CloudinaryService] ✅ Upload successful, returned URL:', data.url);
    return data.url as string;
  }
}
