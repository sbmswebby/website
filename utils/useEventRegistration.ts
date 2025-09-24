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
  serial_no: number;
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
  registrationNumber: string | number;
  photoUrl?: string | null;
}

const isValidUuid = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export default function useEventRegistration(eventId: string, sessionId: string) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [eventName, setEventName] = useState<string>("");

  // --- Fetch event name ---
  useEffect(() => {
    console.log("[useEventRegistration] Fetching event name", eventId);
    if (!eventId || !isValidUuid(eventId)) return;

    const fetchEventName = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("name")
        .eq("id", eventId)
        .maybeSingle();

      console.log("[useEventRegistration] Event fetch:", { data, error });
      if (data?.name) setEventName(data.name);
      if (error && error.code !== "22P02") console.error("[useEventRegistration] Event fetch error:", error);
    };

    fetchEventName();
  }, [eventId]);

  // --- Check user status ---
  useEffect(() => {
    console.log("[useEventRegistration] Checking user status", sessionId);
    if (!sessionId || !isValidUuid(sessionId)) return;

    const checkUserStatus = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      console.log("[useEventRegistration] Current user:", user);
      if (!user) return;

      const { data: existing } = await supabase
        .from("event_registrations")
        .select("id")
        .eq("event_id", eventId)
        .eq("session_id", sessionId)
        .eq("name", user.email)
        .maybeSingle();

      console.log("[useEventRegistration] Existing registration:", existing);
      if (existing?.id) {
        setIsRegistered(true);
        setRegistrationId(existing.id);
      }

      if (!isAdmin) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        console.log("[useEventRegistration] User profile:", profile);
        if (profile?.role === "admin") setIsAdmin(true);
      }
    };

    checkUserStatus();
  }, [sessionId, isAdmin, eventId]);

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

      if (form.photo) {
        const file = form.photo;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
        }

        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
          throw new Error('File size too large. Please upload an image smaller than 5MB.');
        }

        // Generate a unique filename with proper extension
        const fileExt = file.type.split('/')[1]; // Get extension from MIME type
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const fileName = `${timestamp}_${random}.${fileExt}`;

        console.log("[handleManualSubmit] Uploading file with details:", {
          originalName: file.name,
          fileName,
          size: file.size,
          type: file.type,
          bucket: "event_registrations_photos",
        });

        // Note: Skipping bucket existence check as listBuckets() may require admin permissions
        // The bucket exists as confirmed by the working URL structure

        // Upload the file
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("event_registrations_photos")
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type
          });

        console.log("[handleManualSubmit] Upload result:", { uploadData, uploadError });

        if (uploadError) {
          console.error("[handleManualSubmit] Upload failed:", uploadError);
          
          // Provide more specific error messages
          if (uploadError.message.includes('duplicate')) {
            throw new Error('File upload failed: duplicate file. Please try again.');
          } else if (uploadError.message.includes('size')) {
            throw new Error('File too large. Please upload a smaller image.');
          } else if (uploadError.message.includes('policy')) {
            throw new Error('File upload not allowed. Please check file type and size.');
          } else {
            throw new Error(`File upload failed: ${uploadError.message}`);
          }
        }

        // Get the public URL
        const { data: publicData } = supabase.storage
          .from("event_registrations_photos")
          .getPublicUrl(fileName);

        console.log("[handleManualSubmit] Public URL generated:", publicData?.publicUrl);
        photoUrl = publicData?.publicUrl || null;
      }

      // Insert registration data
      const { data, error } = await supabase
        .from("event_registrations")
        .insert({
          name: form.name,
          whatsapp: form.whatsapp,
          profession: form.profession || null,
          organisation: form.organisation || null,
          event_id: eventId,
          session_id: form.user_selected_session_id,
          photo_url: photoUrl,
        })
        .select(
          "id, name, whatsapp, profession, organisation, event_id, session_id, photo_url, serial_no"
        )
        .returns<EventRegistration[]>();

      console.log("[handleManualSubmit] Registration insert result:", { data, error });
      if (error || !data) throw error;

      const reg = data[0];

      // Fetch session data
      const { data: sessionRow } = await supabase
        .from("sessions")
        .select("name")
        .eq("id", reg.session_id)
        .maybeSingle<SessionData>();

      console.log("[handleManualSubmit] Fetched session:", sessionRow);

      // Generate ticket
      const ticket: TicketData = {
        id: reg.id,
        name: reg.name,
        whatsapp: reg.whatsapp,
        profession: reg.profession,
        organisation: reg.organisation,
        eventName,
        sessionName: sessionRow?.name || undefined,
        registrationNumber: reg.serial_no,
        photoUrl: reg.photo_url,
      };

      console.log("[handleManualSubmit] Generating PDF ticket:", ticket);
      await generateTicketImage(ticket);
      alert("Guest registration successful! Ticket downloaded.");
      
    } catch (err) {
      console.error("[handleManualSubmit] Error during registration:", err);
      const errorMessage = err instanceof Error ? err.message : "Manual registration failed.";
      alert(errorMessage);
    } finally {
      setIsRegistering(false);
      console.log("[handleManualSubmit] Registration process finished.");
    }
  };

  // --- Download pass ---
  const handleDownloadPass = async () => {
    console.log("[handleDownloadPass] registrationId:", registrationId);
    if (!registrationId) {
      alert("No registration found.");
      return;
    }

    const { data } = await supabase
      .from("event_registrations")
      .select(
        "id, name, whatsapp, profession, organisation, event_id, session_id, photo_url, serial_no"
      )
      .eq("id", registrationId)
      .maybeSingle();

    console.log("[handleDownloadPass] Registration data:", data);
    if (!data) {
      alert("No registration found.");
      return;
    }

    const { data: sessionRow } = await supabase
      .from("sessions")
      .select("name")
      .eq("id", data.session_id)
      .maybeSingle<SessionData>();

    const ticket: TicketData = {
      id: data.id,
      name: data.name,
      whatsapp: data.whatsapp,
      profession: data.profession,
      organisation: data.organisation,
      eventName,
      sessionName: sessionRow?.name || undefined,
      registrationNumber: data.serial_no,
      photoUrl: data.photo_url,
    };

    console.log("[handleDownloadPass] Generating PDF ticket:", ticket);
    await generateTicketImage(ticket);
  };

  return {
    isProcessing: isRegistering,
    isRegistered,
    isAdmin,
    handleManualSubmit,
    handleDownloadPass,
  };
}