'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Compass, Eye, Shield, Play, RotateCcw, Copy, Check, Code2, Layers } from 'lucide-react';

interface CubeCoord {
  q: number;
  r: number;
  s: number;
}

// Distance between two cube coords
function cubeDistance(a: CubeCoord, b: CubeCoord): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.s - b.s)) / 2;
}

// Linear interpolation for a single float
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Lerp between two cube coordinates
function cubeLerp(a: CubeCoord, b: CubeCoord, t: number) {
  return {
    q: lerp(a.q, b.q, t),
    r: lerp(a.r, b.r, t),
    s: lerp(a.s, b.s, t)
  };
}

// Round fractional cube coordinates to nearest integer hex
function cubeRound(frac: { q: number; r: number; s: number }): CubeCoord {
  let q = Math.round(frac.q);
  let r = Math.round(frac.r);
  let s = Math.round(frac.s);

  const qDiff = Math.abs(q - frac.q);
  const rDiff = Math.abs(r - frac.r);
  const sDiff = Math.abs(s - frac.s);

  if (qDiff > rDiff && qDiff > sDiff) {
    q = -r - s;
  } else if (rDiff > sDiff) {
    r = -q - s;
  } else {
    s = -q - r;
  }

  return { q, r, s };
}

// Generate the line of hexes between A and B
function cubeLineDraw(a: CubeCoord, b: CubeCoord): CubeCoord[] {
  const N = cubeDistance(a, b);
  if (N === 0) return [a];

  const results: CubeCoord[] = [];
  // Small nudge to avoid drawing along ambiguous hex edges/corners
  const aNudge = { q: a.q + 1e-6, r: a.r + 1e-6, s: a.s - 2e-6 };
  const bNudge = { q: b.q + 1e-6, r: b.r + 1e-6, s: b.s - 2e-6 };

  const step = 1.0 / N;
  for (let i = 0; i <= N; i++) {
    results.push(cubeRound(cubeLerp(aNudge, bNudge, step * i)));
  }
  return results;
}

function coordKey(c: CubeCoord): string {
  return `${c.q},${c.r},${c.s}`;
}

