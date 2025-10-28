// lib/supabaseHelpers.ts
import { supabase } from "@/lib/supabaseClient"
import * as types from "@/lib/certificate_and_id/types"


// ==================== USER PROFILE FUNCTIONS ====================

export const getUserProfile = async () => {
  console.log("[getUserProfile] Fetching current user...");
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    console.error("[getUserProfile] No user logged in:", error?.message)
    return null
  }
  console.log("[getUserProfile] Logged in user:", user)

  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("supabase_auth_id", user.id)
    .maybeSingle()
  if (profileError) {
    console.error("[getUserProfile] Error fetching profile:", profileError.message)
    return null
  }
  console.log("[getUserProfile] Profile fetched:", profile)
  return profile as types.UserProfile | null
}

export const getUserProfileById = async (userId: string) => {
  console.log("[getUserProfileById] Fetching profile for userId:", userId)
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single()
  if (error) {
    console.error("[getUserProfileById] Error fetching user profile:", error.message)
    return null
  }
  console.log("[getUserProfileById] Profile fetched:", data)
  return data as types.UserProfile
}

export const createOrUpdateUserProfile = async (profileData: Partial<types.UserProfile>) => {
  console.log("[createOrUpdateUserProfile] profileData:", profileData)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.warn("[createOrUpdateUserProfile] No user logged in")
    return null
  }
  console.log("[createOrUpdateUserProfile] Current user:", user)

  const { data, error } = await supabase
    .from("user_profiles")
    .upsert({
      ...profileData,
      supabase_auth_id: user.id,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error("[createOrUpdateUserProfile] Error upserting profile:", error.message)
    return null
  }
  console.log("[createOrUpdateUserProfile] Profile upserted:", data)
  return data as types.UserProfile
}

// ==================== REGISTRATION FUNCTIONS ====================

export const getAllRegistrations = async () => {
  console.log("[getAllRegistrations] Fetching all registrations...")
  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getAllRegistrations] Error fetching registrations:", error.message)
    return []
  }
  console.log("[getAllRegistrations] Registrations fetched:", data?.length)
  return data as types.Registration[]
}

export const getAllRegistrationsWithDetails = async (): Promise<
  Array<
    types.RegistrationWithDetails & {
      certificate_url?: string | null;
      id_card_url?: string | null;
      organisation?: string | null;
    }
  >
