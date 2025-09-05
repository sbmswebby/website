"use client";

import {
  ImageCarousel,
  ImageGrid,
  PortraitScroller,
} from "@/components/ImageComponents";

import "../app/css/image.css"; // ✅ new CSS for animations & layout

export const ImageGallery = () => {


  return (
    <div className="container mx-auto p-8 space-y-12">
      {/* Carousel with autoplay, dots, and swipe */}
      <PortraitScroller />
      <ImageCarousel  />
      

      {/* Masonry Grid with zoom + staggered animation */}
      <ImageGrid  />
    </div>
  );
};
