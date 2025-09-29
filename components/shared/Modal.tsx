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
  const [scrollY, setScrollY] = useState(0);

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

  // Track scroll Y
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    handleScroll(); // initial value
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
        position: "absolute",
        top: scrollY + 50, // offset if needed
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        backgroundColor: "rgba(0,0,0,0.7)",
        padding: "16px",
      }}
    >
      <div ref={modalRef} style={{ maxWidth: "90vw", maxHeight: "80vh", overflow: "auto" }}>
        <Image src={src} alt={alt} width={1920} height={1080} style={{ objectFit: "contain", width: "100%", height: "100%" }} />
      </div>
    </div>,
    modalRoot
  );
};

export default Modal;
