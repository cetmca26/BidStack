"use client";

import { useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { compressImage, createPreviewUrl, revokePreviewUrl } from "@/lib/imageCompression";

interface ImageUploadFieldProps {
  label: string;
  value: File | null;
  onChange: (file: File | null) => void;
  preview: string | null;
  onPreviewChange: (preview: string | null) => void;
  required?: boolean;
  accept?: string;
  error?: string | null;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  preview,
  onPreviewChange,
  required = true,
  accept = "image/*",
  error,
}: ImageUploadFieldProps) {
  const [compressing, setCompressing] = useState(false);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) {
        onChange(null);
        onPreviewChange(null);
        return;
      }

      setCompressing(true);
      try {
        // Compress the image
        const compressedBlob = await compressImage(file);
        
        // Create a new File object from the compressed blob
        const compressedFile = new File(
          [compressedBlob],
          file.name,
          { type: file.type }
        );

        onChange(compressedFile);

        // Create preview URL
        const previewUrl = createPreviewUrl(compressedBlob);
        if (preview) {
          revokePreviewUrl(preview);
        }
        onPreviewChange(previewUrl);
      } catch (err) {
        console.error("Compression failed:", err);
        // Fall back to original file if compression fails
        onChange(file);
        const previewUrl = createPreviewUrl(file);
        if (preview) {
          revokePreviewUrl(preview);
        }
        onPreviewChange(previewUrl);
      } finally {
        setCompressing(false);
      }
    },
    [onChange, onPreviewChange, preview]
  );

  return (
    <div className="space-y-2">
      <Label htmlFor="image-upload" className="text-slate-100">
        {label} {required && <span className="text-rose-500">*</span>}
      </Label>
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            id="image-upload"
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="bg-slate-950/80 text-slate-50 cursor-pointer"
            disabled={compressing}
            required={required}
          />
          {compressing && (
            <p className="text-xs text-slate-400 mt-1">Compressing image...</p>
          )}
          {value && !compressing && (
            <p className="text-xs text-emerald-400 mt-1">
              ✓ {value.name} ({(value.size / 1024).toFixed(0)} KB)
            </p>
          )}
          {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
        </div>

        {/* Live Preview */}
        {preview && (
          <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-emerald-500/50 bg-slate-800 flex-shrink-0 shadow-lg">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}
