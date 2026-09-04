'use client';

import React, { useState, useId } from 'react';
import {
  Sliders,
  Layers,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Eye,
  Code,
  Info
} from 'lucide-react';

interface BackdropPreset {
  name: string;
  blur: number;
  saturate: number;
  brightness: number;
  contrast: number;
  bgAlpha: number;
  borderAlpha: number;
  bgMode: 'gradient' | 'cyber' | 'mesh';
}

const PRESETS: BackdropPreset[] = [
  {
    name: 'Apple macOS Glass Window',
    blur: 20,
    saturate: 180,
    brightness: 110,
    contrast: 100,
    bgAlpha: 0.25,
    borderAlpha: 0.3,
    bgMode: 'gradient',
  },
  {
    name: 'Cyberpunk Neon Glow',
    blur: 14,
    saturate: 220,
    brightness: 95,
    contrast: 115,
    bgAlpha: 0.35,
    borderAlpha: 0.4,
    bgMode: 'cyber',
  },
  {
    name: 'Minimal Clean Frost',
    blur: 10,
    saturate: 120,
    brightness: 105,
    contrast: 100,
    bgAlpha: 0.15,
    borderAlpha: 0.2,
    bgMode: 'mesh',
  },
];

export function CssBackdropFilterPlayground() {
  const blurId = useId();
  const satId = useId();
  const brightId = useId();
  const contrastId = useId();
  const alphaId = useId();

  const [blur, setBlur] = useState<number>(20);
  const [saturate, setSaturate] = useState<number>(180);
  const [brightness, setBrightness] = useState<number>(110);
  const [contrast, setContrast] = useState<number>(100);
  const [bgAlpha, setBgAlpha] = useState<number>(0.25);
  const [borderAlpha, setBorderAlpha] = useState<number>(0.3);
  const [bgMode, setBgMode] = useState<'gradient' | 'cyber' | 'mesh'>('gradient');
  const [copiedCss, setCopiedCss] = useState<boolean>(false);
  const [copiedTailwind, setCopiedTailwind] = useState<boolean>(false);

  const backdropFilterCss = `blur(${blur}px) saturate(${saturate}%) brightness(${brightness}%) contrast(${contrast}%)`;

  const generatedCss = `.frosted-glass-card {
  background-color: rgba(255, 255, 255, ${bgAlpha});
  backdrop-filter: ${backdropFilterCss};
  -webkit-backdrop-filter: ${backdropFilterCss};
  border: 1px solid rgba(255, 255, 255, ${borderAlpha});
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}`;

  const tailwindSnippet = `bg-white/[${bgAlpha}] backdrop-blur-[${blur}px] backdrop-saturate-[${saturate}%] backdrop-brightness-[${brightness}%] border border-white/[${borderAlpha}] rounded-2xl shadow-2xl`;

  const applyPreset = (p: BackdropPreset) => {
    setBlur(p.blur);
    setSaturate(p.saturate);
    setBrightness(p.brightness);
    setContrast(p.contrast);
    setBgAlpha(p.bgAlpha);
    setBorderAlpha(p.borderAlpha);
    setBgMode(p.bgMode);
  };

  const handleCopyCss = () => {
    navigator.clipboard.writeText(generatedCss);
    setCopiedCss(true);
    setTimeout(() => setCopiedCss(false), 2000);
  };

  const handleCopyTailwind = () => {
    navigator.clipboard.writeText(tailwindSnippet);
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

      {/* Interactive Visual Preview Box */}
      <div className="relative rounded-2xl min-h-[300px] flex items-center justify-center p-8 overflow-hidden border border-slate-800">
        {/* Background Layer (Simulated Scene) */}
        {bgMode === 'gradient' && (
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900 via-purple-800 to-pink-600 flex items-center justify-around opacity-90">
            <div className="w-48 h-48 rounded-full bg-cyan-400 blur-2xl opacity-60 animate-pulse" />
            <div className="w-64 h-64 rounded-full bg-amber-400 blur-3xl opacity-50" />
          </div>
        )}
        {bgMode === 'cyber' && (
          <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
            <div className="w-72 h-72 rounded-full bg-fuchsia-600 blur-3xl opacity-60" />
            <div className="w-56 h-56 rounded-full bg-sky-500 blur-2xl opacity-60" />
          </div>
        )}
        {bgMode === 'mesh' && (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-800 flex items-center justify-between">
            <div className="w-60 h-60 rounded-full bg-emerald-400 blur-3xl opacity-40" />
            <div className="w-60 h-60 rounded-full bg-indigo-500 blur-3xl opacity-40" />
          </div>
        )}

        {/* Foreground Frosted Glass Element */}
        <div
          className="relative z-10 max-w-md w-full p-6 text-white transition-all shadow-2xl"
          style={{
            backgroundColor: `rgba(255, 255, 255, ${bgAlpha})`,
            backdropFilter: backdropFilterCss,
            WebkitBackdropFilter: backdropFilterCss,
            border: `1px solid rgba(255, 255, 255, ${borderAlpha})`,
            borderRadius: '16px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span className="font-bold text-sm tracking-wide">Frosted Glass Surface</span>
          </div>
          <p className="text-xs text-slate-100 leading-relaxed drop-shadow-sm">
            This card demonstrates real-time hardware-accelerated <code>backdrop-filter</code> processing over vibrant graphic elements.
          </p>
          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-[11px] font-mono">
            <span>blur: {blur}px</span>
            <span>sat: {saturate}%</span>
            <span>alpha: {bgAlpha}</span>
          </div>
        </div>

        {/* Scene Switcher Toggle */}
        <div className="absolute bottom-3 right-3 z-20 flex gap-1 bg-black/50 backdrop-blur p-1 rounded-lg border border-white/10">
          <button
            onClick={() => setBgMode('gradient')}
            className={`text-[10px] px-2 py-0.5 rounded ${bgMode === 'gradient' ? 'bg-white/20 text-white' : 'text-slate-400'}`}
          >
            Gradient
          </button>
          <button
            onClick={() => setBgMode('cyber')}
            className={`text-[10px] px-2 py-0.5 rounded ${bgMode === 'cyber' ? 'bg-white/20 text-white' : 'text-slate-400'}`}
          >
            Cyber
          </button>
          <button
            onClick={() => setBgMode('mesh')}
            className={`text-[10px] px-2 py-0.5 rounded ${bgMode === 'mesh' ? 'bg-white/20 text-white' : 'text-slate-400'}`}
          >
            Mesh
          </button>
        </div>
      </div>

      {/* Controls and Code Snippets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sliders Panel */}
        <div className="lg:col-span-6 space-y-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            Backdrop Filter Parameters
          </h3>

          <div>
            <label htmlFor={blurId} className="block text-xs font-medium text-slate-400 mb-1">
              Blur Radius: <span className="text-sky-400 font-mono">{blur}px</span>
            </label>
            <input
              id={blurId}
              type="range"
              min="0"
              max="50"
              value={blur}
              onChange={(e) => setBlur(Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={satId} className="block text-xs font-medium text-slate-400 mb-1">
                Saturation: <span className="text-sky-400 font-mono">{saturate}%</span>
              </label>
              <input
                id={satId}
                type="range"
                min="50"
                max="300"
                step="5"
                value={saturate}
                onChange={(e) => setSaturate(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            <div>
              <label htmlFor={brightId} className="block text-xs font-medium text-slate-400 mb-1">
                Brightness: <span className="text-sky-400 font-mono">{brightness}%</span>
              </label>
              <input
                id={brightId}
                type="range"
                min="50"
                max="200"
                step="5"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={contrastId} className="block text-xs font-medium text-slate-400 mb-1">
                Contrast: <span className="text-sky-400 font-mono">{contrast}%</span>
              </label>
              <input
                id={contrastId}
                type="range"
                min="50"
                max="200"
                step="5"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            <div>
              <label htmlFor={alphaId} className="block text-xs font-medium text-slate-400 mb-1">
                Fill Opacity: <span className="text-sky-400 font-mono">{Math.round(bgAlpha * 100)}%</span>
              </label>
              <input
                id={alphaId}
                type="range"
                min="0.05"
                max="0.80"
                step="0.05"
                value={bgAlpha}
                onChange={(e) => setBgAlpha(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Code Outputs */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-sky-400" />
                Pure CSS Output
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
              <code>{generatedCss}</code>
            </pre>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-400" />
                Tailwind CSS Utility Classes
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
              <code>{tailwindSnippet}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Guide Notes */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2 text-xs text-slate-400">
        <h4 className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-4 h-4 text-sky-400" />
          The Science of Glassmorphic UI Design
        </h4>
        <p>
          <code>backdrop-filter</code> applies graphical effects like blurring and color shifting to the area <em>behind</em> an element. Always combine high blur with subtle saturation boost (140%–180%) and low background opacity (15%–30%) to simulate authentic physical optical glass while preserving legibility.
        </p>
      </div>
    </div>
  );
}

export default CssBackdropFilterPlayground;
