"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 4000); // 4s
    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="loading-screen flex flex-col items-center justify-center h-screen bg-white">
      {/* Logo */}
      <div className="loading-logo mb-4 flex justify-center">
        <Image
          src="/images/sbms_logo.svg"
          alt="SBMS Logo"
          width={250}
          height={250}
          className="object-contain"
        />
      </div>

      {/* Subtitle */}
      <div className="loading-subtitle text-gray-600 text-center mb-6">
        South Indian Bridal Makeup Studio & Academy
      </div>

      {/* Progress Bar */}
      <div className="loading-progress w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="loading-bar bg-green-600 h-full w-0 animate-loading"></div>
      </div>

      <style jsx>{`
        .animate-loading {
          animation: loading-bar 4s linear forwards;
        }
        @keyframes loading-bar {
          from { width: 0; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
