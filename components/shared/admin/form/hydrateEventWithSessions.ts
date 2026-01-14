import { supabase } from "@/lib/supabaseClient";
import { EventFormValue } from "@/components/shared/admin/form/EventForm";
import { SessionFormValue } from "@/components/shared/admin/form/SessionForm";

/**
 * ===============================
 * Supabase row typings
 * ===============================
 * These EXACTLY reflect the DB schema
 * so we never fall back to `any`
 */

interface SessionIdCardRow {
  id_card_details_id: string;
}

interface SessionRow {
  id: string;
  name: string | null;
  description: string | null;
  start_time: string;
  end_time: string;
  image_url: string | null;
  session_id_cards: SessionIdCardRow[] | null;
}

interface EventRow {
  id: string;
  name: string;
  description: string | null;
  venue: string;
  location: string | null;
  start_time: string;
  end_time: string;
  image_url: string | null;
  default_session_id: string | null;
  sessions: SessionRow[] | null;
}

/**
 * ===============================
 * Final hydrated payload
 * ===============================
 */

interface HydratedEvent {
  event: EventFormValue;
  sessions: SessionFormValue[];
}

/**
 * ===============================
 * Hydrate event + sessions for EDIT mode
 * ===============================
 */
export const hydrateEventWithSessions = async (
  eventId: string
): Promise<HydratedEvent> => {
  console.log("hydrateEventWithSessions function was called now");
  console.log("HYDRATING EVENT", eventId);

  /**
   * Fetch event with its sessions and optional ID card linkage
   */
  const { data, error } = await supabase
    .from("events")
    .select(`
      id,
      name,
      description,
      venue,
      location,
      start_time,
      end_time,
      image_url,
      default_session_id,
      sessions!sessions_event_id_fkey (
        id,
        name,
        description,
        start_time,
        end_time,
        image_url,
        session_id_cards!left (
          id_card_details_id
        )
      )
    `)
    .eq("id", eventId)
    .maybeSingle<EventRow>();

  console.log(
    "event details got from the hydrateEventWithSessions function's supabase query",
    data
  );

  if (error || !data) {
    throw new Error("Failed to hydrate event");
  }

  /**
   * ===============================
   * Return normalized form values
   * ===============================
   */
  return {
    /** ---------- EVENT ---------- */
    event: {
      name: data.name ?? "",
      description: data.description ?? "",
      venue: data.venue ?? "",
      location: data.location ?? "",
      startTime: data.start_time ?? "",
      endTime: data.end_time ?? "",
      banner: data.image_url
        ? {
            file: null,
            url: data.image_url,
          }
        : null,
    },

    /** ---------- SESSIONS ---------- */
    sessions: (data.sessions ?? []).map((s) => {
      /**
       * Default session is derived from events.default_session_id
       * (single source of truth)
       */
      const isDefault = s.id === data.default_session_id;

      /**
       * A session issues an ID card
       * ONLY if a row exists in session_id_cards
       */
      const templateId =
  s.session_id_cards?.[0]?.id_card_details_id ?? undefined;


      return {
        id: s.id,
        name: s.name ?? "",
        description: s.description ?? "",
        startTime: s.start_time,
        endTime: s.end_time,
        isDefault,

        banner: s.image_url
          ? {
              file: null,
              url: s.image_url,
            }
          : null,

        /** Explicit toggle state for UI */
        issuesIdCard: Boolean(templateId),

        /** Optional template reference */
        idCardTemplateId: templateId,
      };
    }),
  };
};
