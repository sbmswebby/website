// databaseService.ts - Supabase database operations
// Location: lib/generation/databaseService.ts

import { supabase } from '@/lib/supabaseClient';
import { CertificateTemplate, IDCardDetails, UserProfile } from './types';

export class DatabaseService {
  
  /**
   * Fetches certificate template for a session
   */
  static async getCertificateTemplate(
    sessionId: string
  ): Promise<CertificateTemplate | null> {
    console.log("🔍 [getCertificateTemplate] Fetching certificate template for session:", sessionId);
    const { data, error } = await supabase
      .from('session_certificates')
      .select('certificate_templates(*)')
      .eq('session_id', sessionId)
      .single();

    if (error || !data) {
      console.error("❌ [getCertificateTemplate] Failed to fetch certificate template:", error);
      return null;
    }

    console.log("✅ [getCertificateTemplate] Certificate template fetched successfully");
    return data.certificate_templates as unknown as CertificateTemplate;
  }

  /**
 * Fetches all registrations for a given session
 */
static async getRegistrationsBySession(sessionId: string) {
  console.log("🔍 [getRegistrationsBySession] Fetching registrations for session:", sessionId);

  const { data, error } = await supabase
    .from('registrations')
    .select(`
      *,
      user_profiles(*),
      sessions(*)
    `)
    .eq('session_id', sessionId);

  if (error) {
    console.error("❌ [getRegistrationsBySession] Failed to fetch registrations:", error);
    return [];
  }

  console.log(`✅ [getRegistrationsBySession] Retrieved ${data.length} registrations`);
  return data;
}

  /**
   * Fetches multiple certificate templates for a session
   */
  static async getCertificateTemplates(
    sessionId: string
  ): Promise<CertificateTemplate[]> {
    console.log("🔍 [getCertificateTemplates] Fetching all certificate templates for session:", sessionId);
    const { data, error } = await supabase
      .from('session_certificates')
      .select('certificate_templates(*)')
      .eq('session_id', sessionId);

    if (error || !data) {
      console.error("❌ [getCertificateTemplates] Failed to fetch certificate templates:", error);
      return [];
    }

    console.log(`✅ [getCertificateTemplates] ${data.length} certificate templates retrieved`);
    return data.map((item) => item.certificate_templates) as unknown as CertificateTemplate[];
  }

  /**
   * Fetches ID card details for a session using the session_id_cards junction table
   */
  static async getIDCardDetails(sessionId: string): Promise<IDCardDetails | null> {
    console.log("🔍 [getIDCardDetails] Fetching ID card details for session:", sessionId);
    const { data, error } = await supabase
      .from('session_id_cards')
      .select('id_card_details(*)')
      .eq('session_id', sessionId)
      .single();

    if (error || !data) {
      console.error("❌ [getIDCardDetails] Failed to fetch ID card details:", error);
      return null;
    }

    console.log("✅ [getIDCardDetails] ID card details fetched successfully");
    return data.id_card_details as unknown as IDCardDetails;
  }

  /**
   * Fetches multiple ID card templates for a session
   */
  static async getIDCardDetailsMultiple(sessionId: string): Promise<IDCardDetails[]> {
    console.log("🔍 [getIDCardDetailsMultiple] Fetching all ID card templates for session:", sessionId);
    const { data, error } = await supabase
      .from('session_id_cards')
      .select('id_card_details(*)')
      .eq('session_id', sessionId);

    if (error || !data) {
      console.error("❌ [getIDCardDetailsMultiple] Failed to fetch ID card details:", error);
      return [];
    }

    console.log(`✅ [getIDCardDetailsMultiple] ${data.length} ID card templates retrieved`);
    return data.map((item) => item.id_card_details) as unknown as IDCardDetails[];
  }

  /**
   * Saves certificate URL to database
   * Note: Your schema doesn't have certificate_public_id or generated_at columns
   */
  static async saveCertificate(
    userProfileId: string,
    sessionId: string,
    downloadUrl: string,
    publicId?: string  // Made optional since column doesn't exist
  ): Promise<void> {
    console.log("💾 [saveCertificate] Saving generated certificate to DB:", { userProfileId, sessionId });
    const { error } = await supabase.from('certificates').upsert(
      {
        user_profile_id: userProfileId,
        session_id: sessionId,
        download_url: downloadUrl,
        status: 'generated',
        // certificate_public_id and generated_at columns don't exist in your schema
      },
    );

    if (error) {
      console.error("❌ [saveCertificate] Failed to save certificate:", error);
      throw error;
    }

    console.log("✅ [saveCertificate] Certificate saved successfully");
  }

