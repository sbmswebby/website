// lib/pdf-generator.ts
'use client';
import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib'
import { useEffect, useState } from 'react';


interface PDFData {
  registration: {
    id: string
    reference: string
    created_at: string
    payment_status: string
  }
  user: {
    full_name: string
    number: string
    photo_url?: string
  }
  event: {
    name: string
    date: string
    photo_url?: string
  }
  session?: {
    name: string
    start_time: string
    end_time: string
    cost: number
  }
  qr_code_url: string
  assets: {
    user_photo_signed_url?: string
    event_photo_signed_url?: string
  }
}

export async function generateEventPass(data: PDFData): Promise<Uint8Array> {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create()
    
    // Add a page with custom size (similar to an event pass card)
    const page = pdfDoc.addPage([400, 600]) // 400x600 points (roughly 5.5" x 8.3")
    const { width, height } = page.getSize()
    
    // Embed fonts
    const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    
    // Colors
    const primaryColor = rgb(0.1, 0.1, 0.5) // Dark blue
    const secondaryColor = rgb(0.4, 0.4, 0.4) // Gray
    const accentColor = rgb(0.8, 0.2, 0.2) // Red accent
    
    // Helper function to fetch and embed images
    const embedImageFromUrl = async (url: string) => {
      try {
        const response = await fetch(url)
        const arrayBuffer = await response.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        
        // Determine image type based on content
        if (url.includes('.png') || uint8Array[0] === 0x89) {
          return await pdfDoc.embedPng(uint8Array)
        } else {
          return await pdfDoc.embedJpg(uint8Array)
        }
      } catch (error) {
        console.warn('Failed to embed image:', url, error)
        return null
      }
    }
    
    // Draw header background
    page.drawRectangle({
      x: 0,
      y: height - 120,
      width: width,
      height: 120,
      color: primaryColor
    })
    
    // Event title
    const eventTitle = data.event.name
    const titleSize = Math.min(24, (width - 40) / (eventTitle.length * 0.6))
    page.drawText(eventTitle, {
      x: 20,
      y: height - 50,
      size: titleSize,
      font: titleFont,
      color: rgb(1, 1, 1)
    })
    
    // Event date
    const eventDate = new Date(data.event.date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    page.drawText(eventDate, {
      x: 20,
      y: height - 80,
      size: 14,
      font: regularFont,
      color: rgb(0.9, 0.9, 0.9)
    })
    
    // Draw event photo if available
    if (data.assets.event_photo_signed_url) {
      const eventImage = await embedImageFromUrl(data.assets.event_photo_signed_url)
      if (eventImage) {
        const imgDims = eventImage.scale(0.3)
        page.drawImage(eventImage, {
          x: width - imgDims.width - 20,
          y: height - 110,
          width: imgDims.width,
          height: imgDims.height
        })
      }
    }
    
    // User information section
    let currentY = height - 160
    
    // Draw user photo if available
    if (data.assets.user_photo_signed_url) {
      const userImage = await embedImageFromUrl(data.assets.user_photo_signed_url)
      if (userImage) {
        // Draw circular background for profile photo
        page.drawCircle({
          x: 80,
          y: currentY - 40,
          size: 35,
          color: rgb(0.9, 0.9, 0.9),
          borderColor: primaryColor,
          borderWidth: 2
        })
        
        // Note: pdf-lib doesn't support circular clipping, so we draw as square
        const imgSize = 60
        page.drawImage(userImage, {
          x: 50,
          y: currentY - 70,
          width: imgSize,
          height: imgSize
        })
      }
    }
    
    // User name
    page.drawText('ATTENDEE', {
      x: 140,
      y: currentY - 20,
      size: 10,
      font: boldFont,
      color: secondaryColor
    })
    
    page.drawText(data.user.full_name.toUpperCase(), {
      x: 140,
      y: currentY - 40,
      size: 18,
      font: titleFont,
      color: primaryColor
    })
    
    // Phone number
    page.drawText(data.user.number, {
      x: 140,
      y: currentY - 60,
      size: 12,
      font: regularFont,
      color: secondaryColor
    })
    
    currentY -= 120
    
    // Session information (if available)
    if (data.session) {
      page.drawText('SESSION DETAILS', {
        x: 20,
        y: currentY,
        size: 12,
        font: boldFont,
        color: primaryColor
      })
      
      currentY -= 25
      
      page.drawText(data.session.name, {
        x: 20,
        y: currentY,
        size: 16,
        font: titleFont,
        color: rgb(0, 0, 0)
      })
      
      currentY -= 25
      
      const sessionTime = `${new Date(data.session.start_time).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      })} - ${new Date(data.session.end_time).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      })}`
      
      page.drawText(`Time: ${sessionTime}`, {
        x: 20,
        y: currentY,
        size: 12,
        font: regularFont,
        color: secondaryColor
      })
      
      currentY -= 20
      
      if (data.session.cost > 0) {
        page.drawText(`Fee: ₹${data.session.cost}`, {
          x: 20,
          y: currentY,
          size: 12,
          font: regularFont,
          color: secondaryColor
        })
      } else {
        page.drawText('Fee: FREE', {
          x: 20,
          y: currentY,
          size: 12,
          font: boldFont,
          color: rgb(0, 0.7, 0)
        })
      }
      
      currentY -= 40
    }
    
    // Registration details
    page.drawText('REGISTRATION DETAILS', {
      x: 20,
      y: currentY,
      size: 12,
      font: boldFont,
      color: primaryColor
    })
    
    currentY -= 25
    
    page.drawText(`Reference: ${data.registration.reference}`, {
      x: 20,
      y: currentY,
      size: 12,
      font: regularFont,
      color: secondaryColor
    })
    
    currentY -= 20
    
    page.drawText(`Status: ${data.registration.payment_status.toUpperCase()}`, {
      x: 20,
      y: currentY,
      size: 12,
      font: boldFont,
      color: data.registration.payment_status === 'completed' ? rgb(0, 0.7, 0) : accentColor
    })
    
    currentY -= 20
    
    const registrationDate = new Date(data.registration.created_at).toLocaleDateString('en-IN')
    page.drawText(`Registered: ${registrationDate}`, {
      x: 20,
      y: currentY,
      size: 12,
      font: regularFont,
      color: secondaryColor
    })
    
    // QR Code section
    currentY = 140 // Fixed position for QR code
    
    page.drawText('ENTRY PASS', {
      x: 20,
      y: currentY,
      size: 12,
      font: boldFont,
      color: primaryColor
    })
    
    // Draw QR code if available
    if (data.qr_code_url) {
      const qrImage = await embedImageFromUrl(data.qr_code_url)
      if (qrImage) {
        const qrSize = 100
        page.drawImage(qrImage, {
          x: width - qrSize - 20,
          y: currentY - qrSize,
          width: qrSize,
          height: qrSize
        })
        
        // QR code instructions
        page.drawText('Scan this QR code', {
          x: width - qrSize - 20,
          y: currentY - qrSize - 15,
          size: 8,
          font: regularFont,
          color: secondaryColor
        })
        
        page.drawText('at the venue entrance', {
          x: width - qrSize - 20,
          y: currentY - qrSize - 28,
          size: 8,
          font: regularFont,
          color: secondaryColor
        })
      }
    }
    
    // Important instructions
    page.drawText('IMPORTANT:', {
      x: 20,
      y: currentY - 20,
      size: 10,
      font: boldFont,
      color: accentColor
    })
    
    const instructions = [
      '• Bring a valid ID proof',
      '• Arrive 30 minutes early',
      '• This pass is non-transferable',
      '• Keep this pass safe'
    ]
    
    let instructionY = currentY - 35
    instructions.forEach(instruction => {
      page.drawText(instruction, {
        x: 20,
        y: instructionY,
        size: 9,
        font: regularFont,
        color: secondaryColor
      })
      instructionY -= 12
    })
    
    // Footer
    page.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: 30,
      color: rgb(0.95, 0.95, 0.95)
    })
    
    page.drawText(`Generated on ${new Date().toLocaleDateString('en-IN')} • Pass ID: ${data.registration.id.substr(0, 8)}`, {
      x: 20,
      y: 10,
      size: 8,
      font: regularFont,
      color: secondaryColor
    })
    
    // Serialize the PDF document to bytes
    const pdfBytes = await pdfDoc.save()
    return pdfBytes
  } catch (error) {
    console.error('PDF generation error:', error)
    throw new Error('Failed to generate PDF pass')
  }
}

