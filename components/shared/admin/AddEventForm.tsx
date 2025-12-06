"use client";

import React, { useState, useEffect } from "react";
import { Upload, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { CloudinaryService } from "@/lib/cloudinaryService";
import { createOrUpdateEventWithSessions } from "@/lib/addEvent";

// ============================================================
// TYPES
// ============================================================

interface UploadedImage {
  url: string;
  file: File | null;
}

interface SessionInput {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  isDefault: boolean;
  banner: UploadedImage | null;
}

interface IdCardLayout {
  id: string;
  name: string;
  thumbnailUrl: string;
}

interface IdCardDetailsRow {
  id: string;
  name: string;
  base_image_url: string;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

const EventAndSessionsForm: React.FC = () => {
  // ------------------------------------------------------------
  // Event State
  // ------------------------------------------------------------
  const [eventBanner, setEventBanner] = useState<UploadedImage | null>(null);
  const [eventName, setEventName] = useState<string>("");
  const [eventDescription, setEventDescription] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [venueType, setVenueType] = useState<string>("");

  // ------------------------------------------------------------
  // Sessions
  // ------------------------------------------------------------
  const [sessions, setSessions] = useState<SessionInput[]>([]);

  // ------------------------------------------------------------
  // ID Card Layouts
  // ------------------------------------------------------------
  const [idCardLayouts, setIdCardLayouts] = useState<IdCardLayout[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<string>("");

  // ============================================================
  // FETCH ID CARD LAYOUTS FROM SUPABASE
  // ============================================================

  useEffect(() => {
    const fetchLayouts = async () => {
      try {
        const { data, error } = await supabase
          .from("id_card_details")
          .select("id, name, base_image_url");

        if (error) {
          console.error("❌ Failed to fetch ID card layouts:", error);
          return;
        }

        if (!data) return;

        const formattedLayouts: IdCardLayout[] = data.map((row) => ({
          id: row.id,
          name: row.name,
          thumbnailUrl: row.base_image_url,
        }));

        setIdCardLayouts(formattedLayouts);
      } catch (err) {
        console.error("❌ Error fetching ID card layouts:", err);
      }
    };

    fetchLayouts();
  }, []);

  // ============================================================
  // HELPERS
  // ============================================================

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (value: UploadedImage) => void
  ): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setter({ url: previewUrl, file });
  };

  const addSession = (): void => {
    const newSession: SessionInput = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      startTime: "",
      endTime: "",
      isDefault: false,
      banner: null,
    };
    setSessions((prev) => [...prev, newSession]);
  };

  const updateSession = <K extends keyof SessionInput>(
    id: string,
    key: K,
    value: SessionInput[K]
  ): void => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [key]: value } : s))
    );
  };

  const deleteSession = (id: string): void => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  // ============================================================
  // FORM SUBMISSION
  // ============================================================

  const handleSubmit = async (): Promise<void> => {
    try {
      console.log("🟦 [Submit] Started");

      let eventBannerUrl = "";

      if (eventBanner?.file) {
        eventBannerUrl = await CloudinaryService.uploadFile(
          eventBanner.file,
          "events"
        );
      }

      const processedSessions = await Promise.all(
        sessions.map(async (s) => {
          let bannerUrl = "";

          if (s.banner?.file) {
            bannerUrl = await CloudinaryService.uploadFile(
              s.banner.file,
              "sessions"
            );
          }

          return {
            name: s.name,
            description: s.description,
            start_time: s.startTime,
            end_time: s.endTime,
            is_default: s.isDefault,
            image_url: bannerUrl,
          };
        })
      );

      await createOrUpdateEventWithSessions({
        name: eventName,
        description: eventDescription,
        location,
        startTime,
        endTime,
        venue: venueType,
        imageFile: eventBannerUrl,
        idcard_template_id: selectedLayout,
        sessions: processedSessions,
      });

      console.log("🟩 [Submit] Success — Event + Sessions created");
      alert("Event created successfully!");
    } catch (err) {
      console.error("❌ Error submitting form:", err);
      alert("Something went wrong. Check console.");
    }
  };

  // ============================================================
  // RENDER UI
  // ============================================================

  return (
    <div className="bg-slate-100 rounded-lg shadow p-6 space-y-8">
      {/* Event Details */}
      <section>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Event Details
        </h2>
        <div className="flex items-start gap-4 mb-6">
          <div className="w-32 h-32 border border-slate-400 rounded-lg flex items-center justify-center bg-slate-100 overflow-hidden">
            {eventBanner ? (
              <img
                src={eventBanner.url}
                alt="Event Banner"
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-10 h-10 text-slate-700" />
            )}
          </div>
          <label className="cursor-pointer px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded text-sm text-slate-800 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Event Banner
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, setEventBanner)}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Event Name"
            className="border border-slate-300 rounded p-3 text-slate-800 placeholder-slate-700 bg-white"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Venue Type (Indoor / Outdoor / Hall)"
            className="border border-slate-300 rounded p-3 text-slate-800 placeholder-slate-700 bg-white"
            value={venueType}
            onChange={(e) => setVenueType(e.target.value)}
          />
          <input
            type="datetime-local"
            className="border border-slate-300 rounded p-3 text-slate-800 bg-white"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <input
            type="datetime-local"
            className="border border-slate-300 rounded p-3 text-slate-800 bg-white"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
          <input
            type="text"
            placeholder="Location"
            className="border border-slate-300 rounded p-3 md:col-span-2 text-slate-800 placeholder-slate-700 bg-white"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <textarea
          placeholder="Event Description"
          className="border border-slate-300 rounded p-3 w-full mt-4 text-slate-800 placeholder-slate-700 bg-white"
          rows={4}
          value={eventDescription}
          onChange={(e) => setEventDescription(e.target.value)}
        />
      </section>

      {/* Sessions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">Sessions</h2>
          <button
            onClick={addSession}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Session
          </button>
        </div>

        {sessions.map((session) => (
          <div
            key={session.id}
            className="border border-slate-300 rounded-lg p-4 mb-4 bg-slate-50"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-28 h-28 border border-slate-300 rounded bg-white flex items-center justify-center overflow-hidden">
                {session.banner ? (
                  <img
                    src={session.banner.url}
                    alt="Session Banner"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-700" />
                )}
              </div>
              <label className="cursor-pointer px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded text-sm text-slate-800 flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Session Banner
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageUpload(e, (val) =>
                      updateSession(session.id, "banner", val)
                    )
                  }
                />
              </label>
              <button
                onClick={() => deleteSession(session.id)}
                className="ml-auto p-2 hover:bg-red-100 rounded"
              >
                <Trash2 className="w-5 h-5 text-red-600" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Session Name"
                className="border border-slate-300 rounded p-3 text-slate-800 placeholder-slate-700 bg-white"
                value={session.name}
                onChange={(e) =>
                  updateSession(session.id, "name", e.target.value)
                }
              />
              <input
                type="datetime-local"
                className="border border-slate-300 rounded p-3 text-slate-800 bg-white"
                value={session.startTime}
                onChange={(e) =>
                  updateSession(session.id, "startTime", e.target.value)
                }
              />
              <input
                type="datetime-local"
                className="border border-slate-300 rounded p-3 text-slate-800 bg-white"
                value={session.endTime}
                onChange={(e) =>
                  updateSession(session.id, "endTime", e.target.value)
                }
              />
              <label className="flex items-center gap-2 mt-2 cursor-pointer text-slate-800">
                <input
                  type="checkbox"
                  checked={session.isDefault}
                  onChange={(e) =>
                    updateSession(session.id, "isDefault", e.target.checked)
                  }
                  className="w-4 h-4"
                />
                <span>Make Default Session</span>
              </label>
            </div>

            <textarea
              placeholder="Session Description"
              className="border border-slate-300 rounded p-3 w-full mt-4 text-slate-800 placeholder-slate-700 bg-white"
              rows={3}
              value={session.description}
              onChange={(e) =>
                updateSession(session.id, "description", e.target.value)
              }
            />
          </div>
        ))}
      </section>

      {/* ID Card Layouts */}
      <section>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          ID Card Layout
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {idCardLayouts.map((layout) => (
            <div
              key={layout.id}
              onClick={() => setSelectedLayout(layout.id)}
              className={`border border-slate-300 rounded-lg p-3 cursor-pointer hover:bg-slate-100 ${
                selectedLayout === layout.id
                  ? "border-blue-500 bg-blue-50"
                  : ""
              }`}
            >
              <img
                src={layout.thumbnailUrl}
                alt={layout.name}
                className="w-full h-32 object-cover rounded"
              />
              <p className="text-sm mt-2 text-slate-800">{layout.name}</p>
            </div>
          ))}
        </div>
      </section>

      <button
        onClick={handleSubmit}
        className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded text-lg w-full"
      >
        Create Event
      </button>
    </div>
  );
};

export default EventAndSessionsForm;

