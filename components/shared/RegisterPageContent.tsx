"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import useEventRegistration from "@/utils/useEventRegistration";

interface Session {
  id: string;
  name: string;
}

export default function RegisterPageContent() {
  const searchParams = useSearchParams();

  const eventId = searchParams.get("eventId") || "";

  const [sessionId, setSessionId] = useState("");
  const { handleManualSubmit, isProcessing } = useEventRegistration(eventId, sessionId);

  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [parlor, setParlor] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [profession, setProfession] = useState("");
  const [city, setCity] = useState("");


  // Fetch sessions for the event
  useEffect(() => {
    const fetchSessions = async () => {
      if (!eventId) return;
      const { data, error } = await supabase
        .from("sessions")
        .select("id, name")
        .eq("event_id", eventId);

      if (error) {
        console.error("Error fetching sessions:", error.message);
      } else {
        setSessions(data || []);
      }
    };

    fetchSessions();
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    try {
      await handleManualSubmit({
        name,
        whatsapp,
        organisation: parlor,
        user_selected_session_id: sessionId, // <-- passes the selected session properly
        profession: profession || undefined,
        photo,
        city: city || '',
      });

      setMessage({ type: "success", text: "Registered successfully!" });


    } catch (error) {
      setMessage({
        type: "error",
        text: `Registration failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    }
  };

  return (
    <div id="signIn">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold text-center mb-4">Manual Registration</h2>

        {message && (
          <div
            className={`p-3 mb-4 rounded ${
              message.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1">
              WhatsApp Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1">
              Organization <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={parlor}
              onChange={(e) => setParlor(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1">Profession</label>
            <input
              type="text"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
  <label className="block mb-1">
    City <span className="text-red-500">*</span>
  </label>
  <input
    type="text"
    required
    value={city}
    onChange={(e) => setCity(e.target.value)}
    className="w-full border p-2 rounded"
  />
</div>


          <div>
           <label className="block mb-1">
            Upload Photo:{" "}
            <span className="font-black text-red-600">POTRAIT with CLEAR FACE</span>
          </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="session-select">
            <label className="block mb-1">
              Select Session <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">-- Select Session --</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
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
