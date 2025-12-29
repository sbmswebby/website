// generationOrchestrator.ts - Main orchestration service
// Location: lib/generation/generationOrchestrator.ts

import { CertificateGenerator } from './certificateGenerator';
import { IDCardGenerator } from './idCardGenerator';
import { CloudinaryService } from '@/lib/cloudinaryService';
import { DatabaseService } from './databaseService';
import { DownloadService } from './downloadService';
import { GenerationData } from './types';

export interface GenerationResult {
  certificateUrl?: string;
  idCardUrl?: string;
  success: boolean;
  error?: string;
}

export class GenerationOrchestrator {
  /**
   * Generates certificate for a user
   */
  static async generateCertificate(
    sessionId: string,
    userProfileId: string,
    customText?: Record<string, string>,
    downloadAfter: boolean = true
  ): Promise<GenerationResult> {
    console.log(`🎓 [Certificate] Starting generation for user: ${userProfileId} (session: ${sessionId})`);

    try {
      console.log('🔍 Checking for existing certificate...');
      const existing = await DatabaseService.getExistingCertificate(userProfileId, sessionId);
      if (existing?.download_url) {
        console.log('✅ Existing certificate found, skipping regeneration.');

        // Download existing certificate if requested
        if (downloadAfter) {
          const downloadFilename = `${existing.user_name || 'user'}_${sessionId}_Certificate.jpg`;
          await DownloadService.downloadFile(existing.download_url, downloadFilename);
          console.log(`✅ Existing certificate downloaded as ${downloadFilename}`);
        }

        return { certificateUrl: existing.download_url, success: true };
      }

      console.log('📦 Fetching certificate template and user profile...');
      const [template, userProfile] = await Promise.all([
        DatabaseService.getCertificateTemplate(sessionId),
        DatabaseService.getUserProfile(userProfileId),
      ]);

if (!template) {
  console.warn(
    `⚠️ [Certificate] No template found for session ${sessionId}, skipping`
  );
  return {
    success: true,          // important: NOT false
    certificateUrl: undefined,
  };
}
      if (!userProfile) throw new Error('User profile not found');
      console.log('✅ Template and user profile fetched successfully');

      console.log('🖌️ Generating certificate canvas...');
      const generator = new CertificateGenerator(template);
      const data: GenerationData = {
        userProfile,
        sessionId,
        registrationId: '',
        registrationNumber: '',
        customText,
      };
      const canvas = await generator.generate(data);
      console.log('✅ Certificate canvas generated successfully');

      
      console.log('☁️ Uploading certificate to Cloudinary...');
      const filename = `certificate_${template.id}_${userProfileId}_${sessionId}.jpg`;
      const url = await CloudinaryService.uploadCanvas(canvas, filename, 'certificates');
      console.log(`✅ Certificate uploaded: ${url}`);

      const publicId = this.extractCloudinaryPublicId(url);
      console.log(`🆔 Extracted Cloudinary public_id: ${publicId}`);

      console.log('💾 Saving certificate details to database...');
      await DatabaseService.saveCertificate(userProfileId, sessionId, url);
      console.log('✅ Certificate record saved in database');

      // Download after upload
      if (downloadAfter) {
        const downloadFilename = `${userProfile.name}_${sessionId}_Certificate.jpg`;
        await DownloadService.downloadFile(url, downloadFilename);
        console.log(`✅ Certificate downloaded as ${downloadFilename}`);
      }

      console.log(`🎉 [Certificate] Generation complete for user: ${userProfileId}`);
      return { certificateUrl: url, success: true };
    } catch (error) {
      console.warn('❌ Certificate generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
 * Generates certificates for all users in a session
 */
static async generateCertificatesForSession(
  sessionId: string,
  downloadAfter: boolean = true,
  customText?: Record<string, string>,
  onProgress?: (current: number, total: number) => void
): Promise<{ successful: string[]; failed: string[] }> {
  console.log(`🎓 [Session Certificates] Starting for session: ${sessionId}`);

  try {
    // Step 1: Fetch all registrations for this session
    const registrations = await DatabaseService.getRegistrationsBySession(sessionId);
    if (!registrations || registrations.length === 0) {
      console.warn(`⚠️ No registrations found for session ${sessionId}`);
      return { successful: [], failed: [] };
    }

    const successful: string[] = [];
    const failed: string[] = [];

    // Step 2: Loop through each user and generate their certificate
    for (let i = 0; i < registrations.length; i++) {
      const registration = registrations[i];
      console.log(`\n🔹 [${i + 1}/${registrations.length}] Generating for user: ${registration.user_profile_id}`);

      try {
        const result = await this.generateCertificate(
          sessionId,
          registration.user_profile_id,
          customText,
          downloadAfter
        );

        if (result.success) {
          console.log(`✅ Certificate generated for ${registration.user_profile_id}`);
          successful.push(registration.user_profile_id);
        } else {
          console.warn(`⚠️ Failed for ${registration.user_profile_id}: ${result.error}`);
          failed.push(registration.user_profile_id);
        }
      } catch (err) {
        console.warn(`❌ Exception for ${registration.user_profile_id}:`, err);
        failed.push(registration.user_profile_id);
      }

      // Optional progress callback
      onProgress?.(i + 1, registrations.length);
    }

    console.log(`🎉 [Session Certificates] Generation completed for session: ${sessionId}`);
    console.log(`📊 Success: ${successful.length}, Failed: ${failed.length}`);

    return { successful, failed };
  } catch (error) {
    console.warn(`❌ Session certificate generation failed:`, error);
    return { successful: [], failed: [] };
  }
}

  /**
   * Generates ID card for a registration
   */
  static async generateIDCard(
    registrationId: string,
    customText?: Record<string, string>,
    downloadAfter: boolean = true
  ): Promise<GenerationResult> {
    console.log(`🪪 [ID Card] Starting generation for registration: ${registrationId}`);

    try {
      console.log('🔍 Fetching registration details...');
      const registration = await DatabaseService.getRegistration(registrationId);
      if (!registration) throw new Error('Registration not found');
      console.log('✅ Registration details fetched successfully');

      console.log('📦 Fetching ID card template...');
      const idCardDetails = await DatabaseService.getIDCardDetails(registration.session_id);

if (!idCardDetails) {
  console.warn(
    `⚠️ [ID Card] No template found for session ${registration.session_id}, skipping`
  );
  return {
    success: true,
    idCardUrl: undefined,
  };
}


      console.log('✅ ID card template fetched successfully');

      console.log('🖌️ Generating ID card canvas...');
      const generator = new IDCardGenerator(idCardDetails);
      const data: GenerationData = {
        userProfile: registration.user_profiles,
        sessionId: registration.session_id,
        registrationId: registration.id,
        registrationNumber: registration.id.slice(0, 8),
        customText,
      };
      const canvas = await generator.generate(data);
      console.log('✅ ID card canvas generated successfully');

      console.log('☁️ Uploading ID card to Cloudinary...');
      const filename = `id_card_${registrationId}.jpg`;
      const url = await CloudinaryService.uploadCanvas(canvas, filename, 'id_cards');
      console.log(`✅ ID card uploaded: ${url}`);

      console.log('💾 Saving ticket URL in registrations table...');
      await DatabaseService.saveTicketUrl(registrationId, url);
      console.log('✅ Ticket URL saved in database');

      // Download after upload
      if (downloadAfter) {
        const downloadFilename = `${registration.user_profiles.name}_${registration.session_id}_ID_Card.jpg`;
        await DownloadService.downloadFile(url, downloadFilename);
        console.log(`✅ ID card downloaded as ${downloadFilename}`);
      }

      console.log(`🎉 [ID Card] Generation complete for registration: ${registrationId}`);
      return { idCardUrl: url, success: true };
    } catch (error) {
      console.warn('❌ ID card generation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generates both certificate and ID card
   */
/**
 * Generates both certificate and ID card
 * If certificate generation fails (e.g., no template found),
 * it continues with the ID card instead of throwing an error.
 */
static async generateBoth(
  registrationId: string,
  downloadAfter: boolean = true,
  customText?: Record<string, string>
): Promise<GenerationResult> {
  console.log(`⚙️ [Batch] Starting combined generation for registration: ${registrationId}`);

  try {
    // Step 1: Get registration info
    const registration = await DatabaseService.getRegistration(registrationId);
    if (!registration) throw new Error('Registration not found');

    let certificateUrl: string | undefined;
    let idCardUrl: string | undefined;
    let certError: string | undefined;

    // Step 2: Try generating certificate first
    try {
      console.log('🎓 Attempting certificate generation...');
      const certResult = await this.generateCertificate(
        registration.session_id,
        registration.user_profile_id,
        customText,
        downloadAfter
      );

      if (certResult.success) {
        certificateUrl = certResult.certificateUrl;
        console.log('✅ Certificate generated successfully.');
      } else {
        certError = certResult.error;
        console.warn(`⚠️ Certificate generation failed: ${certError}`);
      }
    } catch (certErr: unknown) {
      certError = certErr instanceof Error ? certErr.message : 'Unknown certificate generation error';
      console.warn(`⚠️ Skipping certificate generation due to error: ${certError}`);
    }

    // Step 3: Always attempt ID card generation
    console.log('🪪 Starting ID card generation...');
    const idResult = await this.generateIDCard(registrationId, customText, downloadAfter);

if (idResult.success) {
  idCardUrl = idResult.idCardUrl;
  console.log('✅ ID card generation finished.');
} else {
  console.warn(
    `⚠️ ID card skipped: ${idResult.error ?? 'no template'}`
  );
}

    // Step 4: Return results
    console.log(`🎉 [Batch] Completed generation for ${registrationId}`);
const anyGenerated = Boolean(certificateUrl || idCardUrl);
if (!anyGenerated) console.warn('⚠️ No certificate or ID card templates found, skipping generation.');


return {
  certificateUrl,
  idCardUrl,
  success: anyGenerated,  // only true if at least one was generated
  // only set error if nothing was generated
};
  } catch (error: unknown) {
    console.warn('❌ Batch generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}


  /**
   * Bulk generates certificates for multiple users in a session
   */
  static async bulkGenerateCertificates(
    sessionId: string,
    userProfileIds: string[],
    onProgress?: (current: number, total: number) => void
  ): Promise<{ successful: string[]; failed: string[] }> {
    console.log(`🚀 [Bulk] Starting certificate generation for ${userProfileIds.length} users in session ${sessionId}`);
    const successful: string[] = [];
    const failed: string[] = [];

    for (let i = 0; i < userProfileIds.length; i++) {
      const userProfileId = userProfileIds[i];
      console.log(`\n🔹 [${i + 1}/${userProfileIds.length}] Generating for user: ${userProfileId}`);
      const result = await this.generateCertificate(sessionId, userProfileId, undefined, true); // auto-download

      if (result.success) {
        console.log(`✅ User ${userProfileId} completed successfully`);
        successful.push(userProfileId);
      } else {
        console.warn(`⚠️ User ${userProfileId} failed: ${result.error}`);
        failed.push(userProfileId);
      }

      onProgress?.(i + 1, userProfileIds.length);
    }

    console.log('📊 Bulk generation summary:', {
      successful: successful.length,
      failed: failed.length,
    });

    return { successful, failed };
  }

  /**
   * Extracts Cloudinary public_id from URL
   */
  private static extractCloudinaryPublicId(url: string): string {
    try {
      const parts = url.split('/');
      const uploadIndex = parts.indexOf('upload');
      if (uploadIndex === -1) return '';

      const afterVersion = parts.slice(uploadIndex + 2).join('/');
      const publicId = afterVersion.replace(/\.[^.]+$/, '');
      console.log(`🧩 Extracted Cloudinary public ID: ${publicId}`);
      return publicId;
    } catch {
      console.warn('⚠️ Failed to extract Cloudinary public ID');
      return '';
    }
  }
}
