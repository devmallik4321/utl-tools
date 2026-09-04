"use client";

import React, { useState, useMemo } from "react";
import { Radar, Download, Copy, Check, Plus, Trash2, RefreshCw, Layers, Sliders, Eye, Sparkles } from "lucide-react";

interface TargetContact {
  id: string;
  name: string;
  distancePercent: number; // 0 - 100% of radius
  angleDeg: number; // 0 - 360 deg
  type: "hostile" | "friendly" | "neutral" | "unidentified";
  speedKnots: number;
}

const COLOR_THEMES = {
  emerald: {
    name: "Tactical Emerald",
    primary: "#10b981",
    glow: "#059669",
    bg: "#022c22",
    blipHostile: "#ef4444",
    blipFriendly: "#10b981",
    blipNeutral: "#06b6d4"
  },
  cyan: {
    name: "Cyberpunk Cyan",
    primary: "#06b6d4",
    glow: "#0891b2",
    bg: "#083344",
    blipHostile: "#f43f5e",
    blipFriendly: "#06b6d4",
    blipNeutral: "#a855f7"
  },
  amber: {
    name: "Naval Amber",
    primary: "#f59e0b",
    glow: "#d97706",
    bg: "#451a03",
    blipHostile: "#ef4444",
    blipFriendly: "#3b82f6",
    blipNeutral: "#f59e0b"
  },
  crimson: {
    name: "Combat Crimson",
    primary: "#ef4444",
    glow: "#dc2626",
    bg: "#450a0a",
    blipHostile: "#fb7185",
    blipFriendly: "#10b981",
    blipNeutral: "#fbbf24"
  }
};

const INITIAL_TARGETS: TargetContact[] = [
  { id: "1", name: "BOGEY-01", distancePercent: 65, angleDeg: 42, type: "hostile", speedKnots: 450 },
  { id: "2", name: "VIPER-4", distancePercent: 35, angleDeg: 195, type: "friendly", speedKnots: 280 },
  { id: "3", name: "TR-882", distancePercent: 82, angleDeg: 310, type: "neutral", speedKnots: 190 },
  { id: "4", name: "GHOST-X", distancePercent: 50, angleDeg: 120, type: "unidentified", speedKnots: 620 }
];

