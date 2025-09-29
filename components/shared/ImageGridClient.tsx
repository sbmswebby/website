"use client";

import { useState} from "react";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import Modal from "@/components/shared/Modal";

export interface ImageData {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

// LazyImage Component
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  onClick?: () => void;
}

const LazyImage = ({ src, alt, className, priority, onClick }: LazyImageProps) => {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: "200px" });

  return (
    <div ref={ref} className={className} onClick={onClick}>
      {inView && (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover w-full h-full"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
        />
      )}
    </div>
  );
};



// Filter images by orientation
const filterImagesByOrientation = (images: ImageData[], mode: "landscape" | "portrait"): ImageData[] => {
  return images.filter(img => {
    if (!img.width || !img.height) return true; // Include if dimensions unknown
    const isLandscape = img.width >= img.height;
    return mode === "landscape" ? isLandscape : !isLandscape;
  });
};

// Image Grid Component
interface ImageGridProps {
  images: ImageData[];
}

export const ImageGridClient = ({ images: allImages }: ImageGridProps) => {
  const images = filterImagesByOrientation(allImages, "landscape");
  const [modalImage, setModalImage] = useState<ImageData | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <div className="container mt-10 mx-auto my-10 gap-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <LazyImage
              key={index}
              src={image.src}
              alt={image.alt}
              className="relative overflow-hidden rounded-lg shadow-md transition-transform duration-300 hover:scale-105 cursor-pointer aspect-[16/9]"
              onClick={() => setModalImage(image)}
            />
          ))}
        </div>
      </div>

      {modalImage && (
        <Modal
          src={modalImage.src}
          alt={modalImage.alt}
          onClose={() => setModalImage(null)}
        />
      )}
    </>
  );
};