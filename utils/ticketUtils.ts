import { jsPDF } from "jspdf";
import "svg2pdf.js"; // augments jsPDF with pdf.svg()
import QRCode from "qrcode";

let cachedLogoSvg: string | null = null;

export const loadLogo = async (): Promise<string> => {
  if (cachedLogoSvg) return cachedLogoSvg;
  try {
    const response = await fetch("/images/sbms_logo.svg");
    const svgText = await response.text();
    cachedLogoSvg = svgText;
    return cachedLogoSvg;
  } catch (err) {
    console.error("[loadLogo] Failed to load logo:", err);
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

const svgStringToElement = (svgText: string): SVGSVGElement => {
  const div = document.createElement("div");
  div.innerHTML = svgText.trim();
  const svgEl = div.querySelector("svg");
  if (!svgEl) throw new Error("Invalid SVG");
  return svgEl as SVGSVGElement;
};

export const generatePdfTicket = async (data: TicketData): Promise<void> => {
  try {
    const pdf = new jsPDF();

    // --- Add QR code first (vector SVG) ---
    const qrSvgText = await QRCode.toString(
      `https://sbmsacademy.in/registrations?registration_id=${data.id}`,
      { type: "svg" }
    );
    const qrSvgEl = svgStringToElement(qrSvgText);
    await pdf.svg(qrSvgEl, { x: 10, y: 10, width: 90, height: 90 });

    // --- Add logo (vector SVG) ---
    const logoSvgText = await loadLogo();
    if (logoSvgText) {
      const logoSvgEl = svgStringToElement(logoSvgText);
      await pdf.svg(logoSvgEl, { x: 110, y: 10, width: 85, height: 85 });
    }

    // --- Event Name ---
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(32);
    pdf.text(data.eventName, 20, 115);

    // --- Subtitle ---
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text("Event Ticket", 20, 120);

    // --- User details ---
    pdf.setFontSize(30);
    let y = 140;
    const lineGap = 16;

    pdf.text(`Name: ${data.name}`, 20, y);
    y += lineGap;
    pdf.text(`WhatsApp: ${data.whatsapp}`, 20, y);
    y += lineGap;
    if (data.profession) {
      pdf.text(`Profession: ${data.profession}`, 20, y);
      y += lineGap;
    }
    if (data.organisation) {
      pdf.text(`Organisation: ${data.organisation}`, 20, y);
      y += lineGap;
    }
    if (data.sessionName) {
      pdf.text(`Session: ${data.sessionName}`, 20, y);
      y += lineGap;
    }
    pdf.text(`Reg No: ${data.registrationNumber}`, 20, y);
    y += lineGap;

    // --- Add uploaded photo if exists ---
    if (data.photoUrl) {
      try {
        const img = await fetch(data.photoUrl).then((res) => res.blob());
        const imgDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(img);
        });
        pdf.addImage(imgDataUrl, "JPEG", 150, 110, 40, 40); // x, y, width, height
      } catch (err) {
        console.warn("[generatePdfTicket] Failed to load user photo:", err);
      }
    }

    // --- Save PDF --- 
    const pdfBlob = pdf.output("blob");
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.eventName}_Ticket_${data.registrationNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("[generatePdfTicket] Failed:", err);
    alert("Ticket generation failed. Please try again.");
  }
};
