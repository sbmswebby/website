"use client";

import {
  ImageCarousel,
  ImageGrid,
} from "@/components/ImageComponents";

import "../app/css/image.css"; // ✅ new CSS for animations & layout

export const ImageGallery = () => {
  const images = [
    { src: "/images/image1.jpeg", alt: "Image 1" },
    { src: "/images/image2.jpeg", alt: "Image 2" },
    { src: "/images/image3.jpeg", alt: "Image 3" },
    { src: "/images/image4.jpeg", alt: "Image 4" },
    { src: "/images/image5.jpeg", alt: "Image 5" },
  ];

  return (
    <div className="container mx-auto p-8 space-y-12">
      {/* Carousel with autoplay, dots, and swipe */}
      <ImageCarousel images={images} autoPlay interval={4000} showDots />

      {/* Masonry Grid with zoom + staggered animation */}
      <ImageGrid images={images} />
    </div>
  );
};
