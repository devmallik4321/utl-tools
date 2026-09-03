"use client";

import { useState, useMemo } from "react";
import { Sparkles, Copy, Check, Sliders, Box, Layers, FileCode } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function SvgViewBoxCalculator() {
  const [minX, setMinX] = useState<number>(0);
  const [minY, setMinY] = useState<number>(0);
  const [viewBoxW, setViewBoxW] = useState<number>(400);
  const [viewBoxH, setViewBoxH] = useState<number>(300);
  const [containerW, setContainerW] = useState<number>(500);
  const [containerH, setContainerH] = useState<number>(250);
  const [scaleMode, setScaleMode] = useState<"meet" | "slice" | "none">("meet");
  const [alignMode, setAlignMode] = useState<string>("xMidYMid");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const {
    preserveAspectRatioStr,
    effectiveScale,
    renderedW,
    renderedH,
    svgSnippet,
    jsTransformCode,
  } = useMemo(() => {
    const par = scaleMode === "none" ? "none" : `${alignMode} ${scaleMode}`;

    const scaleX = containerW / viewBoxW;
    const scaleY = containerH / viewBoxH;

    let scale = 1.0;
    if (scaleMode === "meet") {
      scale = Math.min(scaleX, scaleY);
    } else if (scaleMode === "slice") {
      scale = Math.max(scaleX, scaleY);
    }

    const rw = scaleMode === "none" ? containerW : Math.round(viewBoxW * scale);
    const rh = scaleMode === "none" ? containerH : Math.round(viewBoxH * scale);

    const svg = `<svg
  width="${containerW}"
  height="${containerH}"
  viewBox="${minX} ${minY} ${viewBoxW} ${viewBoxH}"
  preserveAspectRatio="${par}"
  xmlns="http://www.w3.org/2000/svg"
>
  <rect x="${minX}" y="${minY}" width="${viewBoxW}" height="${viewBoxH}" fill="#1e293b" stroke="#3b82f6" stroke-width="2"/>
  <circle cx="${minX + viewBoxW / 2}" cy="${minY + viewBoxH / 2}" r="${Math.min(viewBoxW, viewBoxH) * 0.3}" fill="#ec4899"/>
</svg>`;

    const jsCode = `// Map Mouse/Screen Pixel (clientX, clientY) to SVG Internal ViewBox Coordinates
function screenToSvgCoords(svgElement, clientX, clientY) {
  const pt = svgElement.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  // Use SVG Screen CTM (Current Transformation Matrix)
  const svgCoords = pt.matrixTransform(svgElement.getScreenCTM().inverse());
  return { x: svgCoords.x, y: svgCoords.y };
}`;

    return {
      preserveAspectRatioStr: par,
      effectiveScale: scaleMode === "none" ? `X: ${scaleX.toFixed(2)}, Y: ${scaleY.toFixed(2)}` : `${scale.toFixed(2)}x`,
      renderedW: rw,
      renderedH: rh,
      svgSnippet: svg,
      jsTransformCode: jsCode,
    };
  }, [minX, minY, viewBoxW, viewBoxH, containerW, containerH, scaleMode, alignMode]);

  const handleCopy = async (key: string, val: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* ViewBox vs Container Dimensions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Internal ViewBox */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-3">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
            SVG Internal `viewBox` (Virtual Canvas)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase">minX</span>
              <input
                type="number"
                value={minX}
                onChange={(e) => setMinX(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 font-mono text-xs bg-background border border-border rounded-lg"
              />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase">minY</span>
              <input
                type="number"
                value={minY}
                onChange={(e) => setMinY(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 font-mono text-xs bg-background border border-border rounded-lg"
              />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase">width</span>
              <input
                type="number"
                min={10}
                value={viewBoxW}
                onChange={(e) => setViewBoxW(Math.max(10, parseInt(e.target.value) || 10))}
                className="w-full px-2 py-1.5 font-mono text-xs bg-background border border-border rounded-lg"
              />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase">height</span>
              <input
                type="number"
                min={10}
                value={viewBoxH}
                onChange={(e) => setViewBoxH(Math.max(10, parseInt(e.target.value) || 10))}
                className="w-full px-2 py-1.5 font-mono text-xs bg-background border border-border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Outer Container Element */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-3">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
            Container / Element Dimensions (Screen Pixels)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase">width (px)</span>
              <input
                type="number"
                min={50}
                value={containerW}
                onChange={(e) => setContainerW(Math.max(50, parseInt(e.target.value) || 50))}
                className="w-full px-3 py-1.5 font-mono text-xs bg-background border border-border rounded-lg"
              />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground uppercase">height (px)</span>
              <input
                type="number"
                min={50}
                value={containerH}
                onChange={(e) => setContainerH(Math.max(50, parseInt(e.target.value) || 50))}
                className="w-full px-3 py-1.5 font-mono text-xs bg-background border border-border rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* PreserveAspectRatio Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Scaling Mode (`meet` vs `slice` vs `none`)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(["meet", "slice", "none"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setScaleMode(m)}
                className={`px-3 py-2 text-xs font-bold rounded-xl border capitalize transition-colors ${
                  scaleMode === m ? "bg-blue-600 text-white border-blue-600" : "bg-muted text-foreground border-border hover:bg-muted/80"
                }`}
              >
                {m === "meet" ? "meet (contain)" : m === "slice" ? "slice (cover)" : "none (stretch)"}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Alignment (`align`)
          </label>
          <select
            value={alignMode}
            disabled={scaleMode === "none"}
            onChange={(e) => setAlignMode(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground disabled:opacity-50"
          >
            <option value="xMidYMid">xMidYMid (Center Center - Default)</option>
            <option value="xMinYMin">xMinYMin (Top Left)</option>
            <option value="xMaxYMin">xMaxYMin (Top Right)</option>
            <option value="xMinYMax">xMinYMax (Bottom Left)</option>
            <option value="xMaxYMax">xMaxYMax (Bottom Right)</option>
          </select>
        </div>
      </div>

      {/* Live Interactive Scaled Box */}
      <div className="p-6 bg-slate-950 border border-border rounded-2xl flex flex-col items-center justify-center space-y-3">
        <div className="text-xs text-slate-400 font-mono flex gap-4">
          <span>Container: {containerW}×{containerH}px</span>
          <span>Effective Content: {renderedW}×{renderedH}px</span>
          <span>Scale: {effectiveScale}</span>
        </div>

        <div
          style={{
            width: Math.min(containerW, 500),
            height: Math.min(containerH, 240),
          }}
          className="border-2 border-dashed border-slate-700 bg-slate-900 relative overflow-hidden flex items-center justify-center"
        >
          <svg
            width="100%"
            height="100%"
            viewBox={`${minX} ${minY} ${viewBoxW} ${viewBoxH}`}
            preserveAspectRatio={preserveAspectRatioStr}
          >
            <rect
              x={minX}
              y={minY}
              width={viewBoxW}
              height={viewBoxH}
              fill="#1e293b"
              stroke="#3b82f6"
              strokeWidth="4"
            />
            <circle
              cx={minX + viewBoxW / 2}
              cy={minY + viewBoxH / 2}
              r={Math.min(viewBoxW, viewBoxH) * 0.3}
              fill="#ec4899"
            />
            <text
              x={minX + viewBoxW / 2}
              y={minY + viewBoxH / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#ffffff"
              fontSize={viewBoxW * 0.08}
              fontFamily="sans-serif"
              fontWeight="bold"
            >
              SVG Content
            </text>
          </svg>
        </div>
      </div>

      {/* Code Snippets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-foreground">SVG Header Definition</span>
            <button
              onClick={() => handleCopy("svg", svgSnippet)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "svg" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "svg" ? "Copied!" : "Copy SVG"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 rounded-lg text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
            {svgSnippet}
          </pre>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-foreground">Screen Pixel to SVG Coord Math</span>
            <button
              onClick={() => handleCopy("js", jsTransformCode)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "js" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "js" ? "Copied!" : "Copy JS"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 rounded-lg text-blue-600 dark:text-blue-400 overflow-x-auto select-all">
            {jsTransformCode}
          </pre>
        </div>
      </div>
    </div>
  );
}
