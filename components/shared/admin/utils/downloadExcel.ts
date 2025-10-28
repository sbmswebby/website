import * as XLSX from "xlsx";
import * as types from "@/lib/certificate_and_id/types";

/**
 * Row type for Excel export (clean output structure)
 */
export interface ExcelRow {
  RegistrationID: string | number;
  Name: string;
  WhatsApp: string;
  Organisation: string;
  Session: string;
  Event: string;
  Status: string;
  CreatedAt: string;
  CertificateURL: string;
  IDCardURL: string;
  [key: string]: string | number; // allow extra fields if needed
}

/**
 * Converts RegistrationWithDetails[] into ExcelRow[]
 * @param registrations - Array of registrations with full details
 * @returns ExcelRow[]
 */
const mapRegistrationsToExcelRows = (
  registrations: types.RegistrationWithDetails[]
): ExcelRow[] => {
  return registrations.map((r) => ({
    RegistrationID: r.registration_number ?? "",
    Name: r.user?.name ?? "",
    WhatsApp: r.user?.whatsapp_number ?? "",
    Organisation: r.user?.organisation_name ?? "",
    Session: r.session?.name ?? "",
    Event: r.event?.name ?? "",
    Status: r.status ?? "",
    CreatedAt: new Date(r.created_at).toLocaleString(),

    // ✅ Safely include URLs if present
    CertificateURL: r.certificate_url ?? "",
    IDCardURL: r.id_card_url ?? "",
  }));
};

/**
 * Generates and downloads an Excel file from registration data
 * @param data Array of RegistrationWithDetails or ExcelRow objects
 * @param filename Optional name for the downloaded file
 */
export const downloadExcel = (
  data: types.RegistrationWithDetails[] | ExcelRow[],
  filename = "Registrations"
): void => {
  if (!data || data.length === 0) return;

  // ✅ Automatically detect and map data if needed
  const excelData: ExcelRow[] =
    "registration_number" in (data[0] as Record<string, unknown>)
      ? mapRegistrationsToExcelRows(data as types.RegistrationWithDetails[])
      : (data as ExcelRow[]);

  // Create a worksheet from the data
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Create a new workbook and append the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Convert workbook to a Blob
  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/octet-stream" });

  // Trigger download
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
};
