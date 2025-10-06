// types.ts - Corrected version

export interface UserProfile {
  id: string;
  supabase_auth_id?: string | null;
  name: string;
  whatsapp_number: string;
  profession?: string | null;
  organisation_name?: string | null;
  insta?: string | null;
  image_public_id?: string | null;
  image_url?: string | null;
  city?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type Academy = {
  id: string
  name: string
  type: string
  whatsapp_number: string | null
  owner_name: string | null
  location: string | null
  insta_id: string | null
  other_social_links: string
  created_at: string
  updated_at: string
}

export interface Event {
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

export interface Session {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  start_time: string;
  end_time: string;
  cost: number | null;
  image_url: string | null;
  image_public_id: string | null;
  stripe_price_id: string | null;
  registration_link: string | null;
  id_card_details_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: string;
  user_profile_id: string;
  session_id: string;
  transaction_id: string | null;
  status: string;
  referral: string | null;
  ticket_url: string | null;  // ✅ Changed to nullable
  registration_number: number;  // ✅ Changed to number
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: string;
  user_profile_id: string;
  session_id: string;
  status: string;
  download_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_profile_id: string;
  session_id: string;
  payment_provider_transaction_id: string | null;
  payment_method: string | null;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface RegistrationWithDetails extends Registration {
  user: UserProfile | null;  // ✅ Nullable
  session: Session | null;    // ✅ Nullable
  event: Event | null;        // ✅ Nullable
  certificate: Certificate | null;
  transaction: Transaction | null;
}

export interface FilterState {
  academy: string;
  session: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

export interface StatsData {
  total: number;
  today: number;
  thisWeek: number;
}

// Additional types for completeness
export interface CertificateTemplate {
  id: string;
  name: string;
  base_image_url: string;
  base_image_public_id?: string | null;
  user_image_height: number;
  user_image_width: number;
  user_image_x: number;
  user_image_y: number;
  user_name_x: number;
  user_name_y: number;
  user_name_font: string;
  user_name_font_size: number;
  user_name_color: string;
  logo_x?: number | null;
  logo_y?: number | null;
  logo_height?: number | null;
  logo_width?: number | null;
  logo_url?: string | null;
  logo_public_id?: string | null;
  text_box_x?: number | null;
  text_box_y?: number | null;
  text_box_height?: number | null;
  text_box_width?: number | null;
  text_box_warp: boolean;
  text_box_line_height: number;
  text_box_font: string;
  text_box_font_size?: number | null;
  text_box_color: string;
  text_box_alignment: string;
  text_content?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface IDCardDetails {
  id: string;
  name: string;
  base_image_url: string;
  base_image_public_id?: string | null;
  user_image_height: number;
  user_image_width: number;
  user_image_x: number;
  user_image_y: number;
  qr_x: number;
  qr_y: number;
  qr_width: number;
  qr_height: number;
  logo_x?: number | null;
  logo_y?: number | null;
  logo_height?: number | null;
  logo_width?: number | null;
  logo_url?: string | null;
  logo_public_id?: string | null;
  text_box_x: number;
  text_box_y: number;
  text_box_height?: number | null;
  text_box_width?: number | null;
  text_box_warp: boolean;
  text_box_line_height: number;
  text_box_font: string;
  text_box_font_size?: number | null;
  text_box_color: string;
  text_box_alignment: string;
  text_content: string;
  created_at?: string;
  updated_at?: string;
}