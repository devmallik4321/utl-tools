"use client";

import { useState } from "react";
import { Maximize2, Sparkles, Copy, Check, Code, Sliders } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface RatioPreset {
  name: string;
  w: number;
  h: number;
  usage: string;
}

const PRESETS: RatioPreset[] = [
  { name: "16:9", w: 16, h: 9, usage: "YouTube, TV, 1080p / 4K Video" },
  { name: "9:16", w: 9, h: 16, usage: "Instagram Reels, TikTok, YouTube Shorts" },
  { name: "4:3", w: 4, h: 3, usage: "Classic TV, iPad, Photography" },
  { name: "1:1", w: 1, h: 1, usage: "Instagram Post, Profile Avatars" },
  { name: "21:9", w: 21, h: 9, usage: "Ultrawide Monitors, Cinematic Movies" },
  { name: "3:2", w: 3, h: 2, usage: "DSLR Photography, Microsoft Surface" },
];

export function AspectRatioResizer() {
  const [ratioW, setRatioW] = useState<number>(16);
  const [ratioH, setRatioH] = useState<number>(9);
  const [width, setWidth] = useState<number>(1920);
  const [height, setHeight] = useState<number>(1080);
  const [copied, setCopied] = useState<boolean>(false);

  // Update when changing Width
  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (ratioW > 0) {
      setHeight(Math.round((val * ratioH) / ratioW));
    }
  };

  // Update when changing Height
  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (ratioH > 0) {
      setWidth(Math.round((val * ratioW) / ratioH));
    }
  };

  // Update when selecting Preset
  const applyPreset = (preset: RatioPreset) => {
    setRatioW(preset.w);
    setRatioH(preset.h);
    setHeight(Math.round((width * preset.h) / preset.w));
  };

  // CSS snippet calculations
  const paddingBottomPct = ratioW > 0 ? ((ratioH / ratioW) * 100).toFixed(2) : "56.25";
  const modernCss = `aspect-ratio: ${ratioW} / ${ratioH};`;
  const legacyCss = `/* Responsive Intrinsic Container */\n.video-container {\n  position: relative;\n  width: 100%;\n  padding-bottom: ${paddingBottomPct}%;\n  overflow: hidden;\n}\n.video-container iframe {\n  position: absolute;\n  top: 0; left: 0;\n  width: 100%; height: 100%;\n}`;

  const handleCopy = async () => {
    const summary = `Aspect Ratio Calculation\n• Ratio: ${ratioW}:${ratioH}\n• Dimensions: ${width} × ${height} px\n• CSS: aspect-ratio: ${ratioW} / ${ratioH};\n• Padding-Bottom: ${paddingBottomPct}%`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Standard Aspect Ratio Presets:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(p)}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                ratioW === p.w && ratioH === p.h
                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-foreground font-bold"
                  : "border-border bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-sm font-mono block">{p.name}</span>
              <span className="text-[10px] text-muted-foreground block truncate mt-0.5">{p.usage}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Ratio & Dimension Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Custom Ratio Input */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Aspect Ratio (W : H)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={ratioW}
              onChange={(e) => {
                const nw = Math.max(1, parseInt(e.target.value) || 1);
                setRatioW(nw);
                setHeight(Math.round((width * ratioH) / nw));
              }}
              className="w-1/2 px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
              placeholder="Width Ratio"
            />
            <span className="font-bold text-muted-foreground">:</span>
            <input
              type="number"
              min={1}
              value={ratioH}
              onChange={(e) => {
                const nh = Math.max(1, parseInt(e.target.value) || 1);
                setRatioH(nh);
                setHeight(Math.round((width * nh) / ratioW));
              }}
              className="w-1/2 px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
              placeholder="Height Ratio"
            />
          </div>
        </div>

        {/* Dimension Scaler */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Target Dimensions (Pixels)
          </label>
          <div className="flex items-center gap-2">
            <div className="w-1/2 space-y-1">
              <input
                type="number"
                min={1}
                value={width}
                onChange={(e) => handleWidthChange(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg font-bold text-foreground"
                placeholder="Width"
              />
              <span className="text-[10px] text-muted-foreground block text-center">Width (px)</span>
            </div>
            <span className="font-bold text-muted-foreground">×</span>
            <div className="w-1/2 space-y-1">
              <input
                type="number"
                min={1}
                value={height}
                onChange={(e) => handleHeightChange(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg font-bold text-foreground"
                placeholder="Height"
              />
              <span className="text-[10px] text-muted-foreground block text-center">Height (px)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Results & CSS Code */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Maximize2 className="w-4 h-4 text-emerald-500" />
            Scaled Dimensions &amp; Web Code
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Summary"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Pixel Resolution</span>
            <p className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              {width} × {height} <span className="text-xs font-normal text-muted-foreground">px</span>
            </p>
            <span className="text-[10px] text-muted-foreground">{((width * height) / 1_000_000).toFixed(2)} Megapixels</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Decimal Ratio</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              {(ratioW / ratioH).toFixed(3)} : 1
            </p>
            <span className="text-[10px] text-muted-foreground">Exact mathematical multiplier</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Padding-Bottom</span>
            <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              {paddingBottomPct}%
            </p>
            <span className="text-[10px] text-muted-foreground">Responsive video iframe container</span>
          </div>
        </div>

        {/* CSS Snippet */}
        <div className="space-y-2 pt-2 border-t border-border">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            CSS Embed Snippets:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 bg-card rounded-lg border border-border space-y-1">
              <span className="text-muted-foreground text-[10px] block font-sans font-bold">MODERN CSS</span>
              <pre className="text-foreground">{modernCss}</pre>
            </div>
            <div className="p-3 bg-card rounded-lg border border-border space-y-1">
              <span className="text-muted-foreground text-[10px] block font-sans font-bold">LEGACY INTRINSIC CONTAINER</span>
              <pre className="text-foreground text-[11px] whitespace-pre-wrap">{legacyCss}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
