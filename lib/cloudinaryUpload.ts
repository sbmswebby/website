// lib/cloudinaryUpload.ts
"use server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary (server-side only)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/**
 * Upload a buffer directly to Cloudinary.
 * Returns the uploaded image's secure URL.
 */
export async function  uploadToCloudinary(buffer: Buffer, folder = "uploads"): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        if (!result?.secure_url) {
          return reject(new Error("No URL returned from Cloudinary"));
        }
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}
