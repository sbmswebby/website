import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import QRCode from "qrcode";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { v4 as uuidv4 } from "uuid";

type SuccessResponse = {
  pdfUrl?: string;
  qrUrl?: string;
  success: boolean;
  message?: string;
};

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();

    // Parse FormData
    const formData = await req.formData();
    const sessionId = formData.get("sessionId") as string | null;
    const name = formData.get("name") as string | null;
    const phone = formData.get("phone") as string | null;
    const age = formData.get("age") as string | null;
    const gender = formData.get("gender") as string | null;
    const company = formData.get("company") as string | null;
    const role = formData.get("role") as string | null;
    const instagram = formData.get("instagram") as string | null;
    const reference = formData.get("reference") as string | null;
    const consentMarketing = formData.get("consentMarketing") === "true";
    const tnc = formData.get("tnc") === "true";
    const photo = formData.get("photo") as File | null;

    if (!sessionId || !name || !phone || !age || !gender || !photo) {
      return NextResponse.json<SuccessResponse>(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 1. Upload photo to Supabase Storage
    const fileBuffer = Buffer.from(await photo.arrayBuffer());
    const photoId = uuidv4();
    const photoPath = `photos/${photoId}-${photo.name}`;
    const { error: photoError } = await (await supabase).storage
      .from("event-files")
      .upload(photoPath, fileBuffer, {
        contentType: photo.type,
        upsert: true,
      });

    if (photoError) throw photoError;

    const {
      data: { publicUrl: photoUrl },
    } = (await supabase).storage.from("event-files").getPublicUrl(photoPath);

    // 2. Generate QR Code
    const qrId = uuidv4();
    const qrDataUrl = await QRCode.toDataURL(qrId);
    const qrBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");
    const qrPath = `qrcodes/${qrId}.png`;

    await (await supabase).storage.from("event-files").upload(qrPath, qrBuffer, {
      contentType: "image/png",
      upsert: true,
    });

    const {
      data: { publicUrl: qrUrl },
    } = (await supabase).storage.from("event-files").getPublicUrl(qrPath);

    // 3. Generate PDF Pass
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([400, 600]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText("Event Pass", { x: 150, y: 550, size: 20, font, color: rgb(0, 0, 0) });
    page.drawText(`Name: ${name}`, { x: 50, y: 500, size: 14, font });
    page.drawText(`Session: ${sessionId}`, { x: 50, y: 480, size: 14, font });
    page.drawText(`Phone: ${phone}`, { x: 50, y: 460, size: 14, font });
    page.drawText(`Instagram: ${instagram || "-"}`, { x: 50, y: 440, size: 14, font });

    // Add QR code
    const qrImage = await pdfDoc.embedPng(qrBuffer);
    page.drawImage(qrImage, { x: 120, y: 300, width: 150, height: 150 });

    // Add Photo (only if JPG works)
    try {
      const photoImage = await pdfDoc.embedJpg(fileBuffer).catch(() => null);
      if (photoImage) {
        page.drawImage(photoImage, { x: 140, y: 120, width: 120, height: 120 });
      }
    } catch {
      // ignore
    }

    const pdfBytes = await pdfDoc.save();
    const pdfId = uuidv4();
    const pdfPath = `passes/${pdfId}.pdf`;

    await (await supabase).storage.from("event-files").upload(pdfPath, pdfBytes, {
      contentType: "application/pdf",
      upsert: true,
    });

    const {
      data: { publicUrl: pdfUrl },
    } = (await supabase).storage.from("event-files").getPublicUrl(pdfPath);

    // 4. Insert into Database
    const { data: user } = await (await supabase)
      .from("user_profiles")
      .upsert(
        {
          phone,
          name,
          age: Number(age),
          gender,
          company,
          role,
          instagram,
          reference,
          consent_marketing: consentMarketing,
          tnc,
          paid_events: [sessionId],
        },
        { onConflict: "phone" }
      )
      .select()
      .single();

    if (!user) {
      throw new Error("User insert/upsert failed");
    }

    await (await supabase).from("event_registrations").insert({
      user_id: user.id,
      session_id: sessionId,
      cost: 0,
      photo_url: photoUrl,
      qr_url: qrUrl,
      pdf_url: pdfUrl,
    });

    // ✅ Typed response
    const response: SuccessResponse = {
      success: true,
      pdfUrl,
      qrUrl,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error occurred";
    return NextResponse.json<SuccessResponse>(
      { success: false, message },
      { status: 500 }
    );
  }
}
