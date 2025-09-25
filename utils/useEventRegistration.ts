"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  generateAndUploadBoth,
  TicketData
} from "@/utils/ticketUtils";

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

export interface SessionData {
  name: string;
}

const isValidUuid = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export default function useEventRegistration(eventId: string, sessionId: string) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [eventName, setEventName] = useState<string>("");

  // --- Fetch event name ---
  useEffect(() => {
    if (!eventId || !isValidUuid(eventId)) return;

    const fetchEventName = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("name")
        .eq("id", eventId)
        .maybeSingle();

      if (data?.name) setEventName(data.name);
      if (error && error.code !== "22P02") console.error(error);
    };

    fetchEventName();
  }, [eventId]);

  // --- Check existing WhatsApp registration ---
  const checkWhatsAppRegistration = async (whatsapp: string) => {
    if (!whatsapp || !sessionId) return null;

    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("whatsapp_number", whatsapp)
      .maybeSingle();

    if (!userProfile) return null;

    const { data: registration } = await supabase
      .from("registrations")
      .select("id")
      .eq("user_profile_id", userProfile.id)
      .eq("session_id", sessionId)
      .maybeSingle();

    return registration || null;
  };

  // --- Manual guest submit ---
  const handleManualSubmit = async (form: {
    name: string;
    whatsapp: string;
    profession?: string;
    organisation?: string;
    user_selected_session_id: string;
    photo?: File | null;
  }) => {
    setIsProcessing(true);

    try {
      let photoUrl: string | null = null;

      // --- Handle photo upload ---
      if (form.photo) {
        const file = form.photo;
        const fileExt = file.type.split("/")[1].toLowerCase();
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const fileName = `${timestamp}_${random}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("event_registrations_photos")
          .upload(fileName, file, { cacheControl: "3600", upsert: false, contentType: file.type });

        if (uploadError) throw new Error(`File upload failed: ${uploadError.message}`);

        const { data: publicData } = supabase.storage
          .from("event_registrations_photos")
          .getPublicUrl(fileName);

        photoUrl = publicData?.publicUrl || null;
      }

      // --- Upsert user profile ---
      const { data: userProfiles, error: profileError } = await supabase
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

      if (profileError) throw profileError;
      const userProfile = userProfiles?.[0];
      if (!userProfile) throw new Error("Failed to upsert user profile");

      // --- Check existing registration ---
      let finalRegistrationId: string;
      const existingRegistration = await checkWhatsAppRegistration(form.whatsapp);
      if (existingRegistration) {
        finalRegistrationId = existingRegistration.id;
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

        if (registrationError?.code === "23505") throw new Error("Already registered for this session.");
        if (!registrationData) throw registrationError || new Error("Registration failed");

        finalRegistrationId = registrationData.id;
        setIsRegistered(true);
        setRegistrationId(finalRegistrationId);
      }

      // --- Fetch session name ---
      const { data: sessionRow } = await supabase
        .from("sessions")
        .select("name")
        .eq("id", form.user_selected_session_id)
        .maybeSingle<SessionData>();

      // --- Ticket & Certificate Data ---
      const ticket: TicketData = {
        registrationId: finalRegistrationId,
        userProfileId: userProfile.id, // correct user_profile_id
        name: userProfile.name,
        whatsapp: userProfile.whatsapp_number,
        profession: userProfile.profession,
        organisation: userProfile.organisation_name,
        eventName,
        sessionName: sessionRow?.name || undefined,
        registrationNumber: finalRegistrationId,
        photoUrl: userProfile.image_url,
      };

      // --- Generate & upload both ID and certificate ---
      const { idUrl, certUrl } = await generateAndUploadBoth(ticket, form.user_selected_session_id);

      alert(`Guest registration successful!\nTicket URL: ${idUrl}\nCertificate URL: ${certUrl}`);
      return { idUrl, certUrl, registrationId: finalRegistrationId };
    } catch (err) {
      console.error("[handleManualSubmit]", err);
      alert(err instanceof Error ? err.message : "Manual registration failed.");
      return null;
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
