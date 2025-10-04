// certificateGenerator.ts - Certificate generation logic
// Location: lib/generation/certificateGenerator.ts

import { CertificateTemplate, GenerationData } from './types';
import {
  loadImage,
  loadImageFromBlob,
  drawWrappedText,
  getAlignedX,
  replacePlaceholders,
} from './canvasUtils';

export class CertificateGenerator {
  private template: CertificateTemplate;

  constructor(template: CertificateTemplate) {
    this.template = template;
    console.log("🧩 [CertificateGenerator] Initialized with template:", template.name);
  }

  /**
   * Generates a certificate canvas
   */
  async generate(data: GenerationData): Promise<HTMLCanvasElement> {
    console.log("🎬 [generate] Starting certificate generation process...");
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('❌ [generate] Failed to get canvas context');

    console.log("🖼️ [generate] Loading base template image...");
    const baseImg = await loadImage(this.template.base_image_url);
    canvas.width = baseImg.width;
    canvas.height = baseImg.height;
    ctx.drawImage(baseImg, 0, 0);
    console.log("✅ [generate] Base image drawn on canvas");

    // Draw logo if present
    if (this.template.logo_url) {
      console.log("🏷️ [generate] Drawing logo...");
      await this.drawLogo(ctx);
      console.log("✅ [generate] Logo drawn successfully");
    } else {
      console.log("ℹ️ [generate] No logo URL found — skipping logo rendering");
    }

    // Draw user photo
    if (data.userProfile.image_url) {
      console.log("👤 [generate] Drawing user photo...");
      await this.drawUserPhoto(ctx, data.userProfile.image_url);
      console.log("✅ [generate] User photo drawn successfully");
    } else {
      console.log("ℹ️ [generate] No user photo provided — skipping");
    }

    // Draw user name
    console.log("🖊️ [generate] Drawing user name...");
    this.drawUserName(ctx, data.userProfile.name);
    console.log("✅ [generate] User name drawn");

    // Draw text box content
    console.log("📝 [generate] Drawing text box content...");
    this.drawTextBox(ctx, data);
    console.log("✅ [generate] Text box drawn successfully");

    console.log("🎉 [generate] Certificate generation complete!");
    return canvas;
  }

  /**
   * Draws the logo on the canvas
   */
  private async drawLogo(ctx: CanvasRenderingContext2D): Promise<void> {
    console.log("🏷️ [drawLogo] Preparing to draw logo...");
    if (
      !this.template.logo_url ||
      this.template.logo_x == null ||
      this.template.logo_y == null ||
      this.template.logo_width == null ||
      this.template.logo_height == null
    ) {
      console.warn("⚠️ [drawLogo] Logo parameters missing — skipping logo draw");
      return;
    }

    const logoImg = await loadImage(this.template.logo_url);
    ctx.drawImage(
      logoImg,
      this.template.logo_x,
      this.template.logo_y,
      this.template.logo_width,
      this.template.logo_height
    );
    console.log("✅ [drawLogo] Logo drawn at", {
      x: this.template.logo_x,
      y: this.template.logo_y,
      width: this.template.logo_width,
      height: this.template.logo_height,
    });
  }

  /**
   * Draws user photo on the canvas
   */
  private async drawUserPhoto(
    ctx: CanvasRenderingContext2D,
    photoUrl: string
  ): Promise<void> {
    console.log("👤 [drawUserPhoto] Attempting to draw user photo from:", photoUrl);
    try {
      const photoBlob = await fetch(photoUrl).then((res) => res.blob());
      const photoImg = await loadImageFromBlob(photoBlob);
      ctx.drawImage(
        photoImg,
        this.template.user_image_x,
        this.template.user_image_y,
        this.template.user_image_width,
        this.template.user_image_height
      );
      console.log("✅ [drawUserPhoto] User photo drawn at", {
        x: this.template.user_image_x,
        y: this.template.user_image_y,
        width: this.template.user_image_width,
        height: this.template.user_image_height,
      });
    } catch (error) {
      console.error("❌ [drawUserPhoto] Failed to load user photo:", error);
    }
  }

  /**
   * Draws user name
   */
  private drawUserName(ctx: CanvasRenderingContext2D, name: string): void {
    console.log(`✏️ [drawUserName] Drawing name: "${name}"`);
    ctx.font = `${this.template.user_name_font_size}px ${this.template.user_name_font}`;
    ctx.fillStyle = this.template.user_name_color;
    ctx.textAlign = 'center';
    ctx.fillText(name, this.template.user_name_x, this.template.user_name_y);
    console.log("✅ [drawUserName] Name drawn at", {
      x: this.template.user_name_x,
      y: this.template.user_name_y,
      font: this.template.user_name_font,
      size: this.template.user_name_font_size,
      color: this.template.user_name_color,
    });
  }

  /**
   * Draws the text box with dynamic content
   */
  private drawTextBox(
    ctx: CanvasRenderingContext2D,
    data: GenerationData
  ): void {
    console.log("🧾 [drawTextBox] Preparing text box content...");
    // Skip if no text content configured or missing required fields
    if (
      !this.template.text_content ||
      this.template.text_box_x == null ||
      this.template.text_box_y == null ||
      this.template.text_box_font_size == null ||
      this.template.text_box_width == null
    ) {
      console.warn("⚠️ [drawTextBox] Text box not fully configured in template");
      return;
    }

    // Prepare replacement values
    const replacements: Record<string, string> = {
      name: data.userProfile.name || '',
      whatsapp: data.userProfile.whatsapp_number || '',
      profession: data.userProfile.profession || '',
      organisation: data.userProfile.organisation_name || '',
      city: data.userProfile.city || '',
      ...data.customText,
    };

    console.log("🔁 [drawTextBox] Applying replacements:", replacements);

    // Replace placeholders in static text
    const processedText = replacePlaceholders(
      this.template.text_content,
      replacements
    );
    console.log("✅ [drawTextBox] Placeholders replaced");

    // Set up text styling
    ctx.font = `${this.template.text_box_font_size}px ${this.template.text_box_font}`;
    ctx.fillStyle = this.template.text_box_color;
    const lineHeight =
      this.template.text_box_font_size * this.template.text_box_line_height;

    if (this.template.text_box_warp) {
      console.log("🌀 [drawTextBox] Drawing wrapped text box...");
      const startX =
        this.template.text_box_alignment === 'left'
          ? this.template.text_box_x
          : this.template.text_box_alignment === 'center'
          ? this.template.text_box_x + this.template.text_box_width / 2
          : this.template.text_box_x + this.template.text_box_width;

      ctx.textAlign = this.template.text_box_alignment as CanvasTextAlign;

      drawWrappedText(
        ctx,
        processedText,
        startX,
        this.template.text_box_y,
        this.template.text_box_width,
        lineHeight
      );
      console.log("✅ [drawTextBox] Wrapped text drawn");
    } else {
      console.log("🧾 [drawTextBox] Drawing text line-by-line...");
      const lines = processedText.split('\n');
      let y = this.template.text_box_y;

      for (const line of lines) {
        const x = getAlignedX(
          ctx,
          line,
          this.template.text_box_x,
          this.template.text_box_width,
          this.template.text_box_alignment as 'left' | 'center' | 'right'
        );
        ctx.fillText(line, x, y);
        y += lineHeight;
        console.log(`🖋️ [drawTextBox] Line drawn: "${line}"`);
      }
      console.log("✅ [drawTextBox] All lines drawn");
    }
  }
}
