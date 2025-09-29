"use client";

import { useState } from "react";
import Image from "next/image";

export interface ImageData {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

// Filter images by orientation
const filterImagesByOrientation = (images: ImageData[], mode: "landscape" | "portrait"): ImageData[] => {
  return images.filter(img => {
    if (!img.width || !img.height) return true; // Include if dimensions unknown
    const isLandscape = img.width >= img.height;
    return mode === "landscape" ? isLandscape : !isLandscape;
  });
};

// Portrait Scroller Component
interface PortraitScrollerProps {
  images: ImageData[];
}

export const PortraitScrollerClient = ({ images: allImages }: PortraitScrollerProps) => {
  const images = filterImagesByOrientation(allImages, "portrait");
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
            className="relative w-60 h-96 flex-shrink-0 overflow-hidden rounded-lg shadow-md transition-transform duration-500 hover:scale-110"
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