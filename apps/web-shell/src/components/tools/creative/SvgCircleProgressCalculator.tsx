"use client";

import { useState, useMemo } from "react";
import { Sparkles, Copy, Check, Sliders, RotateCw, FileCode, Layers } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function SvgCircleProgressCalculator() {
  const [radius, setRadius] = useState<number>(60);
  const [strokeWidth, setStrokeWidth] = useState<number>(10);
  const [percentage, setPercentage] = useState<number>(72);
  const [strokeColor, setStrokeColor] = useState<string>("#3b82f6");
  const [trackColor, setTrackColor] = useState<string>("#1e293b");
  const [isRoundCap, setIsRoundCap] = useState<boolean>(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const {
    circumference,
    dashOffset,
    viewBoxSize,
    centerCoord,
    reactComponentCode,
    pureHtmlCode,
  } = useMemo(() => {
    const c = 2 * Math.PI * radius;
    const offset = c - (percentage / 100) * c;
    const size = (radius + strokeWidth) * 2;
    const center = size / 2;
    const cap = isRoundCap ? "round" : "butt";

    const reactCode = `// React SVG Circular Progress Ring Component
export function CircleProgress({ percentage = ${percentage} }: { percentage?: number }) {
  const radius = ${radius};
  const strokeWidth = ${strokeWidth};
  const circumference = 2 * Math.PI * radius; // ${c.toFixed(2)}px
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width="${size}"
        height="${size}"
        viewBox="0 0 ${size} ${size}"
        className="rotate-[-90deg]"
      >
        {/* Track Ring */}
        <circle
          cx="${center}"
          cy="${center}"
          r="${radius}"
          fill="transparent"
          stroke="${trackColor}"
          strokeWidth="${strokeWidth}"
        />
        {/* Animated Progress Ring */}
        <circle
          cx="${center}"
          cy="${center}"
          r="${radius}"
          fill="transparent"
          stroke="${strokeColor}"
          strokeWidth="${strokeWidth}"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="${cap}"
          className="transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <span className="absolute text-lg font-bold text-foreground">
        {Math.round(percentage)}%
      </span>
    </div>
  );
}`;

    const htmlCode = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform: rotate(-90deg);">
  <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="${trackColor}" stroke-width="${strokeWidth}"/>
  <circle
    cx="${center}"
    cy="${center}"
    r="${radius}"
    fill="none"
    stroke="${strokeColor}"
    stroke-width="${strokeWidth}"
    stroke-dasharray="${c.toFixed(2)}"
    stroke-dashoffset="${offset.toFixed(2)}"
    stroke-linecap="${cap}"
    style="transition: stroke-dashoffset 0.5s ease;"
  />
</svg>`;

    return {
      circumference: c.toFixed(2),
      dashOffset: offset.toFixed(2),
      viewBoxSize: size,
      centerCoord: center,
      reactComponentCode: reactCode,
      pureHtmlCode: htmlCode,
    };
  }, [radius, strokeWidth, percentage, strokeColor, trackColor, isRoundCap]);

  const handleCopy = async (key: string, val: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Progress Percentage</span>
            <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{percentage}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={percentage}
            onChange={(e) => setPercentage(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Radius (px)</span>
            <span className="font-mono">{radius}px</span>
          </div>
          <input
            type="range"
            min={20}
            max={120}
            step={5}
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Stroke Width</span>
            <span className="font-mono">{strokeWidth}px</span>
          </div>
          <input
            type="range"
            min={2}
            max={24}
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Progress Stroke Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
            <input
              type="text"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
              className="w-full px-2 py-1 font-mono text-xs bg-background border border-border rounded-lg"
            />
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Background Track Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={trackColor}
              onChange={(e) => setTrackColor(e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
            <input
              type="text"
              value={trackColor}
              onChange={(e) => setTrackColor(e.target.value)}
              className="w-full px-2 py-1 font-mono text-xs bg-background border border-border rounded-lg"
            />
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Line Cap Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsRoundCap(true)}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors ${
                isRoundCap ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
              }`}
            >
              Round Cap
            </button>
            <button
              onClick={() => setIsRoundCap(false)}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors ${
                !isRoundCap ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
              }`}
            >
              Butt Cap
            </button>
          </div>
        </div>
      </div>

      {/* Live Interactive Ring Preview */}
      <div className="p-8 bg-slate-950 border border-border rounded-2xl flex flex-col items-center justify-center space-y-4">
        <div className="text-xs text-slate-400 font-mono flex gap-4">
          <span>Circumference: {circumference}px</span>
          <span>Dashoffset: {dashOffset}px</span>
        </div>

        <div className="relative inline-flex items-center justify-center">
          <svg
            width={viewBoxSize}
            height={viewBoxSize}
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
            style={{ transform: "rotate(-90deg)" }}
          >
            <circle
              cx={centerCoord}
              cy={centerCoord}
              r={radius}
              fill="transparent"
              stroke={trackColor}
              strokeWidth={strokeWidth}
            />
            <circle
              cx={centerCoord}
              cy={centerCoord}
              r={radius}
              fill="transparent"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap={isRoundCap ? "round" : "butt"}
              style={{ transition: "stroke-dashoffset 0.4s ease-out" }}
            />
          </svg>
          <span className="absolute text-2xl font-black text-white font-mono">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Code Snippets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-foreground">React / Next.js Component</span>
            <button
              onClick={() => handleCopy("react", reactComponentCode)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "react" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "react" ? "Copied!" : "Copy React"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 rounded-lg text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all max-h-[300px]">
            {reactComponentCode}
          </pre>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-foreground">Inline SVG HTML Markup</span>
            <button
              onClick={() => handleCopy("html", pureHtmlCode)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "html" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "html" ? "Copied!" : "Copy HTML"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 rounded-lg text-blue-600 dark:text-blue-400 overflow-x-auto select-all max-h-[300px]">
            {pureHtmlCode}
          </pre>
        </div>
      </div>
    </div>
  );
}
