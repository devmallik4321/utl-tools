'use client';

import React, { useState, useEffect, useRef, useId } from 'react';
import {
  Compass,
  Move,
  RotateCcw,
  Copy,
  Check,
  Code,
  Info,
  Layers,
  Sliders
} from 'lucide-react';

interface HexCoordPreset {
  name: string;
  q1: number;
  r1: number;
  q2: number;
  r2: number;
}

const PRESETS: HexCoordPreset[] = [
  { name: 'Diagonal Cross-Map', q1: -3, r1: -1, q2: 3, r2: 2 },
  { name: 'Adjacent Neighbor Step', q1: 0, r1: 0, q2: 1, r2: 0 },
  { name: 'Pure Vertical Offset', q1: 0, r1: -3, q2: 0, r2: 3 },
  { name: 'Origin to Corner', q1: 0, r1: 0, q2: -4, r2: 4 },
];

export function HexCoordinateDistanceConverter() {
  const [q1, setQ1] = useState<number>(-2);
  const [r1, setR1] = useState<number>(-1);
  const [q2, setQ2] = useState<number>(2);
  const [r2, setR2] = useState<number>(2);
  const [activeCodeLang, setActiveCodeLang] = useState<'ts' | 'py' | 'gd'>('ts');
  const [copied, setCopied] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Cube coordinates: x = q, z = r, y = -x - z
  const cube1 = { x: q1, y: -q1 - r1, z: r1 };
  const cube2 = { x: q2, y: -q2 - r2, z: r2 };

  // Offset Coordinates (odd-r flat-topped)
  const offsetOddR1 = { col: q1 + (r1 - (r1 & 1)) / 2, row: r1 };
  const offsetOddR2 = { col: q2 + (r2 - (r2 & 1)) / 2, row: r2 };

  // Hex Step Distance (Manhattan on Hexagon)
  const hexDistance = (Math.abs(cube1.x - cube2.x) + Math.abs(cube1.y - cube2.y) + Math.abs(cube1.z - cube2.z)) / 2;

  // Euclidean pixel distance
  const hexRadius = 24;
  const hexToPixel = (q: number, r: number, ox: number, oy: number) => {
    const x = ox + hexRadius * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
    const y = oy + hexRadius * ((3 / 2) * r);
    return { x, y };
  };

  const euclideanDistancePx = Math.sqrt(
    Math.pow(hexRadius * Math.sqrt(3) * (q1 - q2 + (r1 - r2) / 2), 2) +
    Math.pow(hexRadius * 1.5 * (r1 - r2), 2)
  );

  // Draw Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const ox = width / 2;
    const oy = height / 2;

    ctx.clearRect(0, 0, width, height);

    const drawHex = (c: CanvasRenderingContext2D, cx: number, cy: number, size: number, fill: string, stroke: string, lw: number) => {
      c.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 180) * (60 * i + 30);
        const x = cx + size * Math.cos(angle);
        const y = cy + size * Math.sin(angle);
        if (i === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.closePath();
      c.fillStyle = fill;
      c.fill();
      c.strokeStyle = stroke;
      c.lineWidth = lw;
      c.stroke();
    };

    const maxR = 4;
    for (let q = -maxR; q <= maxR; q++) {
      const r_start = Math.max(-maxR, -q - maxR);
      const r_end = Math.min(maxR, -q + maxR);
      for (let r = r_start; r <= r_end; r++) {
        const { x, y } = hexToPixel(q, r, ox, oy);
        const isA = q === q1 && r === r1;
        const isB = q === q2 && r === r2;

        let fill = '#0f172a';
        let stroke = '#1e293b';
        let lw = 1;

        if (isA) {
          fill = 'rgba(56, 189, 248, 0.4)';
          stroke = '#38bdf8';
          lw = 2;
        } else if (isB) {
          fill = 'rgba(16, 185, 129, 0.4)';
          stroke = '#10b981';
          lw = 2;
        }

        drawHex(ctx, x, y, hexRadius - 1.5, fill, stroke, lw);

        ctx.font = '9px Inter, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isA || isB ? '#ffffff' : '#475569';
        ctx.fillText(isA ? 'A' : isB ? 'B' : `${q},${r}`, x, y);
      }
    }

    // Draw straight connecting line between A and B
    const ptA = hexToPixel(q1, r1, ox, oy);
    const ptB = hexToPixel(q2, r2, ox, oy);
    ctx.beginPath();
    ctx.moveTo(ptA.x, ptA.y);
    ctx.lineTo(ptB.x, ptB.y);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [q1, r1, q2, r2]);

  const getCodeSnippet = () => {
    switch (activeCodeLang) {
      case 'ts':
        return `// TypeScript / JavaScript Axial Hex Distance
export interface HexAxial { q: number; r: number; }

export function hexDistance(a: HexAxial, b: HexAxial): number {
  return (
    Math.abs(a.q - b.q) +
    Math.abs(a.q + a.r - b.q - b.r) +
    Math.abs(a.r - b.r)
  ) / 2;
}`;
      case 'py':
        return `# Python Axial Hex Distance
def hex_distance(q1: int, r1: int, q2: int, r2: int) -> int:
    return (abs(q1 - q2) + abs(q1 + r1 - q2 - r2) + abs(r1 - r2)) // 2`;
      case 'gd':
        return `# Godot 4 GDScript Hex Distance
func hex_distance(a: Vector2i, b: Vector2i) -> int:
    return (abs(a.x - b.x) + abs(a.x + a.y - b.x - b.y) + abs(a.y - b.y)) / 2`;
    }
  };

  const applyPreset = (p: HexCoordPreset) => {
    setQ1(p.q1);
    setR1(p.r1);
    setQ2(p.q2);
    setR2(p.r2);
  };

  return (
    <div className="space-y-8">
      {/* Header Presets */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Presets:</span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => applyPreset(p)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => applyPreset(PRESETS[0])}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Hex Step Distance</span>
          <div className="mt-1 text-2xl font-bold text-amber-400 tracking-tight">{hexDistance} Hex Steps</div>
          <div className="mt-1 text-xs text-slate-400">Manhattan tile transition count</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Euclidean Distance (World Units)</span>
          <div className="mt-1 text-2xl font-bold text-sky-400 tracking-tight font-mono">{euclideanDistancePx.toFixed(1)} px</div>
          <div className="mt-1 text-xs text-slate-400">Radius = 24px flat-topped</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Cubic Zero-Sum Invariant</span>
          <div className="mt-1 text-xl font-bold text-emerald-400 tracking-tight font-mono">
            {cube1.x + cube1.y + cube1.z === 0 && cube2.x + cube2.y + cube2.z === 0 ? 'x + y + z = 0 (Valid)' : 'Invalid'}
          </div>
          <div className="mt-1 text-xs text-slate-400">Pure 3D slice invariant</div>
        </div>
      </div>

      {/* Grid Canvas and Coordinate Conversion Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Canvas Display */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950 border border-slate-800 relative">
          <canvas ref={canvasRef} width={420} height={340} className="rounded-xl" />
          <div className="w-full flex items-center justify-between text-[11px] text-slate-400 mt-2 px-2">
            <span className="flex items-center gap-1.5 text-sky-400">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
              Point A: ({q1}, {r1})
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              Point B: ({q2}, {r2})
            </span>
          </div>
        </div>

        {/* Inputs & Coordinate Representations */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              Hex Endpoint Coordinates (Axial q, r)
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs font-semibold text-sky-400">Point A</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block font-mono">q</label>
                    <input
                      type="number"
                      min="-4"
                      max="4"
                      value={q1}
                      onChange={(e) => setQ1(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-xs text-white font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block font-mono">r</label>
                    <input
                      type="number"
                      min="-4"
                      max="4"
                      value={r1}
                      onChange={(e) => setR1(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-xs text-white font-mono text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs font-semibold text-emerald-400">Point B</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block font-mono">q</label>
                    <input
                      type="number"
                      min="-4"
                      max="4"
                      value={q2}
                      onChange={(e) => setQ2(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-xs text-white font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block font-mono">r</label>
                    <input
                      type="number"
                      min="-4"
                      max="4"
                      value={r2}
                      onChange={(e) => setR2(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-xs text-white font-mono text-center"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Equivalent Coordinate Formats Table */}
            <div className="rounded-xl border border-slate-800 overflow-hidden text-xs">
              <table className="w-full text-left font-mono">
                <thead className="bg-slate-800/80 text-slate-400 text-[10px] uppercase">
                  <tr>
                    <th className="p-2.5 font-sans">Coordinate System</th>
                    <th className="p-2.5 text-sky-400">Point A</th>
                    <th className="p-2.5 text-emerald-400">Point B</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-950 text-slate-300">
                  <tr>
                    <td className="p-2.5 font-sans">Axial (q, r)</td>
                    <td className="p-2.5">({q1}, {r1})</td>
                    <td className="p-2.5">({q2}, {r2})</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans">Cube (x, y, z)</td>
                    <td className="p-2.5">({cube1.x}, {cube1.y}, {cube1.z})</td>
                    <td className="p-2.5">({cube2.x}, {cube2.y}, {cube2.z})</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans">Offset (odd-r)</td>
                    <td className="p-2.5">col:{offsetOddR1.col}, row:{offsetOddR1.row}</td>
                    <td className="p-2.5">col:{offsetOddR2.col}, row:{offsetOddR2.row}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Code Export Tabs */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveCodeLang('ts')}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition ${
                activeCodeLang === 'ts' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              TypeScript / JS
            </button>
            <button
              onClick={() => setActiveCodeLang('py')}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition ${
                activeCodeLang === 'py' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Python
            </button>
            <button
              onClick={() => setActiveCodeLang('gd')}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition ${
                activeCodeLang === 'gd' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Godot GDScript
            </button>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(getCodeSnippet());
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Code'}
          </button>
        </div>
        <pre className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-200 overflow-x-auto border border-slate-800/80">
          <code>{getCodeSnippet()}</code>
        </pre>
      </div>

      {/* Technical Notes */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2 text-xs text-slate-400">
        <h4 className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-4 h-4 text-sky-400" />
          The Beauty of Cube Coordinates in Hex Grids
        </h4>
        <p>
          A regular hexagon grid is a 2D diagonal slice through a 3D cubic lattice where <code>x + y + z = 0</code>. In cube coordinates, distance between any two tiles is simply half the sum of the absolute coordinate differences, making line-drawing, rotation, reflection, and range algorithms trivial without complex trigonometry.
        </p>
      </div>
    </div>
  );
}

export default HexCoordinateDistanceConverter;
