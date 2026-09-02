"use client";

import { useState } from "react";
import { Monitor, Copy, Check, Sparkles, Smartphone, Layers } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function PixelDensityConverter() {
  const [pxVal, setPxVal] = useState<number>(24);
  const [baseRem, setBaseRem] = useState<number>(16);
  const [copied, setCopied] = useState<boolean>(false);

  const remVal = baseRem > 0 ? (pxVal / baseRem).toFixed(3) : "0";
  const ptVal = (pxVal * 0.75).toFixed(2);
  const dpVal = pxVal; // 1 CSS px = 1 dp at 160 dpi baseline

  const physical1x = pxVal * 1;
  const physical2x = pxVal * 2;
  const physical3x = pxVal * 3;
  const physical4x = pxVal * 4;

  const handleCopy = async () => {
    const summary = `Pixel Density Conversion (${pxVal}px @ ${baseRem}px root rem):\n• REM: ${remVal}rem\n• Points (pt): ${ptVal}pt\n• Android DP: ${dpVal}dp\n• @1x MDPI: ${physical1x}px\n• @2x Retina (XHDPI): ${physical2x}px\n• @3x Super Retina (XXHDPI): ${physical3x}px\n• @4x Ultra HD (XXXHDPI): ${physical4x}px`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              CSS Pixel Size (px)
            </label>
            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{pxVal}px</span>
          </div>
          <input
            type="number"
            min={1}
            max={1000}
            value={pxVal}
            onChange={(e) => setPxVal(Math.max(1, parseFloat(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <input
            type="range"
            min={1}
            max={200}
            value={pxVal}
            onChange={(e) => setPxVal(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Root Font Base Size (px)
          </label>
          <select
            value={baseRem}
            onChange={(e) => setBaseRem(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-sm font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={16}>16px (Browser Default / Tailwind)</option>
            <option value={14}>14px (Compact UI)</option>
            <option value={10}>10px (62.5% CSS trick)</option>
          </select>
          <span className="text-[10px] text-muted-foreground">Used for calculating rem units</span>
        </div>
      </div>

      {/* Unit Equivalents Grid */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-500" />
            CSS, iOS, Android &amp; Typography Equivalents
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Units"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              REM (Web Standard)
            </span>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{remVal}rem</p>
            <span className="text-[10px] text-muted-foreground font-sans">Relative to {baseRem}px root</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Points / PT (iOS / Print)
            </span>
            <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{ptVal}pt</p>
            <span className="text-[10px] text-muted-foreground font-sans">72 dpi print &amp; Figma pts</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              DP / DIP (Android)
            </span>
            <p className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">{dpVal}dp</p>
            <span className="text-[10px] text-muted-foreground font-sans">Density-independent pixel</span>
          </div>
        </div>

        {/* Physical Display Asset Densities */}
        <div className="space-y-2 pt-2 border-t border-border">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Physical Asset Export Scale (Icons &amp; Images)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-3 bg-card rounded-lg border border-border space-y-0.5">
              <span className="text-[10px] text-muted-foreground font-sans font-bold block">@1x STANDARD</span>
              <p className="text-base font-bold text-foreground">{physical1x}px</p>
              <span className="text-[10px] text-muted-foreground font-sans">MDPI standard display</span>
            </div>

            <div className="p-3 bg-card rounded-lg border border-border space-y-0.5">
              <span className="text-[10px] text-muted-foreground font-sans font-bold block">@2x RETINA</span>
              <p className="text-base font-bold text-blue-600 dark:text-blue-400">{physical2x}px</p>
              <span className="text-[10px] text-muted-foreground font-sans">XHDPI / iPhone standard</span>
            </div>

            <div className="p-3 bg-card rounded-lg border border-border space-y-0.5">
              <span className="text-[10px] text-muted-foreground font-sans font-bold block">@3x SUPER RETINA</span>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">{physical3x}px</p>
              <span className="text-[10px] text-muted-foreground font-sans">XXHDPI / iPhone Pro / OLED</span>
            </div>

            <div className="p-3 bg-card rounded-lg border border-border space-y-0.5">
              <span className="text-[10px] text-muted-foreground font-sans font-bold block">@4x ULTRA HD</span>
              <p className="text-base font-bold text-purple-600 dark:text-purple-400">{physical4x}px</p>
              <span className="text-[10px] text-muted-foreground font-sans">XXXHDPI 4K assets</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
