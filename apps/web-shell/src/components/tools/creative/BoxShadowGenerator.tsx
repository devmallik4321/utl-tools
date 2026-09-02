"use client";

import { useState, useMemo } from "react";
import { Layers, Copy, Check, Sparkles, Sliders } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const PRESETS = [
  { name: "Subtle Card (1)", x: 0, y: 1, blur: 3, spread: 0, opacity: 0.1, inset: false },
  { name: "Elevated Drop (2)", x: 0, y: 4, blur: 6, spread: -1, opacity: 0.12, inset: false },
  { name: "Floating Modal (3)", x: 0, y: 10, blur: 15, spread: -3, opacity: 0.15, inset: false },
  { name: "Deep Popover (4)", x: 0, y: 20, blur: 25, spread: -5, opacity: 0.2, inset: false },
  { name: "Cyan Glow", x: 0, y: 0, blur: 20, spread: 2, opacity: 0.45, inset: false, color: "#06b6d4" },
  { name: "Soft Inset", x: 0, y: 2, blur: 4, spread: 0, opacity: 0.15, inset: true },
];

export function BoxShadowGenerator() {
  const [x, setX] = useState<number>(0);
  const [y, setY] = useState<number>(10);
  const [blur, setBlur] = useState<number>(15);
  const [spread, setSpread] = useState<number>(-3);
  const [color, setColor] = useState<string>("#000000");
  const [opacity, setOpacity] = useState<number>(0.15);
  const [isInset, setIsInset] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Convert hex color + opacity to rgba
  const rgbaString = useMemo(() => {
    let hex = color.replace("#", "");
    if (hex.length === 3) {
      hex = hex.split("").map((c) => c + c).join("");
    }
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${opacity.toFixed(2)})`;
  }, [color, opacity]);

  const cssBoxShadow = useMemo(() => {
    return `${isInset ? "inset " : ""}${x}px ${y}px ${blur}px ${spread}px ${rgbaString}`;
  }, [x, y, blur, spread, rgbaString, isInset]);

  const cssCode = `box-shadow: ${cssBoxShadow};\n-webkit-box-shadow: ${cssBoxShadow};`;

  const handleApplyPreset = (p: typeof PRESETS[0]) => {
    setX(p.x);
    setY(p.y);
    setBlur(p.blur);
    setSpread(p.spread);
    setOpacity(p.opacity);
    setIsInset(p.inset);
    if (p.color) setColor(p.color);
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(cssCode);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Presets Row */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => handleApplyPreset(p)}
            className="px-3 py-1 bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Interactive Visual Canvas */}
      <div className="p-12 bg-muted/40 border border-border rounded-2xl flex items-center justify-center min-h-[260px]">
        <div
          style={{
            boxShadow: cssBoxShadow,
          }}
          className="w-56 h-36 bg-card border border-border rounded-2xl flex flex-col items-center justify-center p-4 text-center transition-all duration-150"
        >
          <span className="text-xs font-bold text-foreground">Preview Element</span>
          <span className="text-[10px] text-muted-foreground font-mono pt-1">
            {x}px {y}px {blur}px {spread}px
          </span>
        </div>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-3 bg-card border border-border rounded-xl space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="font-semibold text-foreground">X Offset</span>
            <span className="font-mono">{x}px</span>
          </div>
          <input
            type="range"
            min={-50}
            max={50}
            value={x}
            onChange={(e) => setX(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-3 bg-card border border-border rounded-xl space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="font-semibold text-foreground">Y Offset</span>
            <span className="font-mono">{y}px</span>
          </div>
          <input
            type="range"
            min={-50}
            max={50}
            value={y}
            onChange={(e) => setY(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-3 bg-card border border-border rounded-xl space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="font-semibold text-foreground">Blur Radius</span>
            <span className="font-mono">{blur}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={blur}
            onChange={(e) => setBlur(Math.max(0, parseInt(e.target.value)))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-3 bg-card border border-border rounded-xl space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="font-semibold text-foreground">Spread Radius</span>
            <span className="font-mono">{spread}px</span>
          </div>
          <input
            type="range"
            min={-30}
            max={30}
            value={spread}
            onChange={(e) => setSpread(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-3 bg-card border border-border rounded-xl space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="font-semibold text-foreground">Opacity</span>
            <span className="font-mono">{Math.round(opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-3 bg-card border border-border rounded-xl flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground">Inset Shadow</span>
          <button
            onClick={() => setIsInset(!isInset)}
            className={`px-3 py-1 rounded-lg font-bold border transition-colors ${
              isInset ? "bg-blue-600 text-white border-blue-600" : "bg-background border-border text-foreground"
            }`}
          >
            {isInset ? "Active (Inset)" : "Disabled (Drop)"}
          </button>
        </div>
      </div>

      {/* Generated CSS Code */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-500" />
            CSS Box Shadow Rule
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy CSS"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {cssCode}
        </pre>
      </div>
    </div>
  );
}
