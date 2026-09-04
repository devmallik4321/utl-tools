'use client';

import React, { useState, useId } from 'react';
import {
  Type,
  Palette,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  Code,
  Sliders
} from 'lucide-react';

interface StrokePreset {
  name: string;
  text: string;
  strokeWidth: number;
  strokeColor: string;
  fillColor: string;
  isTransparentFill: boolean;
  fontSize: number;
  fontWeight: string;
  paintOrder: 'stroke fill' | 'fill stroke';
  bgColor: string;
}

const PRESETS: StrokePreset[] = [
  {
    name: 'Cyberpunk Hollow Neon',
    text: 'NEON WAVE',
    strokeWidth: 2,
    strokeColor: '#06b6d4',
    fillColor: '#000000',
    isTransparentFill: true,
    fontSize: 54,
    fontWeight: '900',
    paintOrder: 'stroke fill',
    bgColor: '#090d16',
  },
  {
    name: 'Comic Book Pop Out',
    text: 'POW! BOOM!',
    strokeWidth: 4,
    strokeColor: '#000000',
    fillColor: '#facc15',
    isTransparentFill: false,
    fontSize: 48,
    fontWeight: '900',
    paintOrder: 'stroke fill',
    bgColor: '#ffffff',
  },
  {
    name: 'Editorial Luxury Gold',
    text: 'VOGUE LUXE',
    strokeWidth: 1,
    strokeColor: '#f59e0b',
    fillColor: '#ffffff',
    isTransparentFill: true,
    fontSize: 52,
    fontWeight: '700',
    paintOrder: 'stroke fill',
    bgColor: '#18181b',
  },
  {
    name: 'Minimal Clean Wire',
    text: 'MODERN TECH',
    strokeWidth: 1.5,
    strokeColor: '#e2e8f0',
    fillColor: '#0f172a',
    isTransparentFill: true,
    fontSize: 44,
    fontWeight: '600',
    paintOrder: 'stroke fill',
    bgColor: '#020617',
  },
];

