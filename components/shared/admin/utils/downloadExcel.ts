import * as XLSX from "xlsx";
import * as types from "@/lib/certificate_and_id/types";

/**
 * ✅ Row type for Excel export (defines clean column structure)
 */
export interface ExcelRow {
  RegistrationID: string | number;
  Name: string;
  WhatsApp: string;
  Organisation: string;
  Profession: string;
  City: string;
  Session: string;
  Event: string;
  Status: string;
  CreatedAt: string;
  CertificateURL: string;
  IDCardURL: string;
  [key: string]: string | number; // allows extra fields safely
}

/**
 * ✅ Converts RegistrationWithDetails[] into ExcelRow[]
 * Handles multiple certificates per registration safely
 */
const mapRegistrationsToExcelRows = (
  registrations: types.RegistrationWithDetails[]
): ExcelRow[] => {
  return registrations.map((r) => {
    // Safely handle certificate URLs (array or single)
    const certificateUrls: string[] = Array.isArray(r.certificates)
      ? r.certificates.map((c) => c.url).filter(Boolean)
      : r.certificate_url
      ? [r.certificate_url]
      : [];

    return {
      RegistrationID: r.registration_number ?? "",
      Name: r.user?.name ?? "",
      WhatsApp: r.user?.whatsapp_number ?? "",
      Organisation: r.user?.organisation_name ?? "",
      Profession: r.user?.profession ?? "",
      City: r.user?.city ?? "",
      Session: r.session?.name ?? "",
      Event: r.event?.name ?? "",
      Status: r.status ?? "",
      CreatedAt: new Date(r.created_at).toLocaleString(),

      // ✅ Combine all certificate URLs into a single cell
      CertificateURL: certificateUrls.join(", "),
      IDCardURL: r.id_card_url ?? "",
    };
  });
};

/**
 * ✅ Generates and downloads an Excel file from registration data
 * Automatically detects whether input is raw or already mapped.
 *
 * @param data Array of RegistrationWithDetails or ExcelRow objects
 * @param filename Optional file name (default = "Registrations")
 */
export const downloadExcel = (
  data: types.RegistrationWithDetails[] | ExcelRow[],
  filename = "Registrations"
): void => {
  if (!data || data.length === 0) return;

  // Detect input type automatically
  const excelData: ExcelRow[] =
    "registration_number" in (data[0] as Record<string, unknown>)
      ? mapRegistrationsToExcelRows(data as types.RegistrationWithDetails[])
      : (data as ExcelRow[]);

  // Create worksheet from JSON
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Create workbook and append worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Generate and trigger download
  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
};
