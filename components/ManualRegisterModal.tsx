"use client";

import { FormEvent, useState } from "react";



export interface AllEventRegistration {
  id: string;
  user_name: string;
  whatsapp_number: string;
  beautyparlor_name: string | null;
  event_name: string;
  session_name: string | null;
  registration_number: number;
}

export interface UserProfile {
  full_name: string;
  number: string;
  organisation: string | null;
  role?: string;
}

export interface EventRegistration {
  id: string;
}

export interface SessionData {
  name: string;
}

export interface EventData {
  name: string;
}

export interface TicketData {
  name: string;
  whatsapp: string;
  beautyParlor: string;
  eventName: string;
  sessionName?: string;
  registrationNumber: string | number;
}


interface ManualRegisterModalProps {
  onClose: () => void;
  onSubmit: (form: { user_name: string; whatsapp_number: string; beautyparlor_name: string }) => Promise<void>;
  isProcessing: boolean;
}

export default function ManualRegisterModal({ onClose, onSubmit, isProcessing }: ManualRegisterModalProps) {
  const [formData, setFormData] = useState({
    user_name: "",
    whatsapp_number: "",
    beautyparlor_name: "",
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div id="form">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✕
        </button>
        <h3 className="mb-4 text-lg bg-[#0a0a0a] font-bold">Register</h3>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            required
            value={formData.user_name}
            onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
            className="mb-2 w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="WhatsApp Number"
            required
            value={formData.whatsapp_number}
            onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
            className="mb-2 w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Beauty Parlor / Salon Name"
            required
            value={formData.beautyparlor_name}
            onChange={(e) => setFormData({ ...formData, beautyparlor_name: e.target.value })}
            className="mb-2 w-full p-2 border rounded"
          />
          <button
            type="submit"
            disabled={isProcessing}
            className="px-4 py-2 bg-blue-600 text-white rounded mt-2 w-full"
          >
            {isProcessing ? "Processing..." : "Submit & Download Ticket"}
          </button>
        </form>
      </div>
    </div>
  );
}