> => {
  console.log("[getAllRegistrationsWithDetails] Fetching registrations with details...");
  try {
    // Fetch registrations
    const { data: registrations, error: regError } = await supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (regError) {
      throw regError;
    }

    if (!registrations || registrations.length === 0) {
      console.log("[getAllRegistrationsWithDetails] No registrations found");
      return [];
    }

    console.log("[getAllRegistrationsWithDetails] Registrations fetched:", registrations.length);

    // Collect IDs for batch fetches
    const userIds = Array.from(new Set(registrations.map((r) => r.user_profile_id)));
    const sessionIds = Array.from(new Set(registrations.map((r) => r.session_id)));
    const transactionIds = registrations
      .map((r) => r.transaction_id)
      .filter((id): id is string => id !== null);

    console.log("[getAllRegistrationsWithDetails] userIds:", userIds);
    console.log("[getAllRegistrationsWithDetails] sessionIds:", sessionIds);
    console.log("[getAllRegistrationsWithDetails] transactionIds:", transactionIds);

    // Fetch related rows in parallel (typed)
    const [
      { data: users, error: usersError },
      { data: sessions, error: sessionsError },
      { data: certificates, error: certificatesError },
      { data: transactions, error: transactionsError },
    ] = await Promise.all([
      supabase.from("user_profiles").select("*").in("id", userIds),
      supabase.from("sessions").select("*").in("id", sessionIds),
      supabase.from("certificates").select("*").in("session_id", sessionIds),
      transactionIds.length > 0
        ? supabase.from("transactions").select("*").in("id", transactionIds)
        : Promise.resolve({ data: [] as types.Transaction[], error: null }),
    ]);

    if (usersError) throw usersError;
    if (sessionsError) throw sessionsError;
    if (certificatesError) throw certificatesError;
    if (transactionsError) throw transactionsError;

    console.log("[getAllRegistrationsWithDetails] Users:", users?.length ?? 0);
    console.log("[getAllRegistrationsWithDetails] Sessions:", sessions?.length ?? 0);
    console.log("[getAllRegistrationsWithDetails] Certificates:", certificates?.length ?? 0);
    console.log("[getAllRegistrationsWithDetails] Transactions:", transactions?.length ?? 0);

    // Fetch events corresponding to sessions
    const eventIds = Array.from(new Set((sessions || []).map((s) => s.event_id)));
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("*")
      .in("id", eventIds);

    if (eventsError) throw eventsError;
    console.log("[getAllRegistrationsWithDetails] Events:", events?.length ?? 0);

    // Build typed lookup maps (no any)
    const userMap = new Map<string, types.UserProfile>((users || []).map((u) => [u.id, u]));
    const sessionMap = new Map<string, types.Session>((sessions || []).map((s) => [s.id, s]));
    const eventMap = new Map<string, types.Event>((events || []).map((e) => [e.id, e]));
    const transactionMap = new Map<string, types.Transaction>(((transactions as types.Transaction[]) || []).map((t) => [t.id, t]));
    // Map certificates by composite key user_session
    const certificateMap = new Map<string, types.Certificate>(((certificates as types.Certificate[]) || []).map((c) => [`${c.user_profile_id}-${c.session_id}`, c]));

    // Assemble enriched registration objects
    const enriched: Array<
      types.RegistrationWithDetails & {
        certificate_url?: string | null;
        id_card_url?: string | null;
        organisation?: string | null;
      }
    > = registrations.map((reg) => {
      const user = userMap.get(reg.user_profile_id) ?? null;
      const session = sessionMap.get(reg.session_id) ?? null;
      const event = session ? eventMap.get(session.event_id) ?? null : null;
      const transaction = reg.transaction_id ? transactionMap.get(reg.transaction_id) ?? null : null;
      const certificate = certificateMap.get(`${reg.user_profile_id}-${reg.session_id}`) ?? null;

      // certificate_url comes from certificates.download_url (nullable)
      const certificate_url = certificate?.download_url ?? null;
      // id_card_url is stored on the registration row as ticket_url per your schema
      const id_card_url = reg.ticket_url ?? null;

      // Build the RegistrationWithDetails-shaped object
      const regWithDetails: types.RegistrationWithDetails & {
        certificate_url?: string | null;
        id_card_url?: string | null;
        organisation?: string | null;
      } = {
        ...reg,
        user,
        session,
        event,
        certificate: certificate ?? null,
        transaction: transaction ?? null,
        // convenience fields used elsewhere
        certificate_url,
        id_card_url,
        organisation: user?.organisation_name ?? null,
      };

      // optional per-row debug:
      // console.debug("[getAllRegistrationsWithDetails] regWithDetails:", regWithDetails);

      return regWithDetails;
    });

    console.log("[getAllRegistrationsWithDetails] Completed. Total:", enriched.length);
    return enriched;
  } catch (err) {
    console.error("[getAllRegistrationsWithDetails] Error fetching registrations with details:", err);
    return [];
  }
};

// ==================== OTHER FUNCTIONS ====================

export const getRegistrationsByUserId = async (userId: string) => {
  console.log("[getRegistrationsByUserId] Fetching registrations for userId:", userId)
  const { data, error } = await supabase
    .from("registrations")
    .select(`*, user_profiles(*), sessions(*), certificates(*)`)
    .eq("user_profile_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getRegistrationsByUserId] Error fetching user registrations:", error.message)
    return []
  }
  console.log("[getRegistrationsByUserId] Registrations fetched:", data?.length)
  return data
}

export const getRegistrationsBySessionId = async (sessionId: string) => {
  console.log("[getRegistrationsBySessionId] Fetching registrations for sessionId:", sessionId)
  const { data, error } = await supabase
    .from("registrations")
    .select("*, user_profiles(*)")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[getRegistrationsBySessionId] Error fetching session registrations:", error.message)
    return []
  }
  console.log("[getRegistrationsBySessionId] Registrations fetched:", data?.length)
  return data
}

export const createRegistration = async (registrationData: Partial<types.Registration>) => {
  console.log("[createRegistration] Creating registration with data:", registrationData)
  const { data, error } = await supabase
    .from("registrations")
    .insert(registrationData)
    .select()
    .single()

  if (error) {
    console.error("[createRegistration] Error creating registration:", error.message)
    return null
  }
  console.log("[createRegistration] Registration created:", data)
  return data as types.Registration
}

export const updateRegistrationStatus = async (registrationId: string, status: string) => {
  console.log("[updateRegistrationStatus] Updating registrationId:", registrationId, "to status:", status)
  const { data, error } = await supabase
    .from("registrations")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", registrationId)
    .select()
    .single()

  if (error) {
    console.error("[updateRegistrationStatus] Error updating registration:", error.message)
    return null
  }
  console.log("[updateRegistrationStatus] Registration updated:", data)
  return data as types.Registration
}

