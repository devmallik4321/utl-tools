"use client";

import React, { useState, useMemo } from "react";
import { Box, Copy, Check, Eye, Sliders, Palette, RefreshCw } from "lucide-react";

export function SvgIsometricGridGenerator() {
  const [cols, setCols] = useState<number>(6);
  const [rows, setRows] = useState<number>(6);
  const [tileWidth, setTileWidth] = useState<number>(64);
  const [tileHeight, setTileHeight] = useState<number>(32);
  const [blockHeight, setBlockHeight] = useState<number>(24);
  const [showLabels, setShowLabels] = useState<boolean>(false);
  const [elevatedIndices, setElevatedIndices] = useState<string[]>(["2,2", "2,3", "3,2"]);

  // Theme
  const [theme, setTheme] = useState<"CYBERPUNK" | "BLUEPRINT" | "MONOCHROME">("CYBERPUNK");
  const [copiedSvg, setCopiedSvg] = useState(false);

  const colors = useMemo(() => {
    switch (theme) {
      case "CYBERPUNK":
        return {
          bg: "#090d16",
          gridStroke: "#06b6d4",
          gridFill: "#0c1b2f",
          topFace: "#38bdf8",
          leftFace: "#0284c7",
          rightFace: "#0369a1",
          label: "#7dd3fc"
        };
      case "BLUEPRINT":
        return {
          bg: "#0b1e3b",
          gridStroke: "#60a5fa",
          gridFill: "#172554",
          topFace: "#93c5fd",
          leftFace: "#3b82f6",
          rightFace: "#1d4ed8",
          label: "#bfdbfe"
        };
      default:
        return {
          bg: "#111827",
          gridStroke: "#64748b",
          gridFill: "#1e293b",
          topFace: "#cbd5e1",
          leftFace: "#94a3b8",
          rightFace: "#64748b",
          label: "#e2e8f0"
        };
    }
  }, [theme]);

  // Viewport calculation
  const halfW = tileWidth / 2;
  const halfH = tileHeight / 2;
  const svgWidth = (cols + rows) * halfW + 100;
  const svgHeight = (cols + rows) * halfH + blockHeight + 100;
  const originX = rows * halfW + 50;
  const originY = 50 + blockHeight;

  // Project (col, row, z) to 2D
  const project = (c: number, r: number, z = 0) => {
    const x = originX + (c - r) * halfW;
    const y = originY + (c + r) * halfH - z * blockHeight;
    return { x, y };
  };

  // Generate SVG string
  const svgContent = useMemo(() => {
    const lines: string[] = [];
    lines.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}" style="background-color: ${colors.bg};">`);

    // Render floor tiles
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const key = `${c},${r}`;
        const isElevated = elevatedIndices.includes(key);

        const pTop = project(c, r);
        const pRight = project(c + 1, r);
        const pBottom = project(c + 1, r + 1);
        const pLeft = project(c, r + 1);

        if (!isElevated) {
          // Flat Diamond
          lines.push(`  <polygon points="${pTop.x},${pTop.y} ${pRight.x},${pRight.y} ${pBottom.x},${pBottom.y} ${pLeft.x},${pLeft.y}" fill="${colors.gridFill}" stroke="${colors.gridStroke}" stroke-width="1" />`);
          if (showLabels) {
            const centerX = (pTop.x + pBottom.x) / 2;
            const centerY = (pTop.y + pBottom.y) / 2;
            lines.push(`  <text x="${centerX}" y="${centerY + 3}" fill="${colors.label}" font-size="8" font-family="monospace" text-anchor="middle">${c},${r}</text>`);
          }
        } else {
          // Elevated 3D Cube
          const tTop = project(c, r, 1);
          const tRight = project(c + 1, r, 1);
          const tBottom = project(c + 1, r + 1, 1);
          const tLeft = project(c, r + 1, 1);

          // Left Face
          lines.push(`  <polygon points="${tLeft.x},${tLeft.y} ${tBottom.x},${tBottom.y} ${pBottom.x},${pBottom.y} ${pLeft.x},${pLeft.y}" fill="${colors.leftFace}" stroke="${colors.gridStroke}" stroke-width="1" />`);
          // Right Face
          lines.push(`  <polygon points="${tBottom.x},${tBottom.y} ${tRight.x},${tRight.y} ${pRight.x},${pRight.y} ${pBottom.x},${pBottom.y}" fill="${colors.rightFace}" stroke="${colors.gridStroke}" stroke-width="1" />`);
          // Top Face
          lines.push(`  <polygon points="${tTop.x},${tTop.y} ${tRight.x},${tRight.y} ${tBottom.x},${tBottom.y} ${tLeft.x},${tLeft.y}" fill="${colors.topFace}" stroke="${colors.gridStroke}" stroke-width="1" />`);
        }
      }
    }

    lines.push(`</svg>`);
    return lines.join("\n");
  }, [cols, rows, tileWidth, tileHeight, blockHeight, elevatedIndices, colors, showLabels]);

  const toggleElevate = (c: number, r: number) => {
    const key = `${c},${r}`;
    setElevatedIndices((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleCopySvg = async () => {
    try {
      await navigator.clipboard.writeText(svgContent);
      setCopiedSvg(true);
      setTimeout(() => setCopiedSvg(false), 2000);
    } catch {}
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-200">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            2.5D Isometric Math
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Vector SVG Projection
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Box className="w-6 h-6 text-cyan-400" />
          SVG Isometric 3D Grid & Tile Coordinate Projection Generator
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Generate clean, scalable 2.5D isometric tile grids and extruded prism blocks with coordinate projection mapping and custom thematic vector styling.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" /> Grid Dimensions & Tile Ratios
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Columns (X-axis)</label>
                <input
                  type="number"
                  min="2"
                  max="12"
                  value={cols}
                  onChange={(e) => setCols(Math.max(2, Math.min(12, Number(e.target.value))))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Rows (Y-axis)</label>
                <input
                  type="number"
                  min="2"
                  max="12"
                  value={rows}
                  onChange={(e) => setRows(Math.max(2, Math.min(12, Number(e.target.value))))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Tile Width</span>
                  <span className="font-mono text-cyan-400">{tileWidth}px</span>
                </div>
                <input
                  type="range"
                  min="32"
                  max="96"
                  step="4"
                  value={tileWidth}
                  onChange={(e) => {
                    const w = Number(e.target.value);
                    setTileWidth(w);
                    setTileHeight(w / 2); // Maintain standard 2:1 isometric ratio
                  }}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Extruded Block Height (Z)</span>
                  <span className="font-mono text-cyan-400">{blockHeight}px</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={blockHeight}
                  onChange={(e) => setBlockHeight(Number(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-3">
              <label className="text-xs text-slate-400 block">Theme Palette</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "CYBERPUNK", label: "Cyberpunk" },
                  { id: "BLUEPRINT", label: "Blueprint" },
                  { id: "MONOCHROME", label: "Monochrome" }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as any)}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-medium transition ${
                      theme === t.id
                        ? "bg-cyan-600/20 border-cyan-500 text-cyan-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0"
                />
                <span>Render (X, Y) Coordinate Text Labels</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Preview & SVG Code (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Live SVG Canvas */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center min-h-[320px] overflow-auto shadow-inner relative">
            <span className="text-[11px] text-slate-500 absolute top-3 left-4">
              Tip: Click any tile to toggle 3D block extrusion
            </span>

            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="max-h-[320px] w-auto select-none"
              style={{ backgroundColor: colors.bg }}
            >
              {Array.from({ length: rows }).map((_, r) =>
                Array.from({ length: cols }).map((_, c) => {
                  const key = `${c},${r}`;
                  const isElevated = elevatedIndices.includes(key);

                  const pTop = project(c, r);
                  const pRight = project(c + 1, r);
                  const pBottom = project(c + 1, r + 1);
                  const pLeft = project(c, r + 1);

                  if (!isElevated) {
                    return (
                      <g key={key} onClick={() => toggleElevate(c, r)} className="cursor-pointer group">
                        <polygon
                          points={`${pTop.x},${pTop.y} ${pRight.x},${pRight.y} ${pBottom.x},${pBottom.y} ${pLeft.x},${pLeft.y}`}
                          fill={colors.gridFill}
                          stroke={colors.gridStroke}
                          strokeWidth="1"
                          className="transition-colors group-hover:fill-cyan-900/60"
                        />
                        {showLabels && (
                          <text
                            x={(pTop.x + pBottom.x) / 2}
                            y={(pTop.y + pBottom.y) / 2 + 3}
                            fill={colors.label}
                            fontSize="8"
                            fontFamily="monospace"
                            textAnchor="middle"
                            className="pointer-events-none"
                          >
                            {c},{r}
                          </text>
                        )}
                      </g>
                    );
                  }

                  const tTop = project(c, r, 1);
                  const tRight = project(c + 1, r, 1);
                  const tBottom = project(c + 1, r + 1, 1);
                  const tLeft = project(c, r + 1, 1);

                  return (
                    <g key={key} onClick={() => toggleElevate(c, r)} className="cursor-pointer group">
                      <polygon
                        points={`${tLeft.x},${tLeft.y} ${tBottom.x},${tBottom.y} ${pBottom.x},${pBottom.y} ${pLeft.x},${pLeft.y}`}
                        fill={colors.leftFace}
                        stroke={colors.gridStroke}
                        strokeWidth="1"
                      />
                      <polygon
                        points={`${tBottom.x},${tBottom.y} ${tRight.x},${tRight.y} ${pRight.x},${pRight.y} ${pBottom.x},${pBottom.y}`}
                        fill={colors.rightFace}
                        stroke={colors.gridStroke}
                        strokeWidth="1"
                      />
                      <polygon
                        points={`${tTop.x},${tTop.y} ${tRight.x},${tRight.y} ${tBottom.x},${tBottom.y} ${tLeft.x},${tLeft.y}`}
                        fill={colors.topFace}
                        stroke={colors.gridStroke}
                        strokeWidth="1"
                        className="group-hover:brightness-110"
                      />
                    </g>
                  );
                })
              )}
            </svg>
          </div>

          {/* Code Export */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Clean Vector SVG Markup</span>
              <button
                onClick={handleCopySvg}
                className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded flex items-center gap-1 transition shadow-sm"
              >
                {copiedSvg ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSvg ? "Copied SVG!" : "Copy SVG"}
              </button>
            </div>
            <pre className="w-full bg-slate-950/90 font-mono text-xs text-cyan-300 border border-slate-800 rounded-xl p-4 overflow-x-auto max-h-[160px] leading-relaxed shadow-inner">
              <code>{svgContent}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SvgIsometricGridGenerator;
