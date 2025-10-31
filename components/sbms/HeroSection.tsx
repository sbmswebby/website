"use client";

import React from "react";

/**
 * 🎥 Hero Section
 * -------------------------------------------------
 * - Background video always takes full screen width.
 * - Height is responsive (auto-adjusts to aspect ratio).
 * - CTA buttons are overlaid at the lower side of the video.
 * - Includes gradient + optional particle overlay.
 */
const Hero: React.FC = () => {
  return (
    <section
      id="home"
      className="relative w-full overflow-hidden text-center text-white"
    >
      {/* 🎬 Background Video */}
      <div className="relative w-full">
        <video
          className="w-full h-auto object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          poster="/images/hero_fallback.webp"
        >
          {/* Serve smaller file for mobile devices */}
          <source
            src="/videos/hero-mobile.mp4"
            type="video/mp4"
            media="(max-width: 768px)"
          />
          <source
            src="/videos/hero-desktop.mp4"
            type="video/mp4"
            media="(min-width: 769px)"
          />
        </video>

        {/* 🖤 Gradient Overlay for Better Visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

        {/* 🌌 Optional Particle Overlay */}
        <div className="absolute inset-0 hero-particles pointer-events-none">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>

        {/* ✨ CTA Buttons Overlaid on Bottom */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-row sm:flex-row gap-4 justify-center items-center">
          <a
            href="#academy"
            className="cta-button px-6 py-3 rounded-full"
          >
            Explore Academy
          </a>
          <p></p>
          <a
            href="#contact"
            className=" cta-button px-6 py-3 rounded-full border"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
