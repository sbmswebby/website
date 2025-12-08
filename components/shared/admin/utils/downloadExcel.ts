import ExcelJS from "exceljs";
import * as types from "@/lib/certificate_and_id/types";

/**
 * Row type for Excel export (defines clean column structure)
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
  [key: string]: string | number;
}

/**
 * Converts RegistrationWithDetails[] into ExcelRow[]
 * Ensures multiple certificates are merged into a single cell
 */
const mapRegistrationsToExcelRows = (
  registrations: types.RegistrationWithDetails[]
): ExcelRow[] => {
  return registrations.map((r) => {
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
      CertificateURL: certificateUrls.join(", "),
      IDCardURL: r.id_card_url ?? "",
    };
  });
};

/**
 * Generates and downloads an Excel file using exceljs.
 * Automatically maps raw registrations when needed.
 */
export const downloadExcel = (
  data: types.RegistrationWithDetails[] | ExcelRow[],
  filename = "Registrations"
): void => {
  if (!data || data.length === 0) return;

  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .split("Z")[0];

  const finalFilename = `${filename}_${timestamp}.xlsx`;

  // Detect input type automatically
  const excelData: ExcelRow[] =
    "registration_number" in (data[0] as Record<string, unknown>)
      ? mapRegistrationsToExcelRows(data as types.RegistrationWithDetails[])
      : (data as ExcelRow[]);

  // Create a new workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet1");

  // Add header row with correct ordering
  const headerKeys: string[] = Object.keys(excelData[0]);

  worksheet.addRow(headerKeys);

  // Add data rows
  excelData.forEach((row) => {
    const orderedValues = headerKeys.map((key) => row[key]);
    worksheet.addRow(orderedValues);
  });

  // Generate file and download in browser
  workbook.xlsx.writeBuffer().then((buffer: ArrayBuffer) => {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = finalFilename;
    link.click();
    URL.revokeObjectURL(url);
  });
};
