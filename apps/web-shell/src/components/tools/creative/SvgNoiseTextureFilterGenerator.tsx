'use client';

import React, { useState, useMemo } from 'react';
import { Sparkles, Sliders, Copy, Check, Download, Layers, Palette, Eye } from 'lucide-react';

export function SvgNoiseTextureFilterGenerator() {
  const [noiseType, setNoiseType] = useState<'fractalNoise' | 'turbulence'>('fractalNoise');
  const [baseFreqX, setBaseFreqX] = useState<number>(0.65);
  const [baseFreqY, setBaseFreqY] = useState<number>(0.65);
  const [lockFreqRatio, setLockFreqRatio] = useState<boolean>(true);
  const [numOctaves, setNumOctaves] = useState<number>(3);
  const [seed, setSeed] = useState<number>(1);
  const [stitchTiles, setStitchTiles] = useState<'stitch' | 'noStitch'>('stitch');
  const [opacity, setOpacity] = useState<number>(0.4);
  const [monochrome, setMonochrome] = useState<boolean>(true);
  const [blendMode, setBlendMode] = useState<string>('soft-light');
  const [bgColor, setBgColor] = useState<string>('#1e293b');
  const [tileSize, setTileSize] = useState<number>(200);

  const [activeTab, setActiveTab] = useState<'css' | 'svg' | 'react'>('css');
  const [copied, setCopied] = useState<boolean>(false);

  const handleFreqXChange = (val: number) => {
    setBaseFreqX(val);
    if (lockFreqRatio) setBaseFreqY(val);
  };

  // Pure SVG string
  const rawSvgCode = useMemo(() => {
    const freqStr = baseFreqX === baseFreqY ? `${baseFreqX}` : `${baseFreqX} ${baseFreqY}`;
    const colorMatrix = monochrome
      ? `\n    <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0" />`
      : '';

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${tileSize}" height="${tileSize}">
  <filter id="noiseFilter">
    <feTurbulence 
      type="${noiseType}" 
      baseFrequency="${freqStr}" 
      numOctaves="${numOctaves}" 
      stitchTiles="${stitchTiles}"
      seed="${seed}" 
    />${colorMatrix}
    <feComponentTransfer>
      <feFuncA type="linear" slope="${opacity}" />
    </feComponentTransfer>
  </filter>
  <rect width="100%" height="100%" filter="url(#noiseFilter)" />
</svg>`;
  }, [tileSize, noiseType, baseFreqX, baseFreqY, numOctaves, stitchTiles, seed, monochrome, opacity]);

  // CSS Data URI
  const cssBackgroundSnippet = useMemo(() => {
    const encodedSvg = encodeURIComponent(rawSvgCode)
      .replace(/%20/g, ' ')
      .replace(/%3D/g, '=')
      .replace(/%3A/g, ':')
      .replace(/%2F/g, '/');

    return `/* Tileable CSS Noise Texture */
.noisy-surface {
  background-color: ${bgColor};
  background-image: url("data:image/svg+xml,${encodedSvg}");
  background-repeat: repeat;
  mix-blend-mode: ${blendMode};
}`;
  }, [rawSvgCode, bgColor, blendMode]);

  // React JSX Snippet
  const reactSnippet = useMemo(() => {
    const freqStr = baseFreqX === baseFreqY ? `${baseFreqX}` : `${baseFreqX} ${baseFreqY}`;
    return `// React JSX Component with Inline SVG Noise Filter
export function NoiseOverlay() {
  return (
    <div style={{ position: 'relative', backgroundColor: '${bgColor}' }}>
      <svg 
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: ${opacity},
          mixBlendMode: '${blendMode}',
          pointerEvents: 'none'
        }}
      >
        <filter id="grain-filter">
          <feTurbulence
            type="${noiseType}"
            baseFrequency="${freqStr}"
            numOctaves={${numOctaves}}
            stitchTiles="${stitchTiles}"
            seed={${seed}}
          />
          ${monochrome ? '<feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 1 0" />' : ''}
        </filter>
        <rect width="100%" height="100%" filter="url(#grain-filter)" />
      </svg>
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Your content here */}
      </div>
    </div>
  );
}`;
  }, [bgColor, opacity, blendMode, noiseType, baseFreqX, baseFreqY, numOctaves, stitchTiles, seed, monochrome]);

  const currentSnippet = activeTab === 'css' ? cssBackgroundSnippet : activeTab === 'svg' ? rawSvgCode : reactSnippet;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([rawSvgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `noise-texture-${noiseType}-${baseFreqX}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-xl text-pink-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">SVG Noise & Grain Texture Filter Generator</h1>
            <p className="text-sm text-slate-400">
              Procedural vector noise generator using SVG &lt;feTurbulence&gt; and &lt;feColorMatrix&gt; with live preview and seamless CSS tile export.
            </p>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-white">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-pink-400" />
            <span>Noise & Filter Parameters</span>
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Noise Type</label>
              <select
                value={noiseType}
                onChange={(e) => setNoiseType(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-pink-500"
              >
                <option value="fractalNoise">fractalNoise (Smooth Grain)</option>
                <option value="turbulence">turbulence (Sharp Marble)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Stitch Tiles</label>
              <select
                value={stitchTiles}
                onChange={(e) => setStitchTiles(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-pink-500"
              >
                <option value="stitch">stitch (Seamless Repeat)</option>
                <option value="noStitch">noStitch</option>
              </select>
            </div>
          </div>

          {/* Base Frequency */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">Base Frequency: {baseFreqX.toFixed(3)}</span>
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lockFreqRatio}
                  onChange={(e) => setLockFreqRatio(e.target.checked)}
                  className="rounded text-pink-500 focus:ring-0"
                />
                <span className="text-slate-400 text-[11px]">Lock X=Y</span>
              </label>
            </div>
            <input
              type="range"
              min="0.01"
              max="1.50"
              step="0.01"
              value={baseFreqX}
              onChange={(e) => handleFreqXChange(Number(e.target.value))}
              className="w-full accent-pink-500"
            />
          </div>

          {/* Octaves */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">Octaves (Detail Layers): {numOctaves}</span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              step="1"
              value={numOctaves}
              onChange={(e) => setNumOctaves(Number(e.target.value))}
              className="w-full accent-pink-500"
            />
          </div>

          {/* Opacity */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300">Grain Opacity: {Math.round(opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1.0"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="w-full accent-pink-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Random Seed</label>
              <input
                type="number"
                min="0"
                value={seed}
                onChange={(e) => setSeed(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Color Mode</label>
              <select
                value={monochrome ? 'mono' : 'rgb'}
                onChange={(e) => setMonochrome(e.target.value === 'mono')}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-pink-500"
              >
                <option value="mono">Monochromatic Grain</option>
                <option value="rgb">RGB Chromatic Noise</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Background Tint</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-200"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Blend Mode</label>
              <select
                value={blendMode}
                onChange={(e) => setBlendMode(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-pink-500"
              >
                <option value="soft-light">soft-light</option>
                <option value="overlay">overlay</option>
                <option value="multiply">multiply</option>
                <option value="screen">screen</option>
                <option value="normal">normal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between text-white space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <Eye className="w-4 h-4 text-pink-400" />
                <span>Live Interactive Surface Preview</span>
              </h2>
              <button
                onClick={handleDownloadSvg}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .SVG</span>
              </button>
            </div>

            {/* Interactive Preview Container */}
            <div
              className="relative w-full h-72 rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl flex items-center justify-center p-8 transition-all"
              style={{ backgroundColor: bgColor }}
            >
              {/* SVG Filter Generator */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ mixBlendMode: blendMode as any, opacity }}>
                <filter id="livePreviewFilter" x="0%" y="0%" width="100%" height="100%">
                  <feTurbulence
                    type={noiseType}
                    baseFrequency={baseFreqX === baseFreqY ? `${baseFreqX}` : `${baseFreqX} ${baseFreqY}`}
                    numOctaves={numOctaves}
                    stitchTiles={stitchTiles}
                    seed={seed}
                  />
                  {monochrome && (
                    <feColorMatrix
                      type="matrix"
                      values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0"
                    />
                  )}
                </filter>
                <rect width="100%" height="100%" filter="url(#livePreviewFilter)" />
              </svg>

              {/* Sample Card on top to test readability */}
              <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-xl max-w-sm text-center shadow-lg">
                <h3 className="text-lg font-bold text-white mb-1">Tactile Film Grain</h3>
                <p className="text-xs text-slate-200 opacity-90 leading-relaxed">
                  Pure SVG vector noise without any bitmap dependencies or external image assets.
                </p>
                <div className="mt-3 inline-block px-3 py-1 bg-white/20 rounded-full text-[11px] font-mono font-medium">
                  {noiseType} · octaves={numOctaves}
                </div>
              </div>
            </div>
          </div>

          {/* Export Code Box */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('css')}
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    activeTab === 'css' ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  CSS Data URI
                </button>
                <button
                  onClick={() => setActiveTab('svg')}
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    activeTab === 'svg' ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Pure SVG
                </button>
                <button
                  onClick={() => setActiveTab('react')}
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    activeTab === 'react' ? 'bg-pink-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  React JSX
                </button>
              </div>

              <button
                onClick={handleCopy}
                className="inline-flex items-center space-x-1 px-2.5 py-1 bg-pink-600 hover:bg-pink-500 text-white text-xs font-medium rounded transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre max-h-40 leading-relaxed">
              {currentSnippet}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SvgNoiseTextureFilterGenerator;
