/**
 * Excel export utility using SheetJS (xlsx).
 * Creates professionally formatted .xlsx files from extracted data.
 */
import * as XLSX from "xlsx";

interface ExportOptions {
  data: Record<string, string | null>[];
  columns: string[];
  filename?: string;
}

/**
 * Exports data to a professionally formatted Excel file.
 */
export function exportToExcel({
  data,
  columns,
  filename,
}: ExportOptions): void {
  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();

  // Build the data array with headers
  const wsData = [
    columns, // Header row
    ...data.map((row) => columns.map((col) => row[col] ?? "")),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  // Auto-width columns
  const colWidths = columns.map((col, colIndex) => {
    const maxContentLength = Math.max(
      col.length,
      ...data.map((row) => String(row[col] ?? "").length)
    );
    return { wch: Math.min(Math.max(maxContentLength + 2, 10), 50) };
  });
  worksheet["!cols"] = colWidths;

  // Style header row - bold
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = {
        font: { bold: true, sz: 12 },
        fill: { fgColor: { rgb: "4F46E5" } },
        alignment: { horizontal: "center" },
      };
    }
  }

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Extracted Data");

  // Generate filename with date
  const date = new Date().toISOString().split("T")[0];
  const outputFilename = filename || `SmartExtract_${date}.xlsx`;

  // Trigger download
  XLSX.writeFile(workbook, outputFilename);
}