export function HexGridLineDrawingAlgorithm() {
  const [gridRadius, setGridRadius] = useState<number>(4);
  const [hexSize, setHexSize] = useState<number>(24);
  const [orientation, setOrientation] = useState<'pointy' | 'flat'>('pointy');

  // Start & End
  const [startHex, setStartHex] = useState<CubeCoord>({ q: -3, r: 1, s: 2 });
  const [endHex, setEndHex] = useState<CubeCoord>({ q: 3, r: -2, s: -1 });

  // Obstacles set
  const [obstacles, setObstacles] = useState<Set<string>>(() => {
    const init = new Set<string>();
    init.add('0,0,0');
    init.add('0,-1,1');
    init.add('0,1,-1');
    return init;
  });

  const [activeTool, setActiveTool] = useState<'start' | 'end' | 'obstacle'>('obstacle');
  const [copied, setCopied] = useState(false);

  // Generate all hexes in radius
  const allHexes = useMemo(() => {
    const hexes: CubeCoord[] = [];
    for (let q = -gridRadius; q <= gridRadius; q++) {
      const r1 = Math.max(-gridRadius, -q - gridRadius);
      const r2 = Math.min(gridRadius, -q + gridRadius);
      for (let r = r1; r <= r2; r++) {
        const s = -q - r;
        hexes.push({ q, r, s });
      }
    }
    return hexes;
  }, [gridRadius]);

  // Compute raycast line
  const linePath = useMemo(() => {
    return cubeLineDraw(startHex, endHex);
  }, [startHex, endHex]);

  // Line of sight validation
  const lineOfSightResult = useMemo(() => {
    let hasCollision = false;
    let collisionHex: CubeCoord | null = null;
    const pathWithCollision: { hex: CubeCoord; blocked: boolean }[] = [];

    for (const h of linePath) {
      const key = coordKey(h);
      // Don't collide on start hex
      const isStart = h.q === startHex.q && h.r === startHex.r;
      if (!isStart && obstacles.has(key)) {
        hasCollision = true;
        if (!collisionHex) collisionHex = h;
      }
      pathWithCollision.push({
        hex: h,
        blocked: hasCollision
      });
    }

    return {
      hasLineOfSight: !hasCollision,
      collisionHex,
      path: pathWithCollision,
      distance: cubeDistance(startHex, endHex)
    };
  }, [linePath, obstacles, startHex]);

  // Hex to pixel conversion
  const hexToPixel = useCallback((c: CubeCoord) => {
    let x = 0;
    let y = 0;
    if (orientation === 'pointy') {
      x = hexSize * (Math.sqrt(3) * c.q + (Math.sqrt(3) / 2) * c.r);
      y = hexSize * ((3 / 2) * c.r);
    } else {
      x = hexSize * ((3 / 2) * c.q);
      y = hexSize * ((Math.sqrt(3) / 2) * c.q + Math.sqrt(3) * c.r);
    }
    return { x, y };
  }, [hexSize, orientation]);

  // Hexagon SVG polygon points
  const getPolygonPoints = useCallback((center: { x: number; y: number }) => {
    const points: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angleDeg = orientation === 'pointy' ? 60 * i - 30 : 60 * i;
      const angleRad = (Math.PI / 180) * angleDeg;
      points.push(`${center.x + hexSize * Math.cos(angleRad)},${center.y + hexSize * Math.sin(angleRad)}`);
    }
    return points.join(' ');
  }, [hexSize, orientation]);

  const handleHexClick = (hex: CubeCoord) => {
    const key = coordKey(hex);
    if (activeTool === 'start') {
      setStartHex(hex);
      if (obstacles.has(key)) {
        setObstacles((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    } else if (activeTool === 'end') {
      setEndHex(hex);
      if (obstacles.has(key)) {
        setObstacles((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    } else {
      // Toggle obstacle
      setObstacles((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          // Can't make start or end an obstacle
          if (coordKey(startHex) !== key && coordKey(endHex) !== key) {
            next.add(key);
          }
        }
        return next;
      });
    }
  };

  const clearObstacles = () => {
    setObstacles(new Set());
  };

  const randomizeObstacles = () => {
    const newSet = new Set<string>();
    for (const h of allHexes) {
      const key = coordKey(h);
      if (key !== coordKey(startHex) && key !== coordKey(endHex)) {
        if (Math.random() < 0.22) {
          newSet.add(key);
        }
      }
    }
    setObstacles(newSet);
  };

  const linePathSet = useMemo(() => {
    const s = new Set<string>();
    linePath.forEach((p) => s.add(coordKey(p)));
    return s;
  }, [linePath]);

  // Code generator snippet
  const generatedCode = useMemo(() => {
    return `// TypeScript Hex Cube Coordinate Raycasting Implementation
interface CubeCoord { q: number; r: number; s: number; }

function cubeDistance(a: CubeCoord, b: CubeCoord): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.s - b.s)) / 2;
}

function cubeLerp(a: CubeCoord, b: CubeCoord, t: number) {
  return {
    q: a.q + (b.q - a.q) * t,
    r: a.r + (b.r - a.r) * t,
    s: a.s + (b.s - a.s) * t
  };
}

function cubeRound(frac: { q: number; r: number; s: number }): CubeCoord {
  let q = Math.round(frac.q), r = Math.round(frac.r), s = Math.round(frac.s);
  const qDiff = Math.abs(q - frac.q), rDiff = Math.abs(r - frac.r), sDiff = Math.abs(s - frac.s);
  if (qDiff > rDiff && qDiff > sDiff) q = -r - s;
  else if (rDiff > sDiff) r = -q - s;
  else s = -q - r;
  return { q, r, s };
}

export function cubeLineDraw(a: CubeCoord, b: CubeCoord): CubeCoord[] {
  const N = cubeDistance(a, b);
  if (N === 0) return [a];
  const results: CubeCoord[] = [];
  const aNudge = { q: a.q + 1e-6, r: a.r + 1e-6, s: a.s - 2e-6 };
  const bNudge = { q: b.q + 1e-6, r: b.r + 1e-6, s: b.s - 2e-6 };
  for (let i = 0; i <= N; i++) {
    results.push(cubeRound(cubeLerp(aNudge, bNudge, (1.0 / N) * i)));
  }
  return results;
}`;
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Canvas bounds
  const svgWidth = 560;
  const svgHeight = 440;
  const centerSvg = { x: svgWidth / 2, y: svgHeight / 2 };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Hexagonal Grid Line-Drawing & Raycasting Simulator</h1>
            <p className="text-sm text-slate-400">
              Interactive Bresenham-style raycaster and obstacle line-of-sight simulator using linear interpolation on cube coordinates (q + r + s = 0).
            </p>
          </div>
        </div>

        {/* Status bar */}
        <div className={`mt-4 p-3 rounded-xl border flex items-center justify-between text-sm ${
          lineOfSightResult.hasLineOfSight
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4" />
            <span className="font-semibold">
              {lineOfSightResult.hasLineOfSight
                ? 'Line of Sight: CLEAR (Unobstructed Target)'
                : `Line of Sight: BLOCKED at Hex (${lineOfSightResult.collisionHex?.q}, ${lineOfSightResult.collisionHex?.r}, ${lineOfSightResult.collisionHex?.s})`}
            </span>
          </div>
          <div className="font-mono text-xs opacity-90">
            Hex Distance: {lineOfSightResult.distance} steps | Trajectory: {linePath.length} cells
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 text-white">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Interactive Controls</h2>

          {/* Click Tool Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Click Action Mode</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setActiveTool('start')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  activeTool === 'start'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                Set Start (A)
              </button>
              <button
                onClick={() => setActiveTool('end')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  activeTool === 'end'
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-md'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                Set End (B)
              </button>
              <button
                onClick={() => setActiveTool('obstacle')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  activeTool === 'obstacle'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-md'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                Toggle Wall
              </button>
            </div>
          </div>

          {/* Grid Settings */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Grid Radius</span>
              <span className="font-mono text-cyan-400">{gridRadius}</span>
            </div>
            <input
              type="range"
              min="3"
              max="6"
              value={gridRadius}
              onChange={(e) => setGridRadius(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Hex Orientation</span>
              <div className="flex space-x-1">
                <button
                  onClick={() => setOrientation('pointy')}
                  className={`px-2 py-1 rounded text-xs ${orientation === 'pointy' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  Pointy
                </button>
                <button
                  onClick={() => setOrientation('flat')}
                  className={`px-2 py-1 rounded text-xs ${orientation === 'flat' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  Flat
                </button>
              </div>
            </div>
          </div>

          {/* Obstacle Actions */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <label className="block text-xs font-medium text-slate-400">Obstacle Presets</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={randomizeObstacles}
                className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center justify-center space-x-1"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Random Walls</span>
              </button>
              <button
                onClick={clearObstacles}
                className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 flex items-center justify-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          {/* Coordinate Summary */}
          <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between py-1 px-2 rounded bg-slate-800/60 font-mono">
              <span className="text-emerald-400 font-bold">Start Hex (A):</span>
              <span>q:{startHex.q}, r:{startHex.r}, s:{startHex.s}</span>
            </div>
            <div className="flex justify-between py-1 px-2 rounded bg-slate-800/60 font-mono">
              <span className="text-cyan-400 font-bold">Target Hex (B):</span>
              <span>q:{endHex.q}, r:{endHex.r}, s:{endHex.s}</span>
            </div>
            <div className="flex justify-between py-1 px-2 rounded bg-slate-800/60 font-mono">
              <span className="text-rose-400 font-bold">Wall Hexes:</span>
              <span>{obstacles.size} blocked</span>
            </div>
          </div>
        </div>

        {/* SVG Canvas Column */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
          <svg width={svgWidth} height={svgHeight} className="select-none cursor-pointer">
            <g transform={`translate(${centerSvg.x}, ${centerSvg.y})`}>
              {/* Render Hex Cells */}
              {allHexes.map((hex) => {
                const key = coordKey(hex);
                const pos = hexToPixel(hex);
                const isStart = hex.q === startHex.q && hex.r === startHex.r;
                const isEnd = hex.q === endHex.q && hex.r === endHex.r;
                const isObstacle = obstacles.has(key);
                const isPath = linePathSet.has(key);

                // Styling
                let fill = '#1e293b'; // slate-800
                let stroke = '#334155'; // slate-700
                let strokeWidth = 1;

                if (isObstacle) {
                  fill = '#ef4444'; // red-500
                  stroke = '#b91c1c';
                } else if (isStart) {
                  fill = '#10b981'; // emerald-500
                  stroke = '#059669';
                  strokeWidth = 2;
                } else if (isEnd) {
                  fill = '#06b6d4'; // cyan-500
                  stroke = '#0891b2';
                  strokeWidth = 2;
                } else if (isPath) {
                  fill = '#0f766e'; // teal-700
                  stroke = '#14b8a6';
                  strokeWidth = 1.5;
                }

                return (
                  <g key={key} onClick={() => handleHexClick(hex)}>
                    <polygon
                      points={getPolygonPoints(pos)}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={strokeWidth}
                      className="transition-colors duration-150 hover:brightness-125"
                    />
                    {hexSize >= 20 && (
                      <text
                        x={pos.x}
                        y={pos.y + 4}
                        textAnchor="middle"
                        fontSize={8}
                        fontFamily="monospace"
                        fill={isObstacle || isStart || isEnd ? '#ffffff' : '#94a3b8'}
                        pointerEvents="none"
                      >
                        {`${hex.q},${hex.r}`}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Render Raycast Line Overlay */}
              {(() => {
                const startPos = hexToPixel(startHex);
                const endPos = hexToPixel(endHex);
                return (
                  <line
                    x1={startPos.x}
                    y1={startPos.y}
                    x2={endPos.x}
                    y2={endPos.y}
                    stroke={lineOfSightResult.hasLineOfSight ? '#34d399' : '#f87171'}
                    strokeWidth={2.5}
                    strokeDasharray="4 3"
                    pointerEvents="none"
                  />
                );
              })()}
            </g>
          </svg>

          {/* Legend */}
          <div className="w-full flex items-center justify-center space-x-4 pt-3 text-xs text-slate-400 border-t border-slate-800">
            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span>Start (A)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded-full bg-cyan-500 inline-block" />
              <span>Target (B)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded-full bg-teal-700 border border-teal-500 inline-block" />
              <span>Raycast Path</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span>Wall Obstacle</span>
            </span>
          </div>
        </div>
      </div>

      {/* Code Snippet & Export */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code2 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-200">Cube Coordinate Line Drawing Algorithm (TypeScript)</h3>
          </div>
          <button
            onClick={copyCode}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>

        <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre leading-relaxed">
          {generatedCode}
        </pre>
      </div>
    </div>
  );
}

export default HexGridLineDrawingAlgorithm;
