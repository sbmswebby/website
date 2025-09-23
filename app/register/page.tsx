// app/register/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import useEventRegistration from "@/utils/useEventRegistration";
import Modal from "@/components/Modal"; // make sure the path is correct

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventId = searchParams.get("eventId") || "";
  const sessionId = searchParams.get("sessionId") || "";

  const { handleManualSubmit, isProcessing } = useEventRegistration(eventId, sessionId);

  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [parlor, setParlor] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    try {
      await handleManualSubmit({
        user_name: name,
        whatsapp_number: whatsapp,
        beautyparlor_name: parlor,
      });

      setMessage({ type: "success", text: "Registered successfully!" });

      
      // Optionally redirect after a delay
      setTimeout(() => {
        router.push(`/events/${eventId}?sessionId=${sessionId}`);
      }, 2000);

    } catch (error) {
      setMessage({ 
        type: "error", 
        text: `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  };

  return (
    <div id="signIn">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold text-center mb-4">Manual Registration</h2>

        {message && (
          <div className={`p-3 mb-4 rounded ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Full Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1">WhatsApp Number <span className="text-red-500">*</span></label>
            <input
              type="tel"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1">Beauty Parlor / Salon Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={parlor}
              onChange={(e) => setParlor(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isProcessing ? "Processing..." : "Register"}
          </button>
        </form>
      </div>


    </div>
  );
}