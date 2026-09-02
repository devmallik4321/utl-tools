"use client";

import { useState, useMemo } from "react";
import { Printer, Copy, Check, Sparkles, FileText, Image as ImageIcon, Sliders } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface PaperPreset {
  name: string;
  widthIn: number;
  heightIn: number;
}

const PAPER_PRESETS: PaperPreset[] = [
  { name: "US Letter (8.5 × 11\")", widthIn: 8.5, heightIn: 11.0 },
  { name: "A4 International (210 × 297 mm)", widthIn: 8.27, heightIn: 11.69 },
  { name: "US Legal (8.5 × 14\")", widthIn: 8.5, heightIn: 14.0 },
  { name: "Tabloid / A3 (11 × 17\")", widthIn: 11.0, heightIn: 17.0 },
  { name: "Standard Business Card", widthIn: 3.5, heightIn: 2.0 },
  { name: "Postcard (4 × 6\")", widthIn: 4.0, heightIn: 6.0 },
  { name: "Medium Poster (18 × 24\")", widthIn: 18.0, heightIn: 24.0 },
  { name: "Large Poster (24 × 36\")", widthIn: 24.0, heightIn: 36.0 },
];

export function PrintResolutionCalculator() {
  const [widthInches, setWidthInches] = useState<number>(8.5);
  const [heightInches, setHeightInches] = useState<number>(11.0);
  const [copiedDpi, setCopiedDpi] = useState<number | null>(null);

  const { res300, res150, res72 } = useMemo(() => {
    const calc = (dpi: number) => {
      const w = Math.round(widthInches * dpi);
      const h = Math.round(heightInches * dpi);
      const mp = ((w * h) / 1e6).toFixed(1);
      return { w, h, mp };
    };

    return {
      res300: calc(300),
      res150: calc(150),
      res72: calc(72),
    };
  }, [widthInches, heightInches]);

  const selectPreset = (p: PaperPreset) => {
    setWidthInches(p.widthIn);
    setHeightInches(p.heightIn);
  };

  const handleCopy = async (w: number, h: number, dpi: number) => {
    const text = `${w} × ${h} px (${dpi} DPI)`;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedDpi(dpi);
      setTimeout(() => setCopiedDpi(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {PAPER_PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => selectPreset(p)}
            className="px-3 py-1 bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Dimensions Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Print Width (Inches)
          </label>
          <input
            type="number"
            min={0.5}
            step={0.1}
            value={widthInches}
            onChange={(e) => setWidthInches(Math.max(0.1, parseFloat(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground font-mono">
            ~{(widthInches * 25.4).toFixed(1)} mm
          </span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Print Height (Inches)
          </label>
          <input
            type="number"
            min={0.5}
            step={0.1}
            value={heightInches}
            onChange={(e) => setHeightInches(Math.max(0.1, parseFloat(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground font-mono">
            ~{(heightInches * 25.4).toFixed(1)} mm
          </span>
        </div>
      </div>

      {/* DPI Comparison Cards */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Printer className="w-4 h-4 text-emerald-500" />
          Required Pixel Canvas Resolutions
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border-2 border-emerald-500/40 space-y-2">
            <div className="flex justify-between items-center font-sans">
              <span className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">300 DPI</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-1.5 py-0.5 rounded">
                High-End Print
              </span>
            </div>
            <p className="text-xl font-extrabold text-foreground">
              {res300.w} × {res300.h} px
            </p>
            <div className="flex justify-between items-center text-xs text-muted-foreground pt-1">
              <span>{res300.mp} Megapixels</span>
              <button
                onClick={() => handleCopy(res300.w, res300.h, 300)}
                className="hover:text-foreground text-blue-600"
              >
                {copiedDpi === 300 ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-2">
            <div className="flex justify-between items-center font-sans">
              <span className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400">150 DPI</span>
              <span className="text-[10px] bg-blue-500/10 text-blue-600 font-bold px-1.5 py-0.5 rounded">
                Standard / Poster
              </span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {res150.w} × {res150.h} px
            </p>
            <div className="flex justify-between items-center text-xs text-muted-foreground pt-1">
              <span>{res150.mp} Megapixels</span>
              <button
                onClick={() => handleCopy(res150.w, res150.h, 150)}
                className="hover:text-foreground text-blue-600"
              >
                {copiedDpi === 150 ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-2">
            <div className="flex justify-between items-center font-sans">
              <span className="text-xs font-bold uppercase text-foreground">72 DPI</span>
              <span className="text-[10px] bg-muted text-muted-foreground font-bold px-1.5 py-0.5 rounded">
                Screen Preview
              </span>
            </div>
            <p className="text-xl font-bold text-foreground">
              {res72.w} × {res72.h} px
            </p>
            <div className="flex justify-between items-center text-xs text-muted-foreground pt-1">
              <span>{res72.mp} Megapixels</span>
              <button
                onClick={() => handleCopy(res72.w, res72.h, 72)}
                className="hover:text-foreground text-blue-600"
              >
                {copiedDpi === 72 ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
