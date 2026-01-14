"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { BBNDirector } from "./bbnTypes";

interface ModalProps {
  director: BBNDirector;
  onClose: () => void;
}

const BBNDirectorModal = ({ director, onClose }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const modalRoot =
    document.getElementById("modal-root") ||
    (() => {
      const root = document.createElement("div");
      root.id = "modal-root";
      document.body.appendChild(root);
      return root;
    })();

  return createPortal(
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
      <div
        ref={modalRef}
        className="bg-[#111] rounded-xl w-[80vw] h-[90vh] flex overflow-hidden"
        style={{
          transform: isMounted ? "translateY(0)" : "translateY(-100px)",
          transition:
            "transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        }}
      >
        {/* Image */}
        <div className="w-1/2 h-full relative bg-black">
          <Image
            src={director.photo_url}
            alt={director.name}
            fill
            className="object-contain"
          />
        </div>

        {/* Details */}
        <div className="w-1/2 p-8 flex flex-col gap-4 text-white">
          <h2 className="text-2xl font-semibold">{director.name}</h2>

          <div className="space-y-2 text-sm text-gray-300">
            <p>
              <span className="text-gray-400">Phone:</span>{" "}
              {director.phone_number}
            </p>
            <p>
              <span className="text-gray-400">Location:</span>{" "}
              {director.city}, {director.state}
            </p>
            <p>
              <span className="text-gray-400">Region:</span>{" "}
              {director.region}
            </p>
          </div>

          <button
            onClick={onClose}
            className="mt-auto self-start px-4 py-2 bg-white text-black rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default BBNDirectorModal;
