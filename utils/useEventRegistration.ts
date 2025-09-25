"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { generateTicketImage } from "@/utils/ticketUtils";

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

export interface TicketData {
  id: string;
  name: string;
  whatsapp: string;
  profession?: string | null;
  organisation?: string | null;
  eventName: string;
  sessionName?: string;
  registrationNumber: string; // UUID now
  photoUrl?: string | null;
}

const isValidUuid = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export default function useEventRegistration(eventId: string, sessionId: string) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [eventName, setEventName] = useState<string>("");

  // --- Fetch event name ---
  useEffect(() => {
    if (!eventId || !isValidUuid(eventId)) return;

    const fetchEventName = async () => {
      console.log("[useEventRegistration] Fetching event name for ID:", eventId);
      const { data, error } = await supabase
        .from("events")
        .select("name")
        .eq("id", eventId)
        .maybeSingle();

      if (data?.name) {
        console.log("[useEventRegistration] Event name fetched:", data.name);
        setEventName(data.name);
      }
      if (error && error.code !== "22P02")
        console.error("[useEventRegistration] Event fetch error:", error);
    };

    fetchEventName();
  }, [eventId]);

  // --- Check if a WhatsApp number is already registered for the session ---
  const checkWhatsAppRegistration = async (whatsapp: string) => {
    console.log("[checkWhatsAppRegistration] Checking WhatsApp:", whatsapp, "Session:", sessionId);
    if (!whatsapp || !sessionId) return null;

    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("whatsapp_number", whatsapp)
      .maybeSingle();

    console.log("[checkWhatsAppRegistration] User profile found:", userProfile);

    if (!userProfile) return null;

    const { data: registration } = await supabase
      .from("registrations")
      .select("id")
      .eq("user_profile_id", userProfile.id)
      .eq("session_id", sessionId)
      .maybeSingle();

    console.log("[checkWhatsAppRegistration] Existing registration:", registration);
    return registration || null;
  };

  // --- Manual (guest) submit ---
  const handleManualSubmit = async (form: {
    name: string;
    whatsapp: string;
    profession?: string;
    organisation?: string;
    user_selected_session_id: string;
    photo?: File | null;
  }) => {
    console.log("[handleManualSubmit] Form data:", form);
    setIsRegistering(true);

    try {
      let photoUrl: string | null = null;

      // --- Handle photo upload ---
      if (form.photo) {
        console.log("[handleManualSubmit] Uploading photo...");
        const file = form.photo;
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) throw new Error("Invalid file type.");
        if (file.size > 5 * 1024 * 1024) throw new Error("File too large.");

        const fileExt = file.type.split("/")[1].toLowerCase();
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const fileName = `${timestamp}_${random}.${fileExt}`;

        console.log("[handleManualSubmit] Uploading file with name:", fileName);

        const { error: uploadError } = await supabase.storage
          .from("event_registrations_photos")
          .upload(fileName, file, { cacheControl: "3600", upsert: false, contentType: file.type });

        if (uploadError) throw new Error(`File upload failed: ${uploadError.message}`);
        console.log("[handleManualSubmit] Photo uploaded successfully");

        const { data: publicData } = supabase.storage
          .from("event_registrations_photos")
          .getPublicUrl(fileName);

        photoUrl = publicData?.publicUrl || null;
        console.log("[handleManualSubmit] Public URL:", photoUrl);
      }

      // --- Upsert user profile ---
      console.log("[handleManualSubmit] Upserting user profile...");
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
      console.log("[handleManualSubmit] Upserted user profile:", userProfile);
      if (!userProfile) throw new Error("Failed to upsert user profile");

      // --- Check if already registered ---
      console.log("[handleManualSubmit] Checking existing registration...");
      let finalRegistrationId: string;
      const existingRegistration = await checkWhatsAppRegistration(form.whatsapp);
      if (existingRegistration) {
        console.log("[handleManualSubmit] Already registered. ID:", existingRegistration.id);
        finalRegistrationId = existingRegistration.id;
        setIsRegistered(true);
        setRegistrationId(finalRegistrationId);
      } else {
        console.log("[handleManualSubmit] Inserting new registration...");
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
        console.log("[handleManualSubmit] Registration inserted:", registrationData);
        setIsRegistered(true);
        setRegistrationId(finalRegistrationId);
      }

      // --- Fetch session name ---
      console.log("[handleManualSubmit] Fetching session name...");
      const { data: sessionRow } = await supabase
        .from("sessions")
        .select("name")
        .eq("id", form.user_selected_session_id)
        .maybeSingle<SessionData>();
      console.log("[handleManualSubmit] Session fetched:", sessionRow);

      // --- Generate ticket ---
      const ticket: TicketData = {
        id: finalRegistrationId,
        name: userProfile.name,
        whatsapp: userProfile.whatsapp_number,
        profession: userProfile.profession,
        organisation: userProfile.organisation_name,
        eventName,
        sessionName: sessionRow?.name || undefined,
        registrationNumber: finalRegistrationId,
        photoUrl: userProfile.image_url,
      };

      console.log("[handleManualSubmit] Generating ticket with data:", ticket);
      await generateTicketImage(ticket);
      console.log("[handleManualSubmit] Ticket generated successfully");
      alert("Guest registration successful! Ticket downloaded.");
    } catch (err) {
      console.error("[handleManualSubmit] Error during registration:", err);
      alert(err instanceof Error ? err.message : "Manual registration failed.");
    } finally {
      setIsRegistering(false);
      console.log("[handleManualSubmit] Registration process completed");
    }
  };

  // --- Download pass ---
  const handleDownloadPass = async () => {
    console.log("[handleDownloadPass] Downloading pass for registrationId:", registrationId);
    if (!registrationId) return alert("No registration found.");

    const { data: registrationData } = await supabase
      .from("registrations")
      .select("id, user_profile_id, session_id")
      .eq("id", registrationId)
      .maybeSingle();

    if (!registrationData) return alert("No registration found.");
    console.log("[handleDownloadPass] Registration data:", registrationData);

    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("name, whatsapp_number, profession, organisation_name, image_url")
      .eq("id", registrationData.user_profile_id)
      .maybeSingle();

    const { data: sessionRow } = await supabase
      .from("sessions")
      .select("name")
      .eq("id", registrationData.session_id)
      .maybeSingle<SessionData>();

    if (!userProfile) return alert("User profile not found.");
    console.log("[handleDownloadPass] User profile:", userProfile);
    console.log("[handleDownloadPass] Session:", sessionRow);

    const ticket: TicketData = {
      id: registrationData.id,
      name: userProfile.name,
      whatsapp: userProfile.whatsapp_number,
      profession: userProfile.profession,
      organisation: userProfile.organisation_name,
      eventName,
      sessionName: sessionRow?.name || undefined,
      registrationNumber: registrationData.id,
      photoUrl: userProfile.image_url,
    };

    console.log("[handleDownloadPass] Generating ticket for download:", ticket);
    await generateTicketImage(ticket);
  };

  return {
    isProcessing: isRegistering,
    isRegistered,
    handleManualSubmit,
    handleDownloadPass,
    checkWhatsAppRegistration, // ✅ helper
  };
}
