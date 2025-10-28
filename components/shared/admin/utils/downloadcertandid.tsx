// lib/generation/downloadService.ts
import JSZip from "jszip";
import { saveAs } from "file-saver";

/**
 * Information about a downloadable file (certificate or ID card)
 */
export interface FileInfo {
  url: string;
  type: "certificate" | "id_card";
  academyName: string;
  filename: string; // Must include correct extension (e.g., .jpg, .png)
}

/**
 * Downloads multiple files and saves them as a single ZIP archive.
 *
 * The files are organized by type (Certificates / ID_Cards) and then by academy name.
 *
 * Example structure:
 *  - Certificates/ABC Academy/user1.jpg
 *  - ID_Cards/ABC Academy/user1.png
 *
 * @param files Array of file info objects
 * @param zipName Name of the ZIP file to save (e.g., "Academy_Files.zip")
 */
export async function downloadFilesAsZip(files: FileInfo[], zipName: string): Promise<void> {
  console.log("[downloadFilesAsZip] Starting download. Total files:", files.length);

  if (!Array.isArray(files) || files.length === 0) {
    console.warn("[downloadFilesAsZip] No files to download.");
    return;
  }

  const zip = new JSZip();

  // Process each file one by one
  for (const file of files) {
    try {
      console.log("[downloadFilesAsZip] Fetching:", file.filename, "from:", file.url);

      const response = await fetch(file.url);

      if (!response.ok) {
        console.error(`[downloadFilesAsZip] Failed to fetch ${file.url}:`, response.statusText);
        continue;
      }

      const blob = await response.blob();
      const contentType = response.headers.get("Content-Type") ?? "";

      console.log("[downloadFilesAsZip] File fetched:", {
        filename: file.filename,
        contentType,
        size: blob.size,
      });

      // ✅ Ensure filename has correct extension based on MIME type
      let filename = file.filename;
      if (contentType.includes("jpeg") && !filename.endsWith(".jpg")) {
        filename = filename.replace(/\.[^/.]+$/, "") + ".jpg";
      } else if (contentType.includes("png") && !filename.endsWith(".png")) {
        filename = filename.replace(/\.[^/.]+$/, "") + ".png";
      }

      // ✅ Organize by Type → Academy → Filename
      const folderPath =
        file.type === "certificate"
          ? `Certificates/${file.academyName}`
          : `ID_Cards/${file.academyName}`;

      console.log("[downloadFilesAsZip] Adding to ZIP at path:", `${folderPath}/${filename}`);
      zip.file(`${folderPath}/${filename}`, blob);
    } catch (err) {
      console.error(`[downloadFilesAsZip] Error fetching file ${file.url}:`, err);
    }
  }

  try {
    console.log("[downloadFilesAsZip] Generating ZIP...");
    const zipBlob = await zip.generateAsync({ type: "blob" });

    console.log("[downloadFilesAsZip] ZIP generated successfully. Size (bytes):", zipBlob.size);
    saveAs(zipBlob, zipName);

    console.log("[downloadFilesAsZip] ZIP saved as:", zipName);
  } catch (err) {
    console.error("[downloadFilesAsZip] Failed to generate ZIP:", err);
  }
}

