"use client";

import { useState, useMemo } from "react";
import { Grid, Copy, Check, Sparkles, Layers, FileCode, Disc } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

// 6 axial hex neighbor vectors
const HEX_DIRECTIONS = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
];

export function HexRingSpiralGenerator() {
  const [centerQ, setCenterQ] = useState<number>(0);
  const [centerR, setCenterR] = useState<number>(0);
  const [radius, setRadius] = useState<number>(2);
  const [mode, setMode] = useState<"ring" | "spiral">("spiral");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { tilesList, totalCount, tsCode } = useMemo(() => {
    const getRing = (cQ: number, cR: number, rad: number) => {
      if (rad === 0) {
        return [{ q: cQ, r: cR, x: cQ, y: -cQ - cR, z: cR, ring: 0 }];
      }
      const results: { q: number; r: number; x: number; y: number; z: number; ring: number }[] = [];
      // Start at direction 4 * rad
      let curQ = cQ + HEX_DIRECTIONS[4].q * rad;
      let curR = cR + HEX_DIRECTIONS[4].r * rad;

      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < rad; j++) {
          results.push({
            q: curQ,
            r: curR,
            x: curQ,
            y: -curQ - curR,
            z: curR,
            ring: rad,
          });
          curQ += HEX_DIRECTIONS[i].q;
          curR += HEX_DIRECTIONS[i].r;
        }
      }
      return results;
    };

    let list: { q: number; r: number; x: number; y: number; z: number; ring: number }[] = [];

    if (mode === "ring") {
      list = getRing(centerQ, centerR, radius);
    } else {
      for (let r = 0; r <= radius; r++) {
        list.push(...getRing(centerQ, centerR, r));
      }
    }

    const code = `// Red Blob Games Hexagonal Ring & Spiral Coordinate Generator
const HEX_DIRECTIONS = [
  { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
  { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
];

export function getHexRing(center: { q: number; r: number }, radius: number) {
  if (radius === 0) return [center];
  const results: { q: number; r: number }[] = [];
  let curQ = center.q + HEX_DIRECTIONS[4].q * radius;
  let curR = center.r + HEX_DIRECTIONS[4].r * radius;

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < radius; j++) {
      results.push({ q: curQ, r: curR });
      curQ += HEX_DIRECTIONS[i].q;
      curR += HEX_DIRECTIONS[i].r;
    }
  }
  return results;
}

export function getHexSpiral(center: { q: number; r: number }, radius: number) {
  const results: { q: number; r: number }[] = [];
  for (let r = 0; r <= radius; r++) {
    results.push(...getHexRing(center, r));
  }
  return results;
}`;

    return {
      tilesList: list,
      totalCount: list.length,
      tsCode: code,
    };
  }, [centerQ, centerR, radius, mode]);

  const handleCopy = async (key: string, val: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode & Radius Picker */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setMode("spiral")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
              mode === "spiral" ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            Full Spiral Area-of-Effect (Radius 0 to {radius})
          </button>
          <button
            onClick={() => setMode("ring")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
              mode === "ring" ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            Perimeter Ring Only (Radius {radius})
          </button>
        </div>

        <span className="text-xs font-mono text-muted-foreground">
          Total Generated: <strong className="text-foreground">{totalCount}</strong> Hex Tiles
        </span>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Center Column (q0)
          </label>
          <input
            type="number"
            value={centerQ}
            onChange={(e) => setCenterQ(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Center Row (r0)
          </label>
          <input
            type="number"
            value={centerR}
            onChange={(e) => setCenterR(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Radius (R)</span>
            <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{radius}</span>
          </div>
          <input
            type="range"
            min={0}
            max={6}
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value) || 0)}
            className="w-full accent-blue-600"
          />
        </div>
      </div>

      {/* Traversed Tiles Table */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Disc className="w-4 h-4 text-emerald-500" />
            Generated {mode === "spiral" ? "Spiral AoE" : "Perimeter Ring"} Coordinates
          </h4>
          <button
            onClick={() =>
              handleCopy(
                "coords",
                tilesList.map((t, idx) => `#${idx + 1}: (${t.q}, ${t.r}) [Cube: ${t.x}, ${t.y}, ${t.z}] (Ring ${t.ring})`).join("\n")
              )
            }
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copiedKey === "coords" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === "coords" ? "Copied All!" : "Copy Coordinates"}</span>
          </button>
        </div>

        <div className="overflow-x-auto max-h-[300px]">
          <table className="w-full text-xs font-mono text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-sans sticky top-0 bg-muted">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Ring</th>
                <th className="py-2.5 px-3">Axial (q, r)</th>
                <th className="py-2.5 px-3">Cube (x, y, z)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tilesList.map((t, idx) => (
                <tr key={idx} className="hover:bg-muted/40">
                  <td className="py-2 px-3 font-bold">{idx + 1}</td>
                  <td className="py-2 px-3 text-muted-foreground">Ring {t.ring}</td>
                  <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400 font-bold">
                    ({t.q}, {t.r})
                  </td>
                  <td className="py-2 px-3 text-foreground">
                    ({t.x}, {t.y}, {t.z})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Snippet */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between font-sans">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-emerald-500" />
            TypeScript Hex Ring &amp; Spiral Algorithms
          </h4>
          <button
            onClick={() => handleCopy("ts", tsCode)}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copiedKey === "ts" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === "ts" ? "Copied!" : "Copy Code"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {tsCode}
        </pre>
      </div>
    </div>
  );
}
