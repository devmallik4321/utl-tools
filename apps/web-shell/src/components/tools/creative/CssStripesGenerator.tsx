"use client";

import { useState } from "react";
import { Copy, Check, Sparkles, Sliders, Palette, LayoutGrid } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const PRESETS = [
  { name: "Hazard Caution", angle: 45, c1: "#facc15", c2: "#0f172a", w1: 20, w2: 20 },
  { name: "Candy Cane", angle: 45, c1: "#ef4444", c2: "#ffffff", w1: 25, w2: 25 },
  { name: "Tech Pinstripes", angle: 90, c1: "#1e293b", c2: "#0f172a", w1: 4, w2: 4 },
  { name: "Barcode / Zebra", angle: 0, c1: "#000000", c2: "#ffffff", w1: 15, w2: 15 },
  { name: "Soft Pastel Diagonal", angle: 135, c1: "#c084fc", c2: "#f472b6", w1: 30, w2: 30 },
];

export function CssStripesGenerator() {
  const [angle, setAngle] = useState<number>(45);
  const [color1, setColor1] = useState<string>("#facc15");
  const [color2, setColor2] = useState<string>("#0f172a");
  const [width1, setWidth1] = useState<number>(20);
  const [width2, setWidth2] = useState<number>(20);
  const [copied, setCopied] = useState<boolean>(false);

  const totalWidth = width1 + width2;
  const gradientRule = `repeating-linear-gradient(\n  ${angle}deg,\n  ${color1},\n  ${color1} ${width1}px,\n  ${color2} ${width1}px,\n  ${color2} ${totalWidth}px\n)`;
  const cssSnippet = `background: ${gradientRule};`;

  const applyPreset = (p: typeof PRESETS[0]) => {
    setAngle(p.angle);
    setColor1(p.c1);
    setColor2(p.c2);
    setWidth1(p.w1);
    setWidth2(p.w2);
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(cssSnippet);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => applyPreset(p)}
            className="px-3 py-1 bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-semibold text-foreground uppercase tracking-wider">Angle</label>
            <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{angle}°</span>
          </div>
          <input
            type="range"
            min={0}
            max={360}
            value={angle}
            onChange={(e) => setAngle(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Stripe 1 Color &amp; Width
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color1}
              onChange={(e) => setColor1(e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
            <input
              type="number"
              min={2}
              max={200}
              value={width1}
              onChange={(e) => setWidth1(Math.max(1, parseInt(e.target.value) || 20))}
              className="w-full px-2 py-1 text-xs font-mono font-bold bg-background border border-border rounded-lg"
            />
            <span className="text-xs text-muted-foreground font-mono">px</span>
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Stripe 2 Color &amp; Width
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color2}
              onChange={(e) => setColor2(e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
            <input
              type="number"
              min={2}
              max={200}
              value={width2}
              onChange={(e) => setWidth2(Math.max(1, parseInt(e.target.value) || 20))}
              className="w-full px-2 py-1 text-xs font-mono font-bold bg-background border border-border rounded-lg"
            />
            <span className="text-xs text-muted-foreground font-mono">px</span>
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2 flex flex-col justify-center">
          <span className="text-[10px] text-muted-foreground uppercase font-sans">Pattern Repeat Cycle</span>
          <span className="text-lg font-mono font-bold text-foreground">{totalWidth} px</span>
          <span className="text-[10px] text-muted-foreground">Seamless CSS repetition</span>
        </div>
      </div>

      {/* Live Preview Canvas */}
      <div
        style={{
          background: `repeating-linear-gradient(${angle}deg, ${color1}, ${color1} ${width1}px, ${color2} ${width1}px, ${color2} ${totalWidth}px)`,
        }}
        className="w-full h-48 border border-border rounded-2xl shadow-inner flex items-center justify-center"
      >
        <span className="px-4 py-1.5 bg-background/90 backdrop-blur-md rounded-xl text-xs font-bold font-mono text-foreground border border-border shadow-md">
          {angle}° Stripe Pattern ({totalWidth}px Cycle)
        </span>
      </div>

      {/* CSS Code Snippet */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <LayoutGrid className="w-4 h-4 text-emerald-500" />
            CSS `background: repeating-linear-gradient(...)`
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
          {cssSnippet}
        </pre>
      </div>
    </div>
  );
}
