"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

/**
 * BasicCard - Tailwind version with 3D tilt on hover and glow that tracks the cursor only inside the card.
 */
const BasicCard: React.FC = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState(false);

  /** Handle mouse movement (only while hovered) */
  const handleMouseMove = useCallback(
    (event: MouseEvent): void => {
      if (!isHovered) return;

      const wrapper = wrapperRef.current;
      const card = cardRef.current;
      const glow = glowRef.current;
      if (!wrapper || !card || !glow) return;

      const rect = wrapper.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Clamp x/y so glow doesn't go outside
      const clampedX = Math.min(Math.max(x, 0), rect.width);
      const clampedY = Math.min(Math.max(y, 0), rect.height);

      const rotX = ((clampedY - rect.height / 2) / rect.height) * -15;
      const rotY = ((clampedX - rect.width / 2) / rect.width) * 15;

      // Apply tilt
      card.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;

      // Move glow within bounds
      glow.style.backgroundImage = `
        radial-gradient(circle at ${clampedX}px ${clampedY}px, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 10%, transparent 25%)
      `;
    },
    [isHovered]
  );

  /** Reset tilt & glow when mouse leaves */
  const handleMouseLeave = useCallback((): void => {
    const card = cardRef.current;
    const glow = glowRef.current;
    if (!card || !glow) return;

    setIsHovered(false);
    card.style.transform = "rotateX(0deg) rotateY(0deg)";
    glow.style.opacity = "0"; // fade out glow
  }, []);

  /** Activate hover state */
  const handleMouseEnter = useCallback((): void => {
    setIsHovered(true);

    const glow = glowRef.current;
    if (glow) glow.style.opacity = "1"; // fade in glow
  }, []);

  /** Attach mouse listeners */
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    wrapper.addEventListener("mousemove", handleMouseMove);
    wrapper.addEventListener("mouseenter", handleMouseEnter);
    wrapper.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      wrapper.removeEventListener("mousemove", handleMouseMove);
      wrapper.removeEventListener("mouseenter", handleMouseEnter);
      wrapper.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave]);

  return (
    <div
      ref={wrapperRef}
      className="relative mx-auto my-20 flex items-center justify-center"
      style={{ perspective: "1000px" }}
    >
      {/* === Subtle Edge Glow (Behind card) === */}
      <div
        ref={glowRef}
        className="absolute inset-0 pointer-events-none z-0 rounded-2xl opacity-0 blur-[20px] mix-blend-screen transition-opacity duration-500 ease-out"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.4) 10%, transparent 25%)",
        }}
      ></div>

      {/* === Main Card === */}
      <div
        ref={cardRef}
        className="relative z-10 h-[420px] w-[360px] rounded-2xl p-10 
        bg-[rgba(10,10,10,0.9)] border border-[rgba(255,255,255,0.25)]
        shadow-[0_10px_40px_rgba(0,0,0,0.8)] 
        backdrop-blur-2xl transform-gpu transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* === Animated Grain Overlay === */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none z-20 mix-blend-screen
          opacity-60 animate-[grain-wave_3s_ease-in-out_infinite,coverage-wave_3s_ease-in-out_infinite]
          bg-[rgba(255,255,255,0.7)]
          [mask-image:linear-gradient(to_top_right,black_0%,black_calc(var(--mask-start)*1%),transparent_calc(var(--mask-fade)*1%),transparent_100%)]
          filter-[url(#grainy-noise)]"
        />

        {/* === Card Content === */}
        <div className="relative z-30 flex flex-col justify-center h-full text-center text-white">
          <h2 className="text-3xl font-extrabold mb-4">Gold & Teal Card</h2>
          <p className="text-gray-300 font-light mb-6 leading-relaxed">
            Smooth 3D tilt only on hover, with a subtle edge glow and animated
            grain texture. Built with pure Tailwind CSS and TypeScript.
          </p>
          <button
            className="relative mx-auto px-6 py-3 font-semibold rounded-md text-[#0d0126]
            bg-gradient-to-r from-[#c49c33] to-[#1aa7a7]
            shadow-[0_5px_15px_rgba(196,156,51,0.4)]
            transition-all duration-200 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
            overflow-hidden hover:-translate-y-1 hover:shadow-[0_12px_25px_rgba(196,156,51,0.6)]
            before:content-[''] before:absolute before:top-0 before:left-[-100%]
            before:w-full before:h-full before:bg-[rgba(255,255,255,0.3)]
            before:skew-x-[-30deg] before:transition-all before:duration-500 hover:before:left-[150%]"
          >
            Learn More
          </button>
        </div>
      </div>

      {/* === Grainy Noise Filter === */}
      <svg width="0" height="0">
        <filter id="grainy-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>

      {/* === Grain Animations === */}
      <style>{`
        @keyframes grain-wave {
          0%,100% { opacity: 0.6; }
          50% { opacity: 0.3; }
        }
        @keyframes coverage-wave {
          0%,100% { --mask-start: 20; --mask-fade: 80; }
          50% { --mask-start: 40; --mask-fade: 100; }
        }
      `}</style>
    </div>
  );
};

export default BasicCard;
