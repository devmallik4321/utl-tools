"use client";

import { useState } from "react";
import { Copy, Check, Sparkles, Image as ImageIcon, Sliders, Maximize } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

type ObjectFitType = "contain" | "cover" | "fill" | "scale-down" | "none";

export function ObjectFitPreviewer() {
  const [objectFit, setObjectFit] = useState<ObjectFitType>("cover");
  const [position, setPosition] = useState<string>("center");
  const [containerRatio, setContainerRatio] = useState<string>("aspect-video");
  const [copied, setCopied] = useState<boolean>(false);

  const cssSnippet = `/* CSS image object-fit */\nimg.responsive-media {\n  width: 100%;\n  height: 100%;\n  object-fit: ${objectFit};\n  object-position: ${position};\n}`;

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            CSS `object-fit` Mode
          </label>
          <select
            value={objectFit}
            onChange={(e) => setObjectFit(e.target.value as ObjectFitType)}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value="cover">cover (Fills container, crops excess)</option>
            <option value="contain">contain (Letterboxes, shows whole image)</option>
            <option value="fill">fill (Stretches to fill container)</option>
            <option value="scale-down">scale-down (Smallest of contain or none)</option>
            <option value="none">none (Preserves intrinsic size)</option>
          </select>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            CSS `object-position`
          </label>
          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value="center">center</option>
            <option value="top">top</option>
            <option value="bottom">bottom</option>
            <option value="left">left</option>
            <option value="right">right</option>
            <option value="top left">top left</option>
            <option value="top right">top right</option>
          </select>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Container Frame Aspect Ratio
          </label>
          <select
            value={containerRatio}
            onChange={(e) => setContainerRatio(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value="aspect-video">16:9 Widescreen Landscape</option>
            <option value="aspect-square">1:1 Square</option>
            <option value="aspect-[4/3]">4:3 Standard</option>
            <option value="aspect-[9/16]">9:16 Mobile Vertical</option>
          </select>
        </div>
      </div>

      {/* Interactive Visual Frame */}
      <div className="p-6 bg-muted/30 border border-border rounded-2xl flex flex-col items-center justify-center">
        <div
          className={`w-full max-w-md ${containerRatio} border-2 border-dashed border-blue-500 rounded-xl overflow-hidden bg-slate-950 relative shadow-lg flex items-center justify-center`}
        >
          <div
            style={{
              objectFit,
              objectPosition: position,
            }}
            className="w-full h-full bg-gradient-to-tr from-cyan-600 via-indigo-600 to-rose-600 flex flex-col items-center justify-center text-white font-bold text-sm tracking-wider uppercase drop-shadow-md select-none p-4 text-center"
          >
            <ImageIcon className="w-8 h-8 mb-2 opacity-80" />
            <span>Sample Image Media</span>
            <span className="text-[10px] font-mono opacity-70">
              fit: {objectFit} | pos: {position}
            </span>
          </div>
        </div>
        <span className="text-[11px] text-muted-foreground pt-3">
          Dashed blue border denotes outer container boundary.
        </span>
      </div>

      {/* CSS Code Snippet */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Maximize className="w-4 h-4 text-emerald-500" />
            CSS Object-Fit Snippet
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
