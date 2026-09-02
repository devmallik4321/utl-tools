"use client";

import { useState, useMemo } from "react";
import { Maximize2, Copy, Check, Sparkles, Layout, Code2 } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const PRESETS = [
  { name: "16:9 (Widescreen / YouTube)", w: 16, h: 9, tw: "aspect-video" },
  { name: "1:1 (Square / Instagram)", w: 1, h: 1, tw: "aspect-square" },
  { name: "4:3 (Standard Video)", w: 4, h: 3, tw: "aspect-[4/3]" },
  { name: "9:16 (Stories / Shorts / TikTok)", w: 9, h: 16, tw: "aspect-[9/16]" },
  { name: "21:9 (Ultrawide Cinematic)", w: 21, h: 9, tw: "aspect-[21/9]" },
];

export function CssAspectRatioGenerator() {
  const [ratioW, setRatioW] = useState<number>(16);
  const [ratioH, setRatioH] = useState<number>(9);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { modernCss, legacyPaddingCss, tailwindClass, paddingPct } = useMemo(() => {
    const pct = ratioW > 0 ? ((ratioH / ratioW) * 100).toFixed(2) : "56.25";

    const modern = `/* Modern Standard CSS */\n.responsive-container {\n  width: 100%;\n  aspect-ratio: ${ratioW} / ${ratioH};\n  object-fit: cover;\n}`;

    const legacy = `/* Legacy Responsive Wrapper (Padding Hack) */\n.video-wrapper {\n  position: relative;\n  width: 100%;\n  padding-top: ${pct}%; /* (${ratioH} / ${ratioW}) * 100% */\n  overflow: hidden;\n}\n\n.video-wrapper iframe,\n.video-wrapper video {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  border: 0;\n}`;

    const tw = ratioW === 16 && ratioH === 9 ? "aspect-video" : ratioW === 1 && ratioH === 1 ? "aspect-square" : `aspect-[${ratioW}/${ratioH}]`;

    return {
      modernCss: modern,
      legacyPaddingCss: legacy,
      tailwindClass: tw,
      paddingPct: pct,
    };
  }, [ratioW, ratioH]);

  const handleCopy = async (key: string, text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Aspect Ratio Presets */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => {
              setRatioW(p.w);
              setRatioH(p.h);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
              ratioW === p.w && ratioH === p.h
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2 max-w-xs">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Aspect Ratio (Width : Height)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            value={ratioW}
            onChange={(e) => setRatioW(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-2 py-1.5 font-mono font-bold text-center bg-background border border-border rounded-lg"
          />
          <span className="font-bold text-muted-foreground">:</span>
          <input
            type="number"
            min={1}
            value={ratioH}
            onChange={(e) => setRatioH(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-2 py-1.5 font-mono font-bold text-center bg-background border border-border rounded-lg"
          />
        </div>
      </div>

      {/* Live Preview */}
      <div className="p-6 bg-muted/30 border border-border rounded-2xl flex flex-col items-center justify-center">
        <div
          style={{
            aspectRatio: `${ratioW} / ${ratioH}`,
          }}
          className="w-full max-w-sm max-h-56 bg-card border-2 border-dashed border-blue-500 rounded-xl flex flex-col items-center justify-center text-xs font-mono font-bold text-blue-600 dark:text-blue-400 shadow-sm"
        >
          <span>
            {ratioW} : {ratioH}
          </span>
          <span className="text-[10px] text-muted-foreground font-sans">Padding Top: {paddingPct}%</span>
        </div>
      </div>

      {/* Code Snippets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <Code2 className="w-4 h-4 text-emerald-500" />
              Modern `aspect-ratio`
            </h4>
            <button
              onClick={() => handleCopy("modern", modernCss)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "modern" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "modern" ? "Copied!" : "Copy CSS"}</span>
            </button>
          </div>
          <pre className="p-3 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
            {modernCss}
          </pre>
        </div>

        <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <Layout className="w-4 h-4 text-purple-500" />
              Legacy Iframe / Video Hack
            </h4>
            <button
              onClick={() => handleCopy("legacy", legacyPaddingCss)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "legacy" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "legacy" ? "Copied!" : "Copy Hack"}</span>
            </button>
          </div>
          <pre className="p-3 bg-card border border-border rounded-xl font-mono text-xs text-purple-600 dark:text-purple-400 overflow-x-auto select-all">
            {legacyPaddingCss}
          </pre>
        </div>
      </div>
    </div>
  );
}
