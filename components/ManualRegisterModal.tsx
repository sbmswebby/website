// components/ManualRegisterModal.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ManualRegisterModalProps {
  onClose: () => void;
  onSubmit: (form: {
    name: string;
    whatsapp: string;
    organisation?: string;
    profession?: string;
    user_selected_session_id: string;
    photo?: File | null;
  }) => Promise<void>;
  sessionId: string;
  isProcessing: boolean;
}

export default function ManualRegisterModal({
  onClose,
  onSubmit,
  sessionId,
  isProcessing,
}: ManualRegisterModalProps) {
  const [formData, setFormData] = useState({
    user_name: "",
    whatsapp_number: "",
    beautyparlor_name: "",
    profession: "",
    photo: null as File | null,
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await onSubmit({
      name: formData.user_name,
      whatsapp: formData.whatsapp_number,
      organisation: formData.beautyparlor_name,
      profession: formData.profession || undefined,
      user_selected_session_id: sessionId,
      photo: formData.photo,
    });
  };

  const modalContent = (
    <div
      id="form"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50"
    >
      <div className="bg-[#0a0a0a] rounded-lg shadow-lg p-6 w-full max-w-md relative border border-[rgba(255,107,157,0.15)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          style={{
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          className="absolute top-2 right-2 text-gray-300 hover:text-white"
        >
          <p className=" font-black text-5xl">✕</p>
        </button>

        <h3 className="mb-4 text-lg font-bold text-white text-center">Register</h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Full Name"
            required
            value={formData.user_name}
            onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
            className="mb-2 w-full p-2 border rounded bg-[#0a0a0a] text-white"
          />
          <input
            type="text"
            placeholder="WhatsApp Number"
            required
            value={formData.whatsapp_number}
            onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
            className="mb-2 w-full p-2 border rounded bg-[#0a0a0a] text-white"
          />
          <input
            type="text"
            placeholder="Beauty Parlor / Salon Name"
            value={formData.beautyparlor_name}
            onChange={(e) => setFormData({ ...formData, beautyparlor_name: e.target.value })}
            className="mb-2 w-full p-2 border rounded bg-[#0a0a0a] text-white"
          />
          <input
            type="text"
            placeholder="Profession (optional)"
            value={formData.profession}
            onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
            className="mb-2 w-full p-2 border rounded bg-[#0a0a0a] text-white"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setFormData({ ...formData, photo: e.target.files ? e.target.files[0] : null })
            }
            className="mb-2 w-full p-2 border rounded bg-[#0a0a0a] text-white"
          />

          <button
            type="submit"
            disabled={isProcessing}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-yellow-300 text-black rounded mt-2 w-full"
          >
            {isProcessing ? "Processing..." : "Submit & Download Ticket"}
          </button>
        </form>
      </div>
    </div>
  );

  return mounted ? createPortal(modalContent, document.body) : null;
}
