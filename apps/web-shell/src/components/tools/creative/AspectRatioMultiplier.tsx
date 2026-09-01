"use client";

import { useState } from "react";
import { Maximize2, Copy, Check, Sparkles, Sliders, Layers } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SCALE_PRESETS = [0.25, 0.333, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0, 4.0];

export function AspectRatioMultiplier() {
  const [baseWidth, setBaseWidth] = useState<number>(1920);
  const [baseHeight, setBaseHeight] = useState<number>(1080);
  const [customScale, setCustomScale] = useState<number>(150); // 150%
  const [copied, setCopied] = useState<boolean>(false);

  // GCD for Aspect Ratio
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(Math.round(baseWidth), Math.round(baseHeight));
  const ratioW = divisor > 0 ? Math.round(baseWidth / divisor) : 16;
  const ratioH = divisor > 0 ? Math.round(baseHeight / divisor) : 9;

  const customW = Math.round(baseWidth * (customScale / 100));
  const customH = Math.round(baseHeight * (customScale / 100));
  const customMp = ((customW * customH) / 1000000).toFixed(2);

  const handleCopy = async () => {
    const lines = SCALE_PRESETS.map((scale) => {
      const w = Math.round(baseWidth * scale);
      const h = Math.round(baseHeight * scale);
      const mp = ((w * h) / 1000000).toFixed(2);
      return `• ${scale}x Scale: ${w} × ${h} px (${mp} MP)`;
    });
    const summary = `Aspect Ratio Scale Matrix (${baseWidth} × ${baseHeight} px @ ${ratioW}:${ratioH})\n\n${lines.join("\n")}\n\n• Custom ${customScale}%: ${customW} × ${customH} px (${customMp} MP)`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Base Resolution Input */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Base Original Resolution
          </label>
          <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
            Aspect Ratio: {ratioW}:{ratioH}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-muted-foreground block">Width (px)</label>
            <input
              type="number"
              min={1}
              value={baseWidth}
              onChange={(e) => setBaseWidth(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg"
            />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground block">Height (px)</label>
            <input
              type="number"
              min={1}
              value={baseHeight}
              onChange={(e) => setBaseHeight(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Custom Scale Slider */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-foreground uppercase tracking-wider">
            Custom Scale Multiplier ({customScale}%)
          </span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {customW} × {customH} px ({customMp} MP)
          </span>
        </div>
        <input
          type="range"
          min={10}
          max={500}
          step={5}
          value={customScale}
          onChange={(e) => setCustomScale(parseInt(e.target.value))}
          className="w-full accent-blue-600 cursor-pointer"
        />
      </div>

      {/* Preset Multipliers Matrix */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4 text-emerald-500" />
            Standard Scale Multiplier Matrix (Retina @2x, @3x, Downscales)
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied Matrix!" : "Copy All Scales"}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {SCALE_PRESETS.map((scale) => {
            const w = Math.round(baseWidth * scale);
            const h = Math.round(baseHeight * scale);
            const mp = ((w * h) / 1000000).toFixed(2);
            return (
              <div
                key={scale}
                className="p-3 bg-card rounded-xl border border-border space-y-1 hover:border-blue-500 transition-colors shadow-2xs"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
                    {scale}x
                  </span>
                  <span className="text-[10px] text-muted-foreground">{mp} MP</span>
                </div>
                <p className="text-sm font-mono font-bold text-foreground">{w} × {h}</p>
                <span className="text-[10px] text-muted-foreground font-mono block">
                  {scale === 1 ? "Original" : scale > 1 ? `+${((scale - 1) * 100).toFixed(0)}%` : `-${((1 - scale) * 100).toFixed(0)}%`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
