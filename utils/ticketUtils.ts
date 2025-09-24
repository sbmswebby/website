"use client";

import QRCode from "qrcode";

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
  id: string;
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

/** Layout configuration for ticket elements */
const layout = {
  canvas: {
    widthInches: 3.5,
    heightInches: 4.5,
    dpi: 300,
  },
  qr: {
    x: 19,
    y: 23,
    size: 290,
  },
  userPhoto: {
    x: 330,
    y: 250,
    width: 390,
    height: 390,
  },
  textBox: {
    x: 280,
    y: 700,
    lineHeight: 60, // spacing between lines
    color: "#000",
    font: "bold 45px Helvetica",
    titleFont: "bold 45px Helvetica",
  },
};

/** Generates a ticket as an image (JPEG) and triggers download */
export const generateTicketImage = async (data: TicketData): Promise<void> => {
  try {
    // --- Load background SVG ---
    const bgSvg = await loadBackgroundSvg();
    if (!bgSvg) throw new Error("Background SVG not found");

    // --- Create canvas ---
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");

    const { widthInches, heightInches, dpi } = layout.canvas;
    const canvasWidth = widthInches * dpi;
    const canvasHeight = heightInches * dpi;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // --- Draw white background ---
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // --- Draw SVG background ---
    const bgImg = await svgToImage(bgSvg, canvasWidth, canvasHeight);
    ctx.drawImage(bgImg, 0, 0, canvasWidth, canvasHeight);

    // --- Draw QR code ---
    const qrSvgText = await QRCode.toString(
      `https://sbmsacademy.in/registrations?registration_id=${data.id}`,
      { type: "svg" }
    );
    const qrImg = await svgToImage(qrSvgText, layout.qr.size, layout.qr.size);
    ctx.drawImage(qrImg, layout.qr.x, layout.qr.y, layout.qr.size, layout.qr.size);

    // --- Draw user photo if exists ---
    if (data.photoUrl) {
      try {
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
        const p = layout.userPhoto;
        ctx.drawImage(userImg, p.x, p.y, p.width, p.height);
      } catch (err) {
        console.warn("[generateTicketImage] Failed to load user photo:", err);
      }
    }

    // --- Draw text inside text box ---
    const box = layout.textBox;
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

    // --- Download as JPEG ---
    const imageUrl = canvas.toDataURL("image/jpeg", 1.0); // quality 100%
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `${data.eventName}_Ticket_${data.registrationNumber}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    console.error("[generateTicketImage] Failed:", err);
    alert("Ticket generation failed. Please try again.");
  }
};
