"use client";

import { useState, useMemo } from "react";
import { Type, Copy, Check, Sparkles, Sliders, Monitor } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function FluidTypographyCalculator() {
  const [minViewport, setMinViewport] = useState<number>(375);
  const [maxViewport, setMaxViewport] = useState<number>(1280);
  const [minFontSize, setMinFontSize] = useState<number>(18);
  const [maxFontSize, setMaxFontSize] = useState<number>(36);
  const [rootFontSize, setRootFontSize] = useState<number>(16);
  const [testViewport, setTestViewport] = useState<number>(800);
  const [copied, setCopied] = useState<boolean>(false);

  const { clampRule, minRem, maxRem, slopeVw, interceptRem } = useMemo(() => {
    if (maxViewport <= minViewport || rootFontSize <= 0) {
      return { clampRule: "clamp(1rem, 2vw, 2rem);", minRem: "1rem", maxRem: "2rem", slopeVw: "2vw", interceptRem: "0rem" };
    }

    // slope = (maxFontSize - minFontSize) / (maxViewport - minViewport)
    const slope = (maxFontSize - minFontSize) / (maxViewport - minViewport);
    const slopeVwVal = (slope * 100).toFixed(4).replace(/\.?0+$/, "");
    const interceptPx = minFontSize - minViewport * slope;
    const interceptRemVal = (interceptPx / rootFontSize).toFixed(4).replace(/\.?0+$/, "");

    const minRemVal = (minFontSize / rootFontSize).toFixed(4).replace(/\.?0+$/, "");
    const maxRemVal = (maxFontSize / rootFontSize).toFixed(4).replace(/\.?0+$/, "");

    const rule = `font-size: clamp(${minRemVal}rem, ${interceptRemVal}rem + ${slopeVwVal}vw, ${maxRemVal}rem);`;

    return {
      clampRule: rule,
      minRem: `${minRemVal}rem`,
      maxRem: `${maxRemVal}rem`,
      slopeVw: `${slopeVwVal}vw`,
      interceptRem: `${interceptRemVal}rem`,
    };
  }, [minViewport, maxViewport, minFontSize, maxFontSize, rootFontSize]);

  // Interpolated test preview size in px
  const currentPreviewPx = useMemo(() => {
    if (testViewport <= minViewport) return minFontSize;
    if (testViewport >= maxViewport) return maxFontSize;
    const progress = (testViewport - minViewport) / (maxViewport - minViewport);
    return (minFontSize + progress * (maxFontSize - minFontSize)).toFixed(1);
  }, [testViewport, minViewport, maxViewport, minFontSize, maxFontSize]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(clampRule);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Min Screen (px)
          </label>
          <input
            type="number"
            min={320}
            value={minViewport}
            onChange={(e) => setMinViewport(Math.max(1, parseInt(e.target.value) || 320))}
            className="w-full px-3 py-2 text-sm font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Mobile viewport (e.g. 375px)</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Max Screen (px)
          </label>
          <input
            type="number"
            min={minViewport + 10}
            value={maxViewport}
            onChange={(e) => setMaxViewport(Math.max(minViewport + 1, parseInt(e.target.value) || 1280))}
            className="w-full px-3 py-2 text-sm font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Desktop viewport (e.g. 1280px)</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Min Font Size (px)
          </label>
          <input
            type="number"
            min={8}
            value={minFontSize}
            onChange={(e) => setMinFontSize(Math.max(1, parseInt(e.target.value) || 16))}
            className="w-full px-3 py-2 text-sm font-mono font-bold bg-background border border-border rounded-lg text-blue-600 dark:text-blue-400"
          />
          <span className="text-[10px] text-muted-foreground">Base mobile size</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Max Font Size (px)
          </label>
          <input
            type="number"
            min={minFontSize + 1}
            value={maxFontSize}
            onChange={(e) => setMaxFontSize(Math.max(minFontSize + 1, parseInt(e.target.value) || 32))}
            className="w-full px-3 py-2 text-sm font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
          <span className="text-[10px] text-muted-foreground">Desktop scale size</span>
        </div>
      </div>

      {/* Live Preview Canvas with Viewport Slider */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-4">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-foreground uppercase tracking-wider">
            Simulate Viewport Width: <span className="font-mono text-blue-600 dark:text-blue-400">{testViewport}px</span>
          </span>
          <span className="font-mono text-xs font-bold text-foreground">
            Computed Font Size: {currentPreviewPx}px
          </span>
        </div>
        <input
          type="range"
          min={320}
          max={1600}
          value={testViewport}
          onChange={(e) => setTestViewport(parseInt(e.target.value))}
          className="w-full accent-blue-600"
        />

        <div className="p-6 bg-muted/40 border border-border rounded-xl flex items-center justify-center min-h-[140px] overflow-hidden">
          <h2
            style={{ fontSize: `${currentPreviewPx}px`, lineHeight: 1.2 }}
            className="font-extrabold text-foreground text-center tracking-tight transition-all duration-75"
          >
            Smooth Fluid Typography
          </h2>
        </div>
      </div>

      {/* Generated CSS Rule */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Type className="w-4 h-4 text-emerald-500" />
            CSS `clamp(...)` Declaration
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
          {clampRule}
        </pre>
      </div>
    </div>
  );
}
