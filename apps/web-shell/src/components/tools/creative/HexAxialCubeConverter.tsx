"use client";

import { useState, useMemo } from "react";
import { Grid, Copy, Check, Sparkles, Layers, Gamepad2, ArrowRightLeft, FileCode } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function HexAxialCubeConverter() {
  const [q, setQ] = useState<number>(3);
  const [r, setR] = useState<number>(-2);
  const [targetQ, setTargetQ] = useState<number>(-1);
  const [targetR, setTargetR] = useState<number>(4);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const {
    cubeX,
    cubeY,
    cubeZ,
    distanceToTarget,
    neighbors,
    tsSnippet,
  } = useMemo(() => {
    // Invariant: x = q, z = r, y = -q - r
    const x = q;
    const z = r;
    const y = -x - z;

    // Target cube
    const tx = targetQ;
    const tz = targetR;
    const ty = -tx - tz;

    // Distance in cube coordinates
    const dist = Math.max(Math.abs(x - tx), Math.abs(y - ty), Math.abs(z - tz));

    // 6 neighbor directions in cube: (dx, dy, dz)
    const DIRS = [
      { name: "East (+q, 0)", dq: 1, dr: 0, dx: 1, dy: -1, dz: 0 },
      { name: "Northeast (+q, -r)", dq: 1, dr: -1, dx: 1, dy: 0, dz: -1 },
      { name: "Northwest (0, -r)", dq: 0, dr: -1, dx: 0, dy: 1, dz: -1 },
      { name: "West (-q, 0)", dq: -1, dr: 0, dx: -1, dy: 1, dz: 0 },
      { name: "Southwest (-q, +r)", dq: -1, dr: 1, dx: -1, dy: 0, dz: 1 },
      { name: "Southeast (0, +r)", dq: 0, dr: 1, dx: 0, dy: -1, dz: 1 },
    ];

    const neighborList = DIRS.map((d) => ({
      name: d.name,
      axial: `(${q + d.dq}, ${r + d.dr})`,
      cube: `(${x + d.dx}, ${y + d.dy}, ${z + d.dz})`,
    }));

    const ts = `// Hexagonal Tilemap Coordinate Math (Axial <-> Cube)
export interface AxialCoord { q: number; r: number; }
export interface CubeCoord { x: number; y: number; z: number; }

export function axialToCube(hex: AxialCoord): CubeCoord {
  const x = hex.q;
  const z = hex.r;
  const y = -x - z;
  return { x, y, z };
}

export function cubeToAxial(cube: CubeCoord): AxialCoord {
  return { q: cube.x, r: cube.z };
}

export function hexDistance(a: CubeCoord, b: CubeCoord): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.z - b.z));
}

export const CUBE_DIRECTIONS: CubeCoord[] = [
  { x: 1, y: -1, z: 0 }, { x: 1, y: 0, z: -1 }, { x: 0, y: 1, z: -1 },
  { x: -1, y: 1, z: 0 }, { x: -1, y: 0, z: 1 }, { x: 0, y: -1, z: 1 }
];

export function getHexNeighbor(cube: CubeCoord, directionIndex: number): CubeCoord {
  const d = CUBE_DIRECTIONS[directionIndex % 6];
  return { x: cube.x + d.x, y: cube.y + d.y, z: cube.z + d.z };
}`;

    return {
      cubeX: x,
      cubeY: y,
      cubeZ: z,
      distanceToTarget: dist,
      neighbors: neighborList,
      tsSnippet: ts,
    };
  }, [q, r, targetQ, targetR]);

  const handleCopy = async (key: string, val: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Hex Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-3">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
            Current Hex Origin (Axial Coordinates)
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase">Column (q)</span>
              <input
                type="number"
                value={q}
                onChange={(e) => setQ(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
              />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase">Row (r)</span>
              <input
                type="number"
                value={r}
                onChange={(e) => setR(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-3">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
            Target Destination Hex (Distance Measurement)
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase">Target (q)</span>
              <input
                type="number"
                value={targetQ}
                onChange={(e) => setTargetQ(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-blue-600 dark:text-blue-400"
              />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase">Target (r)</span>
              <input
                type="number"
                value={targetR}
                onChange={(e) => setTargetR(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-blue-600 dark:text-blue-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <ArrowRightLeft className="w-4 h-4 text-emerald-500" />
            Equivalent 3D Cube Coordinates &amp; Grid Distance
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border-2 border-emerald-500/40 space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase font-sans">
              3D Cube Vector
            </span>
            <p className="text-2xl font-extrabold text-foreground">
              ({cubeX}, {cubeY}, {cubeZ})
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">
              Invariant: {cubeX} + {cubeY} + {cubeZ} = 0
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Grid Tile Distance
            </span>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {distanceToTarget} steps
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">
              Steps to ({targetQ}, {targetR})
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Axial System
            </span>
            <p className="text-2xl font-bold text-foreground">
              ({q}, {r})
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">q = column, r = row</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Adjacent Neighbors
            </span>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">6 tiles</p>
            <span className="text-[10px] text-muted-foreground font-sans">Surrounding ring 1</span>
          </div>
        </div>
      </div>

      {/* Neighbor Ring Table */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <h5 className="text-xs font-bold text-foreground uppercase tracking-wider">
          6 Adjacent Neighbor Coordinates
        </h5>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 font-mono text-xs text-center">
          {neighbors.map((n, i) => (
            <div key={i} className="p-2.5 bg-muted/40 rounded-xl space-y-0.5 border border-border/50">
              <span className="text-muted-foreground text-[10px] font-sans font-semibold block">{n.name}</span>
              <p className="text-sm font-bold text-foreground">{n.axial}</p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono block">{n.cube}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Code Snippet */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between font-sans">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-emerald-500" />
            TypeScript Coordinate Math &amp; Distance Library
          </h4>
          <button
            onClick={() => handleCopy("ts", tsSnippet)}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copiedKey === "ts" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === "ts" ? "Copied!" : "Copy Code"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {tsSnippet}
        </pre>
      </div>
    </div>
  );
}
