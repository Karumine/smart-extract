"use client";

import { useCallback, useState, useRef } from "react";
import { Upload, ImageIcon, X, CheckCircle2, Images } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface ImageFile {
  id: string;
  base64: string;
  mimeType: string;
  name: string;
  previewUrl: string;
}

interface UploadZoneProps {
  images: ImageFile[];
  onImagesChange: (images: ImageFile[]) => void;
}

export default function UploadZone({ images, onImagesChange }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    (files: FileList | File[]) => {
      const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
      const newImages: ImageFile[] = [];
      let processed = 0;
      const fileArray = Array.from(files);

      fileArray.forEach((file) => {
        if (!validTypes.includes(file.type)) return;
        if (file.size > 10 * 1024 * 1024) return;

        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          const base64 = dataUrl.split(",")[1];
          newImages.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            base64,
            mimeType: file.type,
            name: file.name,
            previewUrl: dataUrl,
          });
          processed++;
          if (processed === fileArray.length) {
            onImagesChange([...images, ...newImages]);
          }
        };
        reader.onerror = () => {
          processed++;
          if (processed === fileArray.length) {
            onImagesChange([...images, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    },
    [images, onImagesChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const removeImage = useCallback(
    (id: string) => {
      onImagesChange(images.filter((img) => img.id !== id));
    },
    [images, onImagesChange]
  );

  const clearAll = useCallback(() => {
    onImagesChange([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [onImagesChange]);

  return (
    <Card className="relative overflow-hidden border-zinc-700/50 bg-zinc-900/50 backdrop-blur-sm">
      <div className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
              <ImageIcon className="h-4 w-4 text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Upload Images</h2>
            {images.length > 0 && (
              <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-300">
                {images.length} file{images.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
          {images.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-zinc-400 hover:text-red-400">
              <X className="mr-1 h-3 w-3" />Clear All
            </Button>
          )}
        </div>

        {/* Image Previews Grid */}
        {images.length > 0 && (
          <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-in fade-in duration-300">
            {images.map((img) => (
              <div key={img.id} className="group relative rounded-lg overflow-hidden border border-zinc-700/50 bg-zinc-800/50 aspect-square">
                <img src={img.previewUrl} alt={img.name} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 shadow-lg"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-white truncate">{img.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {images.length > 0 && (
          <div className="mb-4 flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-zinc-300">{images.length} image{images.length > 1 ? "s" : ""} ready to extract</span>
          </div>
        )}

        {/* Drop Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
          className={`group relative cursor-pointer rounded-xl border-2 border-dashed text-center transition-all duration-300 ${
            images.length > 0 ? "p-6" : "p-12"
          } ${
            isDragOver
              ? "border-indigo-400 bg-indigo-500/10 scale-[1.01]"
              : "border-zinc-700 bg-zinc-800/30 hover:border-indigo-500/50 hover:bg-zinc-800/50"
          }`}
        >
          <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-indigo-500/5 opacity-0 transition-opacity duration-300 ${
            isDragOver ? "opacity-100" : "group-hover:opacity-100"
          }`} />
          <div className="relative flex flex-col items-center">
            <div className={`mb-3 flex items-center justify-center rounded-2xl transition-all duration-300 ${
              images.length > 0 ? "h-10 w-10" : "h-16 w-16 mb-4"
            } ${
              isDragOver ? "bg-indigo-500/20 scale-110" : "bg-zinc-800 group-hover:bg-indigo-500/10"
            }`}>
              {images.length > 0 ? (
                <Images className={`h-5 w-5 transition-colors ${isDragOver ? "text-indigo-400" : "text-zinc-500 group-hover:text-indigo-400"}`} />
              ) : (
                <Upload className={`h-7 w-7 transition-colors ${isDragOver ? "text-indigo-400" : "text-zinc-500 group-hover:text-indigo-400"}`} />
              )}
            </div>
            <p className={`font-medium text-zinc-300 ${images.length > 0 ? "text-sm" : "text-base"}`}>
              {isDragOver ? "Drop images here" : images.length > 0 ? "Add more images" : "Drag & drop your images"}
            </p>
            {images.length === 0 && (
              <p className="mt-1 text-sm text-zinc-500">
                or <span className="text-indigo-400 underline underline-offset-2">browse files</span>
              </p>
            )}
            <p className={`text-xs text-zinc-600 ${images.length > 0 ? "mt-1" : "mt-3"}`}>
              Supports PNG, JPG, WebP • Max 10MB each • Multiple files
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={(e) => { if (e.target.files) processFiles(e.target.files); e.target.value = ""; }}
          className="hidden"
          multiple
        />
      </div>
    </Card>
  );
}
