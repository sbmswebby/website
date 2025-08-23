// @/components/ImageComponents.tsx

"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

// Define the type for image data, including an optional link.
export interface ImageData {
  src: string;
  alt: string;
  link?: string;
}

// ---

//## Image Carousel Component

//This component displays a slideshow of images with automatic playback, navigation, and lazy loading. It's designed to be reusable and responsive.

interface ImageCarouselProps {
  images: ImageData[];
}

export const ImageCarousel = ({ images }: ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to reset the autoplay timer.
  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  // Autoplay functionality using useEffect.
  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(
      () =>
        setCurrentIndex((prevIndex) =>
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        ),
      4000 // Change image every 4 seconds
    );

    return () => resetTimeout();
  }, [currentIndex, images.length]);

  // Navigate to the previous image.
  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // Navigate to the next image.
  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="relative w-full h-250 overflow-hidden rounded-lg shadow-xl">
      {/* Main carousel container */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="relative w-full flex-shrink-0">
            {/* Using next/image for optimized performance and lazy loading. */}
            <Image
              src={image.src}
              alt={image.alt}
              width={1920}
              height={1080}
              className="object-cover w-full h-full"
              priority={index === 0} // Prioritize first image for LCP
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            {/* Optional caption overlay */}
            {image.link && (
              <div className="absolute inset-x-0 bottom-0 p-4 text-center text-white bg-black bg-opacity-50">
                <a href={image.link} className="hover:underline">
                  {image.alt}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-white transition-colors duration-300 hover:bg-black/30"
      >
        &#10094;
      </button>
      <button
        onClick={handleNext}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-white transition-colors duration-300 hover:bg-black/30"
      >
        &#10095;
      </button>

      {/* Indicator Dots */}
      <div className="absolute inset-x-0 bottom-4 flex justify-center space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-2 w-2 rounded-full transition-colors duration-300 ${
              currentIndex === index ? 'bg-white' : 'bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};


// Image Grid Component

//This component displays a responsive grid of images with a subtle hover effect.

interface ImageGridProps {
  images: ImageData[];
}

export const ImageGrid = ({ images }: ImageGridProps) => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {images.map((image, index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded-lg shadow-md transition-transform duration-300 hover:scale-105 cursor-pointer"
        >
          <Image
            src={image.src}
            alt={image.alt}
            width={600}
            height={400}
            className="h-full w-full object-cover transition-all duration-300 hover:brightness-75"
            loading="lazy"
          />
        </div>
      ))}
    </div>
    </div>
  );
};


// Image Lightbox Component

// This component is a full-screen modal that displays a single, larger image.

