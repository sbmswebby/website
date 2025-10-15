// idCardGenerator.ts - ID Card generation logic
// Location: lib/generation/idCardGenerator.ts

import QRCode from 'qrcode';
import { IDCardDetails, GenerationData } from './types';
import {
  loadImage,
  loadImageFromBlob,
  getAlignedX,
} from './canvasUtils';

export class IDCardGenerator {
  private details: IDCardDetails;

  constructor(details: IDCardDetails) {
    this.details = details;
    console.log('[IDCardGenerator] ✅ Instance created with provided IDCardDetails');
  }

  /**
   * Generates an ID card canvas
   */
  async generate(data: GenerationData): Promise<HTMLCanvasElement> {
    console.log('[IDCardGenerator] 🟩 Starting ID card generation process...');

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    // Step 1: Load and draw base image
    console.log('[IDCardGenerator] ⏳ Loading base image...');
    const baseImg = await loadImage(this.details.base_image_url);
    console.log('[IDCardGenerator] ✅ Base image loaded successfully');

    canvas.width = baseImg.width;
    canvas.height = baseImg.height;
    ctx.drawImage(baseImg, 0, 0);
    console.log('[IDCardGenerator] 🖼️ Base image drawn on canvas');

    // Step 2: Draw QR code
    console.log('[IDCardGenerator] ⏳ Generating QR code...');
    if (!data.registrationId) {
      throw new Error("Registration ID is required to generate QR code");
    }
    await this.drawQRCode(ctx, data.registrationId);
    console.log('[IDCardGenerator] ✅ QR code added successfully');

    // Step 3: Draw logo (if present)
    if (this.details.logo_url) {
      console.log('[IDCardGenerator] ⏳ Drawing logo...');
      await this.drawLogo(ctx);
      console.log('[IDCardGenerator] ✅ Logo drawn successfully');
    } else {
      console.log('[IDCardGenerator] ⚠️ No logo URL configured — skipping logo step');
    }

    // Step 4: Draw user photo
    if (data.userProfile.image_url) {
      console.log('[IDCardGenerator] ⏳ Drawing user photo...');
      await this.drawUserPhoto(ctx, data.userProfile.image_url);
      console.log('[IDCardGenerator] ✅ User photo drawn successfully');
    } else {
      console.log('[IDCardGenerator] ⚠️ No user photo found — skipping user photo step');
    }

    // Step 5: Draw user information text
    console.log('[IDCardGenerator] ⏳ Drawing user information text...');
    this.drawUserInfoText(ctx, data);
    console.log('[IDCardGenerator] ✅ User information text drawn successfully');

    console.log('[IDCardGenerator] 🟩 ID card generation complete');
    return canvas;
  }

  /**
   * Generates and draws QR code
   */
  private async drawQRCode(
    ctx: CanvasRenderingContext2D,
    registrationId: string
  ): Promise<void> {
    console.log('[IDCardGenerator] → Creating QR code for registration:', registrationId);
    const qrUrl = `https://sbmsacademy.in/registrations?registration_id=${registrationId}`;

    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: Math.max(this.details.qr_width, this.details.qr_height),
      margin: 1,
    });

    console.log('[IDCardGenerator] QR code generated — loading into canvas...');
    const qrImg = await loadImage(qrDataUrl);

    // Draw QR code at configured position
    ctx.drawImage(
      qrImg,
      this.details.qr_x,
      this.details.qr_y,
      this.details.qr_width,
      this.details.qr_height
    );
    console.log('[IDCardGenerator] QR code drawn at coordinates:', {
      x: this.details.qr_x,
      y: this.details.qr_y,
    });
  }

  /**
   * Draws the logo on the canvas
   */
  private async drawLogo(ctx: CanvasRenderingContext2D): Promise<void> {
    if (
      !this.details.logo_url ||
      this.details.logo_x == null ||
      this.details.logo_y == null ||
      this.details.logo_width == null ||
      this.details.logo_height == null
    ) {
      console.warn('[IDCardGenerator] ⚠️ Logo properties missing — skipping logo drawing');
      return;
    }

    console.log('[IDCardGenerator] Loading logo from:', this.details.logo_url);
    const logoImg = await loadImage(this.details.logo_url);
    ctx.drawImage(
      logoImg,
      this.details.logo_x,
      this.details.logo_y,
      this.details.logo_width,
      this.details.logo_height
    );
    console.log('[IDCardGenerator] Logo drawn at coordinates:', {
      x: this.details.logo_x,
      y: this.details.logo_y,
    });
  }

  /**
   * Draws user photo on the canvas
   */
  private async drawUserPhoto(
    ctx: CanvasRenderingContext2D,
    photoUrl: string
  ): Promise<void> {
    try {
      console.log('[IDCardGenerator] Fetching user photo from:', photoUrl);
      const photoBlob = await fetch(photoUrl).then((res) => res.blob());
      const photoImg = await loadImageFromBlob(photoBlob);

      ctx.drawImage(
        photoImg,
        this.details.user_image_x,
        this.details.user_image_y,
        this.details.user_image_width,
        this.details.user_image_height
      );
      console.log('[IDCardGenerator] User photo drawn at coordinates:', {
        x: this.details.user_image_x,
        y: this.details.user_image_y,
      });
    } catch (error) {
      console.error('[IDCardGenerator] ❌ Failed to load or draw user photo:', error);
    }
  }

