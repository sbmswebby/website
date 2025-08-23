"use client";
import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 4000); // 4s
    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="loading-screen">
      <div className="loading-logo">SBMS</div>
      <div className="loading-subtitle">
        South Indian Bridal Makeup Studio & Academy
      </div>
      <div className="loading-progress">
        <div className="loading-bar"></div>
      </div>
    </div>
  );
}
