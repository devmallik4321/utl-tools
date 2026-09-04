"use client";

import React, { useState } from "react";
import { Sparkles, Copy, Check, Eye, Code, Sliders, Layers } from "lucide-react";

export function CssShimmerSkeletonGenerator() {
  const [baseColor, setBaseColor] = useState<string>("#1e293b");
  const [shimmerColor, setShimmerColor] = useState<string>("#334155");
  const [angle, setAngle] = useState<number>(90);
  const [duration, setDuration] = useState<number>(1.8);
  const [borderRadius, setBorderRadius] = useState<number>(8);
  const [copiedCss, setCopiedCss] = useState(false);
  const [copiedTailwind, setCopiedTailwind] = useState(false);

  const cssCode = `/* Pure CSS Hardware-Accelerated Shimmer Skeleton */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton-shimmer {
  background: linear-gradient(
    ${angle}deg,
    ${baseColor} 0%,
    ${baseColor} 40%,
    ${shimmerColor} 50%,
    ${baseColor} 60%,
    ${baseColor} 100%
  );
  background-size: 200% 100%;
  animation: shimmer ${duration}s ease-in-out infinite;
  border-radius: ${borderRadius}px;
}`;

  const tailwindSnippet = `// In tailwind.config.js extend:
keyframes: {
  shimmer: {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  }
},
animation: {
  shimmer: 'shimmer ${duration}s ease-in-out infinite',
}

// In your JSX / HTML:
<div className="animate-shimmer bg-[linear-gradient(${angle}deg,${baseColor}_0%,${shimmerColor}_50%,${baseColor}_100%)] bg-[length:200%_100%] rounded-[${borderRadius}px]" />`;

  const handleCopyCss = async () => {
    try {
      await navigator.clipboard.writeText(cssCode);
      setCopiedCss(true);
      setTimeout(() => setCopiedCss(false), 2000);
    } catch {}
  };

  const handleCopyTailwind = async () => {
    try {
      await navigator.clipboard.writeText(tailwindSnippet);
      setCopiedTailwind(true);
      setTimeout(() => setCopiedTailwind(false), 2000);
    } catch {}
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-200">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Micro-Interaction & UX
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Zero-JS Shimmer Wave
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-cyan-400" />
          CSS Shimmer Skeleton Loading Effect Generator
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Design silky-smooth skeleton loading placeholders with custom gradient sweep angles, wave speeds, and color tones for both vanilla CSS and Tailwind CSS.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" /> Wave & Color Controls
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Base Slate Tone</label>
                <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded border border-slate-800">
                  <input
                    type="color"
                    value={baseColor}
                    onChange={(e) => setBaseColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                  />
                  <span className="font-mono text-xs text-slate-300">{baseColor}</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Highlight Shimmer</label>
                <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded border border-slate-800">
                  <input
                    type="color"
                    value={shimmerColor}
                    onChange={(e) => setShimmerColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                  />
                  <span className="font-mono text-xs text-slate-300">{shimmerColor}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Wave Sweep Angle</span>
                  <span className="font-mono text-cyan-400">{angle}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="180"
                  step="5"
                  value={angle}
                  onChange={(e) => setAngle(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Cycle Duration</span>
                  <span className="font-mono text-cyan-400">{duration}s</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="4.0"
                  step="0.1"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Border Radius</span>
                  <span className="font-mono text-cyan-400">{borderRadius}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Preview & Code (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Live Component Skeletons */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 relative overflow-hidden shadow-inner space-y-4">
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Interactive UI Preview</span>
              <span className="text-[11px] text-slate-500">60 FPS Hardware Composite</span>
            </div>

            <style>{`
              @keyframes live-shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
              }
              .live-shimmer-box {
                background: linear-gradient(
                  ${angle}deg,
                  ${baseColor} 0%,
                  ${baseColor} 40%,
                  ${shimmerColor} 50%,
                  ${baseColor} 60%,
                  ${baseColor} 100%
                );
                background-size: 200% 100%;
                animation: live-shimmer ${duration}s ease-in-out infinite;
                border-radius: ${borderRadius}px;
              }
            `}</style>

            {/* Profile Mock Card */}
            <div className="p-4 bg-slate-900 border border-slate-800/80 rounded-xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="live-shimmer-box w-12 h-12 flex-shrink-0" style={{ borderRadius: "9999px" }} />
                <div className="space-y-2 flex-1">
                  <div className="live-shimmer-box h-3.5 w-2/5" />
                  <div className="live-shimmer-box h-2.5 w-3/5" />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="live-shimmer-box h-2.5 w-full" />
                <div className="live-shimmer-box h-2.5 w-4/5" />
              </div>
            </div>
          </div>

          {/* Generated Code */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-cyan-400" /> CSS & Tailwind Rules
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyTailwind}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded border border-slate-700 transition"
                >
                  {copiedTailwind ? "Copied Tailwind!" : "Copy Tailwind"}
                </button>
                <button
                  onClick={handleCopyCss}
                  className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded transition flex items-center gap-1"
                >
                  {copiedCss ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCss ? "Copied CSS!" : "Copy CSS"}
                </button>
              </div>
            </div>
            <pre className="w-full bg-slate-950/90 font-mono text-xs text-slate-300 border border-slate-800 rounded-xl p-4 overflow-x-auto max-h-[220px] leading-relaxed shadow-inner">
              <code>{cssCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CssShimmerSkeletonGenerator;
