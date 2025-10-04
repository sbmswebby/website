// downloadService.ts - File download utilities
// Location: lib/generation/downloadService.ts

export class DownloadService {
  /**
   * Forces download of a file from any URL (cross-origin safe)
   */
  static async downloadFile(url: string, filename: string): Promise<void> {
    console.log(`📥 Starting file download: ${filename} from ${url}`);

    try {
      console.log('➡️ Fetching file from server...');
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch file for download');
      console.log('✅ File fetched successfully');

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      console.log('🧩 Blob created and object URL generated');

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);

      console.log('🖱️ Triggering file download in browser...');
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      console.log(`✅ Download completed and blob URL revoked for: ${filename}`);
    } catch (err) {
      console.error(`❌ Download failed for ${filename}:`, err);
      throw err;
    }
  }

  /**
   * Downloads multiple files sequentially
   */
  static async downloadMultipleFiles(
    files: Array<{ url: string; filename: string }>
  ): Promise<void> {
    console.log(`📦 Starting sequential download of ${files.length} files...`);

    for (const [index, file] of files.entries()) {
      console.log(`\n📄 [${index + 1}/${files.length}] Downloading: ${file.filename}`);
      await this.downloadFile(file.url, file.filename);
      console.log(`✅ Completed download for: ${file.filename}`);

      // Add small delay between downloads to prevent browser blocking
      console.log('⏳ Waiting 300ms before next download...');
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    console.log('🎉 All files downloaded successfully.');
  }

  /**
   * Downloads ID card and certificate together
   */
  static async downloadIDAndCertificate(
    idUrl: string,
    certUrl: string,
    baseName: string
  ): Promise<void> {
    console.log(`🎓 Starting combined download for ${baseName}`);

    const files = [
      { url: idUrl, filename: `${baseName}_ID_Card.jpg` },
      { url: certUrl, filename: `${baseName}_Certificate.jpg` },
    ];

    await this.downloadMultipleFiles(files);

    console.log(`✅ Completed download for both ID Card and Certificate of ${baseName}`);
  }
}
