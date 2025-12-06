"use client";

import { supabase } from "@/lib/supabaseClient";

// ================================
// TYPES
// ================================

interface SessionPayload {
  id?: string; // optional: if exists, update; otherwise insert
  name: string;
  description?: string;
  start_time: string; // ISO string
  end_time: string;   // ISO string
  image_url?: string;
  cost?: number;
  registration_link?: string;
  is_default?: boolean;
}

interface CreateOrUpdateEventInput {
  id?: string; // optional: if exists, update; otherwise create new
  name: string;
  description?: string;
  venue: string;
  location?: string;
  startTime: string;
  endTime: string;
  imageFile?: string; // already uploaded Cloudinary URL
  idcard_template_id: string; // ID Card Details ID
  sessions: SessionPayload[];
}

interface CreateOrUpdateEventResult {
  eventId: string;
  sessionIds: string[];
  idCardTemplateId: string;
}

// ================================
// FUNCTION
// ================================

export async function createOrUpdateEventWithSessions(
  input: CreateOrUpdateEventInput
): Promise<CreateOrUpdateEventResult> {
  // Ensure eventId exists after this block
  let eventId: string;

  // -----------------------------
  // Create or Update Event
  // -----------------------------
  if (input.id) {
    eventId = input.id;

    const { error: updateError } = await supabase
      .from("events")
      .update({
        name: input.name,
        description: input.description || "",
        venue: input.venue,
        location: input.location || "hyderabad",
        start_time: input.startTime,
        end_time: input.endTime,
        image_url: input.imageFile || null,
      })
      .eq("id", eventId);

    if (updateError) throw new Error("Failed to update event");
  } else {
    const { data: eventData, error: insertError } = await supabase
      .from("events")
      .insert({
        name: input.name,
        description: input.description || "",
        venue: input.venue,
        location: input.location || "hyderabad",
        start_time: input.startTime,
        end_time: input.endTime,
        image_url: input.imageFile || null,
      })
      .select("id")
      .single();

    if (insertError || !eventData?.id) throw new Error("Failed to create event");
    eventId = eventData.id;
  }

  const sessionIds: string[] = [];

  // -----------------------------
  // Create or Update Sessions
  // -----------------------------
  for (const s of input.sessions) {
    let sessionId: string;

    if (s.id) {
      sessionId = s.id;

      const { error: sessionUpdateError } = await supabase
        .from("sessions")
        .update({
          name: s.name,
          description: s.description || null,
          start_time: s.start_time,
          end_time: s.end_time,
          image_url: s.image_url || "/images/placeholder.png",
          cost: s.cost ?? null,
          registration_link: s.registration_link ?? null,
        })
        .eq("id", sessionId);

      if (sessionUpdateError) throw new Error("Failed to update session");
    } else {
      const { data: sessionData, error: sessionInsertError } = await supabase
        .from("sessions")
        .insert({
          event_id: eventId,
          name: s.name,
          description: s.description || null,
          start_time: s.start_time,
          end_time: s.end_time,
          image_url: s.image_url || "/images/placeholder.png",
          cost: s.cost ?? null,
          registration_link: s.registration_link ?? null,
        })
        .select("id")
        .single();

      if (sessionInsertError || !sessionData?.id) throw new Error("Failed to create session");
      sessionId = sessionData.id;
    }

    sessionIds.push(sessionId);

    // -----------------------------
    // Link Session → ID Card
    // -----------------------------
    const { data: existingLink, error: linkCheckError } = await supabase
      .from("session_id_cards")
      .select("id")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (linkCheckError) throw new Error("Failed to link session with ID card");

    if (!existingLink) {
      const { error: linkInsertError } = await supabase
        .from("session_id_cards")
        .insert({
          session_id: sessionId,
          id_card_details_id: input.idcard_template_id,
        });

      if (linkInsertError) throw new Error("Failed to link session with ID card");
    }
  }

  return {
    eventId,
    sessionIds,
    idCardTemplateId: input.idcard_template_id,
  };
}
