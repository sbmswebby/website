'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef, JSX } from "react";
import { supabase } from "@/lib/supabaseClient";
import useEventRegistration from "@/utils/useEventRegistration";
import { GenerationOrchestrator } from "@/lib/certificate_and_id/generationOrchestrator";
import { DownloadService } from "@/lib/certificate_and_id/downloadService";
import { createPortal } from "react-dom";
import Image from "next/image";
import { City, State } from "country-state-city";
import type { ICity } from "country-state-city";

// ------------------------------------------------------
// Type Definitions
// ------------------------------------------------------
interface SessionRow {
  id: string;
  name: string;
  image_url: string | null;
}
type SubmitState = "idle" | "processing" | "success";


interface Session {
  id: string;
  name: string;
  image_url: string | null;
}

interface DownloadItem {
  url: string;
  label: string;
  filename: string;
}

export default function RegisterPageContent(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId: string = searchParams.get("eventId") || "";
  const urlSessionId: string | null = searchParams.get("sessionId");

const [citySuggestions, setCitySuggestions] = useState<ICity[]>([]);
const [showCityDropdown, setShowCityDropdown] = useState(false);
const indianCities = City.getCitiesOfCountry("IN") || [];

useEffect(() => {
  setCitySuggestions(indianCities);
}, []);
const handleCityChange = (value: string) => {
  setCity(value);

  if (!value.trim()) {
    setShowCityDropdown(false);
    return;
  }

const filtered = indianCities
  .filter((c) =>
    c.name.toLowerCase().startsWith(value.toLowerCase())
  )
  .slice(0, 10);

setCitySuggestions(filtered);
setShowCityDropdown(true);}

  // ------------------------------------------------------
  // Form State
  // ------------------------------------------------------
  const [sessionId, setSessionId] = useState<string>(urlSessionId ?? "");
  const { handleManualSubmit, isProcessing } = useEventRegistration(eventId, sessionId);

  const [name, setName] = useState<string>("");
  const [whatsapp, setWhatsapp] = useState<string>("");
  const [parlor, setParlor] = useState<string>("");
  const [profession, setProfession] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [photo, setPhoto] = useState<File | null>(null);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionImages, setSessionImages] = useState<string[]>([]);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const selectedSession: Session | undefined = sessions.find(
  (session) => session.id === sessionId
);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [sessionModalOpen, setSessionModalOpen] = useState<boolean>(false);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);

  // ------------------------------------------------------
// Submit Button UI State
// ------------------------------------------------------
const [submitState, setSubmitState] = useState<SubmitState>("idle");

  // ------------------------------------------------------
  // Fetch sessions and their images
  // ------------------------------------------------------
  useEffect(() => {
    const fetchSessions = async (): Promise<void> => {
      if (!eventId) return;

      const { data, error } = await supabase
        .from("sessions")
        .select("id, name, image_url")
        .eq("event_id", eventId);

      if (error) {
        console.error("Error fetching sessions:", error.message);
        return;
      }

      const typedData: SessionRow[] = data ?? [];

      setSessions(typedData);

      // Extract valid images
      const validImages = typedData
        .map((s) => s.image_url)
        .filter((u): u is string => Boolean(u && u.trim() !== ""));

      setSessionImages(validImages.length > 0 ? validImages : []);
    };

    fetchSessions();
  }, [eventId]);
  useEffect(() => {
    if (!urlSessionId || sessions.length === 0) return;

    const exists = sessions.some((s) => s.id === urlSessionId);
    if (exists) {
      setSessionId(urlSessionId);
    }
  }, [urlSessionId, sessions]);
