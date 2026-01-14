"use client";

import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { EventForm, EventFormValue } from "./EventForm";
import { SessionForm, SessionFormValue } from "./SessionForm";

import { supabase } from "@/lib/supabaseClient";
import { CloudinaryService } from "@/lib/cloudinaryService";
import {
  createOrUpdateEventWithSessions,
} from "@/lib/addEvent";
import { hydrateEventWithSessions } from "./hydrateEventWithSessions";

// ============================================================
// TYPES
// ============================================================

interface IdCardLayout {
  id: string;
  name: string;
  thumbnailUrl: string;
}

interface Props {
  /** If present → edit mode */
  eventId?: string;
}

// ============================================================
// COMPONENT
// ============================================================

const EventAndSessionsForm: React.FC<Props> = ({ eventId }) => {
  const isEditMode = Boolean(eventId);

  // ------------------------------------------------------------
  // Event state
  // ------------------------------------------------------------
  const [event, setEvent] = useState<EventFormValue>({
    name: "",
    description: "",
    venue: "",
    location: "",
    startTime: "",
    endTime: "",
    banner: null,
  });

  // ------------------------------------------------------------
  // Sessions
  // ------------------------------------------------------------
  const [sessions, setSessions] = useState<SessionFormValue[]>([]);

  useEffect(() => {
  if (!isEditMode || !eventId) return;

  let isMounted = true;

  const hydrate = async (): Promise<void> => {
    const hydrated = await hydrateEventWithSessions(eventId);

    if (!isMounted) return;

    setEvent(hydrated.event);
    setSessions(hydrated.sessions);
  };

  hydrate();

  return () => {
    isMounted = false;
  };
}, [isEditMode, eventId]);


  // ------------------------------------------------------------
  // ID card templates (shared across sessions)
  // ------------------------------------------------------------
  const [layouts, setLayouts] = useState<IdCardLayout[]>([]);
    useState<string>("");

  // ============================================================
  // FETCH ID CARD TEMPLATES
  // ============================================================

  useEffect((): void => {
    const fetchLayouts = async (): Promise<void> => {
      const { data, error } = await supabase
        .from("id_card_details")
        .select("id, name, base_image_url");

      if (error || !data) return;

      setLayouts(
        data.map((row) => ({
          id: row.id,
          name: row.name,
          thumbnailUrl: row.base_image_url,
        }))
      );
    };

    fetchLayouts();
  }, []);

  // ============================================================
  // SESSION HELPERS
  // ============================================================

const addSession = (): void => {
  setSessions((prev) => [
    ...prev,
    {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      startTime: "",
      endTime: "",
      isDefault: false,
      banner: null,

      issuesIdCard: false,
      idCardTemplateId: undefined,
    },
  ]);
};




  const updateSession = (
    id: string,
    value: SessionFormValue
  ): void => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? value : s))
    );
  };

  const deleteSession = (id: string): void => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (): Promise<void> => {
    // -----------------------------------------
    // Upload event banner only if replaced
    // -----------------------------------------
    let eventBannerUrl: string | undefined;

    if (event.banner?.file) {
      eventBannerUrl = await CloudinaryService.uploadFile(
        event.banner.file,
        "events"
      );
    }

    // -----------------------------------------
    // Process sessions
    // -----------------------------------------
const processedSessions = await Promise.all(
  sessions.map(async (s) => {
    let bannerUrl: string | undefined;

    if (s.banner?.file) {
      bannerUrl = await CloudinaryService.uploadFile(
        s.banner.file,
        "sessions"
      );
    }

    return {
      id: s.id, // present in edit mode
      name: s.name || undefined,
      description: s.description || undefined,
      start_time: s.startTime || undefined,
      end_time: s.endTime || undefined,
      image_url: bannerUrl,
      is_default: s.isDefault,

      /** THIS IS THE FIX */
      id_card_template_id: s.issuesIdCard
        ? s.idCardTemplateId
        : undefined,
    };
  })
);


    // -----------------------------------------
    // CREATE vs UPDATE (discriminated union)
    // -----------------------------------------
    await createOrUpdateEventWithSessions(
      isEditMode
        ? {
            mode: "update",
            eventId: eventId!,
            event: {
              name: event.name || undefined,
              description: event.description || undefined,
              venue: event.venue || undefined,
              location: event.location || undefined,
              startTime: event.startTime || undefined,
              endTime: event.endTime || undefined,
              image_url: eventBannerUrl,
            },
            sessions: processedSessions,
          }
        : {
            mode: "create",
            event: {
              name: event.name,
              description: event.description,
              venue: event.venue,
              location: event.location,
              startTime: event.startTime,
              endTime: event.endTime,
              image_url: eventBannerUrl,
            },
            sessions: processedSessions,
          }
    );

    alert(isEditMode ? "Event updated" : "Event created");
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-10 bg-gray-900 p-6 rounded-lg">
      <EventForm value={event} onChange={setEvent} />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Sessions</h2>

        {sessions.map((s) => (
<SessionForm
  key={s.id}
  value={s}
  layouts={layouts}
  onChange={(v) => updateSession(s.id, v)}
  onDelete={() => deleteSession(s.id)}
/>
        ))}

        <button
          type="button"
          onClick={addSession}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded"
        >
          <Plus className="w-4 h-4" />
          Add Session
        </button>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">
          ID Card Template
        </h2>


      </section>

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full bg-green-600 text-white py-3 rounded text-lg"
      >
        {isEditMode ? "Update Event" : "Create Event"}
      </button>
    </div>
  );
};

export default EventAndSessionsForm;
