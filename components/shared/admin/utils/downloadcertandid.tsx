// lib/generation/downloadService.ts
import JSZip from "jszip";
import { saveAs } from "file-saver";

/**
 * File info for organizing downloads
 */
interface FileInfo {
  url: string;
  type: "certificate" | "id_card";
  academyName: string;
  filename: string;
}

/**
 * Downloads multiple files organized by type and academy
 * @param files Array of file info objects
 * @param zipName Name of the ZIP file to save
 */
export async function downloadFilesAsZip(files: FileInfo[], zipName: string) {
  if (files.length === 0) return;

  const zip = new JSZip();

  for (const file of files) {
    try {
      const response = await fetch(file.url);
      if (!response.ok) throw new Error(`Failed to fetch ${file.url}`);

      const blob = await response.blob();
      
      // Organize: Type/Academy/Filename
      const folderPath = `${file.type === "certificate" ? "Certificates" : "ID_Cards"}/${file.academyName}`;
      zip.file(`${folderPath}/${file.filename}`, blob);
    } catch (err) {
      console.error(`[downloadFilesAsZip] Failed to fetch ${file.url}:`, err);
    }
  }

  try {
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, zipName);
  } catch (err) {
    console.error("[downloadFilesAsZip] Failed to generate ZIP:", err);
  }
}