export const getAllEvents = async () => {
  console.log("[getAllEvents] Fetching all events...")
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("start_time", { ascending: false })

  if (error) {
    console.error("[getAllEvents] Error fetching events:", error.message)
    return []
  }
  console.log("[getAllEvents] Events fetched:", data?.length)
  return data as types.Event[]
}

export const getEventById = async (eventId: string) => {
  console.log("[getEventById] Fetching eventId:", eventId)
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single()

  if (error) {
    console.error("[getEventById] Error fetching event:", error.message)
    return null
  }
  console.log("[getEventById] Event fetched:", data)
  return data as types.Event
}

export const getEventBySlug = async (slug: string) => {
  console.log("[getEventBySlug] Fetching event by slug:", slug)
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error) {
    console.error("[getEventBySlug] Error fetching event by slug:", error.message)
    return null
  }
  console.log("[getEventBySlug] Event fetched:", data)
  return data as types.Event
}

export const getSessionsByEventId = async (eventId: string) => {
  console.log("[getSessionsByEventId] Fetching sessions for eventId:", eventId)
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("event_id", eventId)
    .order("start_time", { ascending: true })

  if (error) {
    console.error("[getSessionsByEventId] Error fetching sessions:", error.message)
    return []
  }
  console.log("[getSessionsByEventId] Sessions fetched:", data?.length)
  return data as types.Session[]
}

export const getSessionById = async (sessionId: string) => {
  console.log("[getSessionById] Fetching sessionId:", sessionId)
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single()

  if (error) {
    console.error("[getSessionById] Error fetching session:", error.message)
    return null
  }
  console.log("[getSessionById] Session fetched:", data)
  return data as types.Session
}

export const getAllSessions = async () => {
  console.log("[getAllSessions] Fetching all sessions...")
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .order("start_time", { ascending: false })

  if (error) {
    console.error("[getAllSessions] Error fetching all sessions:", error.message)
    return []
  }
  console.log("[getAllSessions] Sessions fetched:", data?.length)
  return data as types.Session[]
}

export const getCertificateByUserAndSession = async (userId: string, sessionId: string) => {
  console.log("[getCertificateByUserAndSession] Fetching certificate for userId:", userId, "sessionId:", sessionId)
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_profile_id", userId)
    .eq("session_id", sessionId)
    .maybeSingle()

  if (error) {
    console.error("[getCertificateByUserAndSession] Error fetching certificate:", error.message)
    return null
  }
  console.log("[getCertificateByUserAndSession] Certificate fetched:", data)
  return data as types.Certificate | null
}

export const createCertificate = async (certificateData: Partial<types.Certificate>) => {
  console.log("[createCertificate] Creating certificate:", certificateData)
  const { data, error } = await supabase
    .from("certificates")
    .insert(certificateData)
    .select()
    .single()

  if (error) {
    console.error("[createCertificate] Error creating certificate:", error.message)
    return null
  }
  console.log("[createCertificate] Certificate created:", data)
  return data as types.Certificate
}

export const updateCertificate = async (certificateId: string, updates: Partial<types.Certificate>) => {
  console.log("[updateCertificate] Updating certificateId:", certificateId, "with updates:", updates)
  const { data, error } = await supabase
    .from("certificates")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", certificateId)
    .select()
    .single()

  if (error) {
    console.error("[updateCertificate] Error updating certificate:", error.message)
    return null
  }
  console.log("[updateCertificate] Certificate updated:", data)
  return data as types.Certificate
}

export const getCertificatesBySessionId = async (sessionId: string) => {
  console.log("[getCertificatesBySessionId] Fetching certificates for sessionId:", sessionId)
  const { data, error } = await supabase
    .from("certificates")
    .select("*, user_profiles(*)")
    .eq("session_id", sessionId)

  if (error) {
    console.error("[getCertificatesBySessionId] Error fetching certificates:", error.message)
    return []
  }
  console.log("[getCertificatesBySessionId] Certificates fetched:", data?.length)
  return data
}

export const createTransaction = async (transactionData: Partial<types.Transaction>) => {
  console.log("[createTransaction] Creating transaction:", transactionData)
  const { data, error } = await supabase
    .from("transactions")
    .insert(transactionData)
    .select()
    .single()

  if (error) {
    console.error("[createTransaction] Error creating transaction:", error.message)
    return null
  }
  console.log("[createTransaction] Transaction created:", data)
  return data as types.Transaction
}

export const updateTransactionStatus = async (transactionId: string, status: string) => {
  console.log("[updateTransactionStatus] Updating transactionId:", transactionId, "to status:", status)
  const { data, error } = await supabase
    .from("transactions")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", transactionId)
    .select()
    .single()

  if (error) {
    console.error("[updateTransactionStatus] Error updating transaction:", error.message)
    return null
  }
  console.log("[updateTransactionStatus] Transaction updated:", data)
  return data as types.Transaction
}

