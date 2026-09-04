"use client";

import React, { useState, useMemo } from "react";
import { GitCommit, Copy, Check, Eye, Code, Sliders, Move } from "lucide-react";

export function SvgOrthogonalWireGenerator() {
  const [x1, setX1] = useState<number>(60);
  const [y1, setY1] = useState<number>(80);
  const [x2, setX2] = useState<number>(340);
  const [y2, setY2] = useState<number>(240);
  const [radius, setRadius] = useState<number>(16);
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [strokeColor, setStrokeColor] = useState<string>("#38bdf8");
  const [isDashed, setIsDashed] = useState<boolean>(false);
  const [isAnimated, setIsAnimated] = useState<boolean>(false);

  const [copiedSvg, setCopiedSvg] = useState(false);

  // Generate orthogonal rounded path
  const pathData = useMemo(() => {
    // Manhattan mid-point X routing
    const midX = (x1 + x2) / 2;
    const r = Math.min(radius, Math.abs(midX - x1), Math.abs(y2 - y1) / 2);

    const dirY = y2 >= y1 ? 1 : -1;
    const dirX = x2 >= x1 ? 1 : -1;

    // Path with two rounded 90-degree corners
    if (r <= 2) {
      return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
    }

    // Corner 1: at (midX, y1)
    // Corner 2: at (midX, y2)
    const c1StartX = midX - r * dirX;
    const c1EndY = y1 + r * dirY;

    const c2StartY = y2 - r * dirY;
    const c2EndX = midX + r * dirX;

    return `M ${x1} ${y1} L ${c1StartX} ${y1} Q ${midX} ${y1} ${midX} ${c1EndY} L ${midX} ${c2StartY} Q ${midX} ${y2} ${c2EndX} ${y2} L ${x2} ${y2}`;
  }, [x1, y1, x2, y2, radius]);

  const svgSnippet = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" width="400" height="320">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="${strokeColor}" />
    </marker>
  </defs>
  <path
    d="${pathData}"
    fill="none"
    stroke="${strokeColor}"
    stroke-width="${strokeWidth}"
    stroke-linecap="round"
    ${isDashed ? 'stroke-dasharray="6 4"' : ""}
    marker-end="url(#arrow)"
  />
</svg>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(svgSnippet);
      setCopiedSvg(true);
      setTimeout(() => setCopiedSvg(false), 2000);
    } catch {}
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-200">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Vector Diagram Math
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Orthogonal Manhattan Routing
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <GitCommit className="w-6 h-6 text-cyan-400" />
          SVG Orthogonal Flowchart Wire Connector Generator
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Generate clean, rounded 90-degree orthogonal connector wires for architecture flowcharts, circuit schematics, and node-based node graph interfaces.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" /> Pin Coordinates & Radius
            </h3>

            {/* Source Pin */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">Source Pin (X1, Y1)</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 block">X1</label>
                  <input
                    type="number"
                    value={x1}
                    onChange={(e) => setX1(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Y1</label>
                  <input
                    type="number"
                    value={y1}
                    onChange={(e) => setY1(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Target Pin */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-300">Target Pin (X2, Y2)</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 block">X2</label>
                  <input
                    type="number"
                    value={x2}
                    onChange={(e) => setX2(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Y2</label>
                  <input
                    type="number"
                    value={y2}
                    onChange={(e) => setY2(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Corner Radius */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Fillet Corner Radius</span>
                  <span className="font-mono text-cyan-400">{radius}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="32"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Stroke Width</span>
                  <span className="font-mono text-cyan-400">{strokeWidth}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Styling */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDashed}
                  onChange={(e) => setIsDashed(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0"
                />
                <span>Dashed Stroke</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnimated}
                  onChange={(e) => setIsAnimated(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0"
                />
                <span>Animated Flow Pulse</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right: SVG Canvas & Code (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Interactive Preview */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center min-h-[300px] shadow-inner relative">
            <span className="text-[11px] text-slate-500 absolute top-3 left-4">
              Orthogonal Wire Vector Preview (400 x 320)
            </span>

            <svg viewBox="0 0 400 320" width="100%" height="280" className="max-w-md">
              <defs>
                <marker
                  id="preview-arrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill={strokeColor} />
                </marker>
              </defs>

              <style>{`
                @keyframes pulse-flow {
                  to { stroke-dashoffset: -20; }
                }
                .flow-wire-animated {
                  stroke-dasharray: 6 4;
                  animation: pulse-flow 1s linear infinite;
                }
              `}</style>

              {/* Source node box */}
              <rect x={x1 - 30} y={y1 - 20} width="60" height="40" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
              <text x={x1} y={y1 + 4} fill="#cbd5e1" fontSize="10" textAnchor="middle" fontFamily="monospace">Node A</text>

              {/* Target node box */}
              <rect x={x2 - 30} y={y2 - 20} width="60" height="40" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
              <text x={x2} y={y2 + 4} fill="#cbd5e1" fontSize="10" textAnchor="middle" fontFamily="monospace">Node B</text>

              {/* Orthogonal connector wire */}
              <path
                d={pathData}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                className={isAnimated ? "flow-wire-animated" : isDashed ? "" : undefined}
                strokeDasharray={isDashed && !isAnimated ? "6 4" : undefined}
                markerEnd="url(#preview-arrow)"
              />

              {/* Pin dots */}
              <circle cx={x1} cy={y1} r="4" fill="#38bdf8" />
              <circle cx={x2} cy={y2} r="4" fill="#38bdf8" />
            </svg>
          </div>

          {/* Generated Code */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-cyan-400" /> Clean SVG Path Markup
              </span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded flex items-center gap-1 transition shadow-sm"
              >
                {copiedSvg ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSvg ? "Copied SVG!" : "Copy SVG"}
              </button>
            </div>
            <pre className="w-full bg-slate-950/90 font-mono text-xs text-cyan-300 border border-slate-800 rounded-xl p-4 overflow-x-auto max-h-[160px] leading-relaxed shadow-inner">
              <code>{svgSnippet}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SvgOrthogonalWireGenerator;