// Utility function to trigger PDF download in browser
export function downloadPDF(pdfBytes: Uint8Array, filename: string) {
  // Create a safe Uint8Array with guaranteed ArrayBuffer
  const safeBytes = new Uint8Array(pdfBytes);

  const blob = new Blob([safeBytes.buffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
}

// React hook for PDF generation
export function usePDFGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const generateAndDownload = async (registrationId: string) => {
    setIsGenerating(true)
    setError(null)
    
    try {
      // Fetch registration data
      const response = await fetch(`/api/registration/${registrationId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch registration data')
      }
      
      const data = await response.json()
      
      // Generate PDF
      const pdfBytes = await generateEventPass(data)
      
      // Download PDF
      const filename = `event-pass-${data.registration.reference}.pdf`
      downloadPDF(pdfBytes, filename)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate PDF'
      setError(errorMessage)
      console.error('PDF generation failed:', err)
    } finally {
      setIsGenerating(false)
    }
  }
  
  return {
    generateAndDownload,
    isGenerating,
    error
  }
}

// PDF preview component (optional)
export function PDFPreview({ pdfBytes }: { pdfBytes: Uint8Array }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  
  useEffect(() => {
    const fixedBytes = new Uint8Array(pdfBytes); // ensures ArrayBuffer backing
    const blob = new Blob([fixedBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob)
    setPdfUrl(url)
    
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [pdfBytes])
  
  if (!pdfUrl) return null
  
  return (
    <div className="w-full h-96 border rounded-lg overflow-hidden">
      <iframe
        src={pdfUrl}
        className="w-full h-full"
        title="PDF Preview"
      />
    </div>
  )
}