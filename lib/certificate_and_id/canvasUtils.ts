// canvasUtils.ts - Canvas manipulation utilities
// Location: lib/generation/canvasUtils.ts

/**
 * Converts an image URL to an HTMLImageElement
 */
export const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    console.log("🖼️ [loadImage] Starting image load:");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      console.log("✅ [loadImage] Image loaded successfully:");
      resolve(img);
    };
    img.onerror = (error) => {
      console.error("❌ [loadImage] Failed to load image:", error);
      reject(error);
    };
    img.src = url;
  });

/**
 * Loads an image from a blob
 */
export const loadImageFromBlob = async (blob: Blob): Promise<HTMLImageElement> => {
  console.log("🧩 [loadImageFromBlob] Converting blob to data URL...");
  const dataUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      console.log("📄 [loadImageFromBlob] Blob converted to DataURL");
      resolve(reader.result as string);
    };
    reader.readAsDataURL(blob);
  });

  const image = await loadImage(dataUrl);
  console.log("✅ [loadImageFromBlob] Image loaded from blob successfully");
  return image;
};

/**
 * Converts canvas to a File object
 */
export const canvasToFile = (
  canvas: HTMLCanvasElement,
  filename: string,
  quality: number = 0.95
): Promise<File> =>
  new Promise((resolve, reject) => {
    console.log("🧾 [canvasToFile] Converting canvas to file:", filename);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          console.error("❌ [canvasToFile] Failed to convert canvas to blob");
          reject(new Error("Failed to convert canvas to blob"));
          return;
        }
        const file = new File([blob], filename, { type: "image/jpeg" });
        console.log("✅ [canvasToFile] Canvas successfully converted to File:", filename);
        resolve(file);
      },
      "image/jpeg",
      quality
    );
  });

/**
 * Converts canvas to base64 data URL
 */
export const canvasToBase64 = (
  canvas: HTMLCanvasElement,
  quality: number = 0.95
): string => {
  console.log("🎨 [canvasToBase64] Converting canvas to base64...");
  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  console.log("✅ [canvasToBase64] Conversion successful (base64 string created)");
  return dataUrl;
};

/**
 * Draws text with word wrapping
 */
export const drawWrappedText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): void => {
  console.log("✏️ [drawWrappedText] Drawing wrapped text...");
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (const word of words) {
    const testLine = line + word + " ";
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && line !== "") {
      ctx.fillText(line.trim(), x, currentY);
      line = word + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }

  ctx.fillText(line.trim(), x, currentY);
  console.log("✅ [drawWrappedText] Text drawing complete");
};

/**
 * Applies text alignment
 */
export const getAlignedX = (
  ctx: CanvasRenderingContext2D,
  text: string,
  baseX: number,
  boxWidth: number,
  alignment: "left" | "center" | "right"
): number => {
  console.log("📏 [getAlignedX] Calculating aligned X for:", alignment);
  if (alignment === "left") {
    console.log("↩️ [getAlignedX] Left alignment applied");
    return baseX;
  }

  const textWidth = ctx.measureText(text).width;
  let alignedX: number;

  if (alignment === "center") {
    alignedX = baseX + (boxWidth - textWidth) / 2;
    console.log("↔️ [getAlignedX] Center alignment applied");
  } else {
    alignedX = baseX + boxWidth - textWidth;
    console.log("➡️ [getAlignedX] Right alignment applied");
  }

  console.log("✅ [getAlignedX] Alignment calculation complete:", alignedX);
  return alignedX;
};

/**
 * Replaces placeholders in text with actual values
 * Example: "Hello {{name}}" with {name: "John"} becomes "Hello John"
 */
export const replacePlaceholders = (
  text: string | null | undefined,
  replacements: Record<string, string>
): string => {
  console.log("🧠 [replacePlaceholders] Replacing placeholders in text...");
  if (!text) {
    console.warn("⚠️ [replacePlaceholders] Text is null or undefined");
    return "";
  }

  let result = text;
  for (const [key, value] of Object.entries(replacements)) {
    const safeValue = value ?? "";
    result = result.replace(new RegExp(`{{${key}}}`, "g"), safeValue);
    console.log(`🔁 [replacePlaceholders] Replaced {{${key}}} → "${safeValue}"`);
  }

  console.log("✅ [replacePlaceholders] Placeholder replacement complete");
  return result;
};
