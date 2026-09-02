"use client";

import { useState, useMemo } from "react";
import { Palette, Copy, Check, Sparkles, Layers } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function ColorShadesGenerator() {
  const [baseHex, setBaseHex] = useState<string>("#3b82f6");
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const { tints, shades, tailwindScale } = useMemo(() => {
    let clean = baseHex.trim().replace("#", "");
    if (clean.length === 3) {
      clean = clean.split("").map((c) => c + c).join("");
    }
    if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
      clean = "3b82f6";
    }

    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);

    const mix = (r1: number, g1: number, b1: number, r2: number, g2: number, b2: number, weight: number) => {
      const nr = Math.round(r1 * (1 - weight) + r2 * weight);
      const ng = Math.round(g1 * (1 - weight) + g2 * weight);
      const nb = Math.round(b1 * (1 - weight) + b2 * weight);
      return `#${nr.toString(16).padStart(2, "0")}${ng.toString(16).padStart(2, "0")}${nb.toString(16).padStart(2, "0")}`;
    };

    // Tints (mixed with white)
    const tintList = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((w) => ({
      weight: Math.round(w * 100),
      hex: mix(r, g, b, 255, 255, 255, w),
    }));

    // Shades (mixed with black)
    const shadeList = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((w) => ({
      weight: Math.round(w * 100),
      hex: mix(r, g, b, 0, 0, 0, w),
    }));

    // Tailwind 50-950 scale
    const tw = [
      { step: "50", hex: mix(r, g, b, 255, 255, 255, 0.85) },
      { step: "100", hex: mix(r, g, b, 255, 255, 255, 0.7) },
      { step: "200", hex: mix(r, g, b, 255, 255, 255, 0.5) },
      { step: "300", hex: mix(r, g, b, 255, 255, 255, 0.3) },
      { step: "400", hex: mix(r, g, b, 255, 255, 255, 0.15) },
      { step: "500 (Base)", hex: `#${clean}` },
      { step: "600", hex: mix(r, g, b, 0, 0, 0, 0.15) },
      { step: "700", hex: mix(r, g, b, 0, 0, 0, 0.3) },
      { step: "800", hex: mix(r, g, b, 0, 0, 0, 0.5) },
      { step: "900", hex: mix(r, g, b, 0, 0, 0, 0.7) },
      { step: "950", hex: mix(r, g, b, 0, 0, 0, 0.85) },
    ];

    return { tints: tintList, shades: shadeList, tailwindScale: tw };
  }, [baseHex]);

  const handleCopy = async (val: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedColor(val);
      setTimeout(() => setCopiedColor(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Base Hex Picker */}
      <div className="p-4 bg-card border border-border rounded-xl flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={baseHex.startsWith("#") ? baseHex : `#${baseHex}`}
            onChange={(e) => setBaseHex(e.target.value)}
            className="w-10 h-10 rounded-lg border border-border cursor-pointer shrink-0"
          />
          <div>
            <label className="text-[10px] text-muted-foreground uppercase font-bold block">Base Color</label>
            <input
              type="text"
              value={baseHex}
              onChange={(e) => setBaseHex(e.target.value)}
              className="w-28 px-2.5 py-1 font-mono text-sm font-bold bg-background border border-border rounded-md"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 text-xs">
          {["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"].map((preset) => (
            <button
              key={preset}
              onClick={() => setBaseHex(preset)}
              style={{ backgroundColor: preset }}
              className="w-7 h-7 rounded-md border border-border shadow-2xs hover:scale-105 transition-transform"
            />
          ))}
        </div>
      </div>

      {/* Tailwind 50-950 Scale */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-blue-500" />
          Tailwind CSS Design Palette (50 — 950)
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2 text-xs font-mono">
          {tailwindScale.map((item) => (
            <button
              key={item.step}
              onClick={() => handleCopy(item.hex)}
              className="p-2 rounded-lg border border-border space-y-1.5 text-left hover:border-blue-500 transition-colors group"
            >
              <div style={{ backgroundColor: item.hex }} className="w-full h-10 rounded-md shadow-2xs" />
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-foreground font-sans">{item.step}</span>
                <span className="text-[10px] text-muted-foreground">
                  {copiedColor === item.hex ? <Check className="w-3 h-3 text-emerald-500" /> : item.hex}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tints & Shades Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tints */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-3">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
            Tints (+ White Mix)
          </span>
          <div className="space-y-1.5">
            {tints.map((t) => (
              <div
                key={t.weight}
                onClick={() => handleCopy(t.hex)}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/60 cursor-pointer text-xs font-mono"
              >
                <div className="flex items-center gap-2.5">
                  <div style={{ backgroundColor: t.hex }} className="w-6 h-6 rounded border border-border" />
                  <span className="text-foreground">{t.hex}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <span>+{t.weight}% White</span>
                  {copiedColor === t.hex && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shades */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-3">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
            Shades (+ Black Mix)
          </span>
          <div className="space-y-1.5">
            {shades.map((s) => (
              <div
                key={s.weight}
                onClick={() => handleCopy(s.hex)}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/60 cursor-pointer text-xs font-mono"
              >
                <div className="flex items-center gap-2.5">
                  <div style={{ backgroundColor: s.hex }} className="w-6 h-6 rounded border border-border" />
                  <span className="text-foreground">{s.hex}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <span>+{s.weight}% Black</span>
                  {copiedColor === s.hex && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
