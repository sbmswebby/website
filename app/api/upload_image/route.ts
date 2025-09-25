import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";

interface UploadImageRequest {
  imageBase64: string;
  folder?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Parse JSON body safely
    let body: UploadImageRequest;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("[API] Failed to parse JSON:", parseError);
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { imageBase64, folder } = body;

    if (!imageBase64) {
      console.error("[API] imageBase64 is missing");
      return NextResponse.json({ error: "Missing imageBase64" }, { status: 400 });
    }

    const targetFolder = folder || "uploads";
    console.log("[API] Upload folder:", targetFolder);

    // Convert base64 to buffer safely
    let buffer: Buffer;
    try {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      buffer = Buffer.from(base64Data, "base64");
    } catch (bufError) {
      console.error("[API] Failed to convert base64 to buffer:", bufError);
      return NextResponse.json({ error: "Invalid base64 image" }, { status: 400 });
    }

    // Upload to Cloudinary
    let url: string;
    try {
      url = await uploadToCloudinary(buffer, targetFolder);
      console.log("[API] Cloudinary upload success:", url);
    } catch (uploadError) {
      console.error("[API] Cloudinary upload failed:", uploadError);
      return NextResponse.json({ error: "Cloudinary upload failed" }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[API] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
