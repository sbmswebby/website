"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

interface ModalProps {
  src: string;
  alt: string;
  onClose: () => void;
}

const Modal = ({ src, alt, onClose }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Close modal on clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Mount modal with animation
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Portal root
  const modalRoot =
    document.getElementById("modal-root") ||
    (() => {
      const root = document.createElement("div");
      root.id = "modal-root";
      document.body.appendChild(root);
      return root;
    })();

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        ref={modalRef}
        style={{
          width: "80vw",
          height: "90vh",
          backgroundColor: "#111",
          borderRadius: "12px",
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transform: isMounted
            ? "translateY(0)"
            : "translateY(-100px)",
          transition: "transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)", // bounce effect
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={1920}
          height={1080}
          style={{ objectFit: "contain", width: "100%", height: "100%" }}
        />
      </div>
    </div>,
    modalRoot
  );
};

export default Modal;
