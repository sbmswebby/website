"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useInView } from "react-intersection-observer";

// Define the type for image data
export interface ImageData {
  src: string;
  alt: string;
  link?: string;
}

// ---
// Fetch gallery images from a client-side API route
const useGalleryImages = (): ImageData[] => {
  const [images, setImages] = useState<ImageData[]>([]);

  useEffect(() => {
    fetch("/api/gallery")
      .then((res) => res.json())
      .then(setImages)
      .catch((err) => console.error("Failed to load gallery images:", err));
  }, []);

  return images;
};

// ---
// Lazy-loaded Image wrapper with optional click handler
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
          className="object-contain w-full h-full"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
        />
      )}
    </div>
  );
};

// ---
// Modal Component (sticky on screen)
interface ModalProps {
  src: string;
  alt: string;
  onClose: () => void;
}

const Modal = ({ src, alt, onClose }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        ref={modalRef}
        className="relative max-h-full max-w-full overflow-auto rounded-lg shadow-lg"
      >
        <Image
          src={src}
          alt={alt}
          width={1920}
          height={1080}
          className="object-contain w-full h-full"
        />
      </div>
    </div>
  );
};

// ---
// Image Carousel Component
interface ImageCarouselProps {
  autoPlay?: boolean;
  interval?: number;
  showDots?: boolean;
}

export const ImageCarousel = ({
  autoPlay = true,
  interval = 4000,
  showDots = true,
}: ImageCarouselProps) => {
  const images = useGalleryImages();
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

  const handlePrev = () =>
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );

  const handleNext = () =>
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );

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
          onClick={handlePrev}
          aria-label="Previous slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-white hover:bg-black/30"
        >
          &#10094;
        </button>
        <button
          onClick={handleNext}
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

// ---
// Image Grid Component
export const ImageGrid = () => {
  const images = useGalleryImages();
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
