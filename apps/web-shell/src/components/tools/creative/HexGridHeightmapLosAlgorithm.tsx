"use client";

import React, { useState, useMemo } from "react";
import { Mountain, Code2, Copy, Check, Eye, EyeOff, Sliders } from "lucide-react";

interface CubeCoord {
  q: number;
  r: number;
  s: number;
}

function cubeDistance(a: CubeCoord, b: CubeCoord): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.s - b.s)) / 2;
}

function cubeRound(fracQ: number, fracR: number, fracS: number): CubeCoord {
  let q = Math.round(fracQ);
  let r = Math.round(fracR);
  let s = Math.round(fracS);

  const qDiff = Math.abs(q - fracQ);
  const rDiff = Math.abs(r - fracR);
  const sDiff = Math.abs(s - fracS);

  if (qDiff > rDiff && qDiff > sDiff) q = -r - s;
  else if (rDiff > sDiff) r = -q - s;
  else s = -q - r;

  return { q, r, s };
}

function hexToPixel(q: number, r: number, size: number, originX: number, originY: number) {
  const x = size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r) + originX;
  const y = size * ((3 / 2) * r) + originY;
  return { x, y };
}

function getHexCornerPoints(centerX: number, centerY: number, size: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angleRad = ((60 * i - 30) * Math.PI) / 180;
    const x = centerX + size * Math.cos(angleRad);
    const y = centerY + size * Math.sin(angleRad);
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return points.join(" ");
}

