"use client";

import { useState } from "react";
import { Monitor, Smartphone, Video, Square } from "lucide-react";

const PRESETS = [
  { label: "16:9 (YouTube / HD)", w: 16, h: 9, defW: 1920, defH: 1080 },
  { label: "9:16 (TikTok / Reels)", w: 9, h: 16, defW: 1080, defH: 1920 },
  { label: "4:3 (Classic TV)", w: 4, h: 3, defW: 1024, defH: 768 },
  { label: "1:1 (Square / Post)", w: 1, h: 1, defW: 1080, defH: 1080 },
  { label: "21:9 (Ultrawide Cinema)", w: 21, h: 9, defW: 2560, defH: 1080 },
];

export function AspectRatioCalculator() {
  const [ratioW, setRatioW] = useState<number>(16);
  const [ratioH, setRatioH] = useState<number>(9);
  const [width, setWidth] = useState<number>(1920);
  const [height, setHeight] = useState<number>(1080);

  const updateWidth = (newW: number) => {
    setWidth(newW);
    if (ratioW > 0) {
      setHeight(Math.round((newW * ratioH) / ratioW));
    }
  };

  const updateHeight = (newH: number) => {
    setHeight(newH);
    if (ratioH > 0) {
      setWidth(Math.round((newH * ratioW) / ratioH));
    }
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setRatioW(preset.w);
    setRatioH(preset.h);
    setWidth(preset.defW);
    setHeight(preset.defH);
  };

  return (
    <div className="space-y-6">
      {/* Presets Grid */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-3">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Standard Aspect Ratio Presets
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p)}
              className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-colors ${
                ratioW === p.w && ratioH === p.h
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-background text-foreground border-border hover:bg-muted"
              }`}
            >
              <span className="font-bold block">{p.w}:{p.h}</span>
              <span className="text-[10px] opacity-75">{p.label.split("(")[1]?.replace(")", "") || ""}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="p-6 bg-card border border-border rounded-xl space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                Ratio Width
              </label>
              <input
                type="number"
                value={ratioW}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 1;
                  setRatioW(val);
                  setHeight(Math.round((width * ratioH) / val));
                }}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                Ratio Height
              </label>
              <input
                type="number"
                value={ratioH}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 1;
                  setRatioH(val);
                  setHeight(Math.round((width * val) / ratioW));
                }}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono font-bold focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-border grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                Target Width (px)
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => updateWidth(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono font-bold focus:outline-none text-blue-600 dark:text-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
                Proportional Height (px)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => updateHeight(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono font-bold focus:outline-none text-emerald-600 dark:text-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* Visual Aspect Ratio Box Simulation */}
        <div className="p-6 bg-card border border-border rounded-xl flex flex-col items-center justify-center space-y-3 text-center min-h-[260px]">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Proportional Visual Preview
          </span>

          <div className="w-full h-44 flex items-center justify-center bg-muted/30 rounded-xl p-4">
            <div
              className="border-2 border-blue-500 bg-blue-500/10 rounded shadow-sm flex items-center justify-center transition-all duration-200"
              style={{
                aspectRatio: `${ratioW} / ${ratioH}`,
                maxHeight: "100%",
                maxWidth: "100%",
              }}
            >
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 px-2 py-1 bg-card/80 rounded shadow-xs">
                {width} &times; {height}
              </span>
            </div>
          </div>

          <span className="text-xs text-muted-foreground font-mono">
            CSS Property: <code className="bg-muted px-1.5 py-0.5 rounded">aspect-ratio: {ratioW} / {ratioH};</code>
          </span>
        </div>
      </div>
    </div>
  );
}