export function SvgPolarRadarGenerator() {
  const [radarSize, setRadarSize] = useState<number>(500); // 500x500 px
  const [ringsCount, setRingsCount] = useState<number>(5);
  const [spokesCount, setSpokesCount] = useState<number>(12); // 12 spokes = every 30 deg
  const [themeKey, setThemeKey] = useState<keyof typeof COLOR_THEMES>("emerald");
  const [sweepActive, setSweepActive] = useState<boolean>(true);
  const [sweepSpeedSeconds, setSweepSpeedSeconds] = useState<number>(4);
  const [sweepTrailAngle, setSweepTrailAngle] = useState<number>(45); // angle in deg for sweep gradient trail
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showGridNumbers, setShowGridNumbers] = useState<boolean>(true);
  const [maxRangeNm, setMaxRangeNm] = useState<number>(100); // Nautical miles
  const [targets, setTargets] = useState<TargetContact[]>(INITIAL_TARGETS);

  const [copied, setCopied] = useState(false);

  const theme = COLOR_THEMES[themeKey];
  const center = radarSize / 2;
  const radius = (radarSize / 2) * 0.90; // margin for labels

  // Generate SVG Code string
  const svgMarkup = useMemo(() => {
    const ringRadii: number[] = [];
    for (let i = 1; i <= ringsCount; i++) {
      ringRadii.push((radius / ringsCount) * i);
    }

    const spokeAngles: number[] = [];
    for (let i = 0; i < spokesCount; i++) {
      spokeAngles.push((360 / spokesCount) * i);
    }

    // Rings SVG
    const ringsXml = ringRadii
      .map((r, idx) => {
        const nm = Math.round((maxRangeNm / ringsCount) * (idx + 1));
        const label = showGridNumbers ? `<text x="${center + 4}" y="${(center - r + 12).toFixed(1)}" fill="${theme.primary}" opacity="0.6" font-size="9" font-family="monospace">${nm}NM</text>` : "";
        return `  <circle cx="${center}" cy="${center}" r="${r.toFixed(1)}" stroke="${theme.primary}" stroke-width="1" fill="none" opacity="${(idx + 1) === ringsCount ? 0.8 : 0.3}" stroke-dasharray="${(idx + 1) === ringsCount ? "none" : "2,4"}" />\n  ${label}`;
      })
      .join("\n");

    // Spokes SVG
    const spokesXml = spokeAngles
      .map((deg) => {
        const rad = (deg - 90) * (Math.PI / 180);
        const x2 = center + radius * Math.cos(rad);
        const y2 = center + radius * Math.sin(rad);
        const lx = center + (radius + 14) * Math.cos(rad);
        const ly = center + (radius + 14) * Math.sin(rad);
        const labelText = showLabels ? `<text x="${lx.toFixed(1)}" y="${(ly + 3).toFixed(1)}" fill="${theme.primary}" opacity="0.7" font-size="9" font-family="monospace" text-anchor="middle">${deg}&#176;</text>` : "";
        return `  <line x1="${center}" y1="${center}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${theme.primary}" stroke-width="1" opacity="0.3" />\n  ${labelText}`;
      })
      .join("\n");

    // Targets SVG
    const targetsXml = targets
      .map((t) => {
        const rad = (t.angleDeg - 90) * (Math.PI / 180);
        const r = (t.distancePercent / 100) * radius;
        const tx = center + r * Math.cos(rad);
        const ty = center + r * Math.sin(rad);
        let color = theme.blipHostile;
        if (t.type === "friendly") color = theme.blipFriendly;
        if (t.type === "neutral") color = theme.blipNeutral;
        if (t.type === "unidentified") color = "#fbbf24";

        return `  <!-- Target: ${t.name} -->
  <g transform="translate(${tx.toFixed(1)}, ${ty.toFixed(1)})" class="radar-blip">
    <circle cx="0" cy="0" r="4" fill="${color}" />
    <circle cx="0" cy="0" r="10" stroke="${color}" stroke-width="1" fill="none" opacity="0.5" class="radar-ping" />
    <text x="8" y="3" fill="${color}" font-size="10" font-family="monospace" font-weight="bold">${t.name}</text>
    <text x="8" y="13" fill="${color}" opacity="0.7" font-size="8" font-family="monospace">${t.speedKnots}KT</text>
  </g>`;
      })
      .join("\n");

    // Sweep Beam SVG
    const sweepXml = sweepActive
      ? `  <!-- Rotating Radar Sweep Beam -->
  <g class="radar-sweep" transform-origin="${center} ${center}">
    <path d="M ${center} ${center} L ${center} ${(center - radius).toFixed(1)} A ${radius.toFixed(1)} ${radius.toFixed(1)} 0 0 0 ${(center - radius * Math.sin(sweepTrailAngle * Math.PI / 180)).toFixed(1)} ${(center - radius * Math.cos(sweepTrailAngle * Math.PI / 180)).toFixed(1)} Z" fill="url(#sweepGradient)" />
    <line x1="${center}" y1="${center}" x2="${center}" y2="${(center - radius).toFixed(1)}" stroke="${theme.primary}" stroke-width="2" />
  </g>`
      : "";

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${radarSize} ${radarSize}" width="100%" height="100%">
  <defs>
    <filter id="radar-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="glow" />
      <feMerge>
        <feMergeNode in="glow" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <linearGradient id="sweepGradient" gradientUnits="userSpaceOnUse" x1="${center}" y1="${center}" x2="${center - radius * 0.5}" y2="${center - radius}">
      <stop offset="0%" stop-color="${theme.primary}" stop-opacity="0.35" />
      <stop offset="100%" stop-color="${theme.primary}" stop-opacity="0.0" />
    </linearGradient>
    <radialGradient id="screenGradient" cx="50%" cy="50%" r="50%">
      <stop offset="60%" stop-color="${theme.bg}" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#020617" stop-opacity="0.98" />
    </radialGradient>
    <style>
      @keyframes radar-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes ping-fade {
        0% { r: 4px; opacity: 0.8; }
        100% { r: 16px; opacity: 0; }
      }
      .radar-sweep {
        animation: radar-spin ${sweepSpeedSeconds}s linear infinite;
      }
      .radar-ping {
        animation: ping-fade 2s cubic-bezier(0, 0.2, 0.8, 1) infinite;
        transform-origin: center;
      }
    </style>
  </defs>

  <!-- Radar Scope Display Base -->
  <rect width="${radarSize}" height="${radarSize}" fill="#020617" />
  <circle cx="${center}" cy="${center}" r="${radius.toFixed(1)}" fill="url(#screenGradient)" stroke="${theme.primary}" stroke-width="2" filter="url(#radar-glow)" />

  <!-- Range Rings -->
${ringsXml}

  <!-- Azimuth Radial Spokes -->
${spokesXml}

  <!-- Center Origin Marker -->
  <circle cx="${center}" cy="${center}" r="3" fill="${theme.primary}" />
  <circle cx="${center}" cy="${center}" r="8" stroke="${theme.primary}" stroke-width="1" fill="none" opacity="0.7" />

  <!-- Targets / Tactical Contacts -->
${targetsXml}

${sweepXml}
</svg>`;
  }, [radarSize, ringsCount, spokesCount, theme, sweepActive, sweepSpeedSeconds, sweepTrailAngle, showLabels, showGridNumbers, maxRangeNm, targets, center, radius]);

  const handleCopySvg = async () => {
    try {
      await navigator.clipboard.writeText(svgMarkup);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `polar-radar-${themeKey}-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const addRandomTarget = () => {
    const id = Date.now().toString();
    const names = ["EAGLE-9", "PHANTOM", "STRIKER", "CARGO-40", "VALKYRIE", "BANDIT-2"];
    const randomName = names[Math.floor(Math.random() * names.length)] + "-" + Math.floor(Math.random() * 90 + 10);
    const types: TargetContact["type"][] = ["hostile", "friendly", "neutral", "unidentified"];
    const randomType = types[Math.floor(Math.random() * types.length)];

    const newTarget: TargetContact = {
      id,
      name: randomName,
      distancePercent: Math.floor(Math.random() * 75 + 15),
      angleDeg: Math.floor(Math.random() * 360),
      type: randomType,
      speedKnots: Math.floor(Math.random() * 500 + 150)
    };

    setTargets((prev) => [...prev, newTarget]);
  };

  const removeTarget = (id: string) => {
    setTargets((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-slate-200">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Vector SVG &amp; Polar Projection
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            60 FPS CSS Keyframes
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          <Radar className="w-7 h-7 text-emerald-400" />
          SVG Polar Radar Target Sweep Generator
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2">
          Generate production-ready vector polar radar scopes with animated target sweep cones, azimuth spokes, range rings,
          tactical blip contacts, and embedded CSS keyframe animations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Radar Preview (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-2xl flex flex-col items-center justify-center min-h-[460px] relative overflow-hidden">
            <div className="w-full max-w-[440px] aspect-square flex items-center justify-center">
              <div
                className="w-full h-full"
                dangerouslySetInnerHTML={{ __html: svgMarkup }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>SVG Resolution: {radarSize}&times;{radarSize}px | {targets.length} Contacts</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopySvg}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied SVG" : "Copy SVG"}
              </button>
              <button
                type="button"
                onClick={handleDownloadSvg}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-900/20 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Download .svg
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Radar Configuration (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Theme & Scope Display Options */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-md space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Scope Settings
            </h2>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Color Palette</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(COLOR_THEMES) as Array<keyof typeof COLOR_THEMES>).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setThemeKey(key)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border text-left flex items-center gap-2 transition-all ${
                      themeKey === key
                        ? "bg-slate-800 border-emerald-500 text-white shadow-sm"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLOR_THEMES[key].primary }}
                    />
                    {COLOR_THEMES[key].name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Range Rings: {ringsCount}
                </label>
                <input
                  type="range"
                  min="2"
                  max="8"
                  value={ringsCount}
                  onChange={(e) => setRingsCount(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Radial Spokes: {spokesCount}
                </label>
                <input
                  type="range"
                  min="4"
                  max="24"
                  step="2"
                  value={spokesCount}
                  onChange={(e) => setSpokesCount(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="toggle-labels"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-950"
                />
                <label htmlFor="toggle-labels" className="text-xs text-slate-300">
                  Azimuth Labels (0&deg;-360&deg;)
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="toggle-numbers"
                  checked={showGridNumbers}
                  onChange={(e) => setShowGridNumbers(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-950"
                />
                <label htmlFor="toggle-numbers" className="text-xs text-slate-300">
                  Range Distances (NM)
                </label>
              </div>
            </div>
          </div>

          {/* Sweep Animation Settings */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-md space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Sweep Dynamics
            </h2>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Continuous Sweep Beam</div>
                <div className="text-[11px] text-slate-400">Rotates radar beam using CSS @keyframes</div>
              </div>
              <button
                type="button"
                onClick={() => setSweepActive(!sweepActive)}
                className={`w-11 h-6 flex items-center rounded-full p-1 duration-200 transition-colors ${
                  sweepActive ? "bg-emerald-500" : "bg-slate-700"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ${
                    sweepActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {sweepActive && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Sweep Speed ({sweepSpeedSeconds}s / rev)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={sweepSpeedSeconds}
                    onChange={(e) => setSweepSpeedSeconds(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Trail Width ({sweepTrailAngle}&deg;)
                  </label>
                  <input
                    type="range"
                    min="15"
                    max="75"
                    step="5"
                    value={sweepTrailAngle}
                    onChange={(e) => setSweepTrailAngle(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Radar Target Contacts */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Tactical Contacts ({targets.length})
              </h2>
              <button
                type="button"
                onClick={addRandomTarget}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-emerald-400 border border-slate-700 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Add Blip
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {targets.map((tgt) => (
                <div
                  key={tgt.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        tgt.type === "hostile"
                          ? "bg-red-500"
                          : tgt.type === "friendly"
                          ? "bg-emerald-400"
                          : tgt.type === "neutral"
                          ? "bg-cyan-400"
                          : "bg-amber-400"
                      }`}
                    />
                    <span className="font-mono font-bold text-white">{tgt.name}</span>
                    <span className="text-slate-500">
                      {tgt.distancePercent}% @ {tgt.angleDeg}&deg;
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTarget(tgt.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SvgPolarRadarGenerator;
