'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Compass, Play, RotateCcw, Copy, Check, Code2, Layers } from 'lucide-react';

interface CubeCoord {
  q: number;
  r: number;
  s: number;
}

// 6 direction vectors in cube coords
const CUBE_DIRECTIONS: CubeCoord[] = [
  { q: 1, r: -1, s: 0 },
  { q: 1, r: 0, s: -1 },
  { q: 0, r: 1, s: -1 },
  { q: -1, r: 1, s: 0 },
  { q: -1, r: 0, s: 1 },
  { q: 0, r: -1, s: 1 }
];

function cubeAdd(a: CubeCoord, b: CubeCoord): CubeCoord {
  return { q: a.q + b.q, r: a.r + b.r, s: a.s + b.s };
}

function cubeScale(a: CubeCoord, factor: number): CubeCoord {
  return { q: a.q * factor, r: a.r * factor, s: a.s * factor };
}

function cubeNeighbor(hex: CubeCoord, direction: number): CubeCoord {
  return cubeAdd(hex, CUBE_DIRECTIONS[direction % 6]);
}

// Generate single ring of radius R around center
function cubeRing(center: CubeCoord, radius: number): CubeCoord[] {
  if (radius === 0) return [center];
  const results: CubeCoord[] = [];
  // Start at direction 4 scaled by radius
  let current = cubeAdd(center, cubeScale(CUBE_DIRECTIONS[4], radius));

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < radius; j++) {
      results.push(current);
      current = cubeNeighbor(current, i);
    }
  }
  return results;
}

// Generate full spiral up to radius R
function cubeSpiral(center: CubeCoord, radius: number): CubeCoord[] {
  const results: CubeCoord[] = [center];
  for (let r = 1; r <= radius; r++) {
    results.push(...cubeRing(center, r));
  }
  return results;
}

function key(c: CubeCoord): string {
  return `${c.q},${c.r},${c.s}`;
}

