'use client';

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, JSX } from "react";
import { supabase } from "@/lib/supabaseClient";
import useEventRegistration from "@/utils/useEventRegistration";
import { GenerationOrchestrator } from "@/lib/certificate_and_id/generationOrchestrator";
import { DownloadService } from "@/lib/certificate_and_id/downloadService";
import { createPortal } from "react-dom";
import Image from "next/image";

// ------------------------------------------------------
// Type Definitions
// ------------------------------------------------------
interface Session {
  id: string;
  name: string;
}

interface DownloadItem {
  url: string;
  label: string;
  filename: string;
}

export default function RegisterPageContent(): JSX.Element {
  const searchParams = useSearchParams();
  const eventId: string = searchParams.get("eventId") || "";
  const urlSessionId: string | null = searchParams.get("sessionId");

  // ------------------------------------------------------
  // Form State
  // ------------------------------------------------------
  const [sessionId, setSessionId] = useState<string>("");
  const { handleManualSubmit, isProcessing } = useEventRegistration(eventId, sessionId);

  const [name, setName] = useState<string>("");
  const [whatsapp, setWhatsapp] = useState<string>("");
  const [parlor, setParlor] = useState<string>("");
  const [profession, setProfession] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);

  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);

  // ------------------------------------------------------
  // Preselect session from URL (if provided)
  // ------------------------------------------------------
  useEffect(() => {
    if (urlSessionId) setSessionId(urlSessionId);
  }, [urlSessionId]);

  // ------------------------------------------------------
  // Fetch sessions for the given event
  // ------------------------------------------------------
  useEffect(() => {
    const fetchSessions = async (): Promise<void> => {
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

  // ------------------------------------------------------
  // Form Submission Handler
  // ------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setMessage(null);

    // Validate required fields (except session)
    if (!name.trim() || !whatsapp.trim() || !parlor.trim() || !city.trim() || !photo) {
      setMessage({
        type: "error",
        text: "Please fill in all required fields and upload a photo.",
      });
      return;
    }

    try {
      const registration = await handleManualSubmit({
        name,
        whatsapp,
        organisation: parlor,
        user_selected_session_id: sessionId ,
        profession: profession || undefined,
        photo,
        city,
      });

      // Generate certificate & ID after successful registration
      if (registration?.registrationId) {
        const result = await GenerationOrchestrator.generateBoth(
          registration.registrationId,
          false
        );

        if (result.success && (result.certificateUrl || result.idCardUrl)) {
          const baseName = name.replace(/\s+/g, "_");
          const newDownloads: DownloadItem[] = [];

          if (result.certificateUrl) {
            newDownloads.push({
              url: result.certificateUrl,
              label: "Certificate",
              filename: `${baseName}_Certificate.jpg`,
            });
          }

          if (result.idCardUrl) {
            newDownloads.push({
              url: result.idCardUrl,
              label: "ID Card",
              filename: `${baseName}_ID_Card.jpg`,
            });
          }

          setDownloads(newDownloads);
          setModalOpen(true);

          setMessage({
            type: "success",
            text: "Registered successfully!",
          });
        } else {
          console.error("❌ Generation failed:", result.error);
          setMessage({
            type: "error",
            text: `File generation failed: ${result.error || "Unknown error"}`,
          });
        }
      } else {
        setMessage({ type: "success", text: "Registered successfully!" });
      }
    } catch (error) {
      const errorMessage: string =
        error instanceof Error ? error.message : "Unknown error";
      console.error("❌ Registration failed:", error);
      setMessage({
        type: "error",
        text: `Registration failed: ${errorMessage}`,
      });
    }
  };

  // ------------------------------------------------------
  // Handle file download
  // ------------------------------------------------------
  const handleDownload = async (item: DownloadItem): Promise<void> => {
    try {
      await DownloadService.downloadFile(item.url, item.filename);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  // ------------------------------------------------------
  // Download Modal
  // ------------------------------------------------------
  const DownloadsModal = (): JSX.Element => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState<boolean>(false);

    useEffect(() => setIsMounted(true), []);

    const modalRoot =
      document.getElementById("modal-root") ||
      (() => {
        const root = document.createElement("div");
        root.id = "modal-root";
        document.body.appendChild(root);
        return root;
      })();

    return createPortal(
      <div className="fixed inset-0 flex justify-center items-center z-[9999] bg-black bg-opacity-60">
        <div
          ref={modalRef}
          className="w-[90vw] max-w-[1200px] min-h-[33vh] bg-gray-900 rounded-xl p-8 overflow-auto flex flex-col gap-6"
          style={{
            transform: isMounted ? "translateY(0)" : "translateY(-50px)",
            transition: "transform 0.5s ease-in-out",
          }}
        >
          <h2 className="text-center text-2xl font-bold mb-4 text-white">Download Your Files</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {downloads.map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center border border-gray-600 p-4 rounded-lg bg-gray-700"
              >
                <Image
                  src={item.url}
                  alt={item.label}
                  width={400}
                  height={300}
                  className="object-contain w-full h-48 mb-4 rounded"
                />
                <button
                  onClick={() => handleDownload(item)}
                  className="register-btn p-3 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  Download {item.label}
                </button>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <button
              onClick={() => setModalOpen(false)}
              className="register-btn bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      </div>,
      modalRoot
    );
  };

  // ------------------------------------------------------
  // Render Registration Form
  // ------------------------------------------------------
  return (
    <div id="signIn">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold text-center mb-4">Registration</h2>

        {/* Display success or error messages */}
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

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* WhatsApp Number */}
          <div>
            <label className="block mb-1">WhatsApp Number *</label>
            <input
              type="tel"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Organization / Parlor */}
          <div>
            <label className="block mb-1">Organization / Parlor / Company *</label>
            <input
              type="text"
              required
              value={parlor}
              onChange={(e) => setParlor(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Profession (Optional) */}
          <div>
            <label className="block mb-1">Profession / Job *</label>
            <input
              type="text"
              value={profession}
              required
              onChange={(e) => setProfession(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* City */}
          <div>
            <label className="block mb-1">City *</label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block mb-1">
              Upload Photo *{" "}
              <span className="font-black text-red-600">
                (Portrait with clear face)
              </span>
            </label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Session — optional if URL param exists */}
          {!urlSessionId && (
            <div className="session-select">
              <label className="block mb-1">Select Session</label>
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
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isProcessing ? "Processing..." : "Register"}
          </button>
        </form>
      </div>

      {/* Downloads Modal */}
      {modalOpen && <DownloadsModal />}
    </div>
  );
}
