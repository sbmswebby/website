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
const ticketLayout = {
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
    lineHeight: 60,
    color: "#000",
    font: "bold 45px Helvetica",
    titleFont: "bold 45px Helvetica",
  },
};

/** Layout configuration for certificate elements */
const certificateLayout = {
  canvas: {
    // These are default sizes but final canvas size will match the background image
    width: 1240, // 4.18in @ 150dpi
    height: 1800, // 5.55in @ 150dpi
  },
  textBox: {
    x: 620, // centered
    y: 780,
    color: "#000",
    font: "bold 100px Helvetica",
    textAlign: "center" as CanvasTextAlign,
  },
  userPhoto: {
    x: 742, // will be dynamically centered
    y: -240, // will be relative to canvas height
    width: 217,
    height: 316,
  },
  backgroundUrl: "/images/bbn_certificate.jpg",
};

/** Generates a ticket or certificate image and triggers download */
export const generateTicketImage = async (data: TicketData, type?: "ticket" | "certificate"): Promise<void> => {
  try {
    // Helper: create and download canvas
    const downloadCanvas = (canvas: HTMLCanvasElement, filename: string) => {
      const imageUrl = canvas.toDataURL("image/jpeg", 1.0);
      const a = document.createElement("a");
      a.href = imageUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    // --- Generate Ticket ---
    const generateTicket = async () => {
      const bgSvg = await loadBackgroundSvg();
      if (!bgSvg) throw new Error("Background SVG not found");

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Failed to get canvas context");

      const { widthInches, heightInches, dpi } = ticketLayout.canvas;
      const canvasWidth = widthInches * dpi;
      const canvasHeight = heightInches * dpi;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      const bgImg = await svgToImage(bgSvg, canvasWidth, canvasHeight);
      ctx.drawImage(bgImg, 0, 0, canvasWidth, canvasHeight);

      const qrSvgText = await QRCode.toString(
        `https://sbmsacademy.in/registrations?registration_id=${data.id}`,
        { type: "svg" }
      );
      const qrImg = await svgToImage(qrSvgText, ticketLayout.qr.size, ticketLayout.qr.size);
      ctx.drawImage(qrImg, ticketLayout.qr.x, ticketLayout.qr.y, ticketLayout.qr.size, ticketLayout.qr.size);

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
          const p = ticketLayout.userPhoto;
          ctx.drawImage(userImg, p.x, p.y, p.width, p.height);
        } catch (err) {
          console.warn("[generateTicketImage] Failed to load user photo:", err);
        }
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

      downloadCanvas(canvas, `${data.eventName}_Ticket_${data.registrationNumber}.jpg`);
    };

    // --- Generate Certificate ---
// --- Generate Certificate ---
const generateCertificate = async () => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");

  // Load background image first to get its dimensions
  const bgImg = new Image();
  await new Promise<void>((resolve, reject) => {
    bgImg.onload = () => resolve();
    bgImg.onerror = reject;
    bgImg.src = certificateLayout.backgroundUrl;
  });

  // Set canvas size to match background image
  canvas.width = bgImg.width;
  canvas.height = bgImg.height;

  // Draw certificate background
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  // Draw user photo if available
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

      // Use layout config
      const photo = certificateLayout.userPhoto;
      const photoX = canvas.width / 2 - photo.width / 2 + photo.x; // center + offset
      const photoY = canvas.height / 2 - photo.height / 2 + photo.y;
      ctx.drawImage(userImg, photoX, photoY, photo.width, photo.height);
    } catch (err) {
      console.warn("[generateCertificate] Failed to load user photo:", err);
    }
  }

  // Draw name
  ctx.font = certificateLayout.textBox.font;
  ctx.fillStyle = certificateLayout.textBox.color;
  ctx.textAlign = certificateLayout.textBox.textAlign;
  ctx.fillText(data.name, canvas.width / 2, certificateLayout.textBox.y);

  downloadCanvas(canvas, `${data.eventName}_Certificate_${data.registrationNumber}.jpg`);
};



    if (!type) {
      await generateTicket();
      await generateCertificate();
    } else if (type === "ticket") {
      await generateTicket();
    } else if (type === "certificate") {
      await generateCertificate();
    }
  } catch (err) {
    console.error("[generateTicketImage] Failed:", err);
    alert("Ticket/Certificate generation failed. Please try again.");
  }
};
