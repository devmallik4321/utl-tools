"use client";

import { useState } from "react";
import { Monitor, Scale, Copy, Check, Sparkles, Sliders } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface ScreenSpecs {
  diagonal: number;
  ratioW: number;
  ratioH: number;
  resW: number;
  resH: number;
}

export function ScreenComparator() {
  const [screenA, setScreenA] = useState<ScreenSpecs>({ diagonal: 27, ratioW: 16, ratioH: 9, resW: 2560, resH: 1440 });
  const [screenB, setScreenB] = useState<ScreenSpecs>({ diagonal: 34, ratioW: 21, ratioH: 9, resW: 3440, resH: 1440 });
  const [copied, setCopied] = useState<boolean>(false);

  const calculateDims = (s: ScreenSpecs) => {
    // theta = atan(H / W)
    const angle = Math.atan(s.ratioH / s.ratioW);
    const widthInches = s.diagonal * Math.cos(angle);
    const heightInches = s.diagonal * Math.sin(angle);
    const areaSqIn = widthInches * heightInches;

    const widthCm = widthInches * 2.54;
    const heightCm = heightInches * 2.54;
    const areaSqCm = areaSqIn * 6.4516;

    // PPI = sqrt(w^2 + h^2) / diagonal
    const ppi = Math.sqrt(s.resW * s.resW + s.resH * s.resH) / s.diagonal;

    return {
      widthInches,
      heightInches,
      areaSqIn,
      widthCm,
      heightCm,
      areaSqCm,
      ppi,
    };
  };

  const dimA = calculateDims(screenA);
  const dimB = calculateDims(screenB);

  const areaDiffPct = ((dimB.areaSqIn - dimA.areaSqIn) / dimA.areaSqIn) * 100;
  const widthDiffPct = ((dimB.widthInches - dimA.widthInches) / dimA.widthInches) * 100;
  const heightDiffPct = ((dimB.heightInches - dimA.heightInches) / dimA.heightInches) * 100;

  const handleCopy = async () => {
    const summary = `Screen Dimension Comparison\n• Display A: ${screenA.diagonal}" (${screenA.ratioW}:${screenA.ratioH}) ➔ ${dimA.widthInches.toFixed(1)}" × ${dimA.heightInches.toFixed(1)}" (${dimA.areaSqIn.toFixed(0)} sq in, ${dimA.ppi.toFixed(0)} PPI)\n• Display B: ${screenB.diagonal}" (${screenB.ratioW}:${screenB.ratioH}) ➔ ${dimB.widthInches.toFixed(1)}" × ${dimB.heightInches.toFixed(1)}" (${dimB.areaSqIn.toFixed(0)} sq in, ${dimB.ppi.toFixed(0)} PPI)\n• Area Difference: Display B is ${Math.abs(areaDiffPct).toFixed(1)}% ${areaDiffPct >= 0 ? "larger" : "smaller"} than Display A`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Inputs for Both Displays */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Display A */}
        <div className="p-4 bg-card border-2 border-blue-500/30 rounded-xl space-y-3">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
            Display A (Reference Screen)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-muted-foreground block">Diagonal Size</label>
              <input
                type="number"
                value={screenA.diagonal}
                onChange={(e) => setScreenA({ ...screenA, diagonal: Math.max(1, parseFloat(e.target.value) || 1) })}
                className="w-full px-2.5 py-1.5 text-sm font-mono font-bold bg-background border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground block">Aspect Ratio</label>
              <select
                value={`${screenA.ratioW}:${screenA.ratioH}`}
                onChange={(e) => {
                  const [w, h] = e.target.value.split(":").map(Number);
                  setScreenA({ ...screenA, ratioW: w, ratioH: h });
                }}
                className="w-full px-2.5 py-1.5 text-xs font-bold bg-background border border-border rounded-lg"
              >
                <option value="16:9">16:9 Standard</option>
                <option value="16:10">16:10 Productivity</option>
                <option value="21:9">21:9 Ultrawide</option>
                <option value="32:9">32:9 Super Ultrawide</option>
                <option value="4:3">4:3 Retro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Display B */}
        <div className="p-4 bg-card border-2 border-purple-500/30 rounded-xl space-y-3">
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
            Display B (Comparison Screen)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-muted-foreground block">Diagonal Size</label>
              <input
                type="number"
                value={screenB.diagonal}
                onChange={(e) => setScreenB({ ...screenB, diagonal: Math.max(1, parseFloat(e.target.value) || 1) })}
                className="w-full px-2.5 py-1.5 text-sm font-mono font-bold bg-background border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground block">Aspect Ratio</label>
              <select
                value={`${screenB.ratioW}:${screenB.ratioH}`}
                onChange={(e) => {
                  const [w, h] = e.target.value.split(":").map(Number);
                  setScreenB({ ...screenB, ratioW: w, ratioH: h });
                }}
                className="w-full px-2.5 py-1.5 text-xs font-bold bg-background border border-border rounded-lg"
              >
                <option value="16:9">16:9 Standard</option>
                <option value="16:10">16:10 Productivity</option>
                <option value="21:9">21:9 Ultrawide</option>
                <option value="32:9">32:9 Super Ultrawide</option>
                <option value="4:3">4:3 Retro</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-emerald-500" />
            Physical Surface Area &amp; Dimension Delta
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Comparison"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Surface Area Difference</span>
            <p className={`text-2xl sm:text-3xl font-extrabold font-mono ${areaDiffPct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {areaDiffPct >= 0 ? "+" : ""}{areaDiffPct.toFixed(1)}%
            </p>
            <span className="text-[10px] text-muted-foreground">
              Display B is {Math.abs(dimB.areaSqIn - dimA.areaSqIn).toFixed(0)} sq in {areaDiffPct >= 0 ? "larger" : "smaller"}
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Horizontal Width Delta</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              {widthDiffPct >= 0 ? "+" : ""}{widthDiffPct.toFixed(1)}% <span className="text-xs font-normal text-muted-foreground">Width</span>
            </p>
            <span className="text-[10px] text-muted-foreground">
              {dimB.widthInches.toFixed(1)}" vs {dimA.widthInches.toFixed(1)}"
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Vertical Height Delta</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              {heightDiffPct >= 0 ? "+" : ""}{heightDiffPct.toFixed(1)}% <span className="text-xs font-normal text-muted-foreground">Height</span>
            </p>
            <span className="text-[10px] text-muted-foreground">
              {dimB.heightInches.toFixed(1)}" vs {dimA.heightInches.toFixed(1)}"
            </span>
          </div>
        </div>

        {/* Proportional Screen Silhouette Preview */}
        <div className="p-6 bg-background rounded-xl border border-border flex flex-col items-center justify-center min-h-[220px]">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 block">
            Scale Visual Overlay (Blue: Screen A, Purple: Screen B)
          </span>
          <div className="relative flex items-center justify-center" style={{ width: "340px", height: "160px" }}>
            {/* Screen A */}
            <div
              style={{
                width: `${dimA.widthInches * 9}px`,
                height: `${dimA.heightInches * 9}px`,
              }}
              className="absolute border-2 border-blue-500 bg-blue-500/10 rounded-sm flex items-center justify-center pointer-events-none"
            >
              <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-background/80 px-1 rounded">
                A ({screenA.diagonal}")
              </span>
            </div>

            {/* Screen B */}
            <div
              style={{
                width: `${dimB.widthInches * 9}px`,
                height: `${dimB.heightInches * 9}px`,
              }}
              className="absolute border-2 border-purple-500 bg-purple-500/10 rounded-sm flex items-center justify-center pointer-events-none"
            >
              <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400 bg-background/80 px-1 rounded">
                B ({screenB.diagonal}")
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