/**
   * Draws user information text (Name, City, Profession, Organisation)
   */
/**
   * Draws user information text (Name, City, Profession, Organisation)
   */
  private drawUserInfoText(
    ctx: CanvasRenderingContext2D,
    data: GenerationData
  ): void {
    console.log('[IDCardGenerator] 📝 ========== TEXT DRAWING START ==========');
    console.log('[IDCardGenerator] 👤 User profile data received:', {
      name: data.userProfile.name,
      city: data.userProfile.city,
      profession: data.userProfile.profession,
      organisation_name: data.userProfile.organisation_name,
      image_url: data.userProfile.image_url ? 'Present' : 'Missing',
    });
    
    console.log('[IDCardGenerator] ⚙️ Text box raw configuration from details:', {
      text_box_font_size: this.details.text_box_font_size,
      text_box_font: this.details.text_box_font,
      text_box_color: this.details.text_box_color,
      text_box_x: this.details.text_box_x,
      text_box_y: this.details.text_box_y,
      text_box_width: this.details.text_box_width,
      text_box_height: this.details.text_box_height,
      text_box_alignment: this.details.text_box_alignment,
      text_box_line_height: this.details.text_box_line_height,
    });

    console.log('[IDCardGenerator] 🔧 Custom text data:', data.customText);

    // Build the text content from user profile
    const textLines: string[] = [];
    
    if (data.userProfile.name) {
      const line = `Name: ${data.userProfile.name}`;
      textLines.push(line);
      console.log('[IDCardGenerator] ✅ Added line:', line);
    } else {
      console.log('[IDCardGenerator] ⚠️ No name found in user profile');
    }
    
    if (data.userProfile.city || data.customText?.city) {
      const cityValue = data.customText?.city || data.userProfile.city;
      const line = `City: ${cityValue}`;
      textLines.push(line);
      console.log('[IDCardGenerator] ✅ Added line:', line);
    } else {
      console.log('[IDCardGenerator] ⚠️ No city found in user profile or custom text');
    }
    
    if (data.userProfile.profession) {
      const line = `Profession: ${data.userProfile.profession}`;
      textLines.push(line);
      console.log('[IDCardGenerator] ✅ Added line:', line);
    } else {
      console.log('[IDCardGenerator] ⚠️ No profession found in user profile');
    }
    
    if (data.userProfile.organisation_name) {
      const line = `Organisation: ${data.userProfile.organisation_name}`;
      textLines.push(line);
      console.log('[IDCardGenerator] ✅ Added line:', line);
    } else {
      console.log('[IDCardGenerator] ⚠️ No organisation_name found in user profile');
    }

    console.log('[IDCardGenerator] 📋 Total text lines prepared:', textLines.length);
    console.log('[IDCardGenerator] 📋 Text lines array:', textLines);

    // If no text lines, skip drawing
    if (textLines.length === 0) {
      console.error('[IDCardGenerator] ❌ No user information available to display - SKIPPING TEXT DRAWING');
      return;
    }

    // Use defaults if text box properties are not configured
    const fontSize = this.details.text_box_font_size ?? 48;
    const font = this.details.text_box_font ?? 'Arial';
    const color = this.details.text_box_color ?? '#000000';
    const textX = this.details.text_box_x ?? 50;
    const textY = this.details.text_box_y ?? 50;
    const textWidth = this.details.text_box_width ?? 200;
    const lineHeight = fontSize * (this.details.text_box_line_height ?? 1.5);
    const alignment = this.details.text_box_alignment ?? 'left';

    console.log('[IDCardGenerator] 🎨 Final computed text styling:', {
      fontSize: fontSize,
      font: font,
      color: color,
      textX: textX,
      textY: textY,
      textWidth: textWidth,
      lineHeight: lineHeight,
      alignment: alignment,
      fullFont: `${fontSize}px ${font}`,
    });

    // Set up text styling
    ctx.font = `${fontSize}px ${font}`;
    ctx.fillStyle = color;
    console.log('[IDCardGenerator] ✅ Canvas context font set to:', ctx.font);
    console.log('[IDCardGenerator] ✅ Canvas context fillStyle set to:', ctx.fillStyle);

    let y = textY;

    // Draw each line
    console.log('[IDCardGenerator] 🖊️ Starting to draw lines...');
    for (let i = 0; i < textLines.length; i++) {
      const line = textLines[i];
      const x = getAlignedX(ctx, line, textX, textWidth, "left");
      ctx.fillText(line, x, y);
      console.log(`[IDCardGenerator] ✏️ Line ${i + 1}/${textLines.length}: "${line}" drawn at position (x: ${x}, y: ${y})`);
      y += lineHeight;
    }

    console.log('[IDCardGenerator] ✅ User information text drawing complete');
    console.log('[IDCardGenerator] 📝 ========== TEXT DRAWING END ==========');
  }
}