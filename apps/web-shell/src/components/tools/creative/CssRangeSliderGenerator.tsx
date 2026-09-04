"use client";

import { useState, useMemo } from "react";
import { Sparkles, Copy, Check, Sliders, FileCode, Layers } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function CssRangeSliderGenerator() {
  const [trackHeight, setTrackHeight] = useState<number>(8); // px
  const [trackColor, setTrackColor] = useState<string>("#1e293b");
  const [fillColor, setFillColor] = useState<string>("#3b82f6");
  const [thumbSize, setThumbSize] = useState<number>(22); // px
  const [thumbColor, setThumbColor] = useState<string>("#ffffff");
  const [borderRadius, setBorderRadius] = useState<number>(9999);
  const [currentVal, setCurrentVal] = useState<number>(65);
  const [copied, setCopied] = useState<boolean>(false);

  const { fullCss, fullHtml } = useMemo(() => {
    const thumbMargin = -(thumbSize / 2 - trackHeight / 2);

    const css = `/* Cross-Browser Custom Range Slider (WebKit & Firefox) */
.custom-range-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: ${trackHeight}px;
  background: linear-gradient(to right, ${fillColor} 0%, ${fillColor} var(--val, ${currentVal}%), ${trackColor} var(--val, ${currentVal}%), ${trackColor} 100%);
  border-radius: ${borderRadius}px;
  outline: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

/* WebKit (Chrome, Safari, Edge) Track & Thumb */
.custom-range-slider::-webkit-slider-runnable-track {
  height: ${trackHeight}px;
  border-radius: ${borderRadius}px;
}

.custom-range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: ${thumbSize}px;
  height: ${thumbSize}px;
  border-radius: 50%;
  background: ${thumbColor};
  cursor: pointer;
  margin-top: ${thumbMargin}px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.custom-range-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.25);
}

/* Firefox Track & Thumb */
.custom-range-slider::-moz-range-track {
  height: ${trackHeight}px;
  background-color: ${trackColor};
  border-radius: ${borderRadius}px;
}

.custom-range-slider::-moz-range-thumb {
  width: ${thumbSize}px;
  height: ${thumbSize}px;
  border: none;
  border-radius: 50%;
  background: ${thumbColor};
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.custom-range-slider::-moz-range-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.25);
}`;

    const html = `<input 
  type="range" 
  min="0" 
  max="100" 
  value="${currentVal}" 
  style="--val: ${currentVal}%;" 
  class="custom-range-slider" 
  oninput="this.style.setProperty('--val', this.value + '%')" 
/>`;

    return { fullCss: css, fullHtml: html };
  }, [trackHeight, trackColor, fillColor, thumbSize, thumbColor, borderRadius, currentVal]);

  const handleCopy = async () => {
    const combined = `${fullHtml}\n\n<style>\n${fullCss}\n</style>`;
    const ok = await copyToClipboard(combined);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Track Height</span>
            <span className="font-mono">{trackHeight}px</span>
          </div>
          <input
            type="range"
            min={4}
            max={20}
            value={trackHeight}
            onChange={(e) => setTrackHeight(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Thumb Size</span>
            <span className="font-mono">{thumbSize}px</span>
          </div>
          <input
            type="range"
            min={14}
            max={36}
            value={thumbSize}
            onChange={(e) => setThumbSize(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Progress Fill Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={fillColor}
              onChange={(e) => setFillColor(e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
            <input
              type="text"
              value={fillColor}
              onChange={(e) => setFillColor(e.target.value)}
              className="w-full px-2 py-1 font-mono text-xs bg-background border border-border rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Track Background Color
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
            Knob Thumb Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={thumbColor}
              onChange={(e) => setThumbColor(e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
            <input
              type="text"
              value={thumbColor}
              onChange={(e) => setThumbColor(e.target.value)}
              className="w-full px-2 py-1 font-mono text-xs bg-background border border-border rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Live Interactive Preview */}
      <div className="p-8 bg-slate-950 border border-border rounded-2xl flex flex-col items-center justify-center space-y-4">
        <div className="flex items-center justify-between w-full max-w-md text-xs font-mono text-slate-400">
          <span>Live Interactive Preview</span>
          <span className="font-bold text-white text-sm">{currentVal}%</span>
        </div>

        <div className="w-full max-w-md">
          <input
            type="range"
            min={0}
            max={100}
            value={currentVal}
            onChange={(e) => setCurrentVal(parseInt(e.target.value))}
            style={
              {
                background: `linear-gradient(to right, ${fillColor} 0%, ${fillColor} ${currentVal}%, ${trackColor} ${currentVal}%, ${trackColor} 100%)`,
                height: `${trackHeight}px`,
                borderRadius: `${borderRadius}px`,
              } as React.CSSProperties
            }
            className="w-full appearance-none cursor-pointer outline-none rounded-full"
          />
        </div>
      </div>

      {/* Code Snippets */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between font-sans">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-emerald-500" />
            Cross-Browser Range Slider CSS &amp; HTML Export
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied All!" : "Copy Code"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {`${fullHtml}\n\n<style>\n${fullCss}\n</style>`}
        </pre>
      </div>
    </div>
  );
}
