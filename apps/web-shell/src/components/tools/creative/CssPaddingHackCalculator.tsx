"use client";

import { useState, useMemo } from "react";
import { Monitor, Copy, Check, Sparkles, Code, Layout } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const PRESETS = [
  { name: "16:9 Widescreen (YouTube)", w: 16, h: 9 },
  { name: "4:3 Standard TV", w: 4, h: 3 },
  { name: "1:1 Square (Instagram)", w: 1, h: 1 },
  { name: "9:16 Vertical (TikTok/Reels)", w: 9, h: 16 },
  { name: "21:9 Ultrawide Cinema", w: 21, h: 9 },
];

export function CssPaddingHackCalculator() {
  const [widthRatio, setWidthRatio] = useState<number>(16);
  const [heightRatio, setHeightRatio] = useState<number>(9);
  const [copied, setCopied] = useState<boolean>(false);

  const { paddingPercent, modernCss, classicBoilerplate } = useMemo(() => {
    if (widthRatio <= 0 || heightRatio <= 0) {
      return { paddingPercent: "0%", modernCss: "aspect-ratio: 16 / 9;", classicBoilerplate: "" };
    }

    const pct = ((heightRatio / widthRatio) * 100).toFixed(4).replace(/\.?0+$/, "");
    const modern = `aspect-ratio: ${widthRatio} / ${heightRatio};`;

    const boilerplate = `/* Modern CSS (Chrome 88+, Safari 15+, Firefox 89+) */
.responsive-container {
  width: 100%;
  aspect-ratio: ${widthRatio} / ${heightRatio};
}

/* Classic CSS Padding-Bottom Hack (100% Legacy Browser Support) */
.video-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: ${pct}%; /* (${heightRatio} / ${widthRatio}) * 100 */
  height: 0;
  overflow: hidden;
}

.video-wrapper iframe,
.video-wrapper video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}`;

    return {
      paddingPercent: `${pct}%`,
      modernCss: modern,
      classicBoilerplate: boilerplate,
    };
  }, [widthRatio, heightRatio]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(classicBoilerplate);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => {
              setWidthRatio(p.w);
              setHeightRatio(p.h);
            }}
            className="px-3 py-1 bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Ratio Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Width Ratio
          </label>
          <input
            type="number"
            min={1}
            value={widthRatio}
            onChange={(e) => setWidthRatio(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Height Ratio
          </label>
          <input
            type="number"
            min={1}
            value={heightRatio}
            onChange={(e) => setHeightRatio(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Layout className="w-4 h-4 text-emerald-500" />
            CSS Aspect Ratio Percentage &amp; Rules
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Full CSS"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Padding-Top / Bottom Value
            </span>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{paddingPercent}</p>
            <span className="text-[10px] text-muted-foreground font-sans">
              ({heightRatio} / {widthRatio}) × 100%
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Modern CSS Property
            </span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{modernCss}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Supported in all modern browsers</span>
          </div>
        </div>

        {/* Boilerplate */}
        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {classicBoilerplate}
        </pre>
      </div>
    </div>
  );
}
