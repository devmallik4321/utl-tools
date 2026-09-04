'use client';

import React, { useState, useId } from 'react';
import {
  Maximize2,
  RotateCw,
  Move,
  Layers,
  Copy,
  Check,
  RotateCcw,
  Code,
  Info,
  Sliders
} from 'lucide-react';

interface MatrixPreset {
  name: string;
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
  description: string;
}

const PRESETS: MatrixPreset[] = [
  {
    name: 'Identity Matrix (No Transform)',
    a: 1,
    b: 0,
    c: 0,
    d: 1,
    e: 0,
    f: 0,
    description: 'Default unit matrix without any distortion or offset.',
  },
  {
    name: 'Isometric 2.5D Projection',
    a: 0.866,
    b: 0.5,
    c: -0.866,
    d: 0.5,
    e: 0,
    f: 0,
    description: 'Classic dimetric/isometric game grid projection.',
  },
  {
    name: '45° Clockwise Rotation',
    a: 0.707,
    b: 0.707,
    c: -0.707,
    d: 0.707,
    e: 0,
    f: 0,
    description: 'Rigid body rotation preserving Euclidean distances.',
  },
  {
    name: 'Horizontal Italic Shear',
    a: 1,
    b: 0,
    c: -0.364,
    d: 1,
    e: 0,
    f: 0,
    description: 'Shears geometry along X axis at -20 degrees.',
  },
  {
    name: 'Vertical Flip & Scale 1.5x',
    a: 1.5,
    b: 0,
    c: 0,
    d: -1.5,
    e: 0,
    f: 0,
    description: 'Inverts Y axis (reflection) with 150% magnification.',
  },
];