  /**
   * Updates registration with ticket URL
   */
  static async saveTicketUrl(
    registrationId: string,
    ticketUrl: string
  ): Promise<void> {
    console.log("💾 [saveTicketUrl] Updating registration with ticket URL:", registrationId);
    const { error } = await supabase
      .from('registrations')
      .update({ ticket_url: ticketUrl })
      .eq('id', registrationId);

    if (error) {
      console.error("❌ [saveTicketUrl] Failed to update ticket URL:", error);
      throw error;
    }

    console.log("✅ [saveTicketUrl] Ticket URL updated successfully");
  }

  /**
   * Fetches user profile
   */
  static async getUserProfile(userProfileId: string): Promise<UserProfile | null> {
    console.log("🔍 [getUserProfile] Fetching user profile:", userProfileId);
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userProfileId)
      .single();

    if (error || !data) {
      console.error("❌ [getUserProfile] Failed to fetch user profile:", error);
      return null;
    }

    console.log("✅ [getUserProfile] User profile fetched successfully");
    return data as UserProfile;
  }

  /**
   * Fetches registration details with related data
   */
  static async getRegistration(registrationId: string) {
    console.log("🔍 [getRegistration] Fetching registration and related data:", registrationId);
    const { data, error } = await supabase
      .from('registrations')
      .select(`
        *,
        user_profiles(*),
        sessions(*)
      `)
      .eq('id', registrationId)
      .single();

    if (error || !data) {
      console.error("❌ [getRegistration] Failed to fetch registration:", error);
      return null;
    }

    console.log("✅ [getRegistration] Registration fetched successfully");
    return data;
  }

  /**
   * Checks if certificate already exists
   */
  static async certificateExists(
    userProfileId: string,
    sessionId: string
  ): Promise<boolean> {
    console.log("🔎 [certificateExists] Checking if certificate exists:", { userProfileId, sessionId });
    const { data, error } = await supabase
      .from('certificates')
      .select('id')
      .eq('user_profile_id', userProfileId)
      .eq('session_id', sessionId)
      .maybeSingle();

    const exists = !error && !!data;
    console.log(`✅ [certificateExists] Certificate exists: ${exists}`);
    return exists;
  }

  /**
   * Gets existing certificate
   */
  static async getExistingCertificate(
    userProfileId: string,
    sessionId: string
  ) {
    console.log("🔍 [getExistingCertificate] Fetching existing certificate:", { userProfileId, sessionId });
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_profile_id', userProfileId)
      .eq('session_id', sessionId)
      .maybeSingle();

    if (error) {
      console.error("❌ [getExistingCertificate] Error fetching certificate:", error);
      return null;
    }

    console.log("✅ [getExistingCertificate] Existing certificate fetched:", !!data);
    return data;
  }

  /**
   * Checks if ID card already exists for a registration
   */
  static async idCardExists(registrationId: string): Promise<boolean> {
    console.log("🔎 [idCardExists] Checking if ID card exists for registration:", registrationId);
    const { data, error } = await supabase
      .from('registrations')
      .select('ticket_url')
      .eq('id', registrationId)
      .maybeSingle();

    const exists = !error && !!data?.ticket_url;
    console.log(`✅ [idCardExists] ID card exists: ${exists}`);
    return exists;
  }

  /**
   * Gets existing ID card URL
   */
  static async getExistingIDCard(registrationId: string): Promise<string | null> {
    console.log("🔍 [getExistingIDCard] Fetching existing ID card for registration:", registrationId);
    const { data, error } = await supabase
      .from('registrations')
      .select('ticket_url')
      .eq('id', registrationId)
      .maybeSingle();

    if (error || !data) {
      console.warn("⚠️ [getExistingIDCard] No ID card found or query failed:", error);
      return null;
    }

    console.log("✅ [getExistingIDCard] Existing ID card fetched successfully");
    return data.ticket_url;
  }
}