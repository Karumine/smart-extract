"use client";

import { useState, useCallback, useEffect } from "react";
import { Wand2, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import UploadZone, { ImageFile } from "@/components/UploadZone";
import SchemaBuilder from "@/components/SchemaBuilder";
import DataTable from "@/components/DataTable";
import ExportButton from "@/components/ExportButton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [columns, setColumns] = useState<string[]>(["ID", "Weight", "size", "Price", "Certificate", "Stones"]);
  const [extractedData, setExtractedData] = useState<Record<string, string | null>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentProcess, setCurrentProcess] = useState<{ current: number; total: number } | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("smart-extract-data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Migrate old data: "Code" -> "size"
          const migrated = parsed.map((item: any) => {
            if (item.Code && item.size === undefined) {
              const { Code, ...rest } = item;
              return { ...rest, size: Code };
            }
            return item;
          });
          setExtractedData(migrated);
        }
      } catch (e) {
        console.error("Failed to load saved data", e);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("smart-extract-data", JSON.stringify(extractedData));
  }, [extractedData]);

  const handleImagesChange = useCallback((newImages: ImageFile[]) => {
    setImages(newImages);
    setError(null);
    setDuplicateWarning(null);
  }, []);

  const handleExtract = useCallback(async () => {
    if (images.length === 0) {
      setError("Please upload at least one image.");
      return;
    }
    if (columns.length === 0) {
      setError("Please define at least one column.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setDuplicateWarning(null);
    setProgress(0);
    setCurrentProcess({ current: 0, total: images.length });

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const extractSingleImage = async (img: ImageFile, retryCount = 0): Promise<any[]> => {
      try {
        const payload = {
          images: [{ base64: img.base64, mimeType: img.mimeType }],
          columns,
        };

        const response = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Extraction failed");
        }

        return result.data || [];
      } catch (err) {
        if (retryCount < 2) {
          // 3 attempts total
          console.warn(`Retry attempt ${retryCount + 1} for image...`);
          await sleep(2000); // Wait 2 seconds before retry
          return extractSingleImage(img, retryCount + 1);
        }
        throw err;
      }
    };

    try {
      const allNewData: Record<string, string | null>[] = [];

      for (let i = 0; i < images.length; i++) {
        setCurrentProcess({ current: i + 1, total: images.length });
        setProgress(Math.round((i / images.length) * 100));

        const imgData = await extractSingleImage(images[i]);

        // Transform data: handle column renames and formatting
        const newData = imgData.map((item: Record<string, any>) => {
          const transformed: Record<string, string | null> = {};

          columns.forEach((col) => {
            let value = item[col];

            if (col === "size" && value === undefined && item["Code"] !== undefined) {
              value = item["Code"];
            }

            transformed[col] = value ?? null;
          });

          return transformed;
        });

        allNewData.push(...newData);
        setProgress(Math.round(((i + 1) / images.length) * 100));

        // Delay 5 seconds between images, but not after the last one
        if (i < images.length - 1) {
          await sleep(5000);
        }
      }

      // Check for duplicates (based on ID or first column)
      const keyColumn = columns.includes("ID") ? "ID" : columns[0];
      const existingIds = new Set(extractedData.map((item) => item[keyColumn]?.toString().toLowerCase()));
      const duplicates = allNewData.filter(
        (item: Record<string, string | null>) =>
          item[keyColumn] && existingIds.has(item[keyColumn]?.toString().toLowerCase())
      );

      if (duplicates.length > 0) {
        setDuplicateWarning(`พบข้อมูลซ้ำ ${duplicates.length} รายการ (อิงตาม ${keyColumn})`);
      }

      // Append new data
      setExtractedData((prev) => [...prev, ...allNewData]);

      // Clear images after successful extraction
      setImages([]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(msg);
    } finally {
      setIsLoading(false);
      setProgress(100);
      setTimeout(() => setCurrentProcess(null), 1000);
    }
  }, [images, columns, extractedData]);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <Header />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* Step 1: Upload */}
          <UploadZone images={images} onImagesChange={handleImagesChange} />

          {/* Step 2: Define Schema */}
          <SchemaBuilder columns={columns} onColumnsChange={setColumns} />

          {/* Progress Bar */}
          {currentProcess && (
            <div className="space-y-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-indigo-300">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="font-medium">
                    Processing Image {currentProcess.current} of {currentProcess.total}
                  </span>
                </div>
                <span className="font-mono text-indigo-400">{progress}%</span>
              </div>
              <Progress value={progress} />
              <p className="text-center text-[10px] text-indigo-400/60 uppercase tracking-widest">
                Safe Strategy: Processing one by one to avoid rate limits
              </p>
            </div>
          )}

          {/* Extract Button */}
          <Button
            onClick={handleExtract}
            disabled={images.length === 0 || columns.length === 0 || isLoading}
            size="lg"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:shadow-none transition-all duration-300"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-5 w-5" />
                Extract Data with AI{images.length > 1 ? ` (${images.length} images)` : ""}
              </>
            )}
          </Button>

          {/* Error & Warnings */}
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 animate-in fade-in duration-300">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-300">Extraction Error</p>
                <p className="mt-1 text-sm text-red-400/80">{error}</p>
              </div>
            </div>
          )}

          {duplicateWarning && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 animate-in fade-in duration-300">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-300">Duplicate Warning</p>
                <p className="mt-1 text-sm text-amber-400/80">{duplicateWarning}</p>
              </div>
            </div>
          )}

          {/* Step 3: Data Table */}
          <DataTable
            columns={columns}
            data={extractedData}
            onDataChange={setExtractedData}
            isLoading={isLoading}
          />

          {/* Step 4: Export */}
          <ExportButton data={extractedData} columns={columns} />

          {/* Footer */}
          <footer className="py-6 text-center text-xs text-zinc-600">
            Built with Next.js, Gemini AI & SheetJS
          </footer>
        </div>
      </main>
    </div>
  );
}
