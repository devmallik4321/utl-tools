"use client";

import React, { useState, useMemo } from "react";
import { Sparkles, Copy, Check, Eye, Code, Sliders, ArrowRightLeft, Layers } from "lucide-react";

export function CssInfiniteMarqueeTickerGenerator() {
  const [direction, setDirection] = useState<"left" | "right">("left");
  const [duration, setDuration] = useState<number>(20); // seconds
  const [pauseOnHover, setPauseOnHover] = useState<boolean>(true);
  const [fadeEdges, setFadeEdges] = useState<boolean>(true);
  const [gap, setGap] = useState<number>(32); // px
  const [fadeWidth, setFadeWidth] = useState<number>(15); // %
  const [copiedCss, setCopiedCss] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  const sampleItems = [
    "🚀 Next.js 14",
    "⚡ Tailwind CSS",
    "🛡️ TypeScript",
    "⚛️ React 19",
    "💎 Lucide Icons",
    "🔥 Zero-Runtime CSS",
    "🌐 Cloudflare DNS",
    "📊 Observability"
  ];

  const cssCode = `/* Pure CSS Infinite Marquee Ticker */
.marquee-container {
  display: flex;
  overflow: hidden;
  user-select: none;
  gap: ${gap}px;
  ${fadeEdges ? `mask-image: linear-gradient(
    to right,
    transparent 0%,
    black ${fadeWidth}%,
    black ${100 - fadeWidth}%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0%,
    black ${fadeWidth}%,
    black ${100 - fadeWidth}%,
    transparent 100%
  );` : ""}
}

.marquee-track {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: ${gap}px;
  min-width: 100%;
  animation: scroll-${direction} ${duration}s linear infinite;
  ${pauseOnHover ? "&:hover {\n    animation-play-state: paused;\n  }" : ""}
}

${pauseOnHover ? `.marquee-container:hover .marquee-track {
  animation-play-state: paused;
}` : ""}

@keyframes scroll-left {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-100% - ${gap}px));
  }
}

@keyframes scroll-right {
  from {
    transform: translateX(calc(-100% - ${gap}px));
  }
  to {
    transform: translateX(0);
  }
}`;

  const htmlCode = `<div class="marquee-container">
  <!-- Primary Track -->
  <div class="marquee-track">
    <div class="item">🚀 Next.js 14</div>
    <div class="item">⚡ Tailwind CSS</div>
    <div class="item">🛡️ TypeScript</div>
    <div class="item">⚛️ React 19</div>
  </div>
  <!-- Clone Track for Seamless Loop -->
  <div class="marquee-track" aria-hidden="true">
    <div class="item">🚀 Next.js 14</div>
    <div class="item">⚡ Tailwind CSS</div>
    <div class="item">🛡️ TypeScript</div>
    <div class="item">⚛️ React 19</div>
  </div>
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
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Hardware-Accelerated CSS
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Zero-Jitter Seamless Loop
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ArrowRightLeft className="w-6 h-6 text-cyan-400" />
          CSS Infinite Marquee Ticker Generator
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Create silky-smooth, GPU-accelerated infinite scrolling marquee carousels for partner logo clouds, feature lists, and live tickers with hover-pause and edge alpha fade masks.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" /> Ticker Configuration
            </h3>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Scroll Direction</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDirection("left")}
                  className={`py-1.5 px-3 rounded-lg border text-xs font-medium transition ${
                    direction === "left"
                      ? "bg-cyan-600/20 border-cyan-500 text-cyan-300"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  Left ← (Default)
                </button>
                <button
                  onClick={() => setDirection("right")}
                  className={`py-1.5 px-3 rounded-lg border text-xs font-medium transition ${
                    direction === "right"
                      ? "bg-cyan-600/20 border-cyan-500 text-cyan-300"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  Right →
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Scroll Speed (Cycle Duration)</span>
                  <span className="font-mono text-cyan-400">{duration}s</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Item Spacing Gap</span>
                  <span className="font-mono text-cyan-400">{gap}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="64"
                  value={gap}
                  onChange={(e) => setGap(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {fadeEdges && (
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Edge Fade Mask Width</span>
                    <span className="font-mono text-purple-400">{fadeWidth}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={fadeWidth}
                    onChange={(e) => setFadeWidth(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pauseOnHover}
                  onChange={(e) => setPauseOnHover(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0"
                />
                <span>Pause Animation on Hover</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fadeEdges}
                  onChange={(e) => setFadeEdges(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0"
                />
                <span>Enable CSS Gradient Edge Fade Mask</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Live Preview & Code (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Live Marquee Preview */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 relative overflow-hidden shadow-inner">
            <div className="text-xs text-slate-500 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Live Marquee Canvas</span>
              <span className="text-[11px] text-slate-500">{pauseOnHover ? "Hover over items to pause" : ""}</span>
            </div>

            {/* Injected Preview Styles */}
            <style>{`
              @keyframes preview-scroll-left {
                from { transform: translateX(0); }
                to { transform: translateX(calc(-100% - ${gap}px)); }
              }
              @keyframes preview-scroll-right {
                from { transform: translateX(calc(-100% - ${gap}px)); }
                to { transform: translateX(0); }
              }
              .live-marquee-container {
                display: flex;
                overflow: hidden;
                user-select: none;
                gap: ${gap}px;
                ${fadeEdges ? `mask-image: linear-gradient(to right, transparent 0%, black ${fadeWidth}%, black ${100 - fadeWidth}%, transparent 100%); -webkit-mask-image: linear-gradient(to right, transparent 0%, black ${fadeWidth}%, black ${100 - fadeWidth}%, transparent 100%);` : ""}
              }
              .live-marquee-track {
                flex-shrink: 0;
                display: flex;
                align-items: center;
                gap: ${gap}px;
                min-width: 100%;
                animation: preview-scroll-${direction} ${duration}s linear infinite;
              }
              ${pauseOnHover ? `.live-marquee-container:hover .live-marquee-track { animation-play-state: paused; }` : ""}
            `}</style>

            <div className="live-marquee-container py-3">
              {/* First Track */}
              <div className="live-marquee-track">
                {sampleItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 shadow-md whitespace-nowrap"
                  >
                    {item}
                  </div>
                ))}
              </div>

              {/* Second Track (Seamless Clone) */}
              <div className="live-marquee-track" aria-hidden="true">
                {sampleItems.map((item, idx) => (
                  <div
                    key={`clone-${idx}`}
                    className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 shadow-md whitespace-nowrap"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Generated Code */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Code className="w-4 h-4 text-cyan-400" /> CSS Rules
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

export default CssInfiniteMarqueeTickerGenerator;
