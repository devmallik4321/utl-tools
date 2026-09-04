'use client';

import React, { useState, useEffect, useRef, useId } from 'react';
import {
  Compass,
  Footprints,
  Shield,
  Layers,
  RotateCcw,
  Copy,
  Check,
  Info,
  Sliders
} from 'lucide-react';

type TerrainType = 'plains' | 'forest' | 'mountain' | 'swamp' | 'wall';

interface TerrainDef {
  name: string;
  cost: number;
  color: string;
  fill: string;
}

const TERRAIN_CONFIG: Record<TerrainType, TerrainDef> = {
  plains: { name: 'Plains / Road', cost: 1, color: '#22c55e', fill: '#14532d33' },
  forest: { name: 'Forest / Woods', cost: 2, color: '#10b981', fill: '#064e3b66' },
  mountain: { name: 'Mountain / Hills', cost: 3, color: '#f59e0b', fill: '#78350f66' },
  swamp: { name: 'Swamp / Mud', cost: 4, color: '#8b5cf6', fill: '#4c1d9566' },
  wall: { name: 'Wall / Impassable', cost: 999, color: '#ef4444', fill: '#7f1d1d88' },
};

interface HexCell {
  q: number;
  r: number;
  terrain: TerrainType;
}

export function HexMovementCostCalculator() {
  const budgetId = useId();
  const radiusId = useId();

  const [gridRadius, setGridRadius] = useState<number>(4);
  const [movementBudget, setMovementBudget] = useState<number>(5);
  const [activeTerrain, setActiveTerrain] = useState<TerrainType>('forest');
  const [startHex, setStartHex] = useState<{ q: number; r: number }>({ q: 0, r: 0 });
  const [copied, setCopied] = useState<boolean>(false);

  // Hex grid state map: key is `${q},${r}`
  const [terrainMap, setTerrainMap] = useState<Record<string, TerrainType>>({});

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Hex dimensions
  const hexSize = 26; // outer radius in px

  // Axial neighbors: (dq, dr)
  const AXIAL_DIRECTIONS = [
    { dq: 1, dr: 0 },
    { dq: 1, dr: -1 },
    { dq: 0, dr: -1 },
    { dq: -1, dr: 0 },
    { dq: -1, dr: 1 },
    { dq: 0, dr: 1 },
  ];

  // Helper to convert axial (q, r) to pixel center (flat-topped hex)
  const hexToPixel = (q: number, r: number, originX: number, originY: number) => {
    const x = originX + hexSize * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
    const y = originY + hexSize * ((3 / 2) * r);
    return { x, y };
  };

  // Helper to convert pixel to axial (flat-topped hex)
  const pixelToHex = (x: number, y: number, originX: number, originY: number) => {
    const dx = x - originX;
    const dy = y - originY;
    const q = ((Math.sqrt(3) / 3) * dx - (1 / 3) * dy) / hexSize;
    const r = ((2 / 3) * dy) / hexSize;
    // Axial round
    let rx = Math.round(q);
    let ry = Math.round(r);
    let rz = Math.round(-q - r);

    const xDiff = Math.abs(rx - q);
    const yDiff = Math.abs(ry - r);
    const zDiff = Math.abs(rz - (-q - r));

    if (xDiff > yDiff && xDiff > zDiff) {
      rx = -ry - rz;
    } else if (yDiff > zDiff) {
      ry = -rx - rz;
    }
    return { q: rx, r: ry };
  };

  // Run Dijkstra to find reachable hexes and minimum movement costs
  const reachableCosts: Record<string, number> = {};
  {
    const queue: { q: number; r: number; cost: number }[] = [{ q: startHex.q, r: startHex.r, cost: 0 }];
    reachableCosts[`${startHex.q},${startHex.r}`] = 0;

    while (queue.length > 0) {
      queue.sort((a, b) => a.cost - b.cost);
      const curr = queue.shift()!;

      if (curr.cost > reachableCosts[`${curr.q},${curr.r}`]) continue;

      for (const dir of AXIAL_DIRECTIONS) {
        const nq = curr.q + dir.dq;
        const nr = curr.r + dir.dr;
        const distFromCenter = Math.max(Math.abs(nq), Math.abs(nr), Math.abs(-nq - nr));
        if (distFromCenter > gridRadius) continue;

        const key = `${nq},${nr}`;
        const terrain = terrainMap[key] || 'plains';
        const moveCost = TERRAIN_CONFIG[terrain].cost;
        if (moveCost >= 999) continue; // wall/impassable

        const totalNextCost = curr.cost + moveCost;
        if (totalNextCost <= movementBudget) {
          if (reachableCosts[key] === undefined || totalNextCost < reachableCosts[key]) {
            reachableCosts[key] = totalNextCost;
            queue.push({ q: nq, r: nr, cost: totalNextCost });
          }
        }
      }
    }
  }

  // Draw Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const originX = width / 2;
    const originY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Draw grid of hexes within gridRadius
    const drawSingleHex = (
      c: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      size: number,
      fillColor: string,
      strokeColor: string,
      lineWidth: number
    ) => {
      c.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 180) * (60 * i + 30);
        const x = cx + size * Math.cos(angle);
        const y = cy + size * Math.sin(angle);
        if (i === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.closePath();
      c.fillStyle = fillColor;
      c.fill();
      c.strokeStyle = strokeColor;
      c.lineWidth = lineWidth;
      c.stroke();
    };

    for (let q = -gridRadius; q <= gridRadius; q++) {
      const r1 = Math.max(-gridRadius, -q - gridRadius);
      const r2 = Math.min(gridRadius, -q + gridRadius);
      for (let r = r1; r <= r2; r++) {
        const { x, y } = hexToPixel(q, r, originX, originY);
        const key = `${q},${r}`;
        const terrain = terrainMap[key] || 'plains';
        const isStart = q === startHex.q && r === startHex.r;
        const isReachable = reachableCosts[key] !== undefined;

        let fillColor = '#1e293b';
        let strokeColor = '#334155';
        let strokeWidth = 1;

        if (terrain !== 'plains') {
          fillColor = TERRAIN_CONFIG[terrain].fill;
          strokeColor = TERRAIN_CONFIG[terrain].color;
        }

        if (isReachable) {
          fillColor = isStart ? 'rgba(56, 189, 248, 0.4)' : 'rgba(16, 185, 129, 0.35)';
          strokeColor = isStart ? '#38bdf8' : '#34d399';
          strokeWidth = 2;
        }

        drawSingleHex(ctx, x, y, hexSize - 1.5, fillColor, strokeColor, strokeWidth);

        // Draw movement cost or label inside hex
        ctx.font = '10px Inter, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (isStart) {
          ctx.fillStyle = '#ffffff';
          ctx.fillText('START', x, y);
        } else if (isReachable) {
          ctx.fillStyle = '#a7f3d0';
          ctx.fillText(`${reachableCosts[key]} MP`, x, y);
        } else if (terrain === 'wall') {
          ctx.fillStyle = '#f87171';
          ctx.fillText('X', x, y);
        }
      }
    }
  }, [gridRadius, movementBudget, terrainMap, startHex, reachableCosts]);

  // Canvas Click Handler
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const originX = canvas.width / 2;
    const originY = canvas.height / 2;
    const { q, r } = pixelToHex(clickX, clickY, originX, originY);

    const distFromCenter = Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r));
    if (distFromCenter > gridRadius) return;

    if (e.shiftKey) {
      // Shift+Click changes start position
      setStartHex({ q, r });
    } else {
      // Normal click toggles active terrain on the cell
      const key = `${q},${r}`;
      setTerrainMap((prev) => {
        const next = { ...prev };
        if (next[key] === activeTerrain) {
          delete next[key]; // clear to default plains
        } else {
          next[key] = activeTerrain;
        }
        return next;
      });
    }
  };

  const handleResetMap = () => {
    setTerrainMap({});
    setStartHex({ q: 0, r: 0 });
    setMovementBudget(5);
  };

  const handleCopyReachable = () => {
    const entries = Object.entries(reachableCosts).map(([coords, cost]) => {
      return `Hex (${coords}): ${cost} MP`;
    });
    const summary = [
      `Reachable Hexes Summary (${Object.keys(reachableCosts).length} tiles reachable):`,
      `Budget: ${movementBudget} Movement Points (MP)`,
      `Starting Hex: (${startHex.q}, ${startHex.r})`,
      `---------------------------------------`,
      ...entries,
    ].join('\n');

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reachableCount = Object.keys(reachableCosts).length;

  return (
    <div className="space-y-8">
      {/* Top Controls & Presets */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Unit Presets:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setMovementBudget(3); }}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              Infantry Patrol (3 MP)
            </button>
            <button
              onClick={() => { setMovementBudget(6); }}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              Cavalry / Light Mech (6 MP)
            </button>
            <button
              onClick={() => { setMovementBudget(8); }}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              Fast Scout / Drone (8 MP)
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyReachable}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied Coordinates' : 'Export Reachable Tiles'}
          </button>
          <button
            onClick={handleResetMap}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* KPI Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Total Reachable Tiles</span>
          <div className="mt-1 text-2xl font-bold text-emerald-400 tracking-tight">{reachableCount} Hexes</div>
          <div className="mt-1 text-xs text-slate-400">Within {movementBudget} MP Budget</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Unit Start Position</span>
          <div className="mt-1 text-2xl font-bold text-sky-400 tracking-tight font-mono">({startHex.q}, {startHex.r})</div>
          <div className="mt-1 text-xs text-slate-400">Shift+Click any hex to reposition</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Active Paint Brush</span>
          <div className="mt-1 text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ backgroundColor: TERRAIN_CONFIG[activeTerrain].color }}
            />
            {TERRAIN_CONFIG[activeTerrain].name} ({TERRAIN_CONFIG[activeTerrain].cost >= 999 ? 'Impassable' : `${TERRAIN_CONFIG[activeTerrain].cost} MP`})
          </div>
          <div className="mt-1 text-xs text-slate-400">Click any hex to paint or erase</div>
        </div>
      </div>

      {/* Interactive Canvas & Tool Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Canvas Display */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950 border border-slate-800 relative overflow-hidden">
          <canvas
            ref={canvasRef}
            width={580}
            height={460}
            onClick={handleCanvasClick}
            className="cursor-crosshair rounded-xl"
          />
          <div className="absolute bottom-3 left-4 text-[11px] text-slate-500 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800">
            Click = Paint/Clear Terrain | Shift+Click = Move Start Unit
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-5 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            Grid & Unit Budget
          </h3>

          <div>
            <label htmlFor={budgetId} className="block text-xs font-medium text-slate-400 mb-1">
              Movement Points (MP): <span className="text-sky-400 font-mono font-bold">{movementBudget} MP</span>
            </label>
            <input
              id={budgetId}
              type="range"
              min="1"
              max="12"
              step="1"
              value={movementBudget}
              onChange={(e) => setMovementBudget(Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          <div>
            <label htmlFor={radiusId} className="block text-xs font-medium text-slate-400 mb-1">
              Grid Radius: <span className="text-sky-400 font-mono">{gridRadius} Rings</span>
            </label>
            <input
              id={radiusId}
              type="range"
              min="2"
              max="5"
              step="1"
              value={gridRadius}
              onChange={(e) => setGridRadius(Number(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            <label className="block text-xs font-medium text-slate-300">
              Terrain Paintbrush Selector:
            </label>
            <div className="grid grid-cols-1 gap-2">
              {(Object.keys(TERRAIN_CONFIG) as TerrainType[]).map((type) => {
                const t = TERRAIN_CONFIG[type];
                const isSelected = activeTerrain === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setActiveTerrain(type)}
                    className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-medium border transition ${
                      isSelected
                        ? 'bg-slate-800 border-sky-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                      <span>{t.name}</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">
                      {t.cost >= 999 ? 'Impassable' : `${t.cost} MP / tile`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Hex Grid Rules & Dijkstra Explanation */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2 text-xs text-slate-400">
        <h4 className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-4 h-4 text-sky-400" />
          Axial Coordinate System & Dijkstra Shortest Path Engine
        </h4>
        <p>
          Calculated using standard 2D axial hex coordinates <code>(q, r)</code> with flat-topped orientation. Range calculation runs Dijkstra&apos;s algorithm on the hex neighbor graph: moving into a cell incurs the terrain entry cost of that cell. All cells whose cumulative minimal path cost &le; unit MP budget are rendered in green highlighting.
        </p>
      </div>
    </div>
  );
}

export default HexMovementCostCalculator;

