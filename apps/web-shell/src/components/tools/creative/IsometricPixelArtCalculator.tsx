"use client";

import { useState, useMemo } from "react";
import { Grid, Copy, Check, Sparkles, Layers, Gamepad2, Code } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const TILE_PRESETS = [
  { name: "64 × 32 px (Standard Retro)", w: 64, h: 32 },
  { name: "32 × 16 px (Micro / GBA)", w: 32, h: 16 },
  { name: "128 × 64 px (Modern HD Pixel Art)", w: 128, h: 64 },
  { name: "256 × 128 px (High-Res 2D)", w: 256, h: 128 },
];

export function IsometricPixelArtCalculator() {
  const [tileW, setTileW] = useState<number>(64);
  const [tileH, setTileH] = useState<number>(32);
  const [gridCols, setGridCols] = useState<number>(12);
  const [gridRows, setGridRows] = useState<number>(12);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const {
    aspectRatioRatio,
    stairAngleDeg,
    mapWidthPx,
    mapHeightPx,
    totalTiles,
    screenToIsoCode,
    isoToScreenCode,
  } = useMemo(() => {
    const halfW = tileW / 2;
    const halfH = tileH / 2;

    // Classic 2:1 stair step angle
    const angleRad = Math.atan2(halfH, halfW);
    const angleDeg = (angleRad * (180 / Math.PI)).toFixed(3);

    // Total bounding map width & height
    const mapW = (gridCols + gridRows) * halfW;
    const mapH = (gridCols + gridRows) * halfH;

    const toScreen = `// Convert Map Grid (tileX, tileY) to Screen Pixels (x, y)
function isoToScreen(tileX, tileY) {
  const screenX = (tileX - tileY) * ${halfW};
  const screenY = (tileX + tileY) * ${halfH};
  return { x: screenX, y: screenY };
}`;

    const toIso = `// Convert Screen Pixels (screenX, screenY) to Map Grid (tileX, tileY)
function screenToIso(screenX, screenY) {
  const tileX = Math.floor((screenX / ${halfW} + screenY / ${halfH}) / 2);
  const tileY = Math.floor((screenY / ${halfH} - screenX / ${halfW}) / 2);
  return { tileX, tileY };
}`;

    return {
      aspectRatioRatio: `${tileW / tileH}:1`,
      stairAngleDeg: angleDeg,
      mapWidthPx: mapW,
      mapHeightPx: mapH,
      totalTiles: gridCols * gridRows,
      screenToIsoCode: toIso,
      isoToScreenCode: toScreen,
    };
  }, [tileW, tileH, gridCols, gridRows]);

  const setPreset = (p: (typeof TILE_PRESETS)[0]) => {
    setTileW(p.w);
    setTileH(p.h);
  };

  const handleCopy = async (key: string, val: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {TILE_PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => setPreset(p)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
              tileW === p.w && tileH === p.h
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Grid Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Tile Width (Pixels)
          </label>
          <input
            type="number"
            min={16}
            step={16}
            value={tileW}
            onChange={(e) => setTileW(Math.max(4, parseInt(e.target.value) || 4))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Tile Height (Pixels)
          </label>
          <input
            type="number"
            min={8}
            step={8}
            value={tileH}
            onChange={(e) => setTileH(Math.max(2, parseInt(e.target.value) || 2))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Map Grid Columns
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={gridCols}
            onChange={(e) => setGridCols(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Map Grid Rows
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={gridRows}
            onChange={(e) => setGridRows(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Gamepad2 className="w-4 h-4 text-emerald-500" />
            2:1 Dimetric Geometry &amp; Map Canvas Specs
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              True Pixel Angle
            </span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stairAngleDeg}°</p>
            <span className="text-[10px] text-muted-foreground font-sans">
              2:1 stair step (arctan 0.5)
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Map Bounding Box
            </span>
            <p className="text-2xl font-bold text-foreground">
              {mapWidthPx} × {mapHeightPx} px
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Total {totalTiles} tiles grid</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Tile Aspect Ratio
            </span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{aspectRatioRatio}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Pure 2:1 dimetric diamond</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Half-Width / Height</span>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {tileW / 2} × {tileH / 2}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Screen offset increments</span>
          </div>
        </div>
      </div>

      {/* Code Snippets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-foreground">Isometric ➔ Screen Projection</span>
            <button
              onClick={() => handleCopy("isoToScreen", isoToScreenCode)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "isoToScreen" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "isoToScreen" ? "Copied!" : "Copy"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 rounded-lg text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
            {isoToScreenCode}
          </pre>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-foreground">Screen ➔ Isometric (Mouse Picking)</span>
            <button
              onClick={() => handleCopy("screenToIso", screenToIsoCode)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "screenToIso" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "screenToIso" ? "Copied!" : "Copy"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 rounded-lg text-blue-600 dark:text-blue-400 overflow-x-auto select-all">
            {screenToIsoCode}
          </pre>
        </div>
      </div>
    </div>
  );
}
