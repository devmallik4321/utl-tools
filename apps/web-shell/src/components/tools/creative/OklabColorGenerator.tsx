"use client";

import { useState, useMemo } from "react";
import { Palette, Copy, Check, Sparkles, Sliders, Sun } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

type PaletteMode = "monochromatic" | "analogous" | "complementary" | "triadic";

export function OklabColorGenerator() {
  const [lightness, setLightness] = useState<number>(65); // 0% - 100%
  const [chroma, setChroma] = useState<number>(0.22); // 0.0 - 0.37
  const [hue, setHue] = useState<number>(250); // 0 - 360 deg
  const [mode, setMode] = useState<PaletteMode>("complementary");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { paletteColors, cssVariablesSnippet } = useMemo(() => {
    const lNorm = (lightness / 100).toFixed(2);
    const cNorm = chroma.toFixed(3);

    const colors: { name: string; oklchStr: string }[] = [];

    if (mode === "complementary") {
      colors.push({ name: "Base Color", oklchStr: `oklch(${lNorm} ${cNorm} ${hue})` });
      const compHue = (hue + 180) % 360;
      colors.push({ name: "Complement", oklchStr: `oklch(${lNorm} ${cNorm} ${compHue})` });
      colors.push({ name: "Base Tint", oklchStr: `oklch(${Math.min(0.95, parseFloat(lNorm) + 0.2).toFixed(2)} ${(chroma * 0.5).toFixed(3)} ${hue})` });
      colors.push({ name: "Complement Shade", oklchStr: `oklch(${Math.max(0.15, parseFloat(lNorm) - 0.25).toFixed(2)} ${cNorm} ${compHue})` });
    } else if (mode === "analogous") {
      const h1 = (hue - 30 + 360) % 360;
      const h2 = (hue + 30) % 360;
      colors.push({ name: "Analogous -30°", oklchStr: `oklch(${lNorm} ${cNorm} ${h1})` });
      colors.push({ name: "Base Color", oklchStr: `oklch(${lNorm} ${cNorm} ${hue})` });
      colors.push({ name: "Analogous +30°", oklchStr: `oklch(${lNorm} ${cNorm} ${h2})` });
      colors.push({ name: "Subtle Background", oklchStr: `oklch(0.96 0.03 ${hue})` });
    } else if (mode === "triadic") {
      const h1 = (hue + 120) % 360;
      const h2 = (hue + 240) % 360;
      colors.push({ name: "Base Color", oklchStr: `oklch(${lNorm} ${cNorm} ${hue})` });
      colors.push({ name: "Triad #2", oklchStr: `oklch(${lNorm} ${cNorm} ${h1})` });
      colors.push({ name: "Triad #3", oklchStr: `oklch(${lNorm} ${cNorm} ${h2})` });
      colors.push({ name: "Neutral Dark", oklchStr: `oklch(0.25 0.04 ${hue})` });
    } else {
      // Monochromatic
      const steps = [0.95, 0.8, 0.65, 0.45, 0.25];
      steps.forEach((st, i) => {
        const cFactor = st > 0.9 ? 0.04 : chroma;
        colors.push({ name: `Step ${i + 1}`, oklchStr: `oklch(${st.toFixed(2)} ${cFactor} ${hue})` });
      });
    }

    const cssVars = `:root {\n` + colors.map((c, i) => `  --color-${i + 1}: ${c.oklchStr};`).join("\n") + `\n}`;

    return {
      paletteColors: colors,
      cssVariablesSnippet: cssVars,
    };
  }, [lightness, chroma, hue, mode]);

  const handleCopy = async (key: string, val: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Harmony Mode Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(["complementary", "analogous", "triadic", "monochromatic"] as PaletteMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-2 text-xs font-bold rounded-xl border capitalize transition-colors ${
              mode === m ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Lightness (L)</span>
            <span className="font-mono">{lightness}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={95}
            value={lightness}
            onChange={(e) => setLightness(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Chroma / Saturation (C)</span>
            <span className="font-mono">{chroma}</span>
          </div>
          <input
            type="range"
            min={0}
            max={0.35}
            step={0.01}
            value={chroma}
            onChange={(e) => setChroma(parseFloat(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Hue Angle (H)</span>
            <span className="font-mono">{hue}°</span>
          </div>
          <input
            type="range"
            min={0}
            max={360}
            value={hue}
            onChange={(e) => setHue(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>
      </div>

      {/* Palette Color Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {paletteColors.map((c, i) => (
          <div key={i} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div
              style={{ backgroundColor: c.oklchStr }}
              className="h-28 flex items-center justify-center text-white/90 text-xs font-bold drop-shadow"
            />
            <div className="p-3 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between items-center font-sans">
                <span className="font-bold text-foreground">{c.name}</span>
                <button
                  onClick={() => handleCopy(`color-${i}`, c.oklchStr)}
                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {copiedKey === `color-${i}` ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground select-all break-all">{c.oklchStr}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CSS Variables Output */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-emerald-500" />
            CSS Color 4 (oklch) Design Tokens
          </h4>
          <button
            onClick={() => handleCopy("vars", cssVariablesSnippet)}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copiedKey === "vars" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === "vars" ? "Copied!" : "Copy Tokens"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {cssVariablesSnippet}
        </pre>
      </div>
    </div>
  );
}
