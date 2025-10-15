"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  GenerationOrchestrator, 
} from "@/lib/certificate_and_id/generationOrchestrator";
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
 * Represents the structure of a user registration
 */
export interface EventRegistration {
  id: string;
  name: string;
  whatsapp: string;
  profession: string | null;
  organisation: string | null;
  event_id: string;
  session_id: string;
  photo_url: string | null;
}

/**
 * Represents a session row
 */
export interface SessionData {
  name: string;
}

/**
 * Utility to check UUID validity
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
   * Fetch the event name for the given `eventId`
   */
  useEffect(() => {
    if (!eventId || !isValidUuid(eventId)) return;

    const fetchEventName = async () => {
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
   * Check if a user with given WhatsApp is already registered for a session
   */
  const checkWhatsAppRegistration = async (
    whatsapp: string
  ): Promise<{ id: string; registration_number: number } | null> => {
    if (!whatsapp || !sessionId) return null;

    // Get user profile by WhatsApp
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("whatsapp_number", whatsapp)
      .maybeSingle();

    if (!userProfile) return null;

    // Check if registration exists for this session
    const { data: registration } = await supabase
      .from("registrations")
      .select("id, registration_number")
      .eq("user_profile_id", userProfile.id)
      .eq("session_id", sessionId)
      .maybeSingle();

    return registration || null;
  };

  /**
   * Handle manual registration form submission
   */
  const handleManualSubmit = async (form: {
    name: string;
    whatsapp: string;
    profession?: string;
    organisation?: string;
    user_selected_session_id: string;
    photo?: File | null;
    city: string;
  }): Promise<{ idUrl: string; certUrl: string; registrationId: string } | null> => {
    setIsProcessing(true);

    try {
      let photoUrl: string | null = null;

      // --- Handle photo upload to Cloudinary ---
      if (form.photo) {
        photoUrl = await CloudinaryService.uploadFile(form.photo, "user_photos");
      }

      // --- Upsert user profile ---
      const { data: userProfiles } = await supabase
        .from("user_profiles")
        .upsert(
          {
            whatsapp_number: form.whatsapp,
            name: form.name,
            profession: form.profession || null,
            organisation_name: form.organisation || null,
            image_url: photoUrl,
          },
          { onConflict: "whatsapp_number" }
        )
        .select();

      const userProfile = userProfiles?.[0];
      if (!userProfile) throw new Error("Failed to upsert user profile");

      // --- Check if already registered ---
      let finalRegistrationId: string;
      let registrationNumber: number | string;

      const existingRegistration = await checkWhatsAppRegistration(form.whatsapp);

      if (existingRegistration) {
        finalRegistrationId = existingRegistration.id;
        registrationNumber = existingRegistration.registration_number;
        setIsRegistered(true);
        setRegistrationId(finalRegistrationId);
      } else {
        const { data: registrationData, error: registrationError } = await supabase
          .from("registrations")
          .insert({
            user_profile_id: userProfile.id,
            session_id: form.user_selected_session_id,
            status: "registered",
          })
          .select()
          .maybeSingle();

        if (registrationError?.code === "23505") {
          throw new Error("Already registered for this session.");
        }
        if (!registrationData) throw registrationError || new Error("Registration failed");

        finalRegistrationId = registrationData.id;
        registrationNumber = registrationData.registration_number;
        setIsRegistered(true);
        setRegistrationId(finalRegistrationId);
      }

      // --- Fetch session name for custom text ---
      const { data: sessionRow } = await supabase
        .from("sessions")
        .select("name")
        .eq("id", form.user_selected_session_id)
        .maybeSingle<SessionData>();

      // --- Generate & upload ID card & certificate using new orchestrator ---
      const result = await GenerationOrchestrator.generateBoth(
        finalRegistrationId,
        false, // Don't auto-download, we'll return URLs
        {
          // Custom text replacements for template placeholders
          event_name: eventName,
          session_name: sessionRow?.name || '',
          city: form.city,
          registration_number: String(registrationNumber),
        }
      );

      // Handle the result - DON'T throw error for "Certificate skipped"
      if (result.error) {
        if (result.error.includes('Certificate skipped')) {
          // This is expected when certificate template doesn't exist
          console.warn(`ℹ️ [handleManualSubmit] ${result.error}`);
          
          // Return partial success with just ID card
          if (result.idCardUrl) {
            console.log(
              `Guest registration successful (ID card only)!\nTicket URL: ${result.idCardUrl}`
            );
            
            return {
              idUrl: result.idCardUrl,
              certUrl: '', // Empty string instead of throwing error
              registrationId: finalRegistrationId,
            };
          }
        } else {
          // This is an actual error - throw it
          console.error(`❌ [handleManualSubmit] Generation error: ${result.error}`);
          throw new Error(result.error || "Failed to generate certificate and ID card");
        }
      }

      // Success case - both certificate and ID card generated
      if (result.success && result.certificateUrl && result.idCardUrl) {
        console.log(
          `Guest registration successful!\nTicket URL: ${result.idCardUrl}\nCertificate URL: ${result.certificateUrl}`
        );

        return {
          idUrl: result.idCardUrl,
          certUrl: result.certificateUrl,
          registrationId: finalRegistrationId,
        };
      }

      // Fallback - if we get here, something unexpected happened
      throw new Error("Unexpected result from generation orchestrator");

    } catch (err) {
      console.error("❌ [handleManualSubmit] Error:", err);
      throw err; // Re-throw to be handled by the calling component
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