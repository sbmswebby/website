import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

interface ImageData {
  src: string;
  alt: string;
}

export async function GET() {
  const galleryPath = path.join(process.cwd(), "public/images/gallery");
  const files = fs.readdirSync(galleryPath);

  const images: ImageData[] = files
    .filter((f) => /\.(png|jpe?g|gif|webp|avif)$/i.test(f))
    .map((file) => ({
      src: `/images/gallery/${file}`,
      alt: file.split(".")[0].replace(/[-_]/g, " "),
    }));

  return NextResponse.json(images);
}
