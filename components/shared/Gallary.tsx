import fs from "fs";
import path from "path";
import sizeOf from "image-size";
import { ImageCarouselClient } from "@/components/shared/ImageCarouselClient";
import { ImageGridClient } from "@/components/shared/ImageGridClient";
import { PortraitScrollerClient } from "@/components/shared/PortraitScrollerClient";

export interface ImageData {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export default function Gallery() {
  // Read images from filesystem and get dimensions
  const galleryPath = path.join(process.cwd(), "public/images/gallery");
  const files = fs.readdirSync(galleryPath).filter((f) =>
    /\.(png|jpe?g|gif|webp|avif)$/i.test(f)
  );

  const galleryImages: ImageData[] = files.map((file) => {
    const filePath = path.join(galleryPath, file);
    let width: number | undefined;
    let height: number | undefined;

    try {
      const dimensions = sizeOf(fs.readFileSync(filePath));
      width = dimensions.width;
      height = dimensions.height;
    } catch (error) {
      console.error(`Failed to get dimensions for ${file}:`, error);
    }

    return {
      src: `/images/gallery/${file}`,
      alt: file.split(".")[0].replace(/[-_]/g, " "),
      width,
      height,
    };
  });

  // Separate images by orientation
  const landscapeImages = galleryImages.filter(
    (img) => img.width && img.height && img.width >= img.height
  );
  const portraitImages = galleryImages.filter(
    (img) => img.width && img.height && img.width < img.height
  );

  return (
    <section className="section fade-in w-full" id="gallery">
      <h2 className="section-title">Gallery</h2>
      <p className="section-subtitle">
        Explore our stunning portfolio of bridal transformations, showcasing the
        artistry and skill of our talented makeup artists.
      </p>

      <div className="services-grid">
        <div className="service-card">
          <h3>Bridal Transformations</h3>
          <p>
            Witness the magical transformation of our beautiful brides, each
            look carefully crafted to enhance their unique features and personal
            style.
          </p>
        </div>

        <div className="service-card">
          <h3>Behind the Scenes</h3>
          <p>
            Get an exclusive look at our creative process, from initial
            consultation to the final stunning result, showcasing the meticulous
            attention to detail.
          </p>
        </div>

        <div className="service-card">
          <h3>Student Work</h3>
          <p>
            Celebrate the achievements of our academy students with a showcase
            of their exceptional work and artistic growth throughout their
            learning journey.
          </p>
        </div>
      </div>

      <div className="h-10"></div>

      {/* Scroller for portrait images */}
      <PortraitScrollerClient images={portraitImages} />

      <div className="h-10"></div>

      {/* Carousel for landscape images */}
      <ImageCarouselClient
        images={landscapeImages}
        autoPlay={true}
        interval={4000}
        showDots={true}
      />

      <div className="h-10"></div>

      {/* Grid for landscape images */}
      <ImageGridClient images={landscapeImages} />


      
    </section>
  );
}
