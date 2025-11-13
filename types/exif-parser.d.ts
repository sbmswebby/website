declare module "exif-parser" {
  /**
   * Represents known EXIF tags that are commonly extracted from image metadata.
   * This interface can be extended later if needed.
   */
  export interface ExifTags {
    Orientation?: number;
    Make?: string;
    Model?: string;
    DateTimeOriginal?: string;
    ExposureTime?: number;
    FNumber?: number;
    ISOSpeedRatings?: number;
    FocalLength?: number;
    LensModel?: string;
  }

  /**
   * Represents the structure of the parsed EXIF data.
   */
  export interface ExifData {
    tags: ExifTags;
    imageSize?: {
      width: number;
      height: number;
    };
    thumbnailOffset?: number;
    thumbnailLength?: number;
  }

  /**
   * Interface for the parser instance returned by exifParser.create().
   */
  export interface ExifParser {
    parse(): ExifData;
  }

  /**
   * Factory interface for creating an EXIF parser.
   */
  export interface ExifParserFactory {
    create(buffer: Buffer): ExifParser;
  }

  /**
   * The default exported parser factory.
   */
  const exifParser: ExifParserFactory;

  export default exifParser;
}
