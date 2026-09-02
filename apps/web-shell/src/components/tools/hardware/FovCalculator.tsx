"use client";

import { useState, useMemo } from "react";
import { Monitor, Copy, Check, Sparkles, Gamepad2 } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const ASPECT_RATIOS = [
  { name: "16:9 Standard Widescreen (1080p, 1440p, 4K)", w: 16, h: 9 },
  { name: "21:9 Ultrawide Monitor (3440×1440)", w: 21, h: 9 },
  { name: "32:9 Super Ultrawide (5120×1440)", w: 32, h: 9 },
  { name: "16:10 Laptop Display (1920×1200)", w: 16, h: 10 },
  { name: "4:3 Classic / Stretched (1280×960)", w: 4, h: 3 },
];

export function FovCalculator() {
  const [baseFov, setBaseFov] = useState<number>(90);
  const [fovType, setFovType] = useState<"horizontal" | "vertical">("horizontal");
  const [aspectIndex, setAspectIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const currentAspect = ASPECT_RATIOS[aspectIndex];
  const aspectMultiplier = currentAspect.w / currentAspect.h;

  const { hFov16_9, vFov, hFovCurrent, hFov21_9, hFov32_9 } = useMemo(() => {
    const deg2rad = Math.PI / 180;
    const rad2deg = 180 / Math.PI;

    let computedVFov = 0;

    if (fovType === "horizontal") {
      // Horizontal FOV is standardly measured at 16:9 or current aspect
      const baseRatio = aspectMultiplier;
      const hRad = baseFov * deg2rad;
      computedVFov = 2 * Math.atan(Math.tan(hRad / 2) / baseRatio) * rad2deg;
    } else {
      computedVFov = baseFov;
    }

    const vRad = computedVFov * deg2rad;

    const calcH = (ratio: number) => {
      return 2 * Math.atan(Math.tan(vRad / 2) * ratio) * rad2deg;
    };

    return {
      vFov: computedVFov,
      hFov16_9: calcH(16 / 9),
      hFovCurrent: calcH(aspectMultiplier),
      hFov21_9: calcH(21 / 9),
      hFov32_9: calcH(32 / 9),
    };
  }, [baseFov, fovType, aspectMultiplier]);

  const handleCopy = async () => {
    const summary = `Gaming FOV Conversion (${currentAspect.name})\n• Input FOV: ${baseFov}° (${fovType})\n• Vertical FOV (vFOV): ${vFov.toFixed(1)}°\n• 16:9 Horizontal FOV: ${hFov16_9.toFixed(1)}°\n• 21:9 Ultrawide FOV: ${hFov21_9.toFixed(1)}°\n• 32:9 Super Ultrawide FOV: ${hFov32_9.toFixed(1)}°`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Target FOV Angle (Degrees)
          </label>
          <input
            type="number"
            min={30}
            max={170}
            value={baseFov}
            onChange={(e) => setBaseFov(Math.max(30, Math.min(170, parseFloat(e.target.value) || 90)))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            FOV Measurement Axis
          </label>
          <select
            value={fovType}
            onChange={(e) => setFovType(e.target.value as any)}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value="horizontal">Horizontal FOV (Source Engine / CoD)</option>
            <option value="vertical">Vertical FOV (Overwatch / R6 Siege)</option>
          </select>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Monitor Display Aspect Ratio
          </label>
          <select
            value={aspectIndex}
            onChange={(e) => setAspectIndex(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            {ASPECT_RATIOS.map((a, idx) => (
              <option key={a.name} value={idx}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* FOV Results Cards */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Gamepad2 className="w-4 h-4 text-emerald-500" />
            Field of View Scaling Across Aspect Ratios
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy FOV Report"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              16:9 Standard hFOV
            </span>
            <p className="text-3xl font-extrabold text-foreground">{hFov16_9.toFixed(1)}°</p>
            <span className="text-[10px] text-muted-foreground font-sans">Standard 1080p / 1440p / 4K</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              21:9 Ultrawide hFOV
            </span>
            <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{hFov21_9.toFixed(1)}°</p>
            <span className="text-[10px] text-muted-foreground font-sans">Expanded peripheral view</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              32:9 Super Ultrawide
            </span>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{hFov32_9.toFixed(1)}°</p>
            <span className="text-[10px] text-muted-foreground font-sans">Dual 16:9 panoramic</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Vertical FOV (vFOV)
            </span>
            <p className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">{vFov.toFixed(1)}°</p>
            <span className="text-[10px] text-muted-foreground font-sans">Uniform vertical sightline</span>
          </div>
        </div>
      </div>
    </div>
  );
}