export function SvgMatrixTransformVisualizer() {
  const [a, setA] = useState<number>(1);
  const [b, setB] = useState<number>(0);
  const [c, setC] = useState<number>(0);
  const [d, setD] = useState<number>(1);
  const [e, setE] = useState<number>(0);
  const [f, setF] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  // Determinant: ad - bc
  const det = a * d - b * c;
  const isInvertible = Math.abs(det) > 1e-6;

  const matrixString = `matrix(${a.toFixed(3)}, ${b.toFixed(3)}, ${c.toFixed(3)}, ${d.toFixed(3)}, ${e.toFixed(1)}, ${f.toFixed(1)})`;
  const svgTransformAttr = `transform="${matrixString}"`;
  const cssTransformProp = `transform: ${matrixString};`;

  const applyPreset = (p: MatrixPreset) => {
    setA(p.a);
    setB(p.b);
    setC(p.c);
    setD(p.d);
    setE(p.e);
    setF(p.f);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(svgTransformAttr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Unit square corners around origin (-40, -40) to (40, 40)
  const basePoints = [
    { x: -40, y: -40 },
    { x: 40, y: -40 },
    { x: 40, y: 40 },
    { x: -40, y: 40 },
  ];

  // Transform points by matrix [a c e; b d f]
  const transformedPoints = basePoints.map((pt) => {
    return {
      x: a * pt.x + c * pt.y + e,
      y: b * pt.x + d * pt.y + f,
    };
  });

  const basePolygonStr = basePoints.map((pt) => `${pt.x + 150},${pt.y + 150}`).join(' ');
  const transformedPolygonStr = transformedPoints.map((pt) => `${pt.x + 150},${pt.y + 150}`).join(' ');

  return (
    <div className="space-y-8">
      {/* Presets Header */}
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
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy SVG Attr'}
          </button>
          <button
            onClick={() => applyPreset(PRESETS[0])}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Interactive Visualizer Canvas & Live Mathematical Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SVG Canvas Area */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950 border border-slate-800 relative">
          <svg viewBox="0 0 300 300" width="100%" height="320" className="overflow-visible select-none">
            {/* Coordinate Grid Background */}
            <defs>
              <pattern id="gridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="300" height="300" fill="url(#gridPattern)" />

            {/* Axes */}
            <line x1="150" y1="10" x2="150" y2="290" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="10" y1="150" x2="290" y2="150" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
            <text x="285" y="145" fill="#64748b" fontSize="10" fontFamily="monospace">X</text>
            <text x="155" y="20" fill="#64748b" fontSize="10" fontFamily="monospace">Y</text>

            {/* Original Untransformed Reference Ghost */}
            <polygon
              points={basePolygonStr}
              fill="rgba(148, 163, 184, 0.08)"
              stroke="#64748b"
              strokeWidth="1"
              strokeDasharray="4 4"
            />

            {/* Transformed Shape */}
            <polygon
              points={transformedPolygonStr}
              fill="rgba(56, 189, 248, 0.25)"
              stroke="#38bdf8"
              strokeWidth="2"
            />

            {/* Vertices */}
            {transformedPoints.map((pt, i) => (
              <circle
                key={i}
                cx={pt.x + 150}
                cy={pt.y + 150}
                r="4"
                fill="#0284c7"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            ))}

            {/* Center Origin Dot */}
            <circle cx="150" cy="150" r="3" fill="#f43f5e" />
          </svg>

          <div className="w-full flex items-center justify-between text-[11px] text-slate-400 mt-2 px-2">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 border border-dashed border-slate-500 rounded-sm inline-block" />
              Original (80 &times; 80 px)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-sky-500/30 border border-sky-400 rounded-sm inline-block" />
              Transformed Result
            </span>
            <span className="font-mono text-slate-400">
              det: <strong className={det < 0 ? 'text-rose-400' : 'text-emerald-400'}>{det.toFixed(3)}</strong>
            </span>
          </div>
        </div>

        {/* Matrix Equation & 6-Tuple Sliders */}
        <div className="lg:col-span-5 space-y-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            Affine 2D Parameters
          </h3>

          {/* 3x3 Matrix Visual Representation */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-center">
            <div className="text-[10px] uppercase text-slate-500 tracking-wider mb-1">Matrix Structure</div>
            <div className="text-xs text-sky-300 font-bold flex items-center justify-center gap-4 py-1">
              <div className="border-l-2 border-r-2 border-slate-600 px-3 py-1 grid grid-cols-3 gap-x-4 gap-y-1">
                <span>{a.toFixed(2)}</span>
                <span>{c.toFixed(2)}</span>
                <span>{e.toFixed(1)}</span>
                <span>{b.toFixed(2)}</span>
                <span>{d.toFixed(2)}</span>
                <span>{f.toFixed(1)}</span>
                <span className="text-slate-600">0</span>
                <span className="text-slate-600">0</span>
                <span className="text-slate-600">1</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                a (Scale X / cos &theta;): <span className="text-sky-400 font-mono">{a}</span>
              </label>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.05"
                value={a}
                onChange={(e) => setA(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                b (Skew Y / sin &theta;): <span className="text-sky-400 font-mono">{b}</span>
              </label>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.05"
                value={b}
                onChange={(e) => setB(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                c (Skew X / -sin &theta;): <span className="text-sky-400 font-mono">{c}</span>
              </label>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.05"
                value={c}
                onChange={(e) => setC(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                d (Scale Y / cos &theta;): <span className="text-sky-400 font-mono">{d}</span>
              </label>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.05"
                value={d}
                onChange={(e) => setD(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                e (Translate X): <span className="text-sky-400 font-mono">{e}px</span>
              </label>
              <input
                type="range"
                min="-80"
                max="80"
                step="2"
                value={e}
                onChange={(e) => setE(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                f (Translate Y): <span className="text-sky-400 font-mono">{f}px</span>
              </label>
              <input
                type="range"
                min="-80"
                max="80"
                step="2"
                value={f}
                onChange={(e) => setF(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Generated Code Snippets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-sky-400" />
              SVG Attribute Output
            </span>
          </div>
          <pre className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-sky-300 overflow-x-auto border border-slate-800">
            <code>{svgTransformAttr}</code>
          </pre>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-400" />
              CSS Transform Property
            </span>
          </div>
          <pre className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-teal-300 overflow-x-auto border border-slate-800">
            <code>{cssTransformProp}</code>
          </pre>
        </div>
      </div>

      {/* Guide Notes */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2 text-xs text-slate-400">
        <h4 className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-4 h-4 text-sky-400" />
          2D Affine Transformation Mathematics
        </h4>
        <p>
          In 2D graphics (SVG and CSS3), all linear transformations (scaling, rotation, skewing) plus translations are represented compactly by a 3&times;3 affine matrix with fixed bottom row <code>[0 0 1]</code>. The determinant <code>ad - bc</code> indicates area scaling; a negative determinant indicates coordinate plane reflection (mirroring).
        </p>
      </div>
    </div>
  );
}

export default SvgMatrixTransformVisualizer;

