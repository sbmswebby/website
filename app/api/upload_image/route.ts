import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";

interface UploadImageRequest {
  imageBase64: string;
  folder?: string;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  console.log("[API] /api/upload_image POST request received");
  console.log("[API] Request headers:", req.headers);

  let body: UploadImageRequest;

  // Parse JSON body
  try {
    body = await req.json();
    console.log("[API] JSON body parsed successfully:", {
      folder: body.folder,
      hasImageBase64: !!body.imageBase64,
      length: body.imageBase64?.length || 0,
    });
  } catch (parseError) {
    console.error("[API] Failed to parse JSON:", parseError);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { imageBase64, folder } = body;

  if (!imageBase64) {
    console.error("[API] imageBase64 is missing in request body");
    return NextResponse.json({ error: "Missing imageBase64" }, { status: 400 });
  }

  // Convert Base64 to Buffer
  let buffer: Buffer;
  try {
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    buffer = Buffer.from(base64Data, "base64");
    console.log("[API] Converted imageBase64 to buffer:", {
      bufferLength: buffer.length,
      folder,
    });
  } catch (bufError) {
    console.error("[API] Failed to convert base64 to buffer:", bufError);
    return NextResponse.json({ error: "Invalid base64 image" }, { status: 400 });
  }

  // Upload to Cloudinary
  let url: string;
  try {
    console.log("[API] Starting Cloudinary upload...");
    url = await uploadToCloudinary(buffer, folder || "uploads");
    if (!url) throw new Error("No URL returned from Cloudinary");
    console.log("[API] Cloudinary upload success:", url);
  } catch (uploadError: unknown) {
    console.error("[API] Cloudinary upload failed:", uploadError);
    return NextResponse.json(
      { error: "Cloudinary upload failed", details: (uploadError as Error).message },
      { status: 500 }
    );
  }

  const endTime = Date.now();
  console.log(`[API] Request completed in ${endTime - startTime}ms`);

  return NextResponse.json({ url });
}
