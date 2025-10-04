// types.ts - Shared type definitions
// Location: lib/generation/types.ts

export interface CertificateTemplate {
  text_content: string | null | undefined;
  id: string;
  name: string;
  base_image_url: string;
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
  created_at?: string;
  updated_at?: string;
}

export interface IDCardDetails {
  text_content: string;
  id: string;
  name: string;
  base_image_url: string;
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
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  whatsapp_number: string;
  profession?: string | null;
  organisation_name?: string | null;
  image_url?: string | null;
  city?: string | null;
}

export interface GenerationData {
  userProfile: UserProfile;
  sessionId: string;
  registrationId: string;
  registrationNumber: string | number;
  customText?: Record<string, string>; // For dynamic text replacements
}