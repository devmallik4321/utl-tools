"use client";

import { useState, useMemo } from "react";
import { Box, Copy, Check, Sparkles, Sliders, Sun } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

type NeumorphShape = "flat" | "concave" | "convex" | "inset";

export function NeumorphismGenerator() {
  const [bgColor, setBgColor] = useState<string>("#e0e5ec");
  const [shape, setShape] = useState<NeumorphShape>("flat");
  const [size, setSize] = useState<number>(180);
  const [radius, setRadius] = useState<number>(30);
  const [distance, setDistance] = useState<number>(12);
  const [blur, setBlur] = useState<number>(24);
  const [copied, setCopied] = useState<boolean>(false);

  const { boxShadow, gradientBg, cssSnippet } = useMemo(() => {
    // Calculate light and dark shadow colors from bgColor
    let darkColor = "rgba(163, 177, 198, 0.6)";
    let lightColor = "rgba(255, 255, 255, 0.8)";

    if (bgColor.startsWith("#") && bgColor.length === 7) {
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);

      const darkR = Math.max(0, Math.round(r * 0.75));
      const darkG = Math.max(0, Math.round(g * 0.75));
      const darkB = Math.max(0, Math.round(b * 0.75));

      const lightR = Math.min(255, Math.round(r + (255 - r) * 0.7));
      const lightG = Math.min(255, Math.round(g + (255 - g) * 0.7));
      const lightB = Math.min(255, Math.round(b + (255 - b) * 0.7));

      darkColor = `rgb(${darkR}, ${darkG}, ${darkB})`;
      lightColor = `rgb(${lightR}, ${lightG}, ${lightB})`;
    }

    let shadow = "";
    let background = bgColor;

    if (shape === "flat") {
      shadow = `${distance}px ${distance}px ${blur}px ${darkColor}, -${distance}px -${distance}px ${blur}px ${lightColor}`;
    } else if (shape === "inset") {
      shadow = `inset ${distance}px ${distance}px ${blur}px ${darkColor}, inset -${distance}px -${distance}px ${blur}px ${lightColor}`;
    } else if (shape === "concave") {
      shadow = `${distance}px ${distance}px ${blur}px ${darkColor}, -${distance}px -${distance}px ${blur}px ${lightColor}`;
      background = `linear-gradient(145deg, ${darkColor}, ${lightColor})`;
    } else if (shape === "convex") {
      shadow = `${distance}px ${distance}px ${blur}px ${darkColor}, -${distance}px -${distance}px ${blur}px ${lightColor}`;
      background = `linear-gradient(145deg, ${lightColor}, ${darkColor})`;
    }

    const snippet = `/* Pure CSS Neumorphic Soft-UI */\n.neumorphic-card {\n  border-radius: ${radius}px;\n  background: ${background};\n  box-shadow: ${shadow};\n}`;

    return {
      boxShadow: shadow,
      gradientBg: background,
      cssSnippet: snippet,
    };
  }, [bgColor, shape, size, radius, distance, blur]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(cssSnippet);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Shape Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(["flat", "concave", "convex", "inset"] as NeumorphShape[]).map((s) => (
          <button
            key={s}
            onClick={() => setShape(s)}
            className={`px-3 py-2 text-xs font-bold rounded-xl border capitalize transition-colors ${
              shape === s ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            {s} Shape
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Base Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-9 h-9 rounded border border-border cursor-pointer"
            />
            <input
              type="text"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-full px-2 py-1 font-mono text-xs bg-background border border-border rounded-lg"
            />
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Distance: {distance}px
          </label>
          <input
            type="range"
            min={2}
            max={40}
            value={distance}
            onChange={(e) => setDistance(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Blur: {blur}px
          </label>
          <input
            type="range"
            min={4}
            max={80}
            value={blur}
            onChange={(e) => setBlur(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Radius: {radius}px
          </label>
          <input
            type="range"
            min={0}
            max={size / 2}
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>
      </div>

      {/* Live Preview Area */}
      <div
        style={{ backgroundColor: bgColor }}
        className="p-12 rounded-2xl border border-border flex items-center justify-center min-h-[260px] transition-colors"
      >
        <div
          style={{
            width: size,
            height: size,
            borderRadius: radius,
            background: gradientBg,
            boxShadow: boxShadow,
          }}
          className="flex items-center justify-center font-bold text-sm text-foreground/80 cursor-pointer select-none transition-all"
        >
          Soft UI
        </div>
      </div>

      {/* Generated CSS */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Box className="w-4 h-4 text-emerald-500" />
            CSS Neumorphic Shadow Rules
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
