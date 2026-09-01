"use client";

import { useState } from "react";
import { Monitor, Eye, Copy, Check, Sparkles } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function ScreenPpiCalculator() {
  const [width, setWidth] = useState<number>(3840);
  const [height, setHeight] = useState<number>(2160);
  const [diagonal, setDiagonal] = useState<number>(27);
  const [copied, setCopied] = useState<boolean>(false);

  // Common Presets
  const PRESETS = [
    { name: "27\" 4K UHD", w: 3840, h: 2160, d: 27 },
    { name: "27\" 1440p QHD", w: 2560, h: 1440, d: 27 },
    { name: "24\" 1080p FHD", w: 1920, h: 1080, d: 24 },
    { name: "34\" Ultrawide WQHD", w: 3440, h: 1440, d: 34 },
    { name: "16\" MacBook Pro", w: 3456, h: 2234, d: 16.2 },
    { name: "6.1\" Smartphone", w: 2556, h: 1179, d: 6.1 },
  ];

  // Calculation
  const diagonalPixels = Math.sqrt(width * width + height * height);
  const ppi = diagonal > 0 ? diagonalPixels / diagonal : 0;
  const totalPixels = (width * height) / 1_000_000;
  const dotPitchMm = ppi > 0 ? (25.4 / ppi) : 0; // 1 inch = 25.4 mm
  const optimalViewingDistanceCm = ppi > 0 ? (3438 / ppi) * 2.54 : 0; // Visual acuity formula ~1 arcminute

  // Aspect ratio simplification
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  const aspectW = width / divisor;
  const aspectH = height / divisor;

  const handleCopy = async () => {
    const summary = `Screen PPI Calculation\n• Resolution: ${width}x${height} (${totalPixels.toFixed(2)} MP)\n• Screen Size: ${diagonal}" diagonal\n• Pixel Density: ${ppi.toFixed(1)} PPI\n• Dot Pitch: ${dotPitchMm.toFixed(4)} mm\n• Aspect Ratio: ${aspectW}:${aspectH}\n• Recommended Viewing Distance: ${(optimalViewingDistanceCm / 2.54).toFixed(0)}" (~${optimalViewingDistanceCm.toFixed(0)} cm)`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Display Resolution Presets:
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => { setWidth(p.w); setHeight(p.h); setDiagonal(p.d); }}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Input Dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Horizontal Pixels (Width)
          </label>
          <input
            type="number"
            value={width}
            onChange={(e) => setWidth(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Vertical Pixels (Height)
          </label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Diagonal Screen Size (Inches)
          </label>
          <input
            type="number"
            step="0.1"
            value={diagonal}
            onChange={(e) => setDiagonal(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
        </div>
      </div>

      {/* Results Grid */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Monitor className="w-4 h-4 text-blue-500" />
            Display Pixel Density &amp; Geometry
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Results"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Pixel Density (PPI)</span>
            <p className="text-3xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
              {ppi.toFixed(1)} PPI
            </p>
            <span className="text-[10px] text-muted-foreground">
              {ppi >= 200 ? "Retina / High DPI" : ppi >= 110 ? "Sharp Standard DPI" : "Standard Resolution"}
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Dot Pitch / Pixel Pitch</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              {dotPitchMm.toFixed(4)} mm
            </p>
            <span className="text-[10px] text-muted-foreground">Distance between adjacent pixels</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Optimal Viewing Distance</span>
            <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              ~{(optimalViewingDistanceCm / 2.54).toFixed(0)}" ({optimalViewingDistanceCm.toFixed(0)} cm)
            </p>
            <span className="text-[10px] text-muted-foreground">Distance for human 20/20 vision</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs font-mono text-muted-foreground pt-2 border-t border-border">
          <div>Aspect Ratio: <strong className="text-foreground">{aspectW}:{aspectH}</strong></div>
          <div>Total Screen Pixels: <strong className="text-foreground">{totalPixels.toFixed(2)} Megapixels</strong></div>
        </div>
      </div>
    </div>
  );
}
