"use client";

import { useState, useMemo } from "react";
import { Maximize2, Copy, Check, Sparkles, Scale, Sliders } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SCALE_PRESETS = [25, 50, 75, 125, 150, 200, 300, 400];

export function ScaleFactorCalculator() {
  const [origWidth, setOrigWidth] = useState<number>(1920);
  const [origHeight, setOrigHeight] = useState<number>(1080);
  const [scalePct, setScalePct] = useState<number>(150);
  const [copied, setCopied] = useState<boolean>(false);

  const { scaledWidth, scaledHeight, origMegapixels, scaledMegapixels, cssTransform } = useMemo(() => {
    const factor = scalePct / 100;
    const w = Math.round(origWidth * factor);
    const h = Math.round(origHeight * factor);

    const origMp = (origWidth * origHeight) / 1e6;
    const scaledMp = (w * h) / 1e6;
    const css = `width: ${w}px;\nheight: ${h}px;\n/* or transform */\ntransform: scale(${factor.toFixed(2)});`;

    return {
      scaledWidth: w,
      scaledHeight: h,
      origMegapixels: origMp.toFixed(2),
      scaledMegapixels: scaledMp.toFixed(2),
      cssTransform: css,
    };
  }, [origWidth, origHeight, scalePct]);

  const handleCopy = async () => {
    const summary = `Scaled Dimensions (${scalePct}%):\n• New Dimensions: ${scaledWidth} × ${scaledHeight} px\n• Original: ${origWidth} × ${origHeight} px (${origMegapixels} MP ➔ ${scaledMegapixels} MP)`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Preset Scale Buttons */}
      <div className="flex flex-wrap gap-2">
        {SCALE_PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => setScalePct(p)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
              scalePct === p
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            {p}% ({p / 100}x)
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Original Width (px)
          </label>
          <input
            type="number"
            min={1}
            value={origWidth}
            onChange={(e) => setOrigWidth(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Original Height (px)
          </label>
          <input
            type="number"
            min={1}
            value={origHeight}
            onChange={(e) => setOrigHeight(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Scale Percentage (%)
          </label>
          <input
            type="number"
            min={1}
            max={2000}
            value={scalePct}
            onChange={(e) => setScalePct(Math.max(1, parseFloat(e.target.value) || 100))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-blue-600 dark:text-blue-400"
          />
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-emerald-500" />
            Scaled Proportional Dimensions ({scalePct}%)
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Dimensions"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Scaled Dimensions</span>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {scaledWidth} × {scaledHeight} px
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Perfect aspect ratio lock</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Resolution Capacity</span>
            <p className="text-2xl font-bold text-foreground">{scaledMegapixels} MP</p>
            <span className="text-[10px] text-muted-foreground font-sans">From original {origMegapixels} MP</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Scale Multiplier</span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{(scalePct / 100).toFixed(2)}x</p>
            <span className="text-[10px] text-muted-foreground font-sans">Proportional scaling</span>
          </div>
        </div>
      </div>
    </div>
  );
}
