"use client";

import { useState, useRef, useEffect } from "react";
import { Image as ImageIcon, Upload, Download, Crop, Sparkles, Check, RefreshCw } from "lucide-react";

interface SocialPreset {
  id: string;
  platform: string;
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  safeZoneNote?: string;
}

const PRESETS: SocialPreset[] = [
  { id: "og-share", platform: "Web / SEO", name: "OpenGraph / Social Preview", width: 1200, height: 630, aspectRatio: "1.91:1" },
  { id: "x-post", platform: "Twitter / X", name: "Twitter / X Post", width: 1200, height: 675, aspectRatio: "16:9" },
  { id: "x-header", platform: "Twitter / X", name: "Twitter / X Header", width: 1500, height: 500, aspectRatio: "3:1" },
  { id: "yt-thumb", platform: "YouTube", name: "YouTube Video Thumbnail", width: 1280, height: 720, aspectRatio: "16:9" },
  { id: "yt-banner", platform: "YouTube", name: "YouTube Channel Banner", width: 2560, height: 1440, aspectRatio: "16:9", safeZoneNote: "Safe zone: 1546x423 center" },
  { id: "ig-square", platform: "Instagram", name: "Instagram Square Post", width: 1080, height: 1080, aspectRatio: "1:1" },
  { id: "ig-story", platform: "Instagram / TikTok", name: "Story / Reel / TikTok", width: 1080, height: 1920, aspectRatio: "9:16" },
  { id: "li-post", platform: "LinkedIn", name: "LinkedIn Post Image", width: 1200, height: 627, aspectRatio: "1.91:1" },
  { id: "li-banner", platform: "LinkedIn", name: "LinkedIn Profile Banner", width: 1584, height: 396, aspectRatio: "4:1" },
];

export function SocialMediaImageResizer() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("og-share");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("image");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const selectedPreset = PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageName(file.name.replace(/\.[^/.]+$/, ""));
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageSrc(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setImageName(file.name.replace(/\.[^/.]+$/, ""));
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageSrc(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Draw image on canvas with center crop
  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = selectedPreset.width;
      canvas.height = selectedPreset.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Cover crop calculation
      const hRatio = canvas.width / img.width;
      const vRatio = canvas.height / img.height;
      const ratio = Math.max(hRatio, vRatio);

      const centerShiftX = (canvas.width - img.width * ratio) / 2;
      const centerShiftY = (canvas.height - img.height * ratio) / 2;

      ctx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        centerShiftX,
        centerShiftY,
        img.width * ratio,
        img.height * ratio
      );
    };
    img.src = imageSrc;
  }, [imageSrc, selectedPreset]);

  const handleDownload = (format: "png" | "jpeg") => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const mime = format === "png" ? "image/png" : "image/jpeg";
    const dataUrl = canvas.toDataURL(mime, 0.92);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${imageName}_${selectedPreset.id}_${selectedPreset.width}x${selectedPreset.height}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      {/* Preset Selector */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
          1. Select Target Social Media Platform &amp; Dimensions
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setSelectedPresetId(preset.id)}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                selectedPresetId === preset.id
                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-foreground"
                  : "border-border bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block text-muted-foreground">
                {preset.platform}
              </span>
              <p className="text-xs font-bold truncate mt-0.5 text-foreground">{preset.name}</p>
              <span className="text-[10px] font-mono text-muted-foreground block mt-1">
                {preset.width} × {preset.height} ({preset.aspectRatio})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Upload Zone & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Upload Control Box */}
        <div className="lg:col-span-5 space-y-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="p-8 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30 transition-colors text-center"
          >
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-xs font-semibold text-foreground">
              {imageSrc ? "Click or drop to replace image" : "Drop your image here (PNG, JPG, WebP)"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              100% processed locally in browser Canvas. Zero server uploads.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {selectedPreset.safeZoneNote && (
            <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg text-xs text-amber-800 dark:text-amber-300">
              <strong>Safe Zone Guide:</strong> {selectedPreset.safeZoneNote}
            </div>
          )}

          {imageSrc && (
            <div className="p-4 bg-card border border-border rounded-xl space-y-3">
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                Export Options
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload("png")}
                  className="py-2.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PNG</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload("jpeg")}
                  className="py-2.5 bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs rounded-xl border border-border transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download JPG</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Live Canvas Crop Preview */}
        <div className="lg:col-span-7 p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Live Scaled Canvas Output ({selectedPreset.width} × {selectedPreset.height} px)
            </span>
          </div>

          <div className="p-4 bg-muted/40 rounded-xl border border-border flex items-center justify-center min-h-[220px] overflow-hidden">
            {imageSrc ? (
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-[360px] object-contain rounded-lg shadow-md border border-border"
              />
            ) : (
              <div className="text-center text-muted-foreground text-xs space-y-1">
                <ImageIcon className="w-8 h-8 mx-auto opacity-40" />
                <p>Upload an image above to see instant preview and export.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
