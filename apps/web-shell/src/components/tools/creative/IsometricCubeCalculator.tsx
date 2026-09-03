"use client";

import { useState, useMemo } from "react";
import { Box, Copy, Check, Sparkles, Layers, Gamepad2 } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function IsometricCubeCalculator() {
  const [cubeSize, setCubeSize] = useState<number>(60); // Cube edge in pixels
  const [gridX, setGridX] = useState<number>(4);
  const [gridY, setGridY] = useState<number>(4);
  const [gridZ, setGridZ] = useState<number>(3); // Stacked layers
  const [topColor, setTopColor] = useState<string>("#60a5fa"); // Lightest
  const [leftColor, setLeftColor] = useState<string>("#2563eb"); // Medium shadow
  const [rightColor, setRightColor] = useState<string>("#1d4ed8"); // Darkest shadow
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const {
    blockWidth,
    blockHeight,
    boundingWidth,
    boundingHeight,
    totalVoxels,
    cssFaceSnippet,
    zIndexFormulaCode,
  } = useMemo(() => {
    // True isometric cube geometry
    const bw = Math.sqrt(3) * cubeSize;
    const bh = 2 * cubeSize;

    // Total bounding canvas for (X, Y, Z) stack
    const totalW = (gridX + gridY) * (bw / 2);
    const totalH = (gridX + gridY) * (cubeSize / 2) + gridZ * cubeSize;

    const faceCss = `/* Pure CSS 3D Isometric Voxel Cube */
.cube {
  position: absolute;
  width: ${Math.round(bw)}px;
  height: ${Math.round(bh)}px;
}

.cube .face-top {
  position: absolute;
  width: ${cubeSize}px;
  height: ${cubeSize}px;
  background-color: ${topColor};
  transform: rotate(-45deg) skew(15deg, 15deg);
  top: 0;
  left: ${Math.round(bw / 2 - cubeSize / 2)}px;
}

.cube .face-left {
  position: absolute;
  width: ${Math.round(bw / 2)}px;
  height: ${cubeSize}px;
  background-color: ${leftColor};
  transform: skewY(30deg);
  top: ${Math.round(cubeSize * 0.75)}px;
  left: 0;
}

.cube .face-right {
  position: absolute;
  width: ${Math.round(bw / 2)}px;
  height: ${cubeSize}px;
  background-color: ${rightColor};
  transform: skewY(-30deg);
  top: ${Math.round(cubeSize * 0.75)}px;
  left: ${Math.round(bw / 2)}px;
}`;

    const zIndexCode = `// Depth sorting Z-index for 3D Isometric Voxel Stacking
function getVoxelZIndex(x, y, z) {
  // Front-to-back sorting: higher x + y + z renders on top
  return (x + y) * 1000 + z;
}

// Convert 3D Voxel Coordinate (x, y, z) to Screen Pixels
function voxelToScreen(x, y, z, cubeSize = ${cubeSize}) {
  const halfW = (Math.sqrt(3) * cubeSize) / 2;
  const screenX = (x - y) * halfW;
  const screenY = (x + y) * (cubeSize / 2) - z * cubeSize;
  return { x: Math.round(screenX), y: Math.round(screenY) };
}`;

    return {
      blockWidth: bw.toFixed(1),
      blockHeight: bh.toFixed(1),
      boundingWidth: Math.round(totalW),
      boundingHeight: Math.round(totalH),
      totalVoxels: gridX * gridY * gridZ,
      cssFaceSnippet: faceCss,
      zIndexFormulaCode: zIndexCode,
    };
  }, [cubeSize, gridX, gridY, gridZ, topColor, leftColor, rightColor]);

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
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Cube Edge (s)</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{cubeSize}px</span>
          </div>
          <input
            type="range"
            min={20}
            max={120}
            value={cubeSize}
            onChange={(e) => setCubeSize(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Grid Width (X)
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={gridX}
            onChange={(e) => setGridX(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Grid Depth (Y)
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={gridY}
            onChange={(e) => setGridY(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Stack Height (Z)
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={gridZ}
            onChange={(e) => setGridZ(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* Face Colors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Top Face (Light)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={topColor}
              onChange={(e) => setTopColor(e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
            <input
              type="text"
              value={topColor}
              onChange={(e) => setTopColor(e.target.value)}
              className="w-full px-2 py-1 font-mono text-xs bg-background border border-border rounded-lg"
            />
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Left Face (Medium)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={leftColor}
              onChange={(e) => setLeftColor(e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
            <input
              type="text"
              value={leftColor}
              onChange={(e) => setLeftColor(e.target.value)}
              className="w-full px-2 py-1 font-mono text-xs bg-background border border-border rounded-lg"
            />
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Right Face (Dark Shadow)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={rightColor}
              onChange={(e) => setRightColor(e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
            <input
              type="text"
              value={rightColor}
              onChange={(e) => setRightColor(e.target.value)}
              className="w-full px-2 py-1 font-mono text-xs bg-background border border-border rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Box className="w-4 h-4 text-emerald-500" />
            3D Isometric Block Geometry &amp; Canvas Grid
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Single Cube Dimensions
            </span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {blockWidth} × {blockHeight} px
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Width × Height bounding box</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Total Map Canvas
            </span>
            <p className="text-2xl font-bold text-foreground">
              {boundingWidth} × {boundingHeight} px
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">
              {totalVoxels} voxels volume
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Vertical Layer Step
            </span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{cubeSize} px</p>
            <span className="text-[10px] text-muted-foreground font-sans">Δz height per block</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Diagonal Span
            </span>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {(cubeSize * Math.sqrt(3)).toFixed(1)} px
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">s × √3 horizontal span</span>
          </div>
        </div>
      </div>

      {/* Code Snippets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-foreground">CSS 3D Face Skew Transforms</span>
            <button
              onClick={() => handleCopy("css", cssFaceSnippet)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "css" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "css" ? "Copied!" : "Copy"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 rounded-lg text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
            {cssFaceSnippet}
          </pre>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-foreground">Voxel Projection &amp; Z-Index Sorting</span>
            <button
              onClick={() => handleCopy("code", zIndexFormulaCode)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "code" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "code" ? "Copied!" : "Copy"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 rounded-lg text-blue-600 dark:text-blue-400 overflow-x-auto select-all">
            {zIndexFormulaCode}
          </pre>
        </div>
      </div>
    </div>
  );
}