export function CssTextStrokeGenerator() {
  const textInputId = useId();
  const widthId = useId();
  const strokeColorId = useId();
  const fillColorId = useId();
  const fontSizeId = useId();
  const fontWeightId = useId();
  const bgColorId = useId();

  const [text, setText] = useState<string>('HOLLOW OUTLINE');
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [strokeColor, setStrokeColor] = useState<string>('#38bdf8');
  const [fillColor, setFillColor] = useState<string>('#ffffff');
  const [isTransparentFill, setIsTransparentFill] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(56);
  const [fontWeight, setFontWeight] = useState<string>('800');
  const [paintOrder, setPaintOrder] = useState<'stroke fill' | 'fill stroke'>('stroke fill');
  const [bgColor, setBgColor] = useState<string>('#090d16');
  const [copiedCss, setCopiedCss] = useState<boolean>(false);
  const [copiedSvg, setCopiedSvg] = useState<boolean>(false);

  const effectiveFill = isTransparentFill ? 'transparent' : fillColor;

  const generatedCss = `.stroke-text {
  font-size: ${fontSize}px;
  font-weight: ${fontWeight};
  color: ${effectiveFill};
  -webkit-text-stroke: ${strokeWidth}px ${strokeColor};
  paint-order: ${paintOrder};
}`;

  const generatedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 120" width="100%" height="100%">
  <text
    x="50%"
    y="60%"
    dominant-baseline="middle"
    text-anchor="middle"
    font-family="system-ui, sans-serif"
    font-size="${fontSize}px"
    font-weight="${fontWeight}"
    fill="${effectiveFill}"
    stroke="${strokeColor}"
    stroke-width="${strokeWidth}"
    stroke-linejoin="round"
  >${text}</text>
</svg>`;

  const applyPreset = (p: StrokePreset) => {
    setText(p.text);
    setStrokeWidth(p.strokeWidth);
    setStrokeColor(p.strokeColor);
    setFillColor(p.fillColor);
    setIsTransparentFill(p.isTransparentFill);
    setFontSize(p.fontSize);
    setFontWeight(p.fontWeight);
    setPaintOrder(p.paintOrder);
    setBgColor(p.bgColor);
  };

  const handleCopyCss = () => {
    navigator.clipboard.writeText(generatedCss);
    setCopiedCss(true);
    setTimeout(() => setCopiedCss(false), 2000);
  };

  const handleCopySvg = () => {
    navigator.clipboard.writeText(generatedSvg);
    setCopiedSvg(true);
    setTimeout(() => setCopiedSvg(false), 2000);
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

      {/* Live Interactive Preview Box */}
      <div
        className="relative rounded-2xl p-10 min-h-[220px] flex items-center justify-center overflow-hidden border border-slate-800 transition-colors"
        style={{ backgroundColor: bgColor }}
      >
        <div
          className="text-center select-none break-all transition-all"
          style={{
            fontSize: `${fontSize}px`,
            fontWeight: Number(fontWeight),
            color: effectiveFill,
            WebkitTextStroke: `${strokeWidth}px ${strokeColor}`,
            paintOrder: paintOrder,
            lineHeight: 1.2,
          }}
        >
          {text || 'TEXT PREVIEW'}
        </div>
        <div className="absolute bottom-3 right-3 text-[10px] text-slate-400/80 bg-black/40 px-2 py-1 rounded backdrop-blur border border-white/5">
          Live Render ({fontSize}px / {strokeWidth}px stroke)
        </div>
      </div>

      {/* Controls and Code Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Panel */}
        <div className="lg:col-span-6 space-y-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            Stroke & Typography Parameters
          </h3>

          <div>
            <label htmlFor={textInputId} className="block text-xs font-medium text-slate-400 mb-1">
              Display Text
            </label>
            <input
              id={textInputId}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
              placeholder="Type anything..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={widthId} className="block text-xs font-medium text-slate-400 mb-1">
                Stroke Width: <span className="text-sky-400 font-mono">{strokeWidth}px</span>
              </label>
              <input
                id={widthId}
                type="range"
                min="0.5"
                max="16"
                step="0.5"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            <div>
              <label htmlFor={fontSizeId} className="block text-xs font-medium text-slate-400 mb-1">
                Font Size: <span className="text-sky-400 font-mono">{fontSize}px</span>
              </label>
              <input
                id={fontSizeId}
                type="range"
                min="16"
                max="120"
                step="2"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={strokeColorId} className="block text-xs font-medium text-slate-400 mb-1">
                Stroke Color
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

            <div>
              <label htmlFor={bgColorId} className="block text-xs font-medium text-slate-400 mb-1">
                Preview Canvas Bg
              </label>
              <div className="flex items-center gap-2">
                <input
                  id={bgColorId}
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-9 h-9 rounded bg-transparent border border-slate-700 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 uppercase focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300">
                Hollow Transparent Fill
              </label>
              <button
                type="button"
                onClick={() => setIsTransparentFill(!isTransparentFill)}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                  isTransparentFill ? 'bg-sky-600' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    isTransparentFill ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {!isTransparentFill && (
              <div>
                <label htmlFor={fillColorId} className="block text-xs font-medium text-slate-400 mb-1">
                  Text Fill Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id={fillColorId}
                    type="color"
                    value={fillColor}
                    onChange={(e) => setFillColor(e.target.value)}
                    className="w-9 h-9 rounded bg-transparent border border-slate-700 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={fillColor}
                    onChange={(e) => setFillColor(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 uppercase focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label htmlFor={fontWeightId} className="block text-xs font-medium text-slate-400 mb-1">
                Font Weight
              </label>
              <select
                id={fontWeightId}
                value={fontWeight}
                onChange={(e) => setFontWeight(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="400">Normal (400)</option>
                <option value="600">Semi-Bold (600)</option>
                <option value="700">Bold (700)</option>
                <option value="800">Extra Bold (800)</option>
                <option value="900">Black (900)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Paint Order (Stroke In/Out)
              </label>
              <select
                value={paintOrder}
                onChange={(e) => setPaintOrder(e.target.value as 'stroke fill' | 'fill stroke')}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="stroke fill">stroke fill (Behind Text)</option>
                <option value="fill stroke">fill stroke (Overlaps Fill)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Code Snippets Panel */}
        <div className="lg:col-span-6 space-y-5">
          {/* CSS Card */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Code className="w-4 h-4 text-sky-400" />
                Pure CSS Output
              </h4>
              <button
                onClick={handleCopyCss}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                {copiedCss ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCss ? 'Copied CSS' : 'Copy CSS'}
              </button>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto border border-slate-800/80">
              <code>{generatedCss}</code>
            </pre>
          </div>

          {/* SVG Card */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-teal-400" />
                Scalable Vector SVG Output
              </h4>
              <button
                onClick={handleCopySvg}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                {copiedSvg ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSvg ? 'Copied SVG' : 'Copy SVG'}
              </button>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto border border-slate-800/80">
              <code>{generatedSvg}</code>
            </pre>
          </div>

          {/* Browser Support & Best Practice Notes */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <span className="font-semibold text-slate-300">Browser Compatibility Tip:</span>
            <p>
              <code>-webkit-text-stroke</code> is supported across 98%+ of all browsers (Chrome, Safari, Firefox, Edge). Combining with <code>paint-order: stroke fill;</code> ensures thick strokes expand outward rather than eating into the center glyph interior.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CssTextStrokeGenerator;

