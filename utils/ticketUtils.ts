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
  beautyParlor: string;
  eventName: string;
  sessionName?: string;
  registrationNumber: string | number;
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

    // --- Add logo (vector SVG) ---
    const logoSvgText = await loadLogo();
    if (logoSvgText) {
      const logoSvgEl = svgStringToElement(logoSvgText);
      await pdf.svg(logoSvgEl, {
        x: 110,
        y: 10,
        width: 85,
        height: 85,
      });
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
    pdf.text(`Beauty Parlor: ${data.beautyParlor}`, 20, y);
    y += lineGap;
    if (data.sessionName) {
      pdf.text(`Session: ${data.sessionName}`, 20, y);
      y += lineGap;
    }
    pdf.text(`Reg No: ${data.registrationNumber}`, 20, y);

    // --- QR Code (vector SVG) ---
    const qrSvgText = await QRCode.toString(
      `https://sbmsacademy.in/registrations?registration_id=${data.id}`,
      { type: "svg" }
    );
    const qrSvgEl = svgStringToElement(qrSvgText);
    await pdf.svg(qrSvgEl, {
      x: 10,
      y: 10,
      width: 90,
      height: 90,
    });

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
