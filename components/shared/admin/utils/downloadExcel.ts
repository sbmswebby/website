// utils/downloadExcel.ts
import * as XLSX from 'xlsx';

/**
 * Row type for Excel export
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
  [key: string]: string | number; // allow extra fields if needed
}

/**
 * Generates an XLSX file from an array of objects and triggers download
 * @param data Array of objects containing your data
 * @param filename Name of the downloaded file
 */
export const downloadExcel = (data: ExcelRow[], filename: string) => {
  if (!data || data.length === 0) return;

  // Create a worksheet from the data
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Create a new workbook and append the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Convert workbook to a Blob
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });

  // Trigger download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
