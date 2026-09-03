"use client";

import { useState, useMemo } from "react";
import { Grid, Copy, Check, Sparkles, Navigation, Layers, FileCode } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function HexLineDrawingCalculator() {
  const [q1, setQ1] = useState<number>(0);
  const [r1, setR1] = useState<number>(0);
  const [q2, setQ2] = useState<number>(4);
  const [r2, setR2] = useState<number>(-2);
  const [nudgeTies, setNudgeTies] = useState<boolean>(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const {
    hexDistance,
    traversedTiles,
    tsCode,
  } = useMemo(() => {
    // Cube coordinates
    const a = { x: q1, z: r1, y: -q1 - r1 };
    const b = { x: q2, z: r2, y: -q2 - r2 };

    const dist = Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.z - b.z));

    const roundCube = (cx: number, cy: number, cz: number) => {
      let rx = Math.round(cx);
      let ry = Math.round(cy);
      let rz = Math.round(cz);

      const xDiff = Math.abs(rx - cx);
      const yDiff = Math.abs(ry - cy);
      const zDiff = Math.abs(rz - cz);

      if (xDiff > yDiff && xDiff > zDiff) {
        rx = -ry - rz;
      } else if (yDiff > zDiff) {
        ry = -rx - rz;
      } else {
        rz = -rx - ry;
      }
      return { q: rx, r: rz, cube: { x: rx, y: ry, z: rz } };
    };

    const results: { step: number; q: number; r: number; x: number; y: number; z: number }[] = [];

    // Nudge factor to prevent ambiguous boundary ties
    const nudge = nudgeTies ? 1e-6 : 0;
    const nudgedA = { x: a.x + 1e-6, y: a.y + 1e-6, z: a.z - 2e-6 };

    for (let i = 0; i <= dist; i++) {
      const t = dist === 0 ? 0 : i / dist;
      const curX = nudgedA.x + (b.x - nudgedA.x) * t;
      const curY = nudgedA.y + (b.y - nudgedA.y) * t;
      const curZ = nudgedA.z + (b.z - nudgedA.z) * t;

      const rounded = roundCube(curX, curY, curZ);
      results.push({
        step: i,
        q: rounded.q,
        r: rounded.r,
        x: rounded.cube.x,
        y: rounded.cube.y,
        z: rounded.cube.z,
      });
    }

    const code = `// Red Blob Games Hexagonal Line Drawing (LOS Raycasting)
export function hexLine(a: { q: number; r: number }, b: { q: number; r: number }) {
  const ax = a.q, az = a.r, ay = -a.q - a.r;
  const bx = b.q, bz = b.r, by = -b.q - b.r;
  const dist = Math.max(Math.abs(ax - bx), Math.abs(ay - by), Math.abs(az - bz));

  const results: { q: number; r: number }[] = [];
  // Small nudge to break boundary edge ties deterministically
  const nAx = ax + 1e-6, nAy = ay + 1e-6, nAz = az - 2e-6;

  for (let i = 0; i <= dist; i++) {
    const t = dist === 0 ? 0 : i / dist;
    const curX = nAx + (bx - nAx) * t;
    const curY = nAy + (by - nAy) * t;
    const curZ = nAz + (bz - nAz) * t;

    let rx = Math.round(curX);
    let ry = Math.round(curY);
    let rz = Math.round(curZ);

    const xDiff = Math.abs(rx - curX);
    const yDiff = Math.abs(ry - curY);
    const zDiff = Math.abs(rz - curZ);

    if (xDiff > yDiff && xDiff > zDiff) rx = -ry - rz;
    else if (yDiff > zDiff) ry = -rx - rz;
    else rz = -rx - ry;

    results.push({ q: rx, r: rz });
  }
  return results;
}`;

    return {
      hexDistance: dist,
      traversedTiles: results,
      tsCode: code,
    };
  }, [q1, r1, q2, r2, nudgeTies]);

  const handleCopy = async (key: string, val: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Start Hex Column (q1)
          </label>
          <input
            type="number"
            value={q1}
            onChange={(e) => setQ1(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Start Hex Row (r1)
          </label>
          <input
            type="number"
            value={r1}
            onChange={(e) => setR1(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Target Hex Column (q2)
          </label>
          <input
            type="number"
            value={q2}
            onChange={(e) => setQ2(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-blue-600 dark:text-blue-400"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Target Hex Row (r2)
          </label>
          <input
            type="number"
            value={r2}
            onChange={(e) => setR2(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-blue-600 dark:text-blue-400"
          />
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-emerald-500" />
            Hexagonal Line Trajectory ({hexDistance} Hex Steps)
          </h4>
          <button
            onClick={() =>
              handleCopy(
                "steps",
                traversedTiles.map((t) => `Step ${t.step}: (${t.q}, ${t.r}) [Cube: ${t.x}, ${t.y}, ${t.z}]`).join("\n")
              )
            }
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copiedKey === "steps" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === "steps" ? "Copied Steps!" : "Copy Hex Path"}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-sans">
                <th className="py-2.5 px-3">Step</th>
                <th className="py-2.5 px-3">Axial (q, r)</th>
                <th className="py-2.5 px-3">Cube (x, y, z)</th>
                <th className="py-2.5 px-3">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {traversedTiles.map((t) => (
                <tr key={t.step} className="hover:bg-muted/40">
                  <td className="py-2.5 px-3 font-bold">{t.step}</td>
                  <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-bold">
                    ({t.q}, {t.r})
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground">
                    ({t.x}, {t.y}, {t.z})
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-sans ${
                        t.step === 0
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                          : t.step === hexDistance
                          ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {t.step === 0 ? "Origin" : t.step === hexDistance ? "Destination" : "Path Step"}
                    </span>
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
            TypeScript Hexagonal Line Interpolation Function
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
