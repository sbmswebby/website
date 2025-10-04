// idCardGenerator.ts - ID Card generation logic
// Location: lib/generation/idCardGenerator.ts

import QRCode from 'qrcode';
import { IDCardDetails, GenerationData } from './types';
import {
  loadImage,
  loadImageFromBlob,
  drawWrappedText,
  getAlignedX,
  replacePlaceholders,
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

    // Step 5: Draw text box content
    console.log('[IDCardGenerator] ⏳ Drawing text content...');
    this.drawTextBox(ctx, data);
    console.log('[IDCardGenerator] ✅ Text content drawn successfully');

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
   * Draws the text box with dynamic content
   */
  private drawTextBox(
    ctx: CanvasRenderingContext2D,
    data: GenerationData
  ): void {
    if (
      !this.details.text_content ||
      this.details.text_box_font_size == null ||
      this.details.text_box_width == null ||
      this.details.text_box_height == null
    ) {
      console.warn('[IDCardGenerator] ⚠️ Text box not fully configured — skipping text drawing');
      return;
    }

    console.log('[IDCardGenerator] Preparing dynamic text replacements...');
    const replacements: Record<string, string> = {
      name: data.userProfile.name || '',
      whatsapp: data.userProfile.whatsapp_number || '',
      profession: data.userProfile.profession || '',
      organisation: data.userProfile.organisation_name || '',
      city: data.userProfile.city || '',
      registration_number: String(data.registrationNumber || ''),
      ...data.customText,
    };

    const processedText = replacePlaceholders(this.details.text_content, replacements);
    console.log('[IDCardGenerator] Processed text after replacements:', processedText);

    // Set up text styling
    ctx.font = `${this.details.text_box_font_size}px ${this.details.text_box_font}`;
    ctx.fillStyle = this.details.text_box_color;

    const lineHeight = this.details.text_box_font_size * this.details.text_box_line_height;

    if (this.details.text_box_warp) {
      console.log('[IDCardGenerator] Drawing wrapped text...');
      const startX =
        this.details.text_box_alignment === 'left'
          ? this.details.text_box_x
          : this.details.text_box_alignment === 'center'
          ? this.details.text_box_x + this.details.text_box_width / 2
          : this.details.text_box_x + this.details.text_box_width;

      ctx.textAlign = this.details.text_box_alignment as CanvasTextAlign;

      drawWrappedText(
        ctx,
        processedText,
        startX,
        this.details.text_box_y,
        this.details.text_box_width,
        lineHeight
      );
    } else {
      console.log('[IDCardGenerator] Drawing non-wrapped text lines...');
      const lines = processedText.split('\n');
      let y = this.details.text_box_y;

      for (const line of lines) {
        const x = getAlignedX(
          ctx,
          line,
          this.details.text_box_x,
          this.details.text_box_width,
          this.details.text_box_alignment as 'left' | 'center' | 'right'
        );
        ctx.fillText(line, x, y);
        y += lineHeight;
      }
    }

    console.log('[IDCardGenerator] ✅ Text box drawing complete');
  }
}