// ------------------------------------------------------
// Form Submission Handler (FULLY INSTRUMENTED)
// ------------------------------------------------------
const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>
): Promise<void> => {
  e.preventDefault();

  console.group("🧾 [handleSubmit] START");
  console.log("Initial submitState:", submitState);

  setMessage(null);

  // Prevent double submit
  if (submitState !== "idle") {
    console.warn("⛔ Submit blocked — submitState:", submitState);
    console.groupEnd();
    return;
  }

  // Basic validation
  console.log("🔍 Validating form fields", {
    name,
    whatsapp,
    parlor,
    city,
    hasPhoto: Boolean(photo),
    sessionId,
  });

  if (!name.trim() || !whatsapp.trim() || !parlor.trim() || !city.trim() || !photo) {
    console.error("❌ Validation failed");
    setMessage({
      type: "error",
      text: "Please fill in all required fields and upload a photo.",
    });
    console.groupEnd();
    return;
  }

  try {
    // UI → processing
    console.log("🔄 Setting submitState → processing");
    setSubmitState("processing");

    console.group("📤 Calling handleManualSubmit");
    console.log("Payload:", {
      name,
      whatsapp,
      organisation: parlor,
      user_selected_session_id: sessionId,
      profession: profession || undefined,
      city,
      hasPhoto: Boolean(photo),
    });

    const registration = await handleManualSubmit({
      name,
      whatsapp,
      organisation: parlor,
      user_selected_session_id: sessionId,
      profession: profession || undefined,
      photo,
      city,
    });

    console.groupEnd(); // handleManualSubmit

    console.log("📥 handleManualSubmit returned:", registration);

    if (!registration?.registrationId) {
      console.error("❌ No registrationId returned");
      throw new Error("Registration failed");
    }

    console.log("✅ Registration created:", registration.registrationId);

    // ✅ Registration SUCCESS — update UI immediately
    console.log("🎉 Setting submitState → success");
    setSubmitState("success");
    setMessage({ type: "success", text: "Registered successfully!" });

    // --------------------------------------------------
    // 🎟️ OPTIONAL: certificate / ID generation (background)
    // --------------------------------------------------
    console.group("🧩 Background generation task started");

    void (async (): Promise<void> => {
      try {
        console.log("⚙️ Calling GenerationOrchestrator.generateBoth", {
          registrationId: registration.registrationId,
        });

        const result = await GenerationOrchestrator.generateBoth(
          registration.registrationId,
          false
        );

        console.log("📄 Generation result:", result);

        // Nothing generated → valid state
        if (!result.success) {
          console.warn("⚠️ Generation skipped — no templates found");
          console.groupEnd();
          return;
        }

        const baseName: string = name.replace(/\s+/g, "_");
        const newDownloads: DownloadItem[] = [];

        if (result.certificateUrl) {
          console.log("📜 Certificate URL found");
          newDownloads.push({
            url: result.certificateUrl,
            label: "Certificate",
            filename: `${baseName}_Certificate.jpg`,
          });
        }

        if (result.idCardUrl) {
          console.log("🪪 ID Card URL found");
          newDownloads.push({
            url: result.idCardUrl,
            label: "ID Card",
            filename: `${baseName}_ID_Card.jpg`,
          });
        }

        console.log("📦 Downloads prepared:", newDownloads);

        if (newDownloads.length > 0) {
          console.log("🪟 Opening download modal");
          setDownloads(newDownloads);
          setModalOpen(true);
        } else {
          console.warn("⚠️ No downloadable files produced");
        }

        console.groupEnd();
      } catch (generationError: unknown) {
        console.error("❌ Background generation error", generationError);
        console.groupEnd();
      }
    })();
  } catch (err: unknown) {
    console.error("❌ handleSubmit caught error:", err);

    const errorMessage: string =
      err instanceof Error ? err.message : "Unknown error";

    console.log("🔁 Resetting submitState → idle");
    setSubmitState("idle");

    setMessage({
      type: "error",
      text: `Registration failed: ${errorMessage}`,
    });
  } finally {
    console.groupEnd(); // handleSubmit
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
// Session Picker Modal (Dark Glassmorphic Style)
// ------------------------------------------------------
const SessionPickerModal = (): JSX.Element => {
  // Ensure modal root exists
  const modalRoot =
    document.getElementById("modal-root") ||
    (() => {
      const root = document.createElement("div");
      root.id = "modal-root";
      document.body.appendChild(root);
      return root;
    })();

const handleSelectSession = (id: string): void => {
  setSessionId(id);

  const params = new URLSearchParams(searchParams.toString());
  params.set("sessionId", id);

  router.replace(`?${params.toString()}`, {
    scroll: false,
  });

  setSessionModalOpen(false);
};



  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999] p-4">
      {/* Modal container */}
      <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-[20px] border border-[rgba(255,107,157,0.2)] rounded-2xl shadow-[0_10px_40px_rgba(255,107,157,0.15)] p-8 w-full max-w-xl max-h-[80vh] overflow-auto transition-transform">
        <h2 className="text-3xl font-playfair text-center font-bold bg-gradient-to-r from-pink-500 to-yellow-400 bg-clip-text text-transparent mb-6">
          Choose a Session
        </h2>

        {/* Sessions Grid */}
        <div className="grid grid-cols-2 gap-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="border border-[rgba(255,107,157,0.2)] rounded-2xl p-2 cursor-pointer hover:bg-[rgba(255,255,255,0.05)] hover:translate-y-[-5px] hover:shadow-[0_15px_50px_rgba(255,107,157,0.3)] transition-all"
              onClick={() => handleSelectSession(session.id)}
            >
              {/* Session Image */}
              <div className="w-full h-32 rounded mb-2 bg-gray-700 overflow-hidden">
                <Image
                  src={session.image_url || "/placeholder.jpg"}
                  alt={session.name}
                  width={300}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Session Name */}
              <p className="text-center font-semibold text-gray-100">{session.name}</p>
            </div>
          ))}
        </div>

        {/* Cancel Button */}
        <button
          onClick={() => setSessionModalOpen(false)}
          className="mt-6 w-full bg-gradient-to-r from-pink-500 to-yellow-400 text-white rounded-full py-3 font-semibold text-lg shadow-[0_5px_20px_rgba(255,107,157,0.2)] hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(255,107,157,0.4)] transition-all"
        >
          Cancel
        </button>
      </div>
    </div>,
    modalRoot
  );
};


  // ------------------------------------------------------
  // Downloads Modal
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
          className="w-[90vw] max-w-[1200px] bg-gray-900 rounded-xl p-8 overflow-auto"
          style={{
            transform: isMounted ? "translateY(0)" : "translateY(-50px)",
            transition: "transform 0.5s ease-in-out",
          }}
        >
          <h2 className="text-center text-2xl font-bold mb-4 text-white">
            Download Your Files
          </h2>

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
        {/* Session Selector — ALWAYS visible now */}
 <label className="block text-sm sm:text-base">Selected Session *</label>

