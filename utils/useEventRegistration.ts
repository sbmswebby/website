"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { generatePdfTicket } from "@/utils/ticketUtils";


export interface AllEventRegistration {
  id: string;
  user_name: string;
  whatsapp_number: string;
  beautyparlor_name: string | null;
  event_name: string;
  session_name: string | null;
  registration_number: number;
}

export interface UserProfile {
  full_name: string;
  number: string;
  organisation: string | null;
  role?: string;
}

export interface EventRegistration {
  id: string;
}

export interface SessionData {
  name: string;
}

export interface EventData {
  name: string;
}

export interface TicketData {
  name: string;
  whatsapp: string;
  beautyParlor: string;
  eventName: string;
  sessionName?: string;
  registrationNumber: string | number;
}

export default function useEventRegistration(eventId: string, sessionId: string) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [eventName, setEventName] = useState<string>("");

  // --- Fetch event name ---
  useEffect(() => {
    const fetchEventName = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("name")
        .eq("id", eventId)
        .maybeSingle();

      if (data?.name) setEventName(data.name);
      if (error) console.error("[useEventRegistration] Failed to load event name:", error);
    };

    fetchEventName();
  }, [eventId]);

  // --- Check user status (registration + admin role) ---
  useEffect(() => {
    const checkUserStatus = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) return;

      // Check registration
      const { data: existing } = await supabase
        .from("event_registrations")
        .select("id")
        .eq("user_id", user.id)
        .eq("session_id", sessionId)
        .maybeSingle();

      if (existing?.id) {
        setIsRegistered(true);
        setRegistrationId(existing.id);
      }

      // Check admin role
      if (!isAdmin) {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.role === "admin") setIsAdmin(true);
      }
    };

    checkUserStatus();
  }, [sessionId, isAdmin]);

  // --- Register logged-in user ---
  const handleRegister = async (): Promise<boolean> => {
    setIsRegistering(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        // No login → open manual modal
        return true;
      }

      // Already registered?
      const { data: existing } = await supabase
        .from("event_registrations")
        .select("id")
        .eq("user_id", user.id)
        .eq("session_id", sessionId)
        .maybeSingle();

      if (existing?.id) {
        setIsRegistered(true);
        setRegistrationId(existing.id);
        alert("Already registered.");
        return false;
      }

      // Insert event_registrations
      const { data: eventReg, error: regError } = await supabase
        .from("event_registrations")
        .insert({
          user_id: user.id,
          event_id: eventId,
          session_id: sessionId,
          payment_status: "pending",
        })
        .select("id")
        .returns<EventRegistration[]>();

      if (regError || !eventReg) throw regError;
      const regId = eventReg[0].id;
      setIsRegistered(true);
      setRegistrationId(regId);

      // Fetch profile + session
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("full_name, number, organisation")
        .eq("id", user.id)
        .maybeSingle()
        .returns<UserProfile | null>();

      const { data: sessionRow } = await supabase
        .from("sessions")
        .select("name")
        .eq("id", sessionId)
        .maybeSingle()
        .returns<SessionData | null>();

      // Insert into all_event_registrations
      const { data: allReg } = await supabase
        .from("all_event_registrations")
        .insert({
          user_name: profile?.full_name,
          whatsapp_number: profile?.number,
          beautyparlor_name: profile?.organisation || null,
          event_name: eventName,
          session_name: sessionRow?.name,
          payment_status: "pending",
        })
        .select(
          "id, user_name, whatsapp_number, beautyparlor_name, event_name, session_name, registration_number"
        )
        .returns<AllEventRegistration[]>();

      if (allReg?.[0]) {
        const ticket: TicketData = {
          name: allReg[0].user_name,
          whatsapp: allReg[0].whatsapp_number,
          beautyParlor: allReg[0].beautyparlor_name || "Unknown",
          eventName: allReg[0].event_name,
          sessionName: allReg[0].session_name || undefined,
          registrationNumber: allReg[0].registration_number,
        };

        await generatePdfTicket(ticket);
        alert("Registered! Ticket downloaded.");
      }
    } catch (err) {
      console.error("[useEventRegistration] handleRegister error:", err);
      alert("Registration failed.");
    } finally {
      setIsRegistering(false);
    }
    return false;
  };

  // --- Manual (guest) submit ---
  const handleManualSubmit = async (form: {
    user_name: string;
    whatsapp_number: string;
    beautyparlor_name: string;
  }) => {
    setIsRegistering(true);
    try {
      const { data, error } = await supabase
        .from("all_event_registrations")
        .insert({
          user_name: form.user_name,
          whatsapp_number: form.whatsapp_number,
          beautyparlor_name: form.beautyparlor_name,
          event_name: eventName,
        })
        .select()
        .returns<AllEventRegistration[]>();

      if (error || !data) throw error;

      const reg = data[0];
      const ticket: TicketData = {
        name: reg.user_name,
        whatsapp: reg.whatsapp_number,
        beautyParlor: reg.beautyparlor_name || "Unknown",
        eventName: reg.event_name,
        registrationNumber: reg.registration_number,
      };

      await generatePdfTicket(ticket);
      alert("Guest registration successful! Ticket downloaded.");
    } catch (err) {
      console.error("[useEventRegistration] handleManualSubmit error:", err);
      alert("Manual registration failed.");
    } finally {
      setIsRegistering(false);
    }
  };

  // --- Download pass (logged in) ---
  const handleDownloadPass = async () => {
    if (!registrationId) {
      alert("No registration found.");
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) return;

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("full_name, number, organisation")
      .eq("id", user.id)
      .maybeSingle()
      .returns<UserProfile | null>();

    const { data: sessionRow } = await supabase
      .from("sessions")
      .select("name")
      .eq("id", sessionId)
      .maybeSingle()
      .returns<SessionData | null>();

    const { data: allReg } = await supabase
      .from("all_event_registrations")
      .select("registration_number")
      .eq("user_name", profile?.full_name || "")
      .eq("event_name", eventName)
      .eq("session_name", sessionRow?.name || "")
      .maybeSingle();

    const registrationNumber = allReg?.registration_number || registrationId;

    const ticket: TicketData = {
      name: profile?.full_name || "Unknown",
      whatsapp: profile?.number || "Unknown",
      beautyParlor: profile?.organisation || "Unknown",
      eventName,
      sessionName: sessionRow?.name || undefined,
      registrationNumber,
    };

    await generatePdfTicket(ticket);
  };

  return {
    isProcessing: isRegistering, // 👈 alias for nicer API
    isRegistered,
    isAdmin,
    handleRegister,
    handleManualSubmit,
    handleDownloadPass,
  };
}
