"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useInView } from "react-intersection-observer";

// -------------------------
// Types
// -------------------------
export interface ImageData {
  src: string;
  alt: string;
  link?: string;
  width?: number;
  height?: number;
}

// -------------------------
// Fetch gallery images
// -------------------------
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

// -------------------------
// Filter hook (portrait/landscape)
// -------------------------
const useFilteredImages = (mode: "landscape" | "portrait") => {
  const rawImages = useGalleryImages();
  const [images, setImages] = useState<ImageData[]>([]);

  useEffect(() => {
    const loadDimensions = async () => {
      const filtered: ImageData[] = [];

      for (const img of rawImages) {
        if (img.width && img.height) {
          const isLandscape = img.width >= img.height;
          if ((mode === "landscape" && isLandscape) || (mode === "portrait" && !isLandscape)) {
            filtered.push(img);
          }
          continue;
        }

        // Otherwise, measure it
        await new Promise<void>((resolve) => {
          const i = new window.Image();
          i.src = img.src;
          i.onload = () => {
            const isLandscape = i.naturalWidth >= i.naturalHeight;
            if ((mode === "landscape" && isLandscape) || (mode === "portrait" && !isLandscape)) {
              filtered.push({
                ...img,
                width: i.naturalWidth,
                height: i.naturalHeight,
              });
            }
            resolve();
          };
          i.onerror = () => resolve();
        });
      }

      setImages(filtered);
    };

    if (rawImages.length) loadDimensions();
  }, [rawImages, mode]);

  return images;
};

// -------------------------
// LazyImage Component
// -------------------------
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
// -------------------------
// Modal (Fixed Version)
// -------------------------
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

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
      }}
    >
      <div
        ref={modalRef}
        className="relative h-full w-full overflow-hidden rounded-lg shadow-2xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
          aria-label="Close modal"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        
        <Image
          src={src}
          alt={alt}
          width={1920}
          height={1080}
          className="object-cover w-full h-full max-h-[90vh] max-w-[90vw]"
        />
      </div>
    </div>
  );
};

// -------------------------
// Image Carousel (Landscape)
// -------------------------
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
  const images = useFilteredImages("landscape");
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

        {/* Nav buttons */}
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

        {/* Dots */}
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

// -------------------------
// Image Grid (Landscape)
// -------------------------
export const ImageGrid = () => {
  const images = useFilteredImages("landscape");
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

// -------------------------
// Portrait Scroller
// -------------------------
export const PortraitScroller = () => {
  const images = useFilteredImages("portrait");
  const [isHovered, setIsHovered] = useState(false);

  if (images.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden py-6">
      <div
        className={`flex gap-6 animate-scroll ${isHovered ? "pause-scroll" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {[...images, ...images].map((image, index) => (
          <div
            key={index}
            className="relative w-60 h-150 flex-shrink-0 overflow-hidden rounded-lg shadow-md transition-transform duration-500 hover:scale-110"
          >
            <Image src={image.src} alt={image.alt} fill className="object-cover" />
          </div>
        ))}
      </div>

      {/* Animation */}
      <style jsx>{`
        .animate-scroll {
          animation: scroll 25s linear infinite;
        }
        .pause-scroll {
          animation-play-state: paused;
        }
        @keyframes scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
};
