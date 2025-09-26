"use client";

import QRCode from "qrcode";
import { supabase } from "@/lib/supabaseClient";

// Cache the SVG background
let cachedBgSvg: string | null = null;

/** Loads the SVG background from public folder */
export const loadBackgroundSvg = async (): Promise<string> => {
  if (cachedBgSvg) return cachedBgSvg;
  try {
    const response = await fetch("/images/sbms_reg_id.svg");
    const svgText = await response.text();
    cachedBgSvg = svgText;
    return svgText;
  } catch (err) {
    console.error("[loadBackgroundSvg] Failed to load background SVG:", err);
    return "";
  }
};

export interface TicketData {
  registrationId: string;    // the registration row ID
  userProfileId: string;     // the actual user_profile_id
  name: string;
  whatsapp: string;
  profession?: string | null;
  organisation?: string | null;
  eventName: string;
  sessionName?: string;
  registrationNumber: string | number;
  photoUrl?: string | null;
}

/** Converts an SVG string to an HTMLImageElement */
const svgToImage = (svgText: string, width: number, height: number): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
    img.width = width;
    img.height = height;
  });

/** Layouts */
const ticketLayout = {
  canvas: { widthInches: 3.5, heightInches: 4.5, dpi: 300 },
  qr: { x: 19, y: 23, size: 290 },
  userPhoto: { x: 330, y: 250, width: 390, height: 390 },
  textBox: { x: 280, y: 700, lineHeight: 60, color: "#000", font: "bold 45px Helvetica", titleFont: "bold 45px Helvetica" },
};

const certificateLayout = {
  canvas: { width: 1240, height: 1800 },
  textBox: { x: 620, y: 780, color: "#000", font: "bold 100px Helvetica", textAlign: "center" as CanvasTextAlign },
  userPhoto: { x: 742, y: -240, width: 217, height: 316 },
  backgroundUrl: "/images/bbn_certificate.jpg",
};

/** Convert canvas to File */
export const canvasToFile = async (canvas: HTMLCanvasElement, filename: string): Promise<File> =>
  new Promise<File>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) throw new Error("Failed to convert canvas to blob");
      resolve(new File([blob], filename, { type: "image/jpeg" }));
    }, "image/jpeg", 0.95);
  });

/** Generate ID card / Ticket */
export const generateIDCanvas = async (data: TicketData): Promise<HTMLCanvasElement> => {
  const bgSvg = await loadBackgroundSvg();
  if (!bgSvg) throw new Error("Background SVG not found");

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  const { widthInches, heightInches, dpi } = ticketLayout.canvas;
  canvas.width = widthInches * dpi;
  canvas.height = heightInches * dpi;

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const bgImg = await svgToImage(bgSvg, canvas.width, canvas.height);
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  const qrSvgText = await QRCode.toString(`https://sbmsacademy.in/registrations?registration_id=${data.registrationId}`, { type: "svg" });
  const qrImg = await svgToImage(qrSvgText, ticketLayout.qr.size, ticketLayout.qr.size);
  ctx.drawImage(qrImg, ticketLayout.qr.x, ticketLayout.qr.y, ticketLayout.qr.size, ticketLayout.qr.size);

  if (data.photoUrl) {
    const userPhotoBlob = await fetch(data.photoUrl).then((res) => res.blob());
    const userPhotoDataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(userPhotoBlob);
    });
    const userImg = new Image();
    await new Promise<void>((resolve, reject) => {
      userImg.onload = () => resolve();
      userImg.onerror = reject;
      userImg.src = userPhotoDataUrl;
    });

    const p = ticketLayout.userPhoto;
    ctx.drawImage(userImg, p.x, p.y, p.width, p.height);
  }

  const box = ticketLayout.textBox;
  let y = box.y;
  const drawLine = (text: string, font: string = box.font) => {
    ctx.font = font;
    ctx.fillStyle = box.color;
    ctx.fillText(text, box.x, y);
    y += box.lineHeight;
  };

  drawLine(data.eventName, box.titleFont);
  drawLine(`Name: ${data.name}`);
  drawLine(`WhatsApp: ${data.whatsapp}`);
  if (data.profession) drawLine(`Profession: ${data.profession}`);
  if (data.organisation) drawLine(`Organisation: ${data.organisation}`);
  if (data.sessionName) drawLine(`Session: ${data.sessionName}`);
  drawLine(`Reg No: ${data.registrationNumber}`);

  return canvas;
};

