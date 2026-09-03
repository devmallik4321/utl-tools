"use client";

import { useState, useMemo } from "react";
import { Grid, Copy, Check, Sparkles, Layers, Gamepad2, FileCode } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function StaggeredIsometricGridCalculator() {
  const [tileWidth, setTileWidth] = useState<number>(64); // pixels
  const [tileHeight, setTileHeight] = useState<number>(32); // 2:1 ratio
  const [cols, setCols] = useState<number>(10);
  const [rows, setRows] = useState<number>(10);
  const [staggerAxis, setStaggerAxis] = useState<"row" | "col">("row"); // Stagger rows or columns
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const {
    canvasWidth,
    canvasHeight,
    totalTiles,
    jsTileMathCode,
  } = useMemo(() => {
    let cw = 0;
    let ch = 0;

    if (staggerAxis === "row") {
      cw = cols * tileWidth + tileWidth / 2;
      ch = (rows + 1) * (tileHeight / 2);
    } else {
      cw = (cols + 1) * (tileWidth / 2);
      ch = rows * tileHeight + tileHeight / 2;
    }

    const code = `// Staggered Isometric (2:1) Coordinate Projection
// Tile Size: ${tileWidth}x${tileHeight}px

function tileToScreen(col, row) {
  let x = col * ${tileWidth};
  // Stagger every odd row by half tile width
  if (row % 2 !== 0) {
    x += ${tileWidth / 2};
  }
  const y = row * ${tileHeight / 2};
  return { x, y };
}

function screenToTile(screenX, screenY) {
  // Approximate coarse tile picking
  const approxRow = Math.floor(screenY / ${tileHeight / 2});
  const isOdd = approxRow % 2 !== 0;
  const offsetX = isOdd ? ${tileWidth / 2} : 0;
  const approxCol = Math.floor((screenX - offsetX) / ${tileWidth});
  return { col: approxCol, row: approxRow };
}`;

    return {
      canvasWidth: Math.round(cw),
      canvasHeight: Math.round(ch),
      totalTiles: cols * rows,
      jsTileMathCode: code,
    };
  }, [tileWidth, tileHeight, cols, rows, staggerAxis]);

  const handleCopy = async (key: string, val: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Tile Width (px)
          </label>
          <input
            type="number"
            min={16}
            step={8}
            value={tileWidth}
            onChange={(e) => {
              const w = Math.max(8, parseInt(e.target.value) || 8);
              setTileWidth(w);
              setTileHeight(Math.round(w / 2)); // keep 2:1
            }}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Tile Height (px)
          </label>
          <input
            type="number"
            min={8}
            step={4}
            value={tileHeight}
            onChange={(e) => setTileHeight(Math.max(4, parseInt(e.target.value) || 4))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
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
            <Grid className="w-4 h-4 text-emerald-500" />
            Staggered Tilemap Dimensions &amp; Geometry
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Tile Aspect Ratio
            </span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {(tileWidth / tileHeight).toFixed(1)} : 1
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">
              {tileWidth} × {tileHeight} px
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Total Map Canvas
            </span>
            <p className="text-2xl font-bold text-foreground">
              {canvasWidth} × {canvasHeight} px
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">{totalTiles} total tiles</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Vertical Row Step
            </span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{tileHeight / 2} px</p>
            <span className="text-[10px] text-muted-foreground font-sans">Height / 2 per row</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Stagger Offset
            </span>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{tileWidth / 2} px</p>
            <span className="text-[10px] text-muted-foreground font-sans">Half-width shift on odd rows</span>
          </div>
        </div>
      </div>

      {/* Projection Code Snippet */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between font-sans">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-emerald-500" />
            JavaScript Coordinate Projection &amp; Hit Picking
          </h4>
          <button
            onClick={() => handleCopy("math", jsTileMathCode)}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copiedKey === "math" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === "math" ? "Copied!" : "Copy Code"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {jsTileMathCode}
        </pre>
      </div>
    </div>
  );
}