<div className="session-selector grid grid-cols-1 sm:grid-cols-10 gap-3 sm:items-center">
  {/* Session info */}
  <div className="sm:col-span-8 flex items-center gap-3">
    {/* Thumbnail */}
    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-200 shrink-0">
      {selectedSession?.image_url ? (
        <Image
          src={selectedSession.image_url}
          alt={selectedSession.name}
          width={80}
          height={80}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-[10px] sm:text-xs text-gray-500">
          No Image
        </div>
      )}
    </div>

    {/* Session details */}
    <div className="flex flex-col">
<p className="font-medium text-xs sm:text-sm text-white leading-tight">
  {selectedSession?.name ?? "No session selected"}
</p>
    </div>
  </div>

  {/* Change button */}
  <button
    type="button"
    onClick={() => setSessionModalOpen(true)}
    className="
      sm:col-span-2
      session-btn
      text-sm sm:text-md
      w-full sm:w-auto
      mt-2 sm:mt-0
    "
  >
    Change
  </button>
</div>

        <div className="h-5"></div>
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

          {/* WhatsApp */}
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

          {/* Parlor */}
          <div>
            <label className="block mb-1">Organization / Parlor / Company/ Academy Name *</label>
            <input
              type="text"
              required
              value={parlor}
              onChange={(e) => setParlor(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Profession */}
          <div>
            <label className="block mb-1">Profession / Job *</label>
            <input
              type="text"
              required
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* City */}
<div className="relative">
  <label className="block mb-1">City *</label>

  <input
    type="text"
    required
    value={city}
    onChange={(e) => handleCityChange(e.target.value)}
    onFocus={() => city && setShowCityDropdown(true)}
    onBlur={() => setTimeout(() => setShowCityDropdown(false), 150)}
    placeholder="Start typing your city..."
    className="w-full border p-2 rounded"
  />

  {showCityDropdown && citySuggestions.length > 0 && (
<ul className="
  absolute z-50 w-full mt-1 max-h-48 overflow-y-auto rounded-lg
  bg-gray-900 border border-gray-700 shadow-xl
">
  {citySuggestions.map((c) => {
  const stateName =
    State.getStateByCodeAndCountry(c.stateCode, "IN")?.name || "";

  return (
    <li
      key={`${c.name}-${c.stateCode}`}
      onMouseDown={() => {
  const stateName =
    State.getStateByCodeAndCountry(c.stateCode, "IN")?.name || "";

  const displayValue = stateName
    ? `${c.name} - ${stateName}`
    : c.name;

  setCity(displayValue); // ✅ city-state goes into input
  setShowCityDropdown(false);
}}

      className="
        px-3 py-2 cursor-pointer text-white
        hover:bg-gray-700 transition-colors
      "
    >
      <span className="font-medium">{c.name}</span>
      {stateName && (
        <span className="text-gray-400"> — {stateName}</span>
      )}
    </li>
  );
})}


</ul>

  )}
</div>


{/* Photo Upload */}
<div className="form-group photo-upload">
  {/* Hidden native file input */}
  <input
    id="photo-upload"
    type="file"
    accept="image/*"
    required
    className="photo-input"
    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
      const file: File | null = e.target.files ? e.target.files[0] : null
      setPhoto(file)
    }}
  />

  {/* Button + text row */}
  <div className="photo-upload-row">
    {/* Styled label acting as button */}
    <label htmlFor="photo-upload" className="photo-upload-btn">
      {photo ? "Change Photo" : "Upload Photo"}
    </label>

    {/* Right-side text */}
    <div className="photo-upload-text">
      {photo ? (
        <span className="photo-file">
          File Chosen: {photo.name}
        </span>
      ) : (
        <span className="photo-helper">
          Note: Portrait photo with clear face (passport-style)
        </span>
      )}
    </div>
  </div>
</div>





          {/* Submit */}
<button
  type="submit"
  disabled={submitState === "processing" || submitState === "success"}
  className={`
    w-full py-2 rounded transition-all
    ${
      submitState === "idle"
        ? "bg-blue-600 hover:bg-blue-700 text-white"
        : submitState === "processing"
        ? "bg-gray-400 text-white cursor-not-allowed"
        : "bg-green-600 text-white"
    }
  `}
>
  {submitState === "idle" && "Register"}
  {submitState === "processing" && "Processing... Please wait"}
  {submitState === "success" && "Registered Successfully ✓"}
</button>

        </form>
      </div>

      {modalOpen && <DownloadsModal />}
      {sessionModalOpen && <SessionPickerModal />}
    </div>
  );
}
