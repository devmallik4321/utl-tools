'use client';

import React, { useState, useMemo } from 'react';
import { LayoutGrid, Sliders, Copy, Check, Eye, Maximize2, Layers, Code2 } from 'lucide-react';

export function CssGridAutoFitMinmaxGenerator() {
  const [mode, setMode] = useState<'auto-fit' | 'auto-fill'>('auto-fit');
  const [minWidth, setMinWidth] = useState<number>(240);
  const [maxWidthUnit, setMaxWidthUnit] = useState<'1fr' | '100%'>('1fr');
  const [gap, setGap] = useState<number>(16);
  const [itemCount, setItemCount] = useState<number>(6);
  const [containerWidth, setContainerWidth] = useState<number>(760);
  const [copied, setCopied] = useState<boolean>(false);

  const cssRule = useMemo(() => {
    return `.responsive-grid {
  display: grid;
  grid-template-columns: repeat(${mode}, minmax(${minWidth}px, ${maxWidthUnit}));
  gap: ${gap}px;
}`;
  }, [mode, minWidth, maxWidthUnit, gap]);

  const tailwindRule = useMemo(() => {
    return `<div className="grid grid-cols-[repeat(${mode},minmax(${minWidth}px,${maxWidthUnit}))] gap-[${gap}px]">`;
  }, [mode, minWidth, maxWidthUnit, gap]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cssRule);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">CSS Grid auto-fit / minmax() Generator</h1>
            <p className="text-sm text-slate-400">
              Generate responsive CSS Grid layouts that adapt automatically to any screen size without media queries using repeat(auto-fit, minmax()).
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-white">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Grid Parameters</span>
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Repeat Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode('auto-fit')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  mode === 'auto-fit'
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                auto-fit (Expands)
              </button>
              <button
                onClick={() => setMode('auto-fill')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  mode === 'auto-fill'
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                auto-fill (Empty tracks)
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Min Column Width</span>
              <span className="font-mono text-indigo-400">{minWidth}px</span>
            </div>
            <input
              type="range"
              min="120"
              max="480"
              step="10"
              value={minWidth}
              onChange={(e) => setMinWidth(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Grid Gap</span>
              <span className="font-mono text-indigo-400">{gap}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="48"
              step="4"
              value={gap}
              onChange={(e) => setGap(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Item Count</span>
              <span className="font-mono text-indigo-400">{itemCount} items</span>
            </div>
            <input
              type="range"
              min="2"
              max="16"
              value={itemCount}
              onChange={(e) => setItemCount(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Simulated Container Width</span>
              <span className="font-mono text-cyan-400">{containerWidth}px</span>
            </div>
            <input
              type="range"
              min="320"
              max="900"
              step="10"
              value={containerWidth}
              onChange={(e) => setContainerWidth(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>
        </div>

        {/* Live Playground & Code */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between text-white space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                <span>Responsive Viewport Resizing Sandbox</span>
              </h2>
              <span className="text-xs font-mono text-slate-400">{containerWidth}px wide</span>
            </div>

            {/* Simulated container */}
            <div className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto flex justify-center">
              <div
                style={{
                  width: `${containerWidth}px`,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${mode}, minmax(${minWidth}px, ${maxWidthUnit}))`,
                  gap: `${gap}px`
                }}
                className="transition-all duration-150"
              >
                {Array.from({ length: itemCount }).map((_, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-center flex flex-col justify-center items-center h-24 text-slate-200 text-xs font-semibold shadow"
                  >
                    <span className="text-indigo-400 text-sm font-bold">Item {i + 1}</span>
                    <span className="text-[10px] text-slate-400 font-mono mt-1">&ge; {minWidth}px</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Export Code */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-slate-300">Pure CSS & Tailwind Snippets</span>
              </div>
              <button
                onClick={handleCopy}
                className="inline-flex items-center space-x-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy CSS'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre">
              {cssRule}
            </pre>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-300 overflow-x-auto whitespace-pre">
              {tailwindRule}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CssGridAutoFitMinmaxGenerator;
