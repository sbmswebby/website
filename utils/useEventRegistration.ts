"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { GenerationOrchestrator } from "@/lib/certificate_and_id/generationOrchestrator";
import { CloudinaryService } from "@/lib/cloudinaryService";

/**
 * Represents a row in the `events` table
 */
export interface EventRow {
  id: string;
  name: string;
  description: string | null;
  slug: string | null;
  image_public_id: string | null;
  image_url: string | null;
  venue: string;
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at: string;
}

/**
 * Represents a session row
 */
export interface SessionData {
  name: string;
}

/**
 * Utility to validate UUIDs
 */
const isValidUuid = (id: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

/**
 * Custom hook to handle event registration logic
 */
export default function useEventRegistration(eventId: string, sessionId: string) {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [eventName, setEventName] = useState<string>("");

  /**
   * Fetch event name
   */
  useEffect(() => {
    if (!eventId || !isValidUuid(eventId)) return;

    const fetchEventName = async (): Promise<void> => {
      const { data, error } = await supabase
        .from("events")
        .select("name")
        .eq("id", eventId)
        .maybeSingle<EventRow>();

      if (data?.name) setEventName(data.name);
      if (error && error.code !== "22P02") {
        console.error("[fetchEventName] Error:", error);
      }
    };

    fetchEventName();
  }, [eventId]);

  /**
   * Check if WhatsApp number already registered for session
   */
  const checkWhatsAppRegistration = async (
    whatsapp: string
  ): Promise<{ id: string; registration_number: number } | null> => {
    if (!whatsapp || !sessionId) return null;

    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("whatsapp_number", whatsapp)
      .maybeSingle();

    if (!userProfile) return null;

    const { data: registration } = await supabase
      .from("registrations")
      .select("id, registration_number")
      .eq("user_profile_id", userProfile.id)
      .eq("session_id", sessionId)
      .maybeSingle();

    return registration ?? null;
  };

  /**
   * Handles manual registration submission
   * Generation is OPTIONAL and NEVER blocks registration
   */
  const handleManualSubmit = async (form: {
    name: string;
    whatsapp: string;
    profession?: string;
    organisation?: string;
    user_selected_session_id: string;
    photo?: File | null;
    city: string;
  }): Promise<{
    registrationId: string;
    idUrl?: string;
    certUrl?: string;
  }> => {
    setIsProcessing(true);

    try {
      let photoUrl: string | null = null;

      /**
       * Upload photo if provided
       */
      if (form.photo) {
        photoUrl = await CloudinaryService.uploadFile(
          form.photo,
          "user_photos"
        );
      }

      /**
       * Upsert user profile
       */
      const { data: userProfiles } = await supabase
        .from("user_profiles")
        .upsert(
          {
            whatsapp_number: form.whatsapp,
            name: form.name,
            profession: form.profession ?? null,
            organisation_name: form.organisation ?? null,
            image_url: photoUrl,
          },
          { onConflict: "whatsapp_number" }
        )
        .select();

      const userProfile = userProfiles?.[0];
      if (!userProfile) throw new Error("Failed to upsert user profile");

      /**
       * Registration (idempotent)
       */
      let finalRegistrationId: string;
      let registrationNumber: number | string;

      const existing = await checkWhatsAppRegistration(form.whatsapp);

      if (existing) {
        finalRegistrationId = existing.id;
        registrationNumber = existing.registration_number;
      } else {
        const targetSessionId =
          form.user_selected_session_id || sessionId;

        const { data, error } = await supabase
          .from("registrations")
          .insert({
            user_profile_id: userProfile.id,
            session_id: targetSessionId,
            status: "registered",
          })
          .select()
          .maybeSingle();

        if (!data || error) throw error || new Error("Registration failed");

        finalRegistrationId = data.id;
        registrationNumber = data.registration_number;
      }

      setIsRegistered(true);
      setRegistrationId(finalRegistrationId);

      /**
       * Fetch session name
       */
      const { data: sessionRow } = await supabase
        .from("sessions")
        .select("name")
        .eq("id", form.user_selected_session_id)
        .maybeSingle<SessionData>();

      /**
       * OPTIONAL generation
       */
      const generation = await GenerationOrchestrator.generateBoth(
        finalRegistrationId,
        false,
        {
          event_name: eventName,
          session_name: sessionRow?.name ?? "",
          city: form.city,
          registration_number: String(registrationNumber),
        }
      );

      /**
       * ALL states are valid
       */
      return {
        registrationId: finalRegistrationId,
        idUrl: generation.idCardUrl,
        certUrl: generation.certificateUrl,
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    isRegistered,
    handleManualSubmit,
    checkWhatsAppRegistration,
  };
}
