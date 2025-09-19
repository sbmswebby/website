import jsPDF from "jspdf";
import QRCode from "qrcode";

let cachedLogoBase64: string | null = null;

export const loadLogo = async (): Promise<string> => {
  if (cachedLogoBase64) return cachedLogoBase64;
  try {
    const response = await fetch("/images/sbms_logo.png");
    const blob = await response.blob();
    const reader = new FileReader();
    cachedLogoBase64 = await new Promise<string>((resolve) => {
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
    return cachedLogoBase64;
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

export const generatePdfTicket = async (data: TicketData): Promise<void> => {
  try {
    const pdf = new jsPDF();

    // --- Add logo ---
    const logo = await loadLogo();
    if (logo) {
      pdf.addImage(logo, "PNG", 150, 10, 40, 40);
    }

    // --- Event Name (main heading) ---
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    pdf.text(data.eventName, 20, 25);

    // --- Subtitle: Event Ticket ---
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text("Event Ticket", 20, 35);

    pdf.setFontSize(12);
    let y = 50;
    const lineGap = 8;

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

    // --- QR Code with link ---
    const qrPayload = `https://sbmsacademy.in/registrations?registration_id=${data.id}`;
    const qrData = await QRCode.toDataURL(qrPayload);
    pdf.addImage(qrData, "PNG", 150, 50, 40, 40);

    // --- Force fresh download ---
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
