'use client';

import React, { useState, useId } from 'react';
import {
  Box,
  Layers,
  Palette,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Code,
  Info,
  Sliders
} from 'lucide-react';

interface CubePreset {
  name: string;
  size: number;
  height: number;
  baseColor: string;
  strokeWidth: number;
  strokeColor: string;
  lightAngle: number;
}

const PRESETS: CubePreset[] = [
  {
    name: 'Cyberpunk Neon Hexagon Block',
    size: 140,
    height: 90,
    baseColor: '#06b6d4',
    strokeWidth: 2,
    strokeColor: '#38bdf8',
    lightAngle: 45,
  },
  {
    name: 'Voxel Grass & Dirt Cube',
    size: 120,
    height: 80,
    baseColor: '#10b981',
    strokeWidth: 1.5,
    strokeColor: '#064e3b',
    lightAngle: 60,
  },
  {
    name: 'Obsidian Dungeon Block',
    size: 130,
    height: 100,
    baseColor: '#6366f1',
    strokeWidth: 1,
    strokeColor: '#312e81',
    lightAngle: 30,
  },
];

export function SvgIsometricCubeTileGenerator() {
  const sizeId = useId();
  const heightId = useId();
  const colorId = useId();
  const strokeWidthId = useId();
  const strokeColorId = useId();

  const [size, setSize] = useState<number>(140);
  const [height, setHeight] = useState<number>(90);
  const [baseColor, setBaseColor] = useState<string>('#06b6d4');
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [strokeColor, setStrokeColor] = useState<string>('#38bdf8');
  const [copiedSvg, setCopiedSvg] = useState<boolean>(false);
  const [copiedReact, setCopiedReact] = useState<boolean>(false);

  // Geometric coordinates for isometric 2:1 ratio projection
  // Center is (150, 100)
  const cx = 150;
  const cy = 110;
  const w = size / 2;
  const h = size / 4;
  const d = height;

  // Vertices
  const topCenter = { x: cx, y: cy - h };
  const topRight = { x: cx + w, y: cy };
  const topBottom = { x: cx, y: cy + h };
  const topLeft = { x: cx - w, y: cy };

  const botLeft = { x: topLeft.x, y: topLeft.y + d };
  const botBottom = { x: topBottom.x, y: topBottom.y + d };
  const botRight = { x: topRight.x, y: topRight.y + d };

  const topFacePoints = `${topCenter.x},${topCenter.y} ${topRight.x},${topRight.y} ${topBottom.x},${topBottom.y} ${topLeft.x},${topLeft.y}`;
  const leftFacePoints = `${topLeft.x},${topLeft.y} ${topBottom.x},${topBottom.y} ${botBottom.x},${botBottom.y} ${botLeft.x},${botLeft.y}`;
  const rightFacePoints = `${topBottom.x},${topBottom.y} ${topRight.x},${topRight.y} ${botRight.x},${botRight.y} ${botBottom.x},${botBottom.y}`;

  // Lighting variations
  const topColor = baseColor;
  // Left face shaded 25% darker
  // Right face shaded 50% darker

  const generatedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="100%" height="100%">
  <!-- Top Face -->
  <polygon
    points="${topFacePoints}"
    fill="${topColor}"
    stroke="${strokeColor}"
    stroke-width="${strokeWidth}"
    stroke-linejoin="round"
  />
  <!-- Left Face (Shadow 25%) -->
  <polygon
    points="${leftFacePoints}"
    fill="${topColor}"
    fill-opacity="0.75"
    stroke="${strokeColor}"
    stroke-width="${strokeWidth}"
    stroke-linejoin="round"
  />
  <!-- Right Face (Shadow 50%) -->
  <polygon
    points="${rightFacePoints}"
    fill="${topColor}"
    fill-opacity="0.50"
    stroke="${strokeColor}"
    stroke-width="${strokeWidth}"
    stroke-linejoin="round"
  />
</svg>`;

  const generatedReact = `export function IsometricCube({ color = "${baseColor}", size = ${size}, height = ${height} }) {
  return (
    <svg viewBox="0 0 300 300" className="w-full h-auto">
      <polygon points="${topFacePoints}" fill={color} stroke="${strokeColor}" strokeWidth="${strokeWidth}" strokeLinejoin="round" />
      <polygon points="${leftFacePoints}" fill={color} fillOpacity="0.75" stroke="${strokeColor}" strokeWidth="${strokeWidth}" strokeLinejoin="round" />
      <polygon points="${rightFacePoints}" fill={color} fillOpacity="0.50" stroke="${strokeColor}" strokeWidth="${strokeWidth}" strokeLinejoin="round" />
    </svg>
  );
}`;

  const applyPreset = (p: CubePreset) => {
    setSize(p.size);
    setHeight(p.height);
    setBaseColor(p.baseColor);
    setStrokeWidth(p.strokeWidth);
    setStrokeColor(p.strokeColor);
  };

  const handleCopySvg = () => {
    navigator.clipboard.writeText(generatedSvg);
    setCopiedSvg(true);
    setTimeout(() => setCopiedSvg(false), 2000);
  };

  const handleCopyReact = () => {
    navigator.clipboard.writeText(generatedReact);
    setCopiedReact(true);
    setTimeout(() => setCopiedReact(false), 2000);
  };

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
        <button
          onClick={() => applyPreset(PRESETS[0])}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Live Interactive Preview Canvas & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Rendered SVG Preview */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-8 rounded-2xl bg-slate-950 border border-slate-800 relative">
          <div className="w-64 h-64 flex items-center justify-center">
            <svg viewBox="0 0 300 300" width="100%" height="100%" className="overflow-visible select-none">
              <polygon
                points={topFacePoints}
                fill={topColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinejoin="round"
              />
              <polygon
                points={leftFacePoints}
                fill={topColor}
                fillOpacity="0.75"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinejoin="round"
              />
              <polygon
                points={rightFacePoints}
                fill={topColor}
                fillOpacity="0.50"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="w-full flex items-center justify-between text-[11px] text-slate-400 mt-3 px-2">
            <span>Size: {size}px</span>
            <span>Height: {height}px</span>
            <span>Ratio: 2:1 True Dimetric</span>
          </div>
        </div>

        {/* Sliders & Parameters */}
        <div className="lg:col-span-6 space-y-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            Isometric Geometry Parameters
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={sizeId} className="block text-xs font-medium text-slate-400 mb-1">
                Width: <span className="text-sky-400 font-mono">{size}px</span>
              </label>
              <input
                id={sizeId}
                type="range"
                min="60"
                max="220"
                step="5"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            <div>
              <label htmlFor={heightId} className="block text-xs font-medium text-slate-400 mb-1">
                Height / Extrusion: <span className="text-sky-400 font-mono">{height}px</span>
              </label>
              <input
                id={heightId}
                type="range"
                min="20"
                max="160"
                step="5"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={colorId} className="block text-xs font-medium text-slate-400 mb-1">
                Base Surface Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  id={colorId}
                  type="color"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="w-9 h-9 rounded bg-transparent border border-slate-700 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 uppercase focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor={strokeColorId} className="block text-xs font-medium text-slate-400 mb-1">
                Wireframe Edge Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  id={strokeColorId}
                  type="color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="w-9 h-9 rounded bg-transparent border border-slate-700 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 uppercase focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor={strokeWidthId} className="block text-xs font-medium text-slate-400 mb-1">
              Stroke Width: <span className="text-sky-400 font-mono">{strokeWidth}px</span>
            </label>
            <input
              id={strokeWidthId}
              type="range"
              min="0"
              max="6"
              step="0.5"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Code Snippets Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-sky-400" />
              SVG Vector Markup
            </span>
            <button
              onClick={handleCopySvg}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              {copiedSvg ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedSvg ? 'Copied' : 'Copy SVG'}
            </button>
          </div>
          <pre className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-sky-300 overflow-x-auto border border-slate-800 max-h-[220px]">
            <code>{generatedSvg}</code>
          </pre>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-teal-400" />
              React / JSX Component
            </span>
            <button
              onClick={handleCopyReact}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              {copiedReact ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedReact ? 'Copied' : 'Copy React'}
            </button>
          </div>
          <pre className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-teal-300 overflow-x-auto border border-slate-800 max-h-[220px]">
            <code>{generatedReact}</code>
          </pre>
        </div>
      </div>

      {/* Guide Notes */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2 text-xs text-slate-400">
        <h4 className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-4 h-4 text-sky-400" />
          The Classic 2:1 Video Game Isometric Projection
        </h4>
        <p>
          Video game &quot;isometric&quot; projection is actually a 2:1 dimetric projection where the width is exactly twice the height (approximating a 26.565&deg; angle). This guarantees that adjacent tile edges align pixel-perfectly without rounding errors or jagged sub-pixel seam gaps.
        </p>
      </div>
    </div>
  );
}

export default SvgIsometricCubeTileGenerator;
