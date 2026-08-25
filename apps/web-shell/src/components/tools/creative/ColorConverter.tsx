"use client";

import { useState } from "react";
import { Copy, Check, Palette, Sparkles } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function ColorConverter() {
  const [hex, setHex] = useState<string>("#3B82F6");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Converters
  const hexToRgb = (hexStr: string): [number, number, number] => {
    let clean = hexStr.replace(/^#/, "");
    if (clean.length === 3) {
      clean = clean.split("").map((c) => c + c).join("");
    }
    const num = parseInt(clean, 16);
    if (isNaN(num) || clean.length !== 6) return [59, 130, 246];
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  };

  const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  };

  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);

  const formats = {
    hex: hex.toUpperCase(),
    rgb: `rgb(${r}, ${g}, ${b})`,
    rgba: `rgba(${r}, ${g}, ${b}, 1.0)`,
    hsl: `hsl(${h}, ${s}%, ${l}%)`,
    hsla: `hsla(${h}, ${s}%, ${l}%, 1.0)`,
    cssVar: `--color: ${r} ${g} ${b};`,
  };

  const handleCopy = async (val: string, key: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Color Swatch & Native Picker */}
        <div className="md:col-span-5 flex flex-col items-center p-8 bg-card border border-border rounded-xl space-y-4">
          <div
            className="w-40 h-40 rounded-2xl shadow-lg border-4 border-white dark:border-slate-800 transition-colors"
            style={{ backgroundColor: hex }}
          />

          <div className="flex items-center gap-3">
            <input
              type="color"
              value={hex.startsWith("#") && hex.length === 7 ? hex : "#3b82f6"}
              onChange={(e) => setHex(e.target.value)}
              className="w-10 h-10 rounded-lg border border-border cursor-pointer"
            />
            <input
              type="text"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="w-28 px-3 py-2 text-sm font-mono font-bold uppercase bg-background border border-border rounded-lg text-center focus:outline-none"
            />
          </div>
        </div>

        {/* Color Codes Grid */}
        <div className="md:col-span-7 space-y-3">
          {Object.entries(formats).map(([key, val]) => (
            <div
              key={key}
              className="p-3.5 bg-card border border-border rounded-xl flex items-center justify-between font-mono text-xs sm:text-sm group hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-sans font-bold uppercase text-muted-foreground w-14">
                  {key}
                </span>
                <span className="font-bold text-foreground">{val}</span>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(val, key)}
                className="p-1.5 rounded text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted"
                title="Copy color code"
              >
                {copiedKey === key ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
