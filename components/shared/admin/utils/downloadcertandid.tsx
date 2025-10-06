// lib/generation/downloadService.ts
import JSZip from "jszip";
import { saveAs } from "file-saver";

/**
 * File info for organizing downloads
 */
export interface FileInfo {
  url: string;
  type: "certificate" | "id_card";
  academyName: string;
  filename: string; // filename should include correct image extension, e.g., .jpg
}

/**
 * Downloads multiple files organized by type and academy
 * @param files Array of file info objects
 * @param zipName Name of the ZIP file to save
 */
export async function downloadFilesAsZip(files: FileInfo[], zipName: string) {
  console.log("[downloadFilesAsZip] Starting download. Total files:", files.length);
  if (files.length === 0) return;

  const zip = new JSZip();

  for (const file of files) {
    console.log("[downloadFilesAsZip] Fetching file:", file.filename, "from URL:", file.url);

    try {
      const response = await fetch(file.url);
      console.log("[downloadFilesAsZip] Response status:", response.status, response.statusText);

      if (!response.ok) throw new Error(`Failed to fetch ${file.url}`);

      const contentType = response.headers.get("Content-Type");
      console.log("[downloadFilesAsZip] Content-Type:", contentType);

      const blob = await response.blob();
      console.log("[downloadFilesAsZip] Blob created:", blob);
      console.log("[downloadFilesAsZip] Blob size (bytes):", blob.size);
      console.log("[downloadFilesAsZip] Blob type:", blob.type);

      // Ensure file is stored as an image (filename should have correct extension)
      let filename = file.filename;
      if (contentType?.includes("image/jpeg") && !filename.endsWith(".jpg")) {
        filename = filename.replace(/\.[^/.]+$/, "") + ".jpg";
      } else if (contentType?.includes("image/png") && !filename.endsWith(".png")) {
        filename = filename.replace(/\.[^/.]+$/, "") + ".png";
      }

      // Organize: Type/Academy/Filename
      const folderPath = `${file.type === "certificate" ? "Certificates" : "ID_Cards"}/${file.academyName}`;
      console.log("[downloadFilesAsZip] Adding to ZIP at path:", `${folderPath}/${filename}`);

      zip.file(`${folderPath}/${filename}`, blob);

    } catch (err) {
      console.error(`[downloadFilesAsZip] Failed to fetch ${file.url}:`, err);
    }
  }

  try {
    console.log("[downloadFilesAsZip] Generating ZIP...");
    const content = await zip.generateAsync({ type: "blob" });
    console.log("[downloadFilesAsZip] ZIP blob generated. Size:", content.size);

    saveAs(content, zipName);
    console.log("[downloadFilesAsZip] ZIP saved as:", zipName);
  } catch (err) {
    console.error("[downloadFilesAsZip] Failed to generate ZIP:", err);
  }
}
