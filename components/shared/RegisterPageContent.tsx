'use client';

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import useEventRegistration from "@/utils/useEventRegistration";
import { GenerationOrchestrator } from "@/lib/certificate_and_id/generationOrchestrator";
import { DownloadService } from "@/lib/certificate_and_id/downloadService";
import { createPortal } from "react-dom";
import Image from "next/image";

interface Session {
  id: string;
  name: string;
}

interface DownloadItem {
  url: string;
  label: string;
  filename: string;
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
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [profession, setProfession] = useState("");
  const [city, setCity] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);

  // --------------------------
  // Fetch sessions
  // --------------------------
  useEffect(() => {
    const fetchSessions = async () => {
      if (!eventId) return;
      const { data, error } = await supabase.from("sessions").select("id, name").eq("event_id", eventId);
      if (error) console.error("Error fetching sessions:", error.message);
      else setSessions(data || []);
    };
    fetchSessions();
  }, [eventId]);

  // --------------------------
  // Handle registration submit
  // --------------------------
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    try {
      const registration = await handleManualSubmit({
        name,
        whatsapp,
        organisation: parlor,
        user_selected_session_id: sessionId,
        profession: profession || undefined,
        photo,
        city: city || "",
      });

      // Generate certificate & ID card
      if (registration?.registrationId) {
        const result = await GenerationOrchestrator.generateBoth(
          registration.registrationId, 
          false
        );

        // Check if generation succeeded for at least one file
        if (result.success && (result.certificateUrl || result.idCardUrl)) {
          const baseName = name.replace(/\s+/g, "_");
          const newDownloads: DownloadItem[] = [];

          // Add whichever file was successfully generated
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

          // Update UI
          setDownloads(newDownloads);
          setModalOpen(true);

          // Handle certificate skip warning gracefully
          if (result.error?.includes("Certificate skipped")) {
            // Use console.warn instead of console.error for expected behavior
            console.warn(`ℹ️ ${result.error}`);
            setMessage({
              type: "success",
              text: "Registered successfully! (ID card generated.)",
            });
          } else {
            setMessage({ type: "success", text: "Registered successfully!" });
          }
        } else {
          // Only treat as error if BOTH generations failed
          console.error("❌ Failed to generate certificate/ID card:", result.error);
          setMessage({
            type: "error",
            text: `File generation failed: ${result.error || "Unknown error"}`,
          });
        }
      } else {
        setMessage({ type: "success", text: "Registered successfully!" });
      }

    } catch (error) {
      // This catch is for actual unexpected errors during registration
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      // Don't show error if it's just "Certificate skipped"
      if (errorMessage.includes("Certificate skipped")) {
        console.warn(`ℹ️ ${errorMessage}`);
        setMessage({
          type: "success",
          text: "Registered successfully! (Certificate not available for this session)",
        });
      } else {
        console.error("❌ Registration failed:", error);
        setMessage({
          type: "error",
          text: `Registration failed: ${errorMessage}`,
        });
      }
    }
  };

  // --------------------------
  // Handle single file download
  // --------------------------
  const handleDownload = async (item: DownloadItem) => {
    try {
      await DownloadService.downloadFile(item.url, item.filename);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  // --------------------------
  // Animated portal modal component
  // --------------------------
  const DownloadsModal = () => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);
    
    useEffect(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const handleClickOutside = (_event: MouseEvent) => {
        // Add click outside logic if needed
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
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
      <div className="fixed inset-0 flex justify-center items-center z-[9999]">
        <div
          ref={modalRef}
          className="w-[90vw] max-w-[1200px] min-h-[33vh] bg-gray-900 rounded-xl p-8 overflow-auto flex flex-col gap-6"
          style={{
            transform: isMounted ? "translateY(0)" : "translateY(-50px)",
            transition: "transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
          }}
        >
          <h2 className="text-center text-2xl font-bold mb-4">Download Your Files</h2>
          <div className="flex flex-row">
            <div className="w-10"></div>
            <div className="w-max">
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 auto-rows-fr">
                {downloads.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center border border-gray-600 p-4 rounded-lg bg-gray-600"
                  >
                    <div className="h-5"> </div>
                    <Image
                      src={item.url}
                      alt={item.label}
                      width={400}
                      height={300}
                      className="object-contain w-full h-48 mb-2 rounded"
                    />
                    <div className="h-5"> </div>
                    <button 
                      onClick={() => handleDownload(item)}
                      className="register-btn p-10"
                    >
                      Download {item.label}
                    </button>
                    <div className="h-5"> </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-10"></div>
          </div>

          <div className="text-center mt-6">
            <button
              onClick={() => setModalOpen(false)}
              className="register-btn"
            >
              Close
            </button>
            <div className="h-5"></div>
          </div>
        </div>
      </div>,
      modalRoot
    );
  };

  return (
    <div id="signIn">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold text-center mb-4">Manual Registration</h2>

        {message && (
          <div
            className={`p-3 mb-4 rounded ${
              message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block mb-1">Organization *</label>
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
            <label className="block mb-1">City *</label>
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
              Upload Photo <span className="font-black text-red-600">PORTRAIT with CLEAR FACE</span>
            </label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setPhoto(e.target.files?.[0] || null)} 
              className="w-full border p-2 rounded" 
            />
          </div>

          <div className="session-select">
            <label className="block mb-1">Select Session *</label>
            <select 
              required 
              value={sessionId} 
              onChange={(e) => setSessionId(e.target.value)} 
              className="w-full border p-2 rounded"
            >
              <option value="">-- Select Session --</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
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

      {modalOpen && <DownloadsModal />}
    </div>
  );
}