export function HexGridHeightmapLosAlgorithm() {
  const gridRadius = 3;
  const [viewerHex, setViewerHex] = useState<CubeCoord>({ q: -2, r: 0, s: 2 });
  const [eyeHeight, setEyeHeight] = useState<number>(1.2); // observer eye level above terrain
  const [elevationMap, setElevationMap] = useState<Record<string, number>>({
    "0,0,0": 3,
    "0,-1,1": 2,
    "-1,0,1": 2,
    "1,0,-1": 1
  });
  const [mode, setMode] = useState<"SET_VIEWER" | "ELEVATE">("ELEVATE");
  const [copied, setCopied] = useState(false);

  // Generate grid
  const gridHexes = useMemo(() => {
    const list: CubeCoord[] = [];
    for (let q = -gridRadius; q <= gridRadius; q++) {
      const r1 = Math.max(-gridRadius, -q - gridRadius);
      const r2 = Math.min(gridRadius, -q + gridRadius);
      for (let r = r1; r <= r2; r++) {
        list.push({ q, r, s: -q - r });
      }
    }
    return list;
  }, [gridRadius]);

  // Compute 3D Visibility for every hex from viewer
  const visibilityMap = useMemo(() => {
    const visibleSet = new Set<string>();
    const vZ = (elevationMap[`${viewerHex.q},${viewerHex.r},${viewerHex.s}`] || 0) + eyeHeight;
    visibleSet.add(`${viewerHex.q},${viewerHex.r},${viewerHex.s}`);

    for (const target of gridHexes) {
      const key = `${target.q},${target.r},${target.s}`;
      if (target.q === viewerHex.q && target.r === viewerHex.r) continue;

      const dist = cubeDistance(viewerHex, target);
      let blocked = false;
      let maxSlope = -Infinity;

      // Nudged interpolation
      const oNudge = { q: viewerHex.q + 1e-6, r: viewerHex.r + 1e-6, s: viewerHex.s - 2e-6 };
      const tNudge = { q: target.q + 1e-6, r: target.r + 1e-6, s: target.s - 2e-6 };

      // Inspect intermediate hexes along ray
      for (let step = 1; step < dist; step++) {
        const t = step / dist;
        const interHex = cubeRound(
          oNudge.q + (tNudge.q - oNudge.q) * t,
          oNudge.r + (tNudge.r - oNudge.r) * t,
          oNudge.s + (tNudge.s - oNudge.s) * t
        );
        const interZ = elevationMap[`${interHex.q},${interHex.r},${interHex.s}`] || 0;
        const slope = (interZ - vZ) / step;

        if (slope > maxSlope) {
          maxSlope = slope;
        }
      }

      // Check target elevation slope
      const targetZ = elevationMap[key] || 0;
      const targetSlope = (targetZ - vZ) / dist;

      if (targetSlope >= maxSlope) {
        visibleSet.add(key);
      }
    }

    return visibleSet;
  }, [viewerHex, eyeHeight, elevationMap, gridHexes]);

  const handleHexClick = (hex: CubeCoord) => {
    const key = `${hex.q},${hex.r},${hex.s}`;
    if (mode === "SET_VIEWER") {
      setViewerHex(hex);
    } else {
      setElevationMap((prev) => {
        const current = prev[key] || 0;
        const next = (current + 1) % 4; // cycles 0 -> 1 -> 2 -> 3 -> 0
        return { ...prev, [key]: next };
      });
    }
  };

  const tsCode = `// 3D Hexagonal Heightmap Line-of-Sight (LOS) Algorithm
export interface CubeCoord { q: number; r: number; s: number; }

export function isHexVisible3D(
  viewer: CubeCoord,
  viewerEyeHeight: number,
  target: CubeCoord,
  getElevation: (c: CubeCoord) => number
): boolean {
  const dist = (Math.abs(viewer.q - target.q) + Math.abs(viewer.r - target.r) + Math.abs(viewer.s - target.s)) / 2;
  if (dist === 0) return true;

  const viewerZ = getElevation(viewer) + viewerEyeHeight;
  let maxSlope = -Infinity;

  const oNudge = { q: viewer.q + 1e-6, r: viewer.r + 1e-6, s: viewer.s - 2e-6 };
  const tNudge = { q: target.q + 1e-6, r: target.r + 1e-6, s: target.s - 2e-6 };

  for (let step = 1; step < dist; step++) {
    const t = step / dist;
    const inter = cubeRound(
      oNudge.q + (tNudge.q - oNudge.q) * t,
      oNudge.r + (tNudge.r - oNudge.r) * t,
      oNudge.s + (tNudge.s - oNudge.s) * t
    );
    const slope = (getElevation(inter) - viewerZ) / step;
    if (slope > maxSlope) maxSlope = slope;
  }

  const targetSlope = (getElevation(target) - viewerZ) / dist;
  return targetSlope >= maxSlope;
}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tsCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const svgSize = 340;
  const hexRadius = 24;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;

  // Elevation color map
  const getElevationColor = (z: number) => {
    switch (z) {
      case 3: return "#475569"; // high mountain
      case 2: return "#065f46"; // hill
      case 1: return "#047857"; // plateau
      default: return "#0f172a"; // valley / plain
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-200">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            3D Terrain Raycasting
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Slope Occlusion Math
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Mountain className="w-6 h-6 text-emerald-400" />
          Hex Grid 3D Elevation Heightmap Line-of-Sight Algorithm
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Calculate true 3D line-of-sight and terrain shadowcasting across variable elevation heightmaps. Hills, mountains, and towers cast dynamic occlusion shadows hiding lower ground.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Canvas (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Click Action:</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setMode("ELEVATE")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition ${
                    mode === "ELEVATE"
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  Raise Elevation (0-3)
                </button>
                <button
                  onClick={() => setMode("SET_VIEWER")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition ${
                    mode === "SET_VIEWER"
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800"
                  }`}
                >
                  Place Observer
                </button>
              </div>
            </div>

            {/* SVG Visualizer */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 flex items-center justify-center select-none">
              <svg width={svgSize} height={svgSize}>
                {gridHexes.map((hex) => {
                  const key = `${hex.q},${hex.r},${hex.s}`;
                  const { x, y } = hexToPixel(hex.q, hex.r, hexRadius, centerX, centerY);
                  const isViewer = hex.q === viewerHex.q && hex.r === viewerHex.r;
                  const isVisible = visibilityMap.has(key);
                  const elev = elevationMap[key] || 0;

                  const baseColor = getElevationColor(elev);
                  const strokeColor = isViewer ? "#3b82f6" : isVisible ? "#34d399" : "#f43f5e";

                  return (
                    <g key={key} onClick={() => handleHexClick(hex)} className="cursor-pointer group">
                      <polygon
                        points={getHexCornerPoints(x, y, hexRadius - 1.5)}
                        fill={isViewer ? "#2563eb" : baseColor}
                        stroke={strokeColor}
                        strokeWidth={isVisible ? "1.8" : "1"}
                        opacity={isVisible ? 1.0 : 0.4}
                        className="transition-all group-hover:stroke-indigo-400"
                      />
                      <text
                        x={x}
                        y={y + 3}
                        fontSize="9"
                        textAnchor="middle"
                        fill={isViewer ? "#ffffff" : isVisible ? "#f8fafc" : "#94a3b8"}
                        className="pointer-events-none font-mono font-bold"
                      >
                        {isViewer ? "OBS" : `Z:${elev}`}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Legend & Stats */}
            <div className="flex items-center justify-between text-xs px-1 text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-emerald-400" /> Visible: {visibilityMap.size}</span>
                <span className="flex items-center gap-1"><EyeOff className="w-3.5 h-3.5 text-rose-400" /> Hidden: {gridHexes.length - visibilityMap.size}</span>
              </div>
              <span className="font-mono text-[11px]">Observer Z: {(elevationMap[`${viewerHex.q},${viewerHex.r},${viewerHex.s}`] || 0) + eyeHeight}</span>
            </div>
          </div>
        </div>

        {/* Right Code Display (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-emerald-400" /> TypeScript 3D LOS Algorithm
              </span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded flex items-center gap-1 transition shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy TS Code"}
              </button>
            </div>
            <pre className="w-full bg-slate-950/90 font-mono text-xs text-slate-300 border border-slate-800 rounded-xl p-4 overflow-x-auto max-h-[380px] leading-relaxed shadow-inner">
              <code>{tsCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HexGridHeightmapLosAlgorithm;
