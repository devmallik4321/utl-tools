"use client";

import { useState, useMemo } from "react";
import { Monitor, Copy, Check, Sparkles, Layers, Sliders } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const ASPECT_PRESETS = [
  { name: "21:9 Cinemascope (2.39:1)", w: 21, h: 9 },
  { name: "16:9 Standard HD/4K", w: 16, h: 9 },
  { name: "16:10 Laptop / iPad", w: 16, h: 10 },
  { name: "4:3 Classic TV / CRT", w: 4, h: 3 },
  { name: "1:1 Square (Instagram)", w: 1, h: 1 },
  { name: "9:16 Vertical (TikTok/Reels)", w: 9, h: 16 },
];

const DISPLAY_PRESETS = [
  { name: "16:9 Standard 1080p/4K Monitor", w: 16, h: 9 },
  { name: "21:9 Ultrawide Monitor", w: 21, h: 9 },
  { name: "4:3 Retro CRT Monitor", w: 4, h: 3 },
  { name: "19.5:9 Modern Smartphone", w: 19.5, h: 9 },
];

export function LetterboxPreviewer() {
  const [contentRatioIndex, setContentRatioIndex] = useState<number>(0); // 21:9
  const [displayRatioIndex, setDisplayRatioIndex] = useState<number>(0); // 16:9
  const [copied, setCopied] = useState<boolean>(false);

  const content = ASPECT_PRESETS[contentRatioIndex];
  const display = DISPLAY_PRESETS[displayRatioIndex];

  const contentRatio = content.w / content.h;
  const displayRatio = display.w / display.h;

  const barType = useMemo(() => {
    const diff = contentRatio - displayRatio;
    if (Math.abs(diff) < 0.02) return "none";
    if (contentRatio > displayRatio) return "letterbox"; // Horizontal black bars (top & bottom)
    return "pillarbox"; // Vertical black bars (left & right)
  }, [contentRatio, displayRatio]);

  // Screen Utilization Math
  const screenUtilizationPct = useMemo(() => {
    if (barType === "none") return 100;
    if (barType === "letterbox") {
      // Content width fills screen width; height is smaller
      return Math.round((displayRatio / contentRatio) * 100);
    } else {
      // Content height fills screen height; width is smaller
      return Math.round((contentRatio / displayRatio) * 100);
    }
  }, [barType, contentRatio, displayRatio]);

  const blackBarPct = 100 - screenUtilizationPct;

  const handleCopy = async () => {
    const summary = `Aspect Ratio Letterbox / Pillarbox Analysis\n• Content Video Ratio: ${content.name} (${content.w}:${content.h})\n• Display Screen Ratio: ${display.name} (${display.w}:${display.h})\n• Resulting Matte: ${barType === "none" ? "Perfect Fullscreen Fit" : barType === "letterbox" ? "Letterbox (Black bars Top & Bottom)" : "Pillarbox (Black bars Left & Right)"}\n• Active Video Area: ${screenUtilizationPct}% of screen\n• Black Bar Area: ${blackBarPct}% of screen`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            1. Source Content Video Ratio
          </label>
          <select
            value={contentRatioIndex}
            onChange={(e) => setContentRatioIndex(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-blue-600 dark:text-blue-400"
          >
            {ASPECT_PRESETS.map((p, idx) => (
              <option key={p.name} value={idx}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            2. Target Display Screen Ratio
          </label>
          <select
            value={displayRatioIndex}
            onChange={(e) => setDisplayRatioIndex(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          >
            {DISPLAY_PRESETS.map((p, idx) => (
              <option key={p.name} value={idx}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual Screen Simulator Canvas */}
      <div className="p-6 bg-muted/40 border border-border rounded-2xl flex flex-col items-center space-y-4">
        <div className="w-full flex justify-between items-center text-xs">
          <span className="font-bold uppercase text-foreground flex items-center gap-1.5">
            <Monitor className="w-4 h-4 text-blue-500" />
            Display Screen Simulation ({display.w}:{display.h})
          </span>
          <span className="font-mono text-muted-foreground">
            Active: <strong className="text-emerald-600 dark:text-emerald-400">{screenUtilizationPct}%</strong> | Bars: <strong className="text-rose-600 dark:text-rose-400">{blackBarPct}%</strong>
          </span>
        </div>

        {/* Screen Frame with Aspect-Ratio CSS Container */}
        <div className="w-full max-w-xl p-2 bg-slate-900 rounded-xl shadow-2xl border-4 border-slate-800">
          <div
            style={{ aspectRatio: `${display.w} / ${display.h}` }}
            className="w-full bg-black rounded-lg overflow-hidden flex items-center justify-center relative"
          >
            {/* Active Content Window */}
            <div
              style={{
                aspectRatio: `${content.w} / ${content.h}`,
                maxWidth: "100%",
                maxHeight: "100%",
              }}
              className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex flex-col items-center justify-center text-white text-center p-3 select-none"
            >
              <span className="text-xs font-bold tracking-wider uppercase drop-shadow-sm">
                {content.name}
              </span>
              <span className="text-[10px] opacity-80 font-mono">
                {contentRatio.toFixed(2)}:1 Content Stream
              </span>
            </div>
          </div>
        </div>

        <div className="text-center text-xs font-semibold text-muted-foreground pt-1">
          {barType === "none" && (
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              ✓ Fullscreen Native Fit — Zero Black Bars
            </span>
          )}
          {barType === "letterbox" && (
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              ⚠ Letterbox Display — Black Bars Top &amp; Bottom (Widescreen Video on Narrow Display)
            </span>
          )}
          {barType === "pillarbox" && (
            <span className="text-blue-600 dark:text-blue-400 font-bold">
              ⚠ Pillarbox Display — Black Bars Left &amp; Right (Narrow Video on Widescreen Display)
            </span>
          )}
        </div>
      </div>

      {/* Analysis Metrics */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground">Matte &amp; Screen Utilization Analysis</h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Report"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Matte Type</span>
            <p className="text-xl font-bold font-mono text-foreground capitalize">{barType}</p>
            <span className="text-[10px] text-muted-foreground">
              {barType === "letterbox" ? "Horizontal Bars" : barType === "pillarbox" ? "Vertical Bars" : "Zero Bars"}
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Active Video Area</span>
            <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {screenUtilizationPct}%
            </p>
            <span className="text-[10px] text-muted-foreground">Usable display screen area</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Wasted Black Bars</span>
            <p className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {blackBarPct}%
            </p>
            <span className="text-[10px] text-muted-foreground">Unused screen real estate</span>
          </div>
        </div>
      </div>
    </div>
  );
}
