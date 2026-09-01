"use client";

import { useState, useMemo } from "react";
import { Palette, Copy, Check, Sparkles, Sliders } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function HexRgbHslPicker() {
  const [hexColor, setHexColor] = useState<string>("#3b82f6"); // Blue 500
  const [copied, setCopied] = useState<string | null>(null);

  // Conversion Helpers
  const { r, g, b, h, s, l, isValid } = useMemo(() => {
    let clean = hexColor.replace("#", "");
    if (clean.length === 3) {
      clean = clean.split("").map((c) => c + c).join("");
    }
    if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
      return { r: 0, g: 0, b: 0, h: 0, s: 0, l: 0, isValid: false };
    }

    const rVal = parseInt(clean.substring(0, 2), 16);
    const gVal = parseInt(clean.substring(2, 4), 16);
    const bVal = parseInt(clean.substring(4, 6), 16);

    const rNorm = rVal / 255;
    const gNorm = gVal / 255;
    const bNorm = bVal / 255;

    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let hVal = 0;
    let sVal = 0;
    const lVal = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      sVal = lVal > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rNorm: hVal = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
        case gNorm: hVal = (bNorm - rNorm) / d + 2; break;
        case bNorm: hVal = (rNorm - gNorm) / d + 4; break;
      }
      hVal /= 6;
    }

    return {
      r: rVal,
      g: gVal,
      b: bVal,
      h: Math.round(hVal * 360),
      s: Math.round(sVal * 100),
      l: Math.round(lVal * 100),
      isValid: true,
    };
  }, [hexColor]);

  // HSL to Hex Helper for harmonic palettes
  const hslToHex = (hDeg: number, sPct: number, lPct: number): string => {
    let hNorm = (hDeg % 360 + 360) % 360 / 360;
    let sNorm = Math.min(100, Math.max(0, sPct)) / 100;
    let lNorm = Math.min(100, Math.max(0, lPct)) / 100;

    let c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
    let x = c * (1 - Math.abs((hNorm * 6) % 2 - 1));
    let m = lNorm - c / 2;
    let rN = 0, gN = 0, bN = 0;

    if (hNorm < 1/6) { rN = c; gN = x; bN = 0; }
    else if (hNorm < 2/6) { rN = x; gN = c; bN = 0; }
    else if (hNorm < 3/6) { rN = 0; gN = c; bN = x; }
    else if (hNorm < 4/6) { rN = 0; gN = x; bN = c; }
    else if (hNorm < 5/6) { rN = x; gN = 0; bN = c; }
    else { rN = c; gN = 0; bN = x; }

    const toHexStr = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
    return `#${toHexStr(rN)}${toHexStr(gN)}${toHexStr(bN)}`;
  };

  // Harmonies
  const complementary = hslToHex(h + 180, s, l);
  const triadic1 = hslToHex(h + 120, s, l);
  const triadic2 = hslToHex(h + 240, s, l);
  const analogous1 = hslToHex(h - 30, s, l);
  const analogous2 = hslToHex(h + 30, s, l);
  const tintLight = hslToHex(h, s, Math.min(95, l + 20));
  const shadeDark = hslToHex(h, s, Math.max(5, l - 20));

  const handleCopyValue = async (label: string, text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Primary Color Picker Bar */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="color"
            value={hexColor}
            onChange={(e) => setHexColor(e.target.value)}
            className="w-16 h-16 rounded-xl border-2 border-border cursor-pointer p-1 bg-background shrink-0"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 w-full">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">HEX Code</span>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={hexColor}
                  onChange={(e) => setHexColor(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-background border border-border rounded-lg uppercase font-bold"
                />
                <button
                  type="button"
                  onClick={() => handleCopyValue("hex", hexColor)}
                  className="p-2 hover:bg-muted rounded-lg border border-border"
                  title="Copy HEX"
                >
                  {copied === "hex" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">RGB Format</span>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  readOnly
                  value={`rgb(${r}, ${g}, ${b})`}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-muted/40 border border-border rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleCopyValue("rgb", `rgb(${r}, ${g}, ${b})`)}
                  className="p-2 hover:bg-muted rounded-lg border border-border"
                  title="Copy RGB"
                >
                  {copied === "rgb" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">HSL Format</span>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  readOnly
                  value={`hsl(${h}, ${s}%, ${l}%)`}
                  className="w-full px-3 py-1.5 text-xs font-mono bg-muted/40 border border-border rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleCopyValue("hsl", `hsl(${h}, ${s}%, ${l}%)`)}
                  className="p-2 hover:bg-muted rounded-lg border border-border"
                  title="Copy HSL"
                >
                  {copied === "hsl" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Harmonic Palettes */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Palette className="w-4 h-4 text-purple-500" />
          Harmonic Color Palettes
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Complementary */}
          <div className="p-3.5 bg-card border border-border rounded-xl space-y-2">
            <span className="text-xs font-bold text-foreground block">Complementary</span>
            <div className="flex h-12 rounded-lg overflow-hidden border border-border">
              <div style={{ backgroundColor: hexColor }} className="flex-1 cursor-pointer" onClick={() => handleCopyValue("c1", hexColor)} />
              <div style={{ backgroundColor: complementary }} className="flex-1 cursor-pointer" onClick={() => handleCopyValue("c2", complementary)} />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>{hexColor}</span>
              <span>{complementary}</span>
            </div>
          </div>

          {/* Analogous */}
          <div className="p-3.5 bg-card border border-border rounded-xl space-y-2">
            <span className="text-xs font-bold text-foreground block">Analogous</span>
            <div className="flex h-12 rounded-lg overflow-hidden border border-border">
              <div style={{ backgroundColor: analogous1 }} className="flex-1" />
              <div style={{ backgroundColor: hexColor }} className="flex-1" />
              <div style={{ backgroundColor: analogous2 }} className="flex-1" />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>{analogous1}</span>
              <span>{hexColor}</span>
              <span>{analogous2}</span>
            </div>
          </div>

          {/* Triadic */}
          <div className="p-3.5 bg-card border border-border rounded-xl space-y-2">
            <span className="text-xs font-bold text-foreground block">Triadic</span>
            <div className="flex h-12 rounded-lg overflow-hidden border border-border">
              <div style={{ backgroundColor: hexColor }} className="flex-1" />
              <div style={{ backgroundColor: triadic1 }} className="flex-1" />
              <div style={{ backgroundColor: triadic2 }} className="flex-1" />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>{hexColor}</span>
              <span>{triadic1}</span>
              <span>{triadic2}</span>
            </div>
          </div>

          {/* Tints & Shades */}
          <div className="p-3.5 bg-card border border-border rounded-xl space-y-2">
            <span className="text-xs font-bold text-foreground block">Monochromatic</span>
            <div className="flex h-12 rounded-lg overflow-hidden border border-border">
              <div style={{ backgroundColor: tintLight }} className="flex-1" />
              <div style={{ backgroundColor: hexColor }} className="flex-1" />
              <div style={{ backgroundColor: shadeDark }} className="flex-1" />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>{tintLight}</span>
              <span>{hexColor}</span>
              <span>{shadeDark}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