export const getTransactionById = async (transactionId: string) => {
  console.log("[getTransactionById] Fetching transactionId:", transactionId)
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", transactionId)
    .single()

  if (error) {
    console.error("[getTransactionById] Error fetching transaction:", error.message)
    return null
  }
  console.log("[getTransactionById] Transaction fetched:", data)
  return data as types.Transaction
}

export const getAllAcademies = async () => {
  console.log("[getAllAcademies] Fetching all academies...")
  const { data, error } = await supabase
    .from("academies")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    console.error("[getAllAcademies] Error fetching academies:", error.message)
    return []
  }
  console.log("[getAllAcademies] Academies fetched:", data?.length)
  return data as types.Academy[]
}

export const getAcademyById = async (academyId: string) => {
  console.log("[getAcademyById] Fetching academyId:", academyId)
  const { data, error } = await supabase
    .from("academies")
    .select("*")
    .eq("id", academyId)
    .single()

  if (error) {
    console.error("[getAcademyById] Error fetching academy:", error.message)
    return null
  }
  console.log("[getAcademyById] Academy fetched:", data)
  return data as types.Academy
}

export const getIDCardDetailsById = async (idCardId: string) => {
  console.log("[getIDCardDetailsById] Fetching ID card details for idCardId:", idCardId)
  const { data, error } = await supabase
    .from("id_card_details")
    .select("*")
    .eq("id", idCardId)
    .single()

  if (error) {
    console.error("[getIDCardDetailsById] Error fetching ID card details:", error.message)
    return null
  }
  console.log("[getIDCardDetailsById] ID card details fetched:", data)
  return data as types.IDCardDetails
}

export const getSessionIDCards = async (sessionId: string) => {
  console.log("[getSessionIDCards] Fetching session ID cards for sessionId:", sessionId)
  const { data, error } = await supabase
    .from("session_id_cards")
    .select("*, id_card_details(*)")
    .eq("session_id", sessionId)

  if (error) {
    console.error("[getSessionIDCards] Error fetching session ID cards:", error.message)
    return []
  }
  console.log("[getSessionIDCards] Session ID cards fetched:", data?.length)
  return data
}

export const getCertificateTemplateById = async (templateId: string) => {
  console.log("[getCertificateTemplateById] Fetching templateId:", templateId)
  const { data, error } = await supabase
    .from("certificate_templates")
    .select("*")
    .eq("id", templateId)
    .single()

  if (error) {
    console.error("[getCertificateTemplateById] Error fetching certificate template:", error.message)
    return null
  }
  console.log("[getCertificateTemplateById] Certificate template fetched:", data)
  return data as types.CertificateTemplate
}

export const getSessionCertificateTemplates = async (sessionId: string) => {
  console.log("[getSessionCertificateTemplates] Fetching session certificate templates for sessionId:", sessionId)
  const { data, error } = await supabase
    .from("session_certificates")
    .select("*, certificate_templates(*)")
    .eq("session_id", sessionId)

  if (error) {
    console.error("[getSessionCertificateTemplates] Error fetching session certificates:", error.message)
    return []
  }
  console.log("[getSessionCertificateTemplates] Session certificates fetched:", data?.length)
  return data
}

export const isUserAdmin = async (userId: string) => {
  console.log("[isUserAdmin] Checking admin status for userId:", userId)
  const { data, error } = await supabase
    .from("admins")
    .select("*")
    .eq("user_profile_id", userId)
    .maybeSingle()

  if (error) {
    console.error("[isUserAdmin] Error checking admin status:", error.message)
    return false
  }
  console.log("[isUserAdmin] Is admin:", !!data)
  return !!data
}

export const getRegistrationStats = async () => {
  console.log("[getRegistrationStats] Fetching registration stats...")
  const { data: allRegs, error } = await supabase
    .from("registrations")
    .select("created_at, status")

  if (error) {
    console.error("[getRegistrationStats] Error fetching registration stats:", error.message)
    return { total: 0, today: 0, thisWeek: 0, registered: 0, cancelled: 0 }
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)

  const stats = {
    total: allRegs.length,
    today: allRegs.filter(r => new Date(r.created_at) >= today).length,
    thisWeek: allRegs.filter(r => new Date(r.created_at) >= weekAgo).length,
    registered: allRegs.filter(r => r.status === 'registered').length,
    cancelled: allRegs.filter(r => r.status === 'cancelled').length
  }

  console.log("[getRegistrationStats] Stats computed:", stats)
  return stats
}

console.log("[supabaseHelpers] All functions loaded with debug logs")


console.log("[supabaseHelpers] Module loaded")
