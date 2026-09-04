"use client";

import React, { useState, useMemo } from "react";
import { Compass, Code2, Copy, Check, RefreshCw, ShieldAlert, Eye } from "lucide-react";

interface CubeCoord {
  q: number;
  r: number;
  s: number;
}

// Cube rounding algorithm
function cubeRound(fracQ: number, fracR: number, fracS: number): CubeCoord {
  let q = Math.round(fracQ);
  let r = Math.round(fracR);
  let s = Math.round(fracS);

  const qDiff = Math.abs(q - fracQ);
  const rDiff = Math.abs(r - fracR);
  const sDiff = Math.abs(s - fracS);

  if (qDiff > rDiff && qDiff > sDiff) {
    q = -r - s;
  } else if (rDiff > sDiff) {
    r = -q - s;
  } else {
    s = -q - r;
  }

  return { q, r, s };
}

// Cube distance
function cubeDistance(a: CubeCoord, b: CubeCoord): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.s - b.s)) / 2;
}

// Lerp
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Line drawing using cube lerp
function cubeLinedraw(a: CubeCoord, b: CubeCoord): CubeCoord[] {
  const n = cubeDistance(a, b);
  const results: CubeCoord[] = [];
  // Nudge starting point slightly to prevent ambiguous rounding along hex edge boundaries
  const aNudged = { q: a.q + 1e-6, r: a.r + 1e-6, s: a.s - 2e-6 };
  const bNudged = { q: b.q + 1e-6, r: b.r + 1e-6, s: b.s - 2e-6 };

  for (let i = 0; i <= n; i++) {
    const t = n === 0 ? 0 : i / n;
    results.push(
      cubeRound(
        lerp(aNudged.q, bNudged.q, t),
        lerp(aNudged.r, bNudged.r, t),
        lerp(aNudged.s, bNudged.s, t)
      )
    );
  }
  return results;
}

// Convert cube to 2D pixel coordinates (Pointy-topped hex)
function hexToPixel(q: number, r: number, size: number, originX: number, originY: number) {
  const x = size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r) + originX;
  const y = size * ((3 / 2) * r) + originY;
  return { x, y };
}

// Generate pointy-topped polygon points string
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

