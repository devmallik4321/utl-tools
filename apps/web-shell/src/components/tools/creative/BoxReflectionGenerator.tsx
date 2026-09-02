"use client";

import { useState } from "react";
import { Copy, Check, Sparkles, Layers, Sliders } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function BoxReflectionGenerator() {
  const [direction, setDirection] = useState<"below" | "above" | "left" | "right">("below");
  const [offset, setOffset] = useState<number>(4);
  const [fadeOpacity, setFadeOpacity] = useState<number>(30); // 0 to 100
  const [copied, setCopied] = useState<boolean>(false);

  const reflectRule = `-webkit-box-reflect: ${direction} ${offset}px linear-gradient(transparent, rgba(0, 0, 0, ${
    fadeOpacity / 100
  }));`;

  const fallbackCss = `/* Chrome, Safari, Edge (-webkit prefix) */
.reflected-box {
  ${reflectRule}
}

/* Universal Modern CSS Pseudo-element Fallback */
.reflected-card {
  position: relative;
}
.reflected-card::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  height: 50%;
  background: inherit;
  transform: scaleY(-1);
  opacity: ${fadeOpacity / 100};
  mask-image: linear-gradient(to bottom, rgba(0,0,0,1), transparent);
  -webkit-mask-image: linear-gradient(to bottom, rgba(0,0,0,1), transparent);
  pointer-events: none;
}`;

  const handleCopy = async () => {
    const ok = await copyToClipboard(fallbackCss);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Direction & Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Reflection Direction
          </label>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as any)}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value="below">Below (Standard Ground Mirror)</option>
            <option value="above">Above</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-semibold text-foreground uppercase tracking-wider">Offset Gap</label>
            <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{offset}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={30}
            value={offset}
            onChange={(e) => setOffset(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-semibold text-foreground uppercase tracking-wider">Fade Opacity</label>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{fadeOpacity}%</span>
          </div>
          <input
            type="range"
            min={5}
            max={90}
            value={fadeOpacity}
            onChange={(e) => setFadeOpacity(parseInt(e.target.value))}
            className="w-full accent-emerald-600"
          />
        </div>
      </div>

      {/* Live Preview Canvas */}
      <div className="p-10 bg-muted/40 border border-border rounded-2xl flex flex-col items-center justify-center min-h-[260px]">
        <div
          style={{
            WebkitBoxReflect: `${direction} ${offset}px linear-gradient(transparent, rgba(0, 0, 0, ${
              fadeOpacity / 100
            }))`,
          }}
          className="w-48 h-24 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-700 rounded-xl shadow-lg flex items-center justify-center text-white font-bold text-sm tracking-wider uppercase drop-shadow-md select-none"
        >
          Mirror Box
        </div>
      </div>

      {/* CSS Code Snippet */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-500" />
            CSS Reflection Rules &amp; Cross-Browser Fallback
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy CSS"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {fallbackCss}
        </pre>
      </div>
    </div>
  );
}
