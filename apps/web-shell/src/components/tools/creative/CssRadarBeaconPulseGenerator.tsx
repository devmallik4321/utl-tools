"use client";

import React, { useState } from "react";
import { Radio, Copy, Check, Eye, Code, Sliders, Palette } from "lucide-react";

export function CssRadarBeaconPulseGenerator() {
  const [coreSize, setCoreSize] = useState<number>(16); // px
  const [coreColor, setCoreColor] = useState<string>("#10b981");
  const [maxScale, setMaxScale] = useState<number>(4);
  const [duration, setDuration] = useState<number>(2.4); // seconds
  const [rippleCount, setRippleCount] = useState<number>(3);
  const [glowBlur, setGlowBlur] = useState<number>(10);
  const [copiedCss, setCopiedCss] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const cssCode = `/* Pure CSS Radar Beacon & Sonar Ripple Wave */
@keyframes beacon-ripple {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(${maxScale});
    opacity: 0;
  }
}

.beacon-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${coreSize * maxScale}px;
  height: ${coreSize * maxScale}px;
}

.beacon-core {
  position: relative;
  width: ${coreSize}px;
  height: ${coreSize}px;
  border-radius: 50%;
  background-color: ${coreColor};
  box-shadow: 0 0 ${glowBlur}px ${coreColor};
  z-index: 2;
}

.beacon-ring {
  position: absolute;
  width: ${coreSize}px;
  height: ${coreSize}px;
  border-radius: 50%;
  background-color: ${coreColor};
  opacity: 0;
  animation: beacon-ripple ${duration}s cubic-bezier(0, 0.2, 0.8, 1) infinite;
}

${Array.from({ length: rippleCount }).map((_, i) => {
  const delay = ((i * duration) / rippleCount).toFixed(2);
  return `.beacon-ring:nth-child(${i + 1}) { animation-delay: ${delay}s; }`;
}).join("\n")}`;

  const htmlCode = `<div class="beacon-container">
  <!-- Concentric Sonar Ripple Rings -->
${Array.from({ length: rippleCount }).map(() => '  <div class="beacon-ring"></div>').join("\n")}
  <!-- Central Glowing Beacon Core -->
  <div class="beacon-core"></div>
</div>`;

  const handleCopyCss = async () => {
    try {
      await navigator.clipboard.writeText(cssCode);
      setCopiedCss(true);
      setTimeout(() => setCopiedCss(false), 2000);
    } catch {}
  };

  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    } catch {}
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-200">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Micro-Animation & Telemetry
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            GPU Compositor Keyframes
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Radio className="w-6 h-6 text-emerald-400" />
          CSS Radar Beacon & Pulse Ripple Wave Generator
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Generate pure CSS live status beacons, sonar ripple waves, and map location pins with hardware-accelerated scale transformations and staggered opacity dissipation.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" /> Geometry & Wave Parameters
            </h3>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Beacon Color</label>
              <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                <input
                  type="color"
                  value={coreColor}
                  onChange={(e) => setCoreColor(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="font-mono text-xs">{coreColor}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Core Dot Size</span>
                  <span className="font-mono text-emerald-400">{coreSize}px</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="32"
                  value={coreSize}
                  onChange={(e) => setCoreSize(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Max Ripple Expansion Scale</span>
                  <span className="font-mono text-emerald-400">{maxScale}x</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="8"
                  step="0.5"
                  value={maxScale}
                  onChange={(e) => setMaxScale(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Pulse Duration (Cycle Speed)</span>
                  <span className="font-mono text-emerald-400">{duration}s</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.2"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Concentric Ripple Rings</span>
                  <span className="font-mono text-emerald-400">{rippleCount} rings</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={rippleCount}
                  onChange={(e) => setRippleCount(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Core Glow Blur Radius</span>
                  <span className="font-mono text-emerald-400">{glowBlur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={glowBlur}
                  onChange={(e) => setGlowBlur(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Preview & Code (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Live Canvas */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center min-h-[260px] relative overflow-hidden shadow-inner">
            <span className="text-[11px] text-slate-500 absolute top-3 left-4 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> Interactive Beacon Preview
            </span>

            <style>{`
              @keyframes live-beacon-ripple {
                0% { transform: scale(1); opacity: 0.8; }
                100% { transform: scale(${maxScale}); opacity: 0; }
              }
              .live-beacon-container {
                position: relative;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: ${coreSize * maxScale}px;
                height: ${coreSize * maxScale}px;
              }
              .live-beacon-core {
                position: relative;
                width: ${coreSize}px;
                height: ${coreSize}px;
                border-radius: 50%;
                background-color: ${coreColor};
                box-shadow: 0 0 ${glowBlur}px ${coreColor};
                z-index: 2;
              }
              .live-beacon-ring {
                position: absolute;
                width: ${coreSize}px;
                height: ${coreSize}px;
                border-radius: 50%;
                background-color: ${coreColor};
                opacity: 0;
                animation: live-beacon-ripple ${duration}s cubic-bezier(0, 0.2, 0.8, 1) infinite;
              }
              ${Array.from({ length: rippleCount }).map((_, i) => {
                const delay = ((i * duration) / rippleCount).toFixed(2);
                return `.live-beacon-ring:nth-child(${i + 1}) { animation-delay: ${delay}s; }`;
              }).join("\n")}
            `}</style>

            <div className="live-beacon-container">
              {Array.from({ length: rippleCount }).map((_, i) => (
                <div key={i} className="live-beacon-ring" />
              ))}
              <div className="live-beacon-core" />
            </div>

            <div className="mt-4 text-xs font-mono text-slate-400">
              Live System Status: <span className="text-emerald-400 font-bold">OPERATIONAL</span>
            </div>
          </div>

          {/* Generated Code */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-emerald-400" /> CSS & HTML Snippets
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyHtml}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded border border-slate-700 transition"
                >
                  {copiedHtml ? "Copied HTML!" : "Copy HTML"}
                </button>
                <button
                  onClick={handleCopyCss}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded transition flex items-center gap-1"
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

export default CssRadarBeaconPulseGenerator;