export function HexGridRaycastingAlgorithm() {
  const [gridRadius] = useState<number>(3); // -3 to +3
  const [startHex, setStartHex] = useState<CubeCoord>({ q: -2, r: 1, s: 1 });
  const [targetHex, setTargetHex] = useState<CubeCoord>({ q: 2, r: -1, s: -1 });
  const [obstacles, setObstacles] = useState<string[]>(["0,0,0", "0,1,-1"]);
  const [selectionMode, setSelectionMode] = useState<"START" | "TARGET" | "OBSTACLE">("OBSTACLE");
  const [copied, setCopied] = useState(false);

  // Generate all grid hexes
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

  // Compute raycast
  const raycastResult = useMemo<{
    line: CubeCoord[];
    blocked: boolean;
    blockingHex: CubeCoord | null;
    visibleHexes: string[];
    obscuredHexes: string[];
    distance: number;
  }>(() => {
    const line = cubeLinedraw(startHex, targetHex);
    let blocked = false;
    let blockingHex: CubeCoord | null = null;
    const visibleHexes: string[] = [];
    const obscuredHexes: string[] = [];

    for (let idx = 0; idx < line.length; idx++) {
      const hex = line[idx];
      const key = `${hex.q},${hex.r},${hex.s}`;
      if (idx === 0) {
        visibleHexes.push(key);
        continue;
      }
      if (!blocked) {
        if (obstacles.includes(key)) {
          blocked = true;
          blockingHex = hex;
          obscuredHexes.push(key);
        } else {
          visibleHexes.push(key);
        }
      } else {
        obscuredHexes.push(key);
      }
    }

    return {
      line,
      blocked,
      blockingHex,
      visibleHexes,
      obscuredHexes,
      distance: cubeDistance(startHex, targetHex)
    };
  }, [startHex, targetHex, obstacles]);

  const handleHexClick = (coord: CubeCoord) => {
    const key = `${coord.q},${coord.r},${coord.s}`;
    if (selectionMode === "START") {
      setStartHex(coord);
    } else if (selectionMode === "TARGET") {
      setTargetHex(coord);
    } else {
      if (
        (coord.q === startHex.q && coord.r === startHex.r) ||
        (coord.q === targetHex.q && coord.r === targetHex.r)
      ) {
        return; // Don't turn start or target into obstacle directly
      }
      setObstacles((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      );
    }
  };

  const tsCode = `// Cube coordinate Line-of-Sight (LOS) & Raycasting algorithm
export interface CubeCoord { q: number; r: number; s: number; }

export function cubeDistance(a: CubeCoord, b: CubeCoord): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.s - b.s)) / 2;
}

export function cubeRound(fracQ: number, fracR: number, fracS: number): CubeCoord {
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

export function raycastLineOfSight(
  origin: CubeCoord,
  target: CubeCoord,
  isObstacle: (c: CubeCoord) => boolean
): { clear: boolean; path: CubeCoord[]; blockedAt: CubeCoord | null } {
  const dist = cubeDistance(origin, target);
  const path: CubeCoord[] = [];
  const oNudge = { q: origin.q + 1e-6, r: origin.r + 1e-6, s: origin.s - 2e-6 };
  const tNudge = { q: target.q + 1e-6, r: target.r + 1e-6, s: target.s - 2e-6 };

  for (let i = 0; i <= dist; i++) {
    const t = dist === 0 ? 0 : i / dist;
    const hex = cubeRound(
      oNudge.q + (tNudge.q - oNudge.q) * t,
      oNudge.r + (tNudge.r - oNudge.r) * t,
      oNudge.s + (tNudge.s - oNudge.s) * t
    );
    path.push(hex);
    if (i > 0 && isObstacle(hex)) {
      return { clear: false, path, blockedAt: hex };
    }
  }
  return { clear: true, path, blockedAt: null };
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

  const startPx = hexToPixel(startHex.q, startHex.r, hexRadius, centerX, centerY);
  const targetPx = hexToPixel(targetHex.q, targetHex.r, hexRadius, centerX, centerY);

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-200">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Cube Coordinates (q + r + s = 0)
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Nudge Interpolation Lerp
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Compass className="w-6 h-6 text-emerald-400" />
          Hex Grid Line-of-Sight & Raycasting Algorithm
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Interactive hexagonal grid raycasting simulator. Utilizes continuous cube coordinate linear interpolation with float nudging to prevent boundary rounding artifacts and compute line-of-sight obstruction.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Canvas (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Click Mode:</span>
              <div className="flex gap-1.5">
                {[
                  { id: "OBSTACLE", label: "Toggle Wall" },
                  { id: "START", label: "Set Origin" },
                  { id: "TARGET", label: "Set Target" }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectionMode(mode.id as any)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition ${
                      selectionMode === mode.id
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Visualizer */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 flex items-center justify-center overflow-hidden">
              <svg width={svgSize} height={svgSize} className="select-none">
                {/* Ray line */}
                <line
                  x1={startPx.x}
                  y1={startPx.y}
                  x2={targetPx.x}
                  y2={targetPx.y}
                  stroke={raycastResult.blocked ? "#f43f5e" : "#10b981"}
                  strokeWidth="2.5"
                  strokeDasharray={raycastResult.blocked ? "4 4" : undefined}
                  className="transition-all"
                />

                {/* Hexagons */}
                {gridHexes.map((hex) => {
                  const key = `${hex.q},${hex.r},${hex.s}`;
                  const { x, y } = hexToPixel(hex.q, hex.r, hexRadius, centerX, centerY);
                  const isStart = hex.q === startHex.q && hex.r === startHex.r;
                  const isTarget = hex.q === targetHex.q && hex.r === targetHex.r;
                  const isWall = obstacles.includes(key);
                  const isVisRay = raycastResult.visibleHexes.includes(key);
                  const isObsRay = raycastResult.obscuredHexes.includes(key);

                  let fillColor = "#0f172a";
                  let strokeColor = "#1e293b";

                  if (isStart) {
                    fillColor = "#3b82f6";
                    strokeColor = "#60a5fa";
                  } else if (isTarget) {
                    fillColor = "#10b981";
                    strokeColor = "#34d399";
                  } else if (isWall) {
                    fillColor = "#334155";
                    strokeColor = "#64748b";
                  } else if (isVisRay) {
                    fillColor = "#064e3b";
                    strokeColor = "#10b981";
                  } else if (isObsRay) {
                    fillColor = "#4c0519";
                    strokeColor = "#f43f5e";
                  }

                  return (
                    <g key={key} onClick={() => handleHexClick(hex)} className="cursor-pointer group">
                      <polygon
                        points={getHexCornerPoints(x, y, hexRadius - 1.5)}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth="1.5"
                        className="transition-colors group-hover:stroke-indigo-400"
                      />
                      <text
                        x={x}
                        y={y + 3}
                        fontSize="8"
                        textAnchor="middle"
                        fill={isStart || isTarget ? "#ffffff" : isWall ? "#94a3b8" : "#475569"}
                        className="pointer-events-none font-mono"
                      >
                        {isStart ? "O" : isTarget ? "T" : `${hex.q},${hex.r}`}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Status Feedback */}
            <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
              raycastResult.blocked
                ? "bg-rose-950/40 border-rose-800/50 text-rose-300"
                : "bg-emerald-950/40 border-emerald-800/50 text-emerald-300"
            }`}>
              <div className="flex items-center gap-2">
                {raycastResult.blocked ? <ShieldAlert className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="font-semibold">
                  {raycastResult.blocked
                    ? `Line of Sight BLOCKED at hex (${raycastResult.blockingHex?.q}, ${raycastResult.blockingHex?.r})`
                    : "Line of Sight CLEAR"}
                </span>
              </div>
              <span className="font-mono text-[11px] opacity-80">Distance: {raycastResult.distance} hexes</span>
            </div>
          </div>
        </div>

        {/* Right: Code & Controls (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-emerald-400" /> TypeScript Raycasting Implementation
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

export default HexGridRaycastingAlgorithm;