export function HexGridSpiralRingAlgorithm() {
  const [mode, setMode] = useState<'ring' | 'spiral'>('spiral');
  const [radius, setRadius] = useState<number>(3);
  const [currentStep, setCurrentStep] = useState<number>(100);
  const [copied, setCopied] = useState<boolean>(false);

  const center: CubeCoord = { q: 0, r: 0, s: 0 };

  const orderedPath = useMemo(() => {
    return mode === 'ring' ? cubeRing(center, radius) : cubeSpiral(center, radius);
  }, [mode, radius]);

  // Active visible path up to currentStep
  const visiblePath = useMemo(() => {
    return orderedPath.slice(0, Math.min(currentStep, orderedPath.length));
  }, [orderedPath, currentStep]);

  const pathOrderMap = useMemo(() => {
    const m = new Map<string, number>();
    visiblePath.forEach((h, idx) => m.set(key(h), idx + 1));
    return m;
  }, [visiblePath]);

  // Render all hexes up to max radius 4
  const allHexes = useMemo(() => {
    return cubeSpiral(center, 4);
  }, []);

  const hexSize = 22;
  const hexToPixel = useCallback((c: CubeCoord) => {
    const x = hexSize * (Math.sqrt(3) * c.q + (Math.sqrt(3) / 2) * c.r);
    const y = hexSize * ((3 / 2) * c.r);
    return { x, y };
  }, [hexSize]);

  const getPoints = useCallback((centerPos: { x: number; y: number }) => {
    const pts: string[] = [];
    for (let i = 0; i < 6; i++) {
      const rad = (Math.PI / 180) * (60 * i - 30);
      pts.push(`${centerPos.x + hexSize * Math.cos(rad)},${centerPos.y + hexSize * Math.sin(rad)}`);
    }
    return pts.join(' ');
  }, [hexSize]);

  const typescriptSnippet = useMemo(() => {
    return `// TypeScript Hexagonal Ring & Spiral Traversal
interface CubeCoord { q: number; r: number; s: number; }

const CUBE_DIRECTIONS: CubeCoord[] = [
  { q: 1, r: -1, s: 0 }, { q: 1, r: 0, s: -1 }, { q: 0, r: 1, s: -1 },
  { q: -1, r: 1, s: 0 }, { q: -1, r: 0, s: 1 }, { q: 0, r: -1, s: 1 }
];

function cubeAdd(a: CubeCoord, b: CubeCoord): CubeCoord {
  return { q: a.q + b.q, r: a.r + b.r, s: a.s + b.s };
}

function cubeNeighbor(hex: CubeCoord, dir: number): CubeCoord {
  return cubeAdd(hex, CUBE_DIRECTIONS[dir % 6]);
}

export function getHexRing(center: CubeCoord, radius: number): CubeCoord[] {
  if (radius === 0) return [center];
  const results: CubeCoord[] = [];
  let current = cubeAdd(center, { q: -radius, r: 0, s: radius });
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < radius; j++) {
      results.push(current);
      current = cubeNeighbor(current, i);
    }
  }
  return results;
}

export function getHexSpiral(center: CubeCoord, maxRadius: number): CubeCoord[] {
  const results: CubeCoord[] = [center];
  for (let r = 1; r <= maxRadius; r++) {
    results.push(...getHexRing(center, r));
  }
  return results;
}`;
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(typescriptSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Hex Grid Spiral & Ring Traversal Algorithm</h1>
            <p className="text-sm text-slate-400">
              Interactive algorithm visualizer for concentric hexagonal rings and outward spiral path traversals using cube coordinate direction vectors.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-white">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Traversal Settings</h2>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Algorithm Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setMode('spiral'); setCurrentStep(100); }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                  mode === 'spiral' ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                Outward Spiral
              </button>
              <button
                onClick={() => { setMode('ring'); setCurrentStep(100); }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                  mode === 'ring' ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                Single Ring
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Target Radius</span>
              <span className="font-mono text-cyan-400">Radius = {radius}</span>
            </div>
            <input
              type="range"
              min="1"
              max="4"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Step Progression</span>
              <span className="font-mono text-cyan-400">{Math.min(currentStep, orderedPath.length)} / {orderedPath.length}</span>
            </div>
            <input
              type="range"
              min="1"
              max={orderedPath.length}
              value={Math.min(currentStep, orderedPath.length)}
              onChange={(e) => setCurrentStep(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={() => setCurrentStep(orderedPath.length)}
              className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200"
            >
              Reveal Complete Traversal
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center">
          <svg width={520} height={400} className="select-none">
            <g transform="translate(260, 200)">
              {allHexes.map((hex) => {
                const k = key(hex);
                const pos = hexToPixel(hex);
                const order = pathOrderMap.get(k);
                const isCenter = hex.q === 0 && hex.r === 0;

                let fill = '#1e293b';
                let stroke = '#334155';
                if (isCenter) {
                  fill = '#06b6d4';
                  stroke = '#0891b2';
                } else if (order !== undefined) {
                  fill = '#0f766e';
                  stroke = '#14b8a6';
                }

                return (
                  <g key={k}>
                    <polygon
                      points={getPoints(pos)}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={1}
                    />
                    {order !== undefined && (
                      <text
                        x={pos.x}
                        y={pos.y + 4}
                        textAnchor="middle"
                        fontSize={9}
                        fontFamily="monospace"
                        fill="#ffffff"
                        fontWeight="bold"
                      >
                        {order}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>

          <div className="w-full flex justify-center space-x-4 pt-3 text-xs text-slate-400 border-t border-slate-800">
            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded-full bg-cyan-500" />
              <span>Center (0,0,0)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-3 h-3 rounded-full bg-teal-600" />
              <span>Visited in Sequence (1..N)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Code Export */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-300">TypeScript Traversal Algorithm</span>
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex items-center space-x-1 px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium rounded transition"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Code'}</span>
          </button>
        </div>
        <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto whitespace-pre max-h-52 leading-relaxed">
          {typescriptSnippet}
        </pre>
      </div>
    </div>
  );
}

export default HexGridSpiralRingAlgorithm;
