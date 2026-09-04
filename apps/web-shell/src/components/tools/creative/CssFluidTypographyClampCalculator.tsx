'use client';

import React, { useState, useId } from 'react';
import {
  Type,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Code,
  Info,
  Smartphone,
  Monitor
} from 'lucide-react';

interface ClampPreset {
  name: string;
  minFontSize: number;
  maxFontSize: number;
  minViewport: number;
  maxViewport: number;
}

const PRESETS: ClampPreset[] = [
  { name: 'Hero Display Title (36px to 72px)', minFontSize: 36, maxFontSize: 72, minViewport: 375, maxViewport: 1440 },
  { name: 'Section Heading H2 (24px to 42px)', minFontSize: 24, maxFontSize: 42, minViewport: 375, maxViewport: 1440 },
  { name: 'Responsive Body Text (15px to 18px)', minFontSize: 15, maxFontSize: 18, minViewport: 375, maxViewport: 1440 },
  { name: 'Subheading / Lead (18px to 28px)', minFontSize: 18, maxFontSize: 28, minViewport: 375, maxViewport: 1440 },
];

export function CssFluidTypographyClampCalculator() {
  const minFontId = useId();
  const maxFontId = useId();
  const minViewId = useId();
  const maxViewId = useId();

  const [minFontSize, setMinFontSize] = useState<number>(36);
  const [maxFontSize, setMaxFontSize] = useState<number>(72);
  const [minViewport, setMinViewport] = useState<number>(375);
  const [maxViewport, setMaxViewport] = useState<number>(1440);
  const [previewViewport, setPreviewViewport] = useState<number>(800);
  const [previewText, setPreviewText] = useState<string>('Fluid Typography That Scales Flawlessly');
  const [copiedCss, setCopiedCss] = useState<boolean>(false);
  const [copiedTailwind, setCopiedTailwind] = useState<boolean>(false);

  const rootFontSize = 16;

  // Mathematical Slope & Intercept for clamp()
  // slope = (maxFont - minFont) / (maxView - minView)
  const viewDelta = Math.max(1, maxViewport - minViewport);
  const fontDelta = maxFontSize - minFontSize;
  const slope = fontDelta / viewDelta;
  const slopeVw = (slope * 100).toFixed(3);
  const interceptPx = minFontSize - slope * minViewport;
  const interceptRem = (interceptPx / rootFontSize).toFixed(3);

  const minRem = (minFontSize / rootFontSize).toFixed(3);
  const maxRem = (maxFontSize / rootFontSize).toFixed(3);

  const clampExpression = `clamp(${minRem}rem, ${interceptRem}rem + ${slopeVw}vw, ${maxRem}rem)`;
  const cssDeclaration = `font-size: ${clampExpression};`;
  const tailwindClass = `text-[${clampExpression}]`;

  // Calculate current font size at simulated previewViewport
  const currentCalculatedSizePx = Math.min(
    maxFontSize,
    Math.max(minFontSize, minFontSize + slope * (previewViewport - minViewport))
  );

  const applyPreset = (p: ClampPreset) => {
    setMinFontSize(p.minFontSize);
    setMaxFontSize(p.maxFontSize);
    setMinViewport(p.minViewport);
    setMaxViewport(p.maxViewport);
  };

  const handleCopyCss = () => {
    navigator.clipboard.writeText(cssDeclaration);
    setCopiedCss(true);
    setTimeout(() => setCopiedCss(false), 2000);
  };

  const handleCopyTailwind = () => {
    navigator.clipboard.writeText(tailwindClass);
    setCopiedTailwind(true);
    setTimeout(() => setCopiedTailwind(false), 2000);
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

      {/* Live Interactive Viewport Simulator Box */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Monitor className="w-4 h-4 text-sky-400" />
            Interactive Viewport Scaler: <span className="font-mono text-sky-400">{previewViewport}px</span>
          </span>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-800/40">
            Rendered Font Size: {currentCalculatedSizePx.toFixed(1)}px ({(currentCalculatedSizePx / rootFontSize).toFixed(2)}rem)
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Smartphone className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="range"
            min="320"
            max="1920"
            step="10"
            value={previewViewport}
            onChange={(e) => setPreviewViewport(Number(e.target.value))}
            className="w-full accent-sky-500 cursor-pointer"
          />
          <Monitor className="w-4 h-4 text-slate-500 shrink-0" />
        </div>

        <div className="relative p-6 rounded-xl bg-slate-950 border border-slate-800/80 min-h-[140px] flex items-center justify-center text-center overflow-hidden">
          <div
            className="font-bold text-white leading-tight select-none transition-all duration-75"
            style={{ fontSize: `${currentCalculatedSizePx}px` }}
          >
            {previewText}
          </div>
        </div>
      </div>

      {/* Grid Inputs & Output Snippets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs Panel */}
        <div className="lg:col-span-6 space-y-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            Clamp Parameters (px)
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={minFontId} className="block text-xs font-medium text-slate-400 mb-1">
                Min Font Size (px)
              </label>
              <input
                id={minFontId}
                type="number"
                min="8"
                max="120"
                value={minFontSize}
                onChange={(e) => setMinFontSize(Math.max(1, Number(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div>
              <label htmlFor={maxFontId} className="block text-xs font-medium text-slate-400 mb-1">
                Max Font Size (px)
              </label>
              <input
                id={maxFontId}
                type="number"
                min="8"
                max="240"
                value={maxFontSize}
                onChange={(e) => setMaxFontSize(Math.max(minFontSize, Number(e.target.value) || minFontSize))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={minViewId} className="block text-xs font-medium text-slate-400 mb-1">
                Min Viewport Width (px)
              </label>
              <input
                id={minViewId}
                type="number"
                min="280"
                max="1200"
                step="5"
                value={minViewport}
                onChange={(e) => setMinViewport(Math.max(280, Number(e.target.value) || 375))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div>
              <label htmlFor={maxViewId} className="block text-xs font-medium text-slate-400 mb-1">
                Max Viewport Width (px)
              </label>
              <input
                id={maxViewId}
                type="number"
                min="600"
                max="2560"
                step="10"
                value={maxViewport}
                onChange={(e) => setMaxViewport(Math.max(minViewport + 100, Number(e.target.value) || 1440))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Sample Text Preview
            </label>
            <input
              type="text"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        {/* Right Code Output */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-sky-400" />
                Pure CSS Declaration
              </span>
              <button
                onClick={handleCopyCss}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                {copiedCss ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCss ? 'Copied' : 'Copy CSS'}
              </button>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-sky-300 overflow-x-auto border border-slate-800">
              <code>{cssDeclaration}</code>
            </pre>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-teal-400" />
                Tailwind CSS Arbitrary Value Class
              </span>
              <button
                onClick={handleCopyTailwind}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                {copiedTailwind ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedTailwind ? 'Copied' : 'Copy Tailwind'}
              </button>
            </div>
            <pre className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-teal-300 overflow-x-auto border border-slate-800">
              <code>{tailwindClass}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Guide Notes */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2 text-xs text-slate-400">
        <h4 className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-4 h-4 text-sky-400" />
          The Mathematics of CSS Fluid Typography
        </h4>
        <p>
          Traditional responsive typography relies on rigid media query breakpoints (<code>@media (min-width: 768px)</code>) that abruptly jump between sizes. Fluid typography with <code>clamp(min, preferred, max)</code> scales text continuously and smoothly with viewport width (<code>vw</code>) while respecting accessibility user zoom settings via <code>rem</code> offsets.
        </p>
      </div>
    </div>
  );
}

export default CssFluidTypographyClampCalculator;
