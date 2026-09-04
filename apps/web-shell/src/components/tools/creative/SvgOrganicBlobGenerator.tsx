'use client';

import React, { useState, useMemo } from 'react';
import { Sparkles, RefreshCw, Copy, Check, Download, Layers, Palette } from 'lucide-react';

function createBlobPath(pointCount: number, randomness: number, seed: number): string {
  // Simple pseudo-random from seed
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  const center = 200;
  const baseRadius = 140;
  const angleStep = (Math.PI * 2) / pointCount;
  const points: { x: number; y: number }[] = [];

  for (let i = 0; i < pointCount; i++) {
    const angle = i * angleStep;
    const offset = (rand() - 0.5) * 2 * randomness * (baseRadius * 0.4);
    const r = baseRadius + offset;
    points.push({
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    });
  }

  // Generate smooth cubic bezier loop through points
  const d: string[] = [`M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`];

  for (let i = 0; i < points.length; i++) {
    const p0 = points[(i - 1 + points.length) % points.length];
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    const p3 = points[(i + 2) % points.length];

    // Catmull-Rom to Cubic Bezier control points
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d.push(`C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`);
  }

  d.push('Z');
  return d.join(' ');
}

export function SvgOrganicBlobGenerator() {
  const [pointCount, setPointCount] = useState<number>(6);
  const [randomness, setRandomness] = useState<number>(0.5);
  const [seed, setSeed] = useState<number>(42);
  const [color1, setColor1] = useState<string>('#6366f1');
  const [color2, setColor2] = useState<string>('#ec4899');
  const [copied, setCopied] = useState<boolean>(false);

  const pathData = useMemo(() => {
    return createBlobPath(pointCount, randomness, seed);
  }, [pointCount, randomness, seed]);

  const svgMarkup = useMemo(() => {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="blob-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}" />
      <stop offset="100%" stop-color="${color2}" />
    </linearGradient>
  </defs>
  <path fill="url(#blob-grad)" d="${pathData}" />
</svg>`;
  }, [pathData, color1, color2]);

  const handleCopy = () => {
    navigator.clipboard.writeText(svgMarkup);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRandomize = () => {
    setSeed(Math.floor(Math.random() * 10000));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-xl text-pink-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">SVG Smooth Organic Blob Generator</h1>
            <p className="text-sm text-slate-400">
              Generate fluid, organic vector blob shapes using smooth cubic Bézier loops with gradient fills and clean SVG code export.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Blob Controls</h2>
            <button
              onClick={handleRandomize}
              className="inline-flex items-center space-x-1 text-xs text-pink-400 hover:text-pink-300"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Randomize Shape</span>
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Complexity (Point Count)</span>
              <span className="font-mono text-pink-400">{pointCount} points</span>
            </div>
            <input
              type="range"
              min="3"
              max="12"
              value={pointCount}
              onChange={(e) => setPointCount(Number(e.target.value))}
              className="w-full accent-pink-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Fluid Contrast (Distortion)</span>
              <span className="font-mono text-pink-400">{Math.round(randomness * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={randomness}
              onChange={(e) => setRandomness(Number(e.target.value))}
              className="w-full accent-pink-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Gradient Start</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={color1}
                  onChange={(e) => setColor1(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={color1}
                  onChange={(e) => setColor1(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-200"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Gradient End</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={color2}
                  onChange={(e) => setColor2(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={color2}
                  onChange={(e) => setColor2(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Canvas */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between text-white space-y-6">
          <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-xl border border-slate-800 h-72">
            <svg width={260} height={260} viewBox="0 0 400 400" className="drop-shadow-2xl">
              <defs>
                <linearGradient id="preview-blob-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={color1} />
                  <stop offset="100%" stopColor={color2} />
                </linearGradient>
              </defs>
              <path fill="url(#preview-blob-grad)" d={pathData} className="transition-all duration-300" />
            </svg>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-semibold text-slate-300">SVG Output</span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-pink-600 hover:bg-pink-500 text-white text-xs font-medium rounded transition"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy SVG'}</span>
              </button>
            </div>
            <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre max-h-32">
              {svgMarkup}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SvgOrganicBlobGenerator;