/** Generate Certificate */
export const generateCertificateCanvas = async (data: TicketData): Promise<HTMLCanvasElement> => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  const bgImg = new Image();
  await new Promise<void>((resolve, reject) => {
    bgImg.onload = () => resolve();
    bgImg.onerror = reject;
    bgImg.src = certificateLayout.backgroundUrl;
  });

  canvas.width = bgImg.width;
  canvas.height = bgImg.height;
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  if (data.photoUrl) {
    const userPhotoBlob = await fetch(data.photoUrl).then((res) => res.blob());
    const userPhotoDataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(userPhotoBlob);
    });
    const userImg = new Image();
    await new Promise<void>((resolve, reject) => {
      userImg.onload = () => resolve();
      userImg.onerror = reject;
      userImg.src = userPhotoDataUrl;
    });

    const photo = certificateLayout.userPhoto;
    const photoX = canvas.width / 2 - photo.width / 2 + photo.x;
    const photoY = canvas.height / 2 - photo.height / 2 + photo.y;
    ctx.drawImage(userImg, photoX, photoY, photo.width, photo.height);
  }

  ctx.font = certificateLayout.textBox.font;
  ctx.fillStyle = certificateLayout.textBox.color;
  ctx.textAlign = certificateLayout.textBox.textAlign;
  ctx.fillText(data.name, canvas.width / 2, certificateLayout.textBox.y);

  return canvas;
};

/** Upload ID card */
export const uploadIDCard = async (canvas: HTMLCanvasElement, data: TicketData, sessionId: string) => {
  const file = await canvasToFile(canvas, `${data.eventName}_Ticket_${data.registrationNumber}.jpg`);
  const url = await uploadImageToCloudinary(file, "tickets");

  // Save URL in Supabase (registrations table uses registrationId)
  await supabase.from("registrations").update({ ticket_url: url }).eq("id", data.registrationId);
  return url;
};

/** Upload Certificate */
export const uploadCertificate = async (canvas: HTMLCanvasElement, data: TicketData, sessionId: string) => {
  const file = await canvasToFile(canvas, `${data.eventName}_Certificate_${data.registrationNumber}.jpg`);
  const url = await uploadImageToCloudinary(file, "certificates");

  // Save URL in Supabase (certificates table uses userProfileId)
  await supabase.from("certificates").insert([{
    user_profile_id: data.userProfileId,
    session_id: sessionId,
    download_url: url,
    status: "generated"
  }]);
  return url;
};

/** Generate and upload both ID card and certificate */
export const generateAndUploadBoth = async (data: TicketData, sessionId: string) => {
  const idCanvas = await generateIDCanvas(data);
  const certCanvas = await generateCertificateCanvas(data);

  const [idUrl, certUrl] = await Promise.all([
    uploadIDCard(idCanvas, data, sessionId),
    uploadCertificate(certCanvas, data, sessionId),
  ]);

  downloadBothFiles(idUrl, certUrl, data);

  return { idUrl, certUrl };
};

/** Upload image to Cloudinary */
export const uploadImageToCloudinary = async (file: File, folder: string): Promise<string> => {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const res = await fetch("/api/upload_image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64: base64, folder }),
  });

  const data = await res.json();
  if (!res.ok || !data.url) throw new Error("Cloudinary upload failed");
  return data.url;
};

/** 
 * Forces download of a file from any URL (cross-origin safe)
 * @param url - The URL of the file to download
 * @param filename - The desired filename for the downloaded file
 */
export const downloadFile = async (url: string, filename: string) => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch file for download");

    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(blobUrl);
  } catch (err) {
    console.error("Download failed:", err);
  }
};

/** 
 * Downloads both ID card and Certificate given their URLs 
 * @param idUrl - URL of the ID card
 * @param certUrl - URL of the certificate
 * @param data - Ticket data for naming the files
 */
export const downloadBothFiles = async (idUrl: string, certUrl: string, data: TicketData) => {
  const idFilename = `${data.eventName}_Ticket_${data.registrationNumber}.jpg`;
  const certFilename = `${data.eventName}_Certificate_${data.registrationNumber}.jpg`;

  await Promise.all([
    downloadFile(idUrl, idFilename),
    downloadFile(certUrl, certFilename),
  ]);
};


