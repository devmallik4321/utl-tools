"use client";

import { useState, useMemo } from "react";
import { Monitor, Copy, Check, Sparkles, Grid, Zap, Layers, Maximize } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const TILE_PRESETS = [
  { name: "2.6mm Fine Pitch (500x500mm)", tileW: 192, tileH: 192, widthMm: 500, heightMm: 500 },
  { name: "2.9mm Indoor Stage (500x500mm)", tileW: 168, tileH: 168, widthMm: 500, heightMm: 500 },
  { name: "3.9mm Touring Outdoor (500x500mm)", tileW: 128, tileH: 128, widthMm: 500, heightMm: 500 },
  { name: "3.9mm Rectangular (500x1000mm)", tileW: 128, tileH: 256, widthMm: 500, heightMm: 1000 },
  { name: "1.5mm Ultra-HD (600x337.5mm)", tileW: 384, tileH: 216, widthMm: 600, heightMm: 337.5 },
];

export function VideoWallCalculator() {
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);
  const [cols, setCols] = useState<number>(16);
  const [rows, setRows] = useState<number>(9);
  const [wattsPerTile, setWattsPerTile] = useState<number>(150); // Peak watts
  const [copied, setCopied] = useState<boolean>(false);

  const tile = TILE_PRESETS[selectedPresetIdx];

  const {
    totalWidthPx,
    totalHeightPx,
    totalPixels,
    aspectRatioStr,
    totalTiles,
    widthMeters,
    heightMeters,
    widthFeet,
    heightFeet,
    networkPortsNeeded,
    peakPowerKw,
  } = useMemo(() => {
    const wPx = cols * tile.tileW;
    const hPx = rows * tile.tileH;
    const pixels = wPx * hPx;
    const tilesCount = cols * rows;

    const ratio = (wPx / hPx).toFixed(2);

    const wM = (cols * tile.widthMm) / 1000;
    const hM = (rows * tile.heightMm) / 1000;
    const wFt = wM * 3.28084;
    const hFt = hM * 3.28084;

    // Standard Gigabit LED receiver card port capacity: ~650,000 pixels @ 60Hz 8-bit
    const ports = Math.ceil(pixels / 650000);

    const peakKw = (tilesCount * wattsPerTile) / 1000;

    return {
      totalWidthPx: wPx,
      totalHeightPx: hPx,
      totalPixels: pixels,
      aspectRatioStr: `${ratio}:1`,
      totalTiles: tilesCount,
      widthMeters: wM.toFixed(2),
      heightMeters: hM.toFixed(2),
      widthFeet: wFt.toFixed(1),
      heightFeet: hFt.toFixed(1),
      networkPortsNeeded: Math.max(1, ports),
      peakPowerKw: peakKw.toFixed(1),
    };
  }, [cols, rows, tile, wattsPerTile]);

  const handleCopy = async () => {
    const summary = `LED Video Wall Technical Specs (${cols} cols × ${rows} rows | ${totalTiles} Tiles):\n• Native Pixel Resolution: ${totalWidthPx} × ${totalHeightPx} px (${(totalPixels / 1000000).toFixed(2)} MP)\n• Aspect Ratio: ${aspectRatioStr}\n• Physical Dimensions: ${widthMeters}m × ${heightMeters}m (${widthFeet}ft × ${heightFeet}ft)\n• Processor Gigabit Data Ports: ${networkPortsNeeded} ports (NovaStar / Brompton)\n• Estimated Peak Power: ${peakPowerKw} kW`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Preset Selector */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          LED Tile Model / Pixel Pitch
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {TILE_PRESETS.map((p, idx) => (
            <button
              key={p.name}
              onClick={() => setSelectedPresetIdx(idx)}
              className={`p-2.5 text-left rounded-xl border text-xs font-semibold transition-colors ${
                selectedPresetIdx === idx
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-muted/40 border-border text-foreground hover:bg-muted"
              }`}
            >
              <span className="block font-bold">{p.name}</span>
              <span className="text-[10px] opacity-80 font-mono">
                {p.tileW} × {p.tileH} px per tile
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid Configuration */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Cabinet Columns (Width)
          </label>
          <input
            type="number"
            min={1}
            max={64}
            value={cols}
            onChange={(e) => setCols(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Cabinet Rows (Height)
          </label>
          <input
            type="number"
            min={1}
            max={64}
            value={rows}
            onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Peak Watts / Cabinet
          </label>
          <input
            type="number"
            min={50}
            max={500}
            step={25}
            value={wattsPerTile}
            onChange={(e) => setWattsPerTile(Math.max(10, parseInt(e.target.value) || 10))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Monitor className="w-4 h-4 text-emerald-500" />
            Video Wall Pixel Resolution &amp; Engineering Specs
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Engineering Specs"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Resolution (Pixels)
            </span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {totalWidthPx} × {totalHeightPx}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">
              Ratio: {aspectRatioStr} ({(totalPixels / 1000000).toFixed(2)} MP)
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Physical Size</span>
            <p className="text-xl font-bold text-foreground">
              {widthMeters}m × {heightMeters}m
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">
              {widthFeet}ft × {heightFeet}ft ({totalTiles} total tiles)
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Gigabit Data Ports
            </span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{networkPortsNeeded} Ports</p>
            <span className="text-[10px] text-muted-foreground font-sans">~650k px/port @ 60Hz</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Peak Power</span>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{peakPowerKw} kW</p>
            <span className="text-[10px] text-muted-foreground font-sans">~{Math.round(parseFloat(peakPowerKw) * 0.4)} kW avg running</span>
          </div>
        </div>
      </div>
    </div>
  );
}
