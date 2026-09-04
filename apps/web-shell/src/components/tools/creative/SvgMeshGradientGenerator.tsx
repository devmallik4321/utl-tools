'use client';

import React, { useState, useMemo } from 'react';
import { Sparkles, Palette, Copy, Check, Download, RefreshCw, Layers } from 'lucide-react';

interface MeshPoint {
  id: string;
  x: number; // percentage
  y: number; // percentage
  color: string;
  radius: number; // percentage
}

const PALETTES = [
  { name: 'Sunset Aura', colors: ['#ff7e5f', '#feb47b', '#86a8e7', '#91eae4', '#2c3e50'] },
  { name: 'Deep Cyber', colors: ['#4f46e5', '#06b6d4', '#ec4899', '#8b5cf6', '#0f172a'] },
  { name: 'Emerald Forest', colors: ['#059669', '#10b981', '#34d399', '#047857', '#064e3b'] },
  { name: 'Pastel Dream', colors: ['#fbcfe8', '#fed7aa', '#fef08a', '#bbf7d0', '#bfdbfe'] }
];

export function SvgMeshGradientGenerator() {
  const [blurAmount, setBlurAmount] = useState<number>(45);
  const [backgroundColor, setBackgroundColor] = useState<string>('#0f172a');
  const [points, setPoints] = useState<MeshPoint[]>([
    { id: 'p1', x: 20, y: 25, color: '#4f46e5', radius: 45 },
    { id: 'p2', x: 80, y: 20, color: '#ec4899', radius: 40 },
    { id: 'p3', x: 75, y: 75, color: '#06b6d4', radius: 50 },
    { id: 'p4', x: 25, y: 80, color: '#8b5cf6', radius: 45 }
  ]);
  const [copied, setCopied] = useState<boolean>(false);

  const applyPalette = (pal: typeof PALETTES[0]) => {
    setBackgroundColor(pal.colors[4]);
    setPoints([
      { id: 'p1', x: 20, y: 25, color: pal.colors[0], radius: 45 },
      { id: 'p2', x: 80, y: 20, color: pal.colors[1], radius: 40 },
      { id: 'p3', x: 75, y: 75, color: pal.colors[2], radius: 50 },
      { id: 'p4', x: 25, y: 80, color: pal.colors[3], radius: 45 }
    ]);
  };

  const updatePoint = (index: number, patch: Partial<MeshPoint>) => {
    setPoints((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const svgMarkup = useMemo(() => {
    const circles = points.map(
      (p) => `<circle cx="${p.x}%" cy="${p.y}%" r="${p.radius}%" fill="${p.color}" />`
    ).join('\n    ');

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <filter id="mesh-blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="${blurAmount}" />
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="${backgroundColor}" />
  <g filter="url(#mesh-blur)">
    ${circles}
  </g>
</svg>`;
  }, [points, blurAmount, backgroundColor]);

  const cssBackground = useMemo(() => {
    const encoded = encodeURIComponent(svgMarkup)
      .replace(/%20/g, ' ')
      .replace(/%3D/g, '=')
      .replace(/%3A/g, ':')
      .replace(/%2F/g, '/');
    return `background-color: ${backgroundColor};
background-image: url("data:image/svg+xml,${encoded}");
background-size: cover;`;
  }, [svgMarkup, backgroundColor]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cssBackground);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-xl text-pink-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">SVG Organic Mesh Gradient Generator</h1>
            <p className="text-sm text-slate-400">
              Create smooth, multi-point organic mesh gradients with customizable radial patches, Gaussian blur diffusion, and CSS Data URI export.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-white">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Gradient Configuration</h2>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Color Presets</label>
            <div className="grid grid-cols-2 gap-2">
              {PALETTES.map((pal) => (
                <button
                  key={pal.name}
                  onClick={() => applyPalette(pal)}
                  className="p-2 rounded bg-slate-800 border border-slate-700 text-xs text-left hover:bg-slate-700 flex items-center justify-between"
                >
                  <span>{pal.name}</span>
                  <div className="flex -space-x-1">
                    {pal.colors.slice(0, 3).map((c, i) => (
                      <span key={i} className="w-2.5 h-2.5 rounded-full border border-slate-900" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Diffusion Blur</span>
              <span className="font-mono text-pink-400">{blurAmount}px</span>
            </div>
            <input
              type="range"
              min="15"
              max="80"
              value={blurAmount}
              onChange={(e) => setBlurAmount(Number(e.target.value))}
              className="w-full accent-pink-500"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-400 block">Radial Anchor Patches</span>
            {points.map((p, idx) => (
              <div key={p.id} className="p-2.5 rounded bg-slate-800/80 border border-slate-700 flex items-center justify-between gap-2 text-xs">
                <input
                  type="color"
                  value={p.color}
                  onChange={(e) => updatePoint(idx, { color: e.target.value })}
                  className="w-7 h-7 rounded border border-slate-600 bg-transparent cursor-pointer"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>X: {p.x}% | Y: {p.y}%</span>
                    <span>Radius: {p.radius}%</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={p.x}
                      onChange={(e) => updatePoint(idx, { x: Number(e.target.value) })}
                      className="w-1/2 accent-pink-500"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={p.y}
                      onChange={(e) => updatePoint(idx, { y: Number(e.target.value) })}
                      className="w-1/2 accent-pink-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white flex flex-col justify-between space-y-6">
          {/* Live Preview Container */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Live Mesh Preview</h2>
            <div className="w-full h-72 rounded-xl overflow-hidden border border-slate-700 shadow-2xl relative flex items-center justify-center">
              <div
                className="absolute inset-0 w-full h-full"
                dangerouslySetInnerHTML={{ __html: svgMarkup }}
              />
              <div className="relative z-10 p-4 bg-slate-900/40 backdrop-blur-md rounded-xl border border-white/10 text-center">
                <span className="text-white text-base font-bold">Organic Mesh Surface</span>
                <p className="text-xs text-slate-300 mt-1">Lightweight vector blur mesh</p>
              </div>
            </div>
          </div>

          {/* Export Code */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-semibold text-slate-300">CSS Background Data URI</span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-pink-600 hover:bg-pink-500 text-white text-xs font-medium rounded transition"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy CSS'}</span>
              </button>
            </div>
            <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre max-h-36">
              {cssBackground}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SvgMeshGradientGenerator;
