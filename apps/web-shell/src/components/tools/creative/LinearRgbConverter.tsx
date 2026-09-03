"use client";

import { useState, useMemo } from "react";
import { Palette, Copy, Check, Sparkles, Sliders, Box, Code } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

// IEC 61966-2-1 exact sRGB to Linear conversion
function srgbToLinear(c: number): number {
  const norm = c / 255;
  if (norm <= 0.04045) {
    return norm / 12.92;
  }
  return Math.pow((norm + 0.055) / 1.055, 2.4);
}

export function LinearRgbConverter() {
  const [hexColor, setHexColor] = useState<string>("#3b82f6");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const {
    rgb8Bit,
    normSrgb,
    linearRgb,
    cssLinearString,
    glslVec3,
    wgslVec3,
  } = useMemo(() => {
    let clean = hexColor.trim().replace(/^#/, "");
    if (clean.length === 3) {
      clean = clean.split("").map((c) => c + c).join("");
    }
    if (clean.length !== 6) {
      clean = "3b82f6";
    }

    const r = parseInt(clean.slice(0, 2), 16) || 0;
    const g = parseInt(clean.slice(2, 4), 16) || 0;
    const b = parseInt(clean.slice(4, 6), 16) || 0;

    const sR = (r / 255).toFixed(4);
    const sG = (g / 255).toFixed(4);
    const sB = (b / 255).toFixed(4);

    const lR = srgbToLinear(r);
    const lG = srgbToLinear(g);
    const lB = srgbToLinear(b);

    const lRStr = lR.toFixed(5);
    const lGStr = lG.toFixed(5);
    const lBStr = lB.toFixed(5);

    const cssLinear = `color(srgb-linear ${lRStr} ${lGStr} ${lBStr})`;
    const glsl = `vec3 linearColor = vec3(${lRStr}, ${lGStr}, ${lBStr});`;
    const wgsl = `let linear_color = vec3<f32>(${lRStr}, ${lGStr}, ${lBStr});`;

    return {
      rgb8Bit: `rgb(${r}, ${g}, ${b})`,
      normSrgb: `vec3(${sR}, ${sG}, ${sB})`,
      linearRgb: `${lRStr}, ${lGStr}, ${lBStr}`,
      cssLinearString: cssLinear,
      glslVec3: glsl,
      wgslVec3: wgsl,
    };
  }, [hexColor]);

  const handleCopy = async (key: string, val: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Color Picker & Input */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Input Color (Hex or Picker)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={hexColor}
            onChange={(e) => setHexColor(e.target.value)}
            className="w-12 h-12 rounded-xl border border-border cursor-pointer"
          />
          <input
            type="text"
            value={hexColor}
            onChange={(e) => setHexColor(e.target.value)}
            placeholder="#3b82f6"
            className="w-48 px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground uppercase"
          />
          <div
            style={{ backgroundColor: hexColor }}
            className="flex-1 h-12 rounded-xl border border-border shadow-inner"
          />
        </div>
      </div>

      {/* Conversion Formats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
        <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-foreground">Linear RGB Floats (PBR / 3D)</span>
            <button
              onClick={() => handleCopy("linear", linearRgb)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "linear" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "linear" ? "Copied!" : "Copy"}</span>
            </button>
          </div>
          <pre className="p-3 bg-card border border-border rounded-lg text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
            {linearRgb}
          </pre>
        </div>

        <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-foreground">CSS Color 4 (srgb-linear)</span>
            <button
              onClick={() => handleCopy("css", cssLinearString)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "css" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "css" ? "Copied!" : "Copy"}</span>
            </button>
          </div>
          <pre className="p-3 bg-card border border-border rounded-lg text-blue-600 dark:text-blue-400 overflow-x-auto select-all">
            {cssLinearString}
          </pre>
        </div>

        <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-foreground">GLSL Shader Vector</span>
            <button
              onClick={() => handleCopy("glsl", glslVec3)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "glsl" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "glsl" ? "Copied!" : "Copy"}</span>
            </button>
          </div>
          <pre className="p-3 bg-card border border-border rounded-lg text-purple-600 dark:text-purple-400 overflow-x-auto select-all">
            {glslVec3}
          </pre>
        </div>

        <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-foreground">WGSL WebGPU Vector</span>
            <button
              onClick={() => handleCopy("wgsl", wgslVec3)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "wgsl" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "wgsl" ? "Copied!" : "Copy"}</span>
            </button>
          </div>
          <pre className="p-3 bg-card border border-border rounded-lg text-amber-600 dark:text-amber-400 overflow-x-auto select-all">
            {wgslVec3}
          </pre>
        </div>
      </div>
    </div>
  );
}
