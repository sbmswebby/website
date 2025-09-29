"use client";

import { useState, useEffect, useRef } from "react";
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

// Image Carousel Component
interface ImageCarouselProps {
  images: ImageData[];
  autoPlay?: boolean;
  interval?: number;
  showDots?: boolean;
}

export const ImageCarouselClient = ({
  images: allImages,
  autoPlay = true,
  interval = 4000,
  showDots = true,
}: ImageCarouselProps) => {
  const images = filterImagesByOrientation(allImages, "landscape");
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [modalImage, setModalImage] = useState<ImageData | null>(null);

  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    if (autoPlay && images.length > 0) {
      resetTimeout();
      timeoutRef.current = setTimeout(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
      }, interval);
    }
    return () => resetTimeout();
  }, [currentIndex, images.length, autoPlay, interval]);

  if (images.length === 0) return null;

  return (
    <>
      <div className="relative w-full overflow-hidden rounded-lg shadow-xl">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <LazyImage
              key={index}
              src={image.src}
              alt={image.alt}
              className="relative w-full flex-shrink-0 aspect-[16/9] cursor-pointer"
              priority={index === 0}
              onClick={() => setModalImage(image)}
            />
          ))}
        </div>

        <button
          onClick={() =>
            setCurrentIndex((prev) =>
              prev === 0 ? images.length - 1 : prev - 1
            )
          }
          aria-label="Previous slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-white hover:bg-black/30"
        >
          &#10094;
        </button>
        <button
          onClick={() =>
            setCurrentIndex((prev) =>
              prev === images.length - 1 ? 0 : prev + 1
            )
          }
          aria-label="Next slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-white hover:bg-black/30"
        >
          &#10095;
        </button>

        {showDots && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                  currentIndex === index ? "bg-white" : "bg-gray-400"
                }`}
              />
            ))}
          </div>
        )}
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