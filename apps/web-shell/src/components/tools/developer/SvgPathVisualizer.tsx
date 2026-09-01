"use client";

import { useState, useMemo } from "react";
import { Eye, Copy, Check, Sparkles, Layers, Sliders, Code } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_PATH = `M 20 80 Q 100 10 180 80 T 340 80`;

export function SvgPathVisualizer() {
  const [pathInput, setPathInput] = useState<string>(SAMPLE_PATH);
  const [strokeColor, setStrokeColor] = useState<string>("#3b82f6");
  const [fillColor, setFillColor] = useState<string>("none");
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [viewBoxSize, setViewBoxSize] = useState<number>(360);
  const [copied, setCopied] = useState<boolean>(false);

  // Extract path 'd' attribute if full SVG is pasted
  const pathD = useMemo(() => {
    const clean = pathInput.trim();
    if (clean.includes("<svg") || clean.includes("<path")) {
      const match = clean.match(/d=["']([^"']+)["']/);
      return match ? match[1] : clean;
    }
    return clean;
  }, [pathInput]);

  // Command Statistics
  const stats = useMemo(() => {
    const commands = pathD.match(/[MmLlHhVvCcSsQqTtAaZz]/g) || [];
    const counts: Record<string, number> = {};
    commands.forEach((c) => {
      counts[c.toUpperCase()] = (counts[c.toUpperCase()] || 0) + 1;
    });
    return { total: commands.length, counts };
  }, [pathD]);

  const minifiedSvg = useMemo(() => {
    const minD = pathD.replace(/\s+/g, " ").trim();
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="100%" height="100%"><path d="${minD}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round"/></svg>`;
  }, [pathD, viewBoxSize, fillColor, strokeColor, strokeWidth]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(minifiedSvg);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input and Preview Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Input & Styling Pane */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                SVG Path Data (`d` attribute) or XML
              </label>
              <span className="text-xs text-muted-foreground font-mono">{stats.total} commands</span>
            </div>
            <textarea
              value={pathInput}
              onChange={(e) => setPathInput(e.target.value)}
              rows={5}
              placeholder="Paste SVG path (M... Z) or full <svg> tag..."
              className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-muted-foreground block mb-1">Stroke Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="w-7 h-7 rounded border border-border cursor-pointer bg-transparent"
                />
                <span className="font-mono text-[11px] uppercase">{strokeColor}</span>
              </div>
            </div>

            <div>
              <label className="text-muted-foreground block mb-1">Stroke Width</label>
              <input
                type="number"
                min={1}
                max={20}
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-2 py-1 font-mono bg-background border border-border rounded-md"
              />
            </div>

            <div>
              <label className="text-muted-foreground block mb-1">ViewBox Size</label>
              <input
                type="number"
                min={50}
                max={2000}
                value={viewBoxSize}
                onChange={(e) => setViewBoxSize(Math.max(50, parseInt(e.target.value) || 100))}
                className="w-full px-2 py-1 font-mono bg-background border border-border rounded-md"
              />
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground pt-1">
            <span>Presets:</span>
            {[
              { name: "Sine Curve", d: "M 20 80 Q 100 10 180 80 T 340 80" },
              { name: "Heart", d: "M 180 280 C 60 180 40 80 120 60 C 160 50 180 100 180 100 C 180 100 200 50 240 60 C 320 80 300 180 180 280 Z" },
              { name: "Star", d: "M 180 20 L 220 130 L 340 130 L 240 200 L 280 310 L 180 240 L 80 310 L 120 200 L 20 130 L 140 130 Z" },
            ].map((p) => (
              <button
                key={p.name}
                onClick={() => setPathInput(p.d)}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Live SVG Render Canvas */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2 flex flex-col items-center">
          <div className="w-full flex justify-between items-center text-xs text-muted-foreground">
            <span className="font-semibold uppercase text-foreground flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-blue-500" />
              SVG Render Canvas
            </span>
            <span className="font-mono">{viewBoxSize} × {viewBoxSize} px</span>
          </div>

          <div className="w-full h-72 border border-dashed border-border rounded-xl flex items-center justify-center p-4 bg-muted/20 relative overflow-hidden">
            <svg
              viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
              className="w-full h-full max-h-64 drop-shadow-xs"
            >
              <path
                d={pathD}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Minified Code Output */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Code className="w-4 h-4 text-emerald-500" />
            Minified Clean SVG Code
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied SVG!" : "Copy SVG Code"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {minifiedSvg}
        </pre>
      </div>
    </div>
  );
}
