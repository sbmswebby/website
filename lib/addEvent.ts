"use client";

import { supabase } from "@/lib/supabaseClient";

// ============================================================
// TYPES
// ============================================================

/**
 * Session data coming from the form layer
 * - id is present only in edit mode
 */
export interface SessionPayload {
  id?: string;
  name?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  image_url?: string;
  cost?: number;
  registration_link?: string;
  is_default?: boolean;
  id_card_template_id: string;
}

/**
 * Event fields are PARTIAL on purpose:
 * empty fields must NOT overwrite existing DB values
 */
export interface EventPayload {
  name?: string;
  description?: string;
  venue?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  image_url?: string;
}

/**
 * CREATE MODE
 */
interface CreateEventInput {
  mode: "create";
  event: EventPayload;
  sessions: SessionPayload[];
}

/**
 * UPDATE MODE
 */
interface UpdateEventInput {
  mode: "update";
  eventId: string;
  event: EventPayload;
  sessions: SessionPayload[];
}

export type CreateOrUpdateEventInput =
  | CreateEventInput
  | UpdateEventInput;

/**
 * Result returned to the UI
 */
export interface CreateOrUpdateEventResult {
  eventId: string;
  sessionIds: string[];
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Removes undefined values so we never overwrite DB fields accidentally
 */
const cleanPayload = <T extends Record<string, unknown>>(
  payload: T
): Partial<T> => {
  const cleaned: Partial<T> = {};

  for (const key in payload) {
    if (payload[key] !== undefined) {
      cleaned[key] = payload[key];
    }
  }

  return cleaned;
};

// ============================================================
// MAIN FUNCTION
// ============================================================

export async function createOrUpdateEventWithSessions(
  input: CreateOrUpdateEventInput
): Promise<CreateOrUpdateEventResult> {
  let eventId: string;

  // ============================================================
  // EVENT: CREATE OR UPDATE
  // ============================================================

  if (input.mode === "create") {
    const { data, error } = await supabase
      .from("events")
      .insert(
        cleanPayload({
          name: input.event.name,
          description: input.event.description,
          venue: input.event.venue,
          location: input.event.location ?? "hyderabad",
          start_time: input.event.startTime,
          end_time: input.event.endTime,
          image_url: input.event.image_url,
        })
      )
      .select("id")
      .single();

    if (error || !data?.id) {
      throw new Error("Failed to create event");
    }

    eventId = data.id;
  } else {
    eventId = input.eventId;

    const { error } = await supabase
      .from("events")
      .update(
        cleanPayload({
          name: input.event.name,
          description: input.event.description,
          venue: input.event.venue,
          location: input.event.location,
          start_time: input.event.startTime,
          end_time: input.event.endTime,
          image_url: input.event.image_url,
          updated_at: new Date().toISOString(),
        })
      )
      .eq("id", eventId);

    if (error) {
      throw new Error("Failed to update event");
    }
  }

  // ============================================================
  // SESSIONS: UPSERT
  // ============================================================

  const sessionIds: string[] = [];

  for (const session of input.sessions) {
    let sessionId: string;

    // ----------------------------
    // UPDATE SESSION
    // ----------------------------
    if (session.id) {
      sessionId = session.id;

      const { error } = await supabase
        .from("sessions")
        .update(
          cleanPayload({
            name: session.name,
            description: session.description,
            start_time: session.start_time,
            end_time: session.end_time,
            image_url: session.image_url,
            cost: session.cost,
            registration_link: session.registration_link,
            updated_at: new Date().toISOString(),
          })
        )
        .eq("id", sessionId);

      if (error) {
        throw new Error("Failed to update session");
      }
    }
    // ----------------------------
    // CREATE SESSION
    // ----------------------------
    else {
      const { data, error } = await supabase
        .from("sessions")
        .insert(
          cleanPayload({
            event_id: eventId,
            name: session.name,
            description: session.description,
            start_time: session.start_time,
            end_time: session.end_time,
            image_url:
              session.image_url ?? "/images/placeholder.png",
            cost: session.cost,
            registration_link: session.registration_link,
          })
        )
        .select("id")
        .single();

      if (error || !data?.id) {
        throw new Error("Failed to create session");
      }

      sessionId = data.id;
    }

    sessionIds.push(sessionId);

    // ============================================================
    // SESSION → ID CARD LINK (idempotent)
    // ============================================================

    const { data: existingLink, error: linkCheckError } =
      await supabase
        .from("session_id_cards")
        .select("id")
        .eq("session_id", sessionId)
        .eq(
          "id_card_details_id",
          session.id_card_template_id
        )
        .maybeSingle();

    if (linkCheckError) {
      throw new Error("Failed to check ID card link");
    }

    if (!existingLink) {
      const { error: linkInsertError } = await supabase
        .from("session_id_cards")
        .insert({
          session_id: sessionId,
          id_card_details_id:
            session.id_card_template_id,
        });

      if (linkInsertError) {
        throw new Error(
          "Failed to link session with ID card template"
        );
      }
    }
  }

  // ============================================================
  // RESULT
  // ============================================================

  return {
    eventId,
    sessionIds,
  };
}
