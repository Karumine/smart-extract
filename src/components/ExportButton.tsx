"use client";

import { FileSpreadsheet, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToExcel } from "@/lib/excel-export";

interface ExportButtonProps {
  data: Record<string, string | null>[];
  columns: string[];
}

export default function ExportButton({ data, columns }: ExportButtonProps) {
  const handleExport = () => {
    try {
      exportToExcel({ data, columns });
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={data.length === 0}
      size="lg"
      className="relative w-full overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:shadow-none transition-all duration-300 group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      <FileSpreadsheet className="mr-2 h-5 w-5" />
      Export to Excel
      <Download className="ml-2 h-4 w-4" />
    </Button>
  );
}
