"use client";

import { useState, useRef, useEffect } from "react";
import { Crop, Download, Upload, Image as ImageIcon, Sparkles, Sliders } from "lucide-react";

interface CropPreset {
  name: string;
  w: number;
  h: number;
  platform: string;
}

const PRESETS: CropPreset[] = [
  { name: "16:9", w: 16, h: 9, platform: "YouTube / Video Thumbnail" },
  { name: "1:1", w: 1, h: 1, platform: "Instagram Square / Avatar" },
  { name: "4:5", w: 4, h: 5, platform: "Instagram Portrait Post" },
  { name: "9:16", w: 9, h: 16, platform: "TikTok / IG Reels / Shorts" },
  { name: "21:9", w: 21, h: 9, platform: "Cinematic Ultrawide" },
  { name: "4:3", w: 4, h: 3, platform: "Classic Photo / iPad" },
];

export function AspectRatioCropper() {
  const [selectedPreset, setSelectedPreset] = useState<CropPreset>(PRESETS[0]);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imgDims, setImgDims] = useState<{ w: number; h: number }>({ w: 1200, h: 800 });
  const [cropOffsetPct, setCropOffsetPct] = useState<number>(50); // 50% = Center
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load default sample canvas if no image uploaded
  useEffect(() => {
    if (!imageSrc) {
      // Create a nice gradient image as default sample
      const offscreen = document.createElement("canvas");
      offscreen.width = 1200;
      offscreen.height = 800;
      const ctx = offscreen.getContext("2d");
      if (ctx) {
        const grad = ctx.createLinearGradient(0, 0, 1200, 800);
        grad.addColorStop(0, "#1e293b");
        grad.addColorStop(0.5, "#3b82f6");
        grad.addColorStop(1, "#10b981");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1200, 800);

        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.font = "bold 44px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Sample Image (1200 × 800 px)", 600, 380);
        ctx.font = "24px sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.fillText("Upload any custom image to preview exact crop dimensions", 600, 440);

        setImageSrc(offscreen.toDataURL());
      }
    }
  }, [imageSrc]);

  // Redraw canvas with crop overlay
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      setImgDims({ w: img.naturalWidth || 1200, h: img.naturalHeight || 800 });
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const cw = 700;
      const ch = (cw * img.naturalHeight) / img.naturalWidth;
      canvas.width = cw;
      canvas.height = ch;

      // Draw base image
      ctx.drawImage(img, 0, 0, cw, ch);

      // Calculate Crop Boundary Box
      const targetRatio = selectedPreset.w / selectedPreset.h;
      const imageRatio = cw / ch;

      let cropW = cw;
      let cropH = ch;
      let cropX = 0;
      let cropY = 0;

      if (imageRatio > targetRatio) {
        // Image is wider than target -> Height is fixed, Width is cropped
        cropH = ch;
        cropW = ch * targetRatio;
        const maxOffset = cw - cropW;
        cropX = maxOffset * (cropOffsetPct / 100);
      } else {
        // Image is taller than target -> Width is fixed, Height is cropped
        cropW = cw;
        cropH = cw / targetRatio;
        const maxOffset = ch - cropH;
        cropY = maxOffset * (cropOffsetPct / 100);
      }

      // Darken outside area
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      // Top
      ctx.fillRect(0, 0, cw, cropY);
      // Bottom
      ctx.fillRect(0, cropY + cropH, cw, ch - (cropY + cropH));
      // Left
      ctx.fillRect(0, cropY, cropX, cropH);
      // Right
      ctx.fillRect(cropX + cropW, cropY, cw - (cropX + cropW), cropH);

      // Crop border outline & rule of thirds grid
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.strokeRect(cropX, cropY, cropW, cropH);

      // Rule of thirds grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Verticals
      ctx.moveTo(cropX + cropW / 3, cropY);
      ctx.lineTo(cropX + cropW / 3, cropY + cropH);
      ctx.moveTo(cropX + (cropW * 2) / 3, cropY);
      ctx.lineTo(cropX + (cropW * 2) / 3, cropY + cropH);
      // Horizontals
      ctx.moveTo(cropX, cropY + cropH / 3);
      ctx.lineTo(cropX + cropW, cropY + cropH / 3);
      ctx.moveTo(cropX, cropY + (cropH * 2) / 3);
      ctx.lineTo(cropX + cropW, cropY + (cropH * 2) / 3);
      ctx.stroke();
    };
  }, [imageSrc, selectedPreset, cropOffsetPct]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageSrc(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExportCropped = () => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;
    img.onload = () => {
      const targetRatio = selectedPreset.w / selectedPreset.h;
      const imgRatio = img.naturalWidth / img.naturalHeight;

      let cW = img.naturalWidth;
      let cH = img.naturalHeight;
      let cX = 0;
      let cY = 0;

      if (imgRatio > targetRatio) {
        cH = img.naturalHeight;
        cW = cH * targetRatio;
        cX = (img.naturalWidth - cW) * (cropOffsetPct / 100);
      } else {
        cW = img.naturalWidth;
        cH = cW / targetRatio;
        cY = (img.naturalHeight - cH) * (cropOffsetPct / 100);
      }

      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = cW;
      exportCanvas.height = cH;
      const eCtx = exportCanvas.getContext("2d");
      if (eCtx) {
        eCtx.drawImage(img, cX, cY, cW, cH, 0, 0, cW, cH);
        const link = document.createElement("a");
        link.download = `crop-${selectedPreset.name.replace(":", "x")}-${Math.round(cW)}x${Math.round(cH)}.png`;
        link.href = exportCanvas.toDataURL("image/png");
        link.click();
      }
    };
  };

  return (
    <div className="space-y-6">
      {/* Preset Buttons */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Target Aspect Ratio:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedPreset(p)}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                selectedPreset.name === p.name
                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-foreground font-bold"
                  : "border-border bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-sm font-mono block">{p.name}</span>
              <span className="text-[10px] text-muted-foreground block truncate mt-0.5">{p.platform}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Upload & Positioning Slider */}
      <div className="p-4 bg-card border border-border rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <label className="px-3.5 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-xs hover:opacity-90">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
          <span className="text-xs text-muted-foreground font-mono">
            {imgDims.w} × {imgDims.h} px Original
          </span>
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-xs">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Framing Position:</span>
          <input
            type="range"
            min={0}
            max={100}
            value={cropOffsetPct}
            onChange={(e) => setCropOffsetPct(parseInt(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>

        <button
          onClick={handleExportCropped}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export {selectedPreset.name} Crop</span>
        </button>
      </div>

      {/* Canvas Visual Preview */}
      <div className="p-4 bg-muted/40 border border-border rounded-xl flex flex-col items-center justify-center min-h-[300px] overflow-hidden">
        <canvas
          ref={canvasRef}
          className="max-w-full h-auto rounded-lg shadow-md border border-border"
        />
        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
          <Crop className="w-3.5 h-3.5 text-blue-500" />
          Blue boundary indicates the active {selectedPreset.name} crop zone with rule-of-thirds gridlines.
        </p>
      </div>
    </div>
  );
}
