"use client";

import { useState } from "react";
import { Sliders, Copy, Check, Sparkles, MoveVertical, Palette } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function ScrollbarGenerator() {
  const [width, setWidth] = useState<number>(8);
  const [thumbColor, setThumbColor] = useState<string>("#3b82f6");
  const [thumbHover, setThumbHover] = useState<string>("#1d4ed8");
  const [trackColor, setTrackColor] = useState<string>("#1e293b");
  const [radius, setRadius] = useState<number>(10);
  const [copied, setCopied] = useState<boolean>(false);

  const cssSnippet = `/* Modern Standard (Firefox) */
* {
  scrollbar-width: thin;
  scrollbar-color: ${thumbColor} ${trackColor};
}

/* Chrome, Safari, Edge, Opera */
*::-webkit-scrollbar {
  width: ${width}px;
  height: ${width}px;
}

*::-webkit-scrollbar-track {
  background: ${trackColor};
  border-radius: ${radius}px;
}

*::-webkit-scrollbar-thumb {
  background-color: ${thumbColor};
  border-radius: ${radius}px;
  border: 2px solid ${trackColor};
}

*::-webkit-scrollbar-thumb:hover {
  background-color: ${thumbHover};
}`;

  const handleCopy = async () => {
    const ok = await copyToClipboard(cssSnippet);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-semibold text-foreground uppercase tracking-wider">Scrollbar Width</label>
            <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{width}px</span>
          </div>
          <input
            type="range"
            min={4}
            max={20}
            value={width}
            onChange={(e) => setWidth(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-semibold text-foreground uppercase tracking-wider">Corner Radius</label>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{radius}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={20}
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            className="w-full accent-emerald-600"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">Thumb Colors</label>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <input
                type="color"
                value={thumbColor}
                onChange={(e) => setThumbColor(e.target.value)}
                className="w-7 h-7 rounded border border-border cursor-pointer"
              />
              <span className="text-[10px] text-muted-foreground font-mono">Rest</span>
            </div>
            <div className="flex items-center gap-1">
              <input
                type="color"
                value={thumbHover}
                onChange={(e) => setThumbHover(e.target.value)}
                className="w-7 h-7 rounded border border-border cursor-pointer"
              />
              <span className="text-[10px] text-muted-foreground font-mono">Hover</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">Track Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={trackColor}
              onChange={(e) => setTrackColor(e.target.value)}
              className="w-7 h-7 rounded border border-border cursor-pointer"
            />
            <span className="text-xs font-mono text-foreground font-bold">{trackColor}</span>
          </div>
        </div>
      </div>

      {/* Live Preview Pane */}
      <div className="p-6 bg-muted/30 border border-border rounded-2xl flex flex-col items-center justify-center">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">Live Scrollbar Preview</h4>
        <div
          style={{
            scrollbarColor: `${thumbColor} ${trackColor}`,
          }}
          className="w-full max-w-md h-40 overflow-y-scroll p-4 bg-card border border-border rounded-xl text-xs text-muted-foreground space-y-3 shadow-inner"
        >
          <p className="font-bold text-foreground">Interactive Scroll Container</p>
          <p>
            Scroll down to inspect your custom scrollbar thumb styling, hover responsiveness, and border radius in real time.
          </p>
          <p>
            Clean CSS custom scrollbars provide refined visual polish for dark mode dashboards, code editors, and high-density SaaS tables.
          </p>
          <p>
            Both modern W3C standard properties and legacy WebKit pseudo-elements are supported for complete cross-browser compatibility across Chrome, Safari, Edge, and Firefox.
          </p>
          <p>
            Scroll further to confirm smooth track padding and corner rounding. End of scroll container.
          </p>
        </div>
      </div>

      {/* CSS Snippet */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <MoveVertical className="w-4 h-4 text-emerald-500" />
            Cross-Browser CSS Scrollbar Rules
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
          {cssSnippet}
        </pre>
      </div>
    </div>
  );
}
