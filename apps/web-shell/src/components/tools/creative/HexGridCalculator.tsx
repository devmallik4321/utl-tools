"use client";

import { useState, useMemo } from "react";
import { Hexagon, Copy, Check, Sparkles, Gamepad2, Layers } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

type HexOrientation = "pointy" | "flat";

export function HexGridCalculator() {
  const [orientation, setOrientation] = useState<HexOrientation>("pointy");
  const [radius, setRadius] = useState<number>(36); // circumradius in pixels
  const [cols, setCols] = useState<number>(10);
  const [rows, setRows] = useState<number>(8);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const {
    hexWidth,
    hexHeight,
    horizStep,
    vertStep,
    totalWidth,
    totalHeight,
    totalTiles,
    axialToPixelCode,
    hexDistanceCode,
  } = useMemo(() => {
    let w = 0;
    let h = 0;
    let hStep = 0;
    let vStep = 0;

    if (orientation === "pointy") {
      // Pointy-topped
      w = Math.sqrt(3) * radius;
      h = 2 * radius;
      hStep = w;
      vStep = (3 / 4) * h;
    } else {
      // Flat-topped
      w = 2 * radius;
      h = Math.sqrt(3) * radius;
      hStep = (3 / 4) * w;
      vStep = h;
    }

    const mapW = orientation === "pointy" ? (cols + 0.5) * hStep : cols * hStep + (w / 4);
    const mapH = orientation === "pointy" ? rows * vStep + (h / 4) : (rows + 0.5) * vStep;

    const axialCode =
      orientation === "pointy"
        ? `// Pointy-Topped Axial (q, r) to Screen Pixels (x, y)
function axialToPixel(q, r, radius = ${radius}) {
  const x = radius * Math.sqrt(3) * (q + r / 2);
  const y = radius * (3 / 2) * r;
  return { x: Math.round(x), y: Math.round(y) };
}`
        : `// Flat-Topped Axial (q, r) to Screen Pixels (x, y)
function axialToPixel(q, r, radius = ${radius}) {
  const x = radius * (3 / 2) * q;
  const y = radius * Math.sqrt(3) * (r + q / 2);
  return { x: Math.round(x), y: Math.round(y) };
}`;

    const distCode = `// Hexagonal Distance using Cube Coordinates
function hexDistance(a, b) {
  // Convert axial (q, r) to cube (q, r, s) where s = -q - r
  const a_s = -a.q - a.r;
  const b_s = -b.q - b.r;
  return Math.max(Math.abs(a.q - b.q), Math.abs(a.r - b.r), Math.abs(a_s - b_s));
}`;

    return {
      hexWidth: w.toFixed(1),
      hexHeight: h.toFixed(1),
      horizStep: hStep.toFixed(1),
      vertStep: vStep.toFixed(1),
      totalWidth: Math.round(mapW),
      totalHeight: Math.round(mapH),
      totalTiles: cols * rows,
      axialToPixelCode: axialCode,
      hexDistanceCode: distCode,
    };
  }, [orientation, radius, cols, rows]);

  const handleCopy = async (key: string, val: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Orientation Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setOrientation("pointy")}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
            orientation === "pointy" ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
          }`}
        >
          Pointy-Topped Hexagon (Standard Strategy)
        </button>
        <button
          onClick={() => setOrientation("flat")}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
            orientation === "flat" ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
          }`}
        >
          Flat-Topped Hexagon (Catan / Wargames)
        </button>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Hex Radius (r)</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{radius} px</span>
          </div>
          <input
            type="range"
            min={12}
            max={120}
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
          <span className="text-[10px] text-muted-foreground">Center to vertex distance</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Grid Columns
          </label>
          <input
            type="number"
            min={1}
            max={50}
            value={cols}
            onChange={(e) => setCols(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Grid Rows
          </label>
          <input
            type="number"
            min={1}
            max={50}
            value={rows}
            onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Hexagon className="w-4 h-4 text-emerald-500" />
            Hex Dimensions &amp; Map Canvas Specs
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Single Hex Dimensions
            </span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {hexWidth} × {hexHeight} px
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Width × Height bounding box</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Center Spacing Steps
            </span>
            <p className="text-2xl font-bold text-foreground">
              Δx {horizStep}, Δy {vertStep}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Center-to-center offset</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Total Map Canvas
            </span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totalWidth} × {totalHeight} px
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">
              Total {totalTiles} hexagon tiles
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Short Diameter</span>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {(radius * Math.sqrt(3)).toFixed(1)} px
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Inradius r × √3</span>
          </div>
        </div>
      </div>

      {/* Code Snippets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-foreground">Axial ➔ Pixel Coordinate Projection</span>
            <button
              onClick={() => handleCopy("axial", axialToPixelCode)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "axial" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "axial" ? "Copied!" : "Copy"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 rounded-lg text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
            {axialToPixelCode}
          </pre>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-foreground">Hex Distance Formula (Cube Coordinates)</span>
            <button
              onClick={() => handleCopy("dist", hexDistanceCode)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "dist" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "dist" ? "Copied!" : "Copy"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 rounded-lg text-blue-600 dark:text-blue-400 overflow-x-auto select-all">
            {hexDistanceCode}
          </pre>
        </div>
      </div>
    </div>
  );
}
