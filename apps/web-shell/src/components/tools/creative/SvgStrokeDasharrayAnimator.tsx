"use client";

import { useState, useMemo } from "react";
import { Sparkles, Copy, Check, Sliders, Play, RotateCcw, FileCode, Layers } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_PATHS = [
  { name: "Infinity Loop", path: "M 50 100 C 50 50, 150 50, 200 100 C 250 150, 350 150, 350 100 C 350 50, 250 50, 200 100 C 150 150, 50 150, 50 100 Z", approxLen: 850 },
  { name: "Checkmark", path: "M 40 100 L 90 150 L 220 50", approxLen: 230 },
  { name: "Heart", path: "M 200,100 A 45,45 0 0,0 110,100 A 45,45 0 0,0 20,100 Q 20,160 110,210 Q 200,160 200,100 Z", approxLen: 540 },
];

export function SvgStrokeDasharrayAnimator() {
  const [selectedPathIndex, setSelectedPathIndex] = useState<number>(0);
  const [customPath, setCustomPath] = useState<string>(SAMPLE_PATHS[0].path);
  const [pathLength, setPathLength] = useState<number>(SAMPLE_PATHS[0].approxLen);
  const [durationSec, setDurationSec] = useState<number>(2.5);
  const [strokeColor, setStrokeColor] = useState<string>("#3b82f6");
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [key, setKey] = useState<number>(0); // force replay
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { cssCode, svgSnippet } = useMemo(() => {
    const css = `@keyframes strokeDraw {
  0% {
    stroke-dashoffset: ${pathLength};
  }
  100% {
    stroke-dashoffset: 0;
  }
}

.animated-svg-path {
  stroke: ${strokeColor};
  stroke-width: ${strokeWidth}px;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
  stroke-dasharray: ${pathLength};
  stroke-dashoffset: ${pathLength};
  animation: strokeDraw ${durationSec}s cubic-bezier(0.65, 0, 0.35, 1) forwards;
}`;

    const svg = `<svg width="400" height="240" viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg">
  <path
    d="${customPath}"
    class="animated-svg-path"
  />
</svg>`;

    return { cssCode: css, svgSnippet: svg };
  }, [customPath, pathLength, durationSec, strokeColor, strokeWidth]);

  const handleCopy = async (k: string, val: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedKey(k);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {SAMPLE_PATHS.map((p, idx) => (
          <button
            key={p.name}
            onClick={() => {
              setSelectedPathIndex(idx);
              setCustomPath(p.path);
              setPathLength(p.approxLen);
              setKey((prev) => prev + 1);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
              selectedPathIndex === idx
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* SVG Path Input */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          SVG Path `d` Attribute
        </label>
        <textarea
          value={customPath}
          onChange={(e) => {
            setCustomPath(e.target.value);
            setKey((prev) => prev + 1);
          }}
          rows={2}
          className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Animation Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Path Length (px)
          </label>
          <input
            type="number"
            min={10}
            step={20}
            value={pathLength}
            onChange={(e) => {
              setPathLength(Math.max(10, parseInt(e.target.value) || 10));
              setKey((prev) => prev + 1);
            }}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Duration</span>
            <span className="font-mono">{durationSec}s</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={6.0}
            step={0.1}
            value={durationSec}
            onChange={(e) => {
              setDurationSec(parseFloat(e.target.value));
              setKey((prev) => prev + 1);
            }}
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
            min={1}
            max={12}
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Stroke Color
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
      </div>

      {/* Interactive Live Drawing Stage */}
      <div className="p-8 bg-slate-950 border border-border rounded-2xl flex flex-col items-center justify-center space-y-4">
        <div className="flex items-center justify-between w-full max-w-lg text-xs text-slate-400 font-mono">
          <span>Animation Preview (dasharray: {pathLength})</span>
          <button
            onClick={() => setKey((prev) => prev + 1)}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg inline-flex items-center gap-1.5 transition-colors font-sans font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay Animation</span>
          </button>
        </div>

        <div className="border border-slate-800 bg-slate-900 rounded-xl p-4 flex items-center justify-center">
          <svg key={key} width="360" height="200" viewBox="0 0 400 240">
            <style>
              {`
                @keyframes localDraw {
                  0% { stroke-dashoffset: ${pathLength}; }
                  100% { stroke-dashoffset: 0; }
                }
                .preview-path {
                  stroke: ${strokeColor};
                  stroke-width: ${strokeWidth}px;
                  stroke-linecap: round;
                  stroke-linejoin: round;
                  fill: none;
                  stroke-dasharray: ${pathLength};
                  stroke-dashoffset: ${pathLength};
                  animation: localDraw ${durationSec}s cubic-bezier(0.65, 0, 0.35, 1) forwards;
                }
              `}
            </style>
            <path d={customPath} className="preview-path" />
          </svg>
        </div>
      </div>

      {/* Code Snippets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-foreground">CSS Keyframes Snippet</span>
            <button
              onClick={() => handleCopy("css", cssCode)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "css" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "css" ? "Copied!" : "Copy CSS"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 rounded-lg text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
            {cssCode}
          </pre>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-foreground">SVG Element Markup</span>
            <button
              onClick={() => handleCopy("svg", svgSnippet)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "svg" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "svg" ? "Copied!" : "Copy SVG"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 rounded-lg text-blue-600 dark:text-blue-400 overflow-x-auto select-all">
            {svgSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
}
