'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Eye, Sun, Shield, RotateCcw, Copy, Check, Code2, Compass } from 'lucide-react';

interface CubeCoord {
  q: number;
  r: number;
  s: number;
}

function cubeDistance(a: CubeCoord, b: CubeCoord): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.s - b.s)) / 2;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function cubeLerp(a: CubeCoord, b: CubeCoord, t: number) {
  return {
    q: lerp(a.q, b.q, t),
    r: lerp(a.r, b.r, t),
    s: lerp(a.s, b.s, t)
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

function cubeLine(a: CubeCoord, b: CubeCoord): CubeCoord[] {
  const N = cubeDistance(a, b);
  if (N === 0) return [a];
  const res: CubeCoord[] = [];
  const aN = { q: a.q + 1e-6, r: a.r + 1e-6, s: a.s - 2e-6 };
  const bN = { q: b.q + 1e-6, r: b.r + 1e-6, s: b.s - 2e-6 };
  for (let i = 0; i <= N; i++) {
    res.push(cubeRound(cubeLerp(aN, bN, (1.0 / N) * i)));
  }
  return res;
}

function key(c: CubeCoord): string {
  return `${c.q},${c.r},${c.s}`;
}

export function HexGridFovShadowcastingAlgorithm() {
  const [gridRadius, setGridRadius] = useState<number>(4);
  const [visionRadius, setVisionRadius] = useState<number>(3);
  const [observer, setObserver] = useState<CubeCoord>({ q: 0, r: 0, s: 0 });
  const [obstacles, setObstacles] = useState<Set<string>>(() => {
    const s = new Set<string>();
    s.add('1,-1,0');
    s.add('1,0,-1');
    s.add('-1,1,0');
    return s;
  });
  const [activeTool, setActiveTool] = useState<'observer' | 'wall'>('wall');
  const [copied, setCopied] = useState<boolean>(false);

  // Generate grid hexes
  const allHexes = useMemo(() => {
    const hexes: CubeCoord[] = [];
    for (let q = -gridRadius; q <= gridRadius; q++) {
      const r1 = Math.max(-gridRadius, -q - gridRadius);
      const r2 = Math.min(gridRadius, -q + gridRadius);
      for (let r = r1; r <= r2; r++) {
        hexes.push({ q, r, s: -q - r });
      }
    }
    return hexes;
  }, [gridRadius]);

  // Compute Field of View (FOV) via raycasting to each hex in radius
  const fovVisibleHexes = useMemo(() => {
    const visible = new Set<string>();
    visible.add(key(observer));

    for (const target of allHexes) {
      const dist = cubeDistance(observer, target);
      if (dist > visionRadius) continue;

      const line = cubeLine(observer, target);
      let blocked = false;

      for (let i = 1; i < line.length; i++) {
        const h = line[i];
        const k = key(h);
        if (obstacles.has(k)) {
          // The obstacle itself is visible, but blocks anything behind it
          if (i === line.length - 1) {
            visible.add(k);
          }
          blocked = true;
          break;
        }
      }

      if (!blocked) {
        visible.add(key(target));
      }
    }
    return visible;
  }, [observer, visionRadius, allHexes, obstacles]);

  // Hex SVG coordinates
  const hexSize = 24;
  const hexToPixel = useCallback((c: CubeCoord) => {
    const x = hexSize * (Math.sqrt(3) * c.q + (Math.sqrt(3) / 2) * c.r);
    const y = hexSize * ((3 / 2) * c.r);
    return { x, y };
  }, [hexSize]);

  const getPoints = useCallback((center: { x: number; y: number }) => {
    const pts: string[] = [];
    for (let i = 0; i < 6; i++) {
      const rad = (Math.PI / 180) * (60 * i - 30);
      pts.push(`${center.x + hexSize * Math.cos(rad)},${center.y + hexSize * Math.sin(rad)}`);
    }
    return pts.join(' ');
  }, [hexSize]);

  const handleHexClick = (hex: CubeCoord) => {
    const k = key(hex);
    if (activeTool === 'observer') {
      setObserver(hex);
      if (obstacles.has(k)) {
        setObstacles((prev) => {
          const n = new Set(prev);
          n.delete(k);
          return n;
        });
      }
    } else {
      setObstacles((prev) => {
        const n = new Set(prev);
        if (n.has(k)) n.delete(k);
        else if (k !== key(observer)) n.add(k);
        return n;
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <Sun className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Hex Grid Field of View (FOV) & Shadowcasting Simulator</h1>
            <p className="text-sm text-slate-400">
              Interactive hex vision and shadow projection simulator using cube coordinate raycasting and line-of-sight obstruction for tactical game development.
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex justify-between items-center text-xs">
          <span>Visible Cells: <strong className="text-amber-400">{fovVisibleHexes.size}</strong> / {allHexes.length}</span>
          <span>Obstacles: <strong className="text-rose-400">{obstacles.size}</strong> walls</span>
          <span>Vision Range: <strong className="text-cyan-400">{visionRadius}</strong> hex steps</span>
        </div>
      </div>

      {/* Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-white">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Click Mode</h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTool('observer')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                activeTool === 'observer'
                  ? 'bg-amber-600 border-amber-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              Move Observer
            </button>
            <button
              onClick={() => setActiveTool('wall')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                activeTool === 'wall'
                  ? 'bg-rose-600 border-rose-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              Toggle Wall
            </button>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Vision Range (Radius)</span>
              <span className="font-mono text-amber-400">{visionRadius}</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={visionRadius}
              onChange={(e) => setVisionRadius(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            <button
              onClick={() => setObstacles(new Set())}
              className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200"
            >
              Clear All Walls
            </button>
          </div>
        </div>

        {/* SVG Canvas */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center">
          <svg width={540} height={420} className="select-none cursor-pointer">
            <g transform="translate(270, 210)">
              {allHexes.map((hex) => {
                const k = key(hex);
                const pos = hexToPixel(hex);
                const isObs = hex.q === observer.q && hex.r === observer.r;
                const isWall = obstacles.has(k);
                const isVisible = fovVisibleHexes.has(k);

                let fill = '#0f172a'; // Hidden / fog of war
                let stroke = '#1e293b';

                if (isObs) {
                  fill = '#f59e0b'; // Amber observer
                  stroke = '#d97706';
                } else if (isWall) {
                  fill = isVisible ? '#ef4444' : '#7f1d1d'; // Visible wall vs hidden wall
                  stroke = '#991b1b';
                } else if (isVisible) {
                  fill = '#334155'; // Illuminated hex
                  stroke = '#475569';
                }

                return (
                  <polygon
                    key={k}
                    points={getPoints(pos)}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={1}
                    onClick={() => handleHexClick(hex)}
                    className="transition-colors duration-150 hover:brightness-125"
                  />
                );
              })}
            </g>
          </svg>

          <div className="w-full flex justify-center space-x-4 pt-3 text-xs text-slate-400 border-t border-slate-800">
            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Observer</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded-full bg-slate-700" />
              <span>Illuminated Cell</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded-full bg-slate-950" />
              <span>Fog of War (Shadow)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span>Wall Obstacle</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HexGridFovShadowcastingAlgorithm;
