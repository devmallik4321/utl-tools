"use client";

import React, { useState, useMemo } from "react";
import { Compass, Code2, Copy, Check, ShieldAlert, Route, RefreshCw } from "lucide-react";

interface CubeCoord {
  q: number;
  r: number;
  s: number;
}

const DIRECTIONS: CubeCoord[] = [
  { q: 1, r: 0, s: -1 },
  { q: 1, r: -1, s: 0 },
  { q: 0, r: -1, s: 1 },
  { q: -1, r: 0, s: 1 },
  { q: -1, r: 1, s: 0 },
  { q: 0, r: 1, s: -1 }
];

function cubeDistance(a: CubeCoord, b: CubeCoord): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.s - b.s)) / 2;
}

function hexToPixel(q: number, r: number, size: number, originX: number, originY: number) {
  const x = size * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r) + originX;
  const y = size * ((3 / 2) * r) + originY;
  return { x, y };
}

function getHexCornerPoints(centerX: number, centerY: number, size: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angleRad = ((60 * i - 30) * Math.PI) / 180;
    const x = centerX + size * Math.cos(angleRad);
    const y = centerY + size * Math.sin(angleRad);
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return points.join(" ");
}

export function HexGridAStarPathfindingAlgorithm() {
  const gridRadius = 3;
  const [startHex, setStartHex] = useState<CubeCoord>({ q: -2, r: 2, s: 0 });
  const [goalHex, setGoalHex] = useState<CubeCoord>({ q: 2, r: -2, s: 0 });
  const [barriers, setBarriers] = useState<string[]>(["0,0,0", "0,1,-1", "0,-1,1"]);
  const [clickMode, setClickMode] = useState<"BARRIER" | "START" | "GOAL">("BARRIER");
  const [copied, setCopied] = useState(false);

  // Generate grid
  const gridHexes = useMemo(() => {
    const list: CubeCoord[] = [];
    for (let q = -gridRadius; q <= gridRadius; q++) {
      const r1 = Math.max(-gridRadius, -q - gridRadius);
      const r2 = Math.min(gridRadius, -q + gridRadius);
      for (let r = r1; r <= r2; r++) {
        list.push({ q, r, s: -q - r });
      }
    }
    return list;
  }, [gridRadius]);

  // A* Algorithm
  const pathResult = useMemo<{
    found: boolean;
    path: string[];
    visited: string[];
    cost: number;
  }>(() => {
    const startKey = `${startHex.q},${startHex.r},${startHex.s}`;
    const goalKey = `${goalHex.q},${goalHex.r},${goalHex.s}`;

    if (startKey === goalKey) {
      return { found: true, path: [startKey], visited: [startKey], cost: 0 };
    }

    const frontier: { coord: CubeCoord; priority: number }[] = [{ coord: startHex, priority: 0 }];
    const cameFrom = new Map<string, CubeCoord | null>();
    const costSoFar = new Map<string, number>();

    cameFrom.set(startKey, null);
    costSoFar.set(startKey, 0);

    const visitedKeys: string[] = [startKey];
    let foundGoal = false;

    while (frontier.length > 0) {
      // Pop lowest priority
      frontier.sort((a, b) => a.priority - b.priority);
      const current = frontier.shift()!.coord;
      const currentKey = `${current.q},${current.r},${current.s}`;

      if (current.q === goalHex.q && current.r === goalHex.r && current.s === goalHex.s) {
        foundGoal = true;
        break;
      }

      // Check 6 neighbors
      for (const dir of DIRECTIONS) {
        const next: CubeCoord = {
          q: current.q + dir.q,
          r: current.r + dir.r,
          s: current.s + dir.s
        };

        // Bound check
        if (Math.abs(next.q) > gridRadius || Math.abs(next.r) > gridRadius || Math.abs(next.s) > gridRadius) {
          continue;
        }

        const nextKey = `${next.q},${next.r},${next.s}`;
        if (barriers.includes(nextKey)) {
          continue; // Blocked
        }

        const newCost = (costSoFar.get(currentKey) || 0) + 1; // uniform edge cost = 1
        if (!costSoFar.has(nextKey) || newCost < costSoFar.get(nextKey)!) {
          costSoFar.set(nextKey, newCost);
          const priority = newCost + cubeDistance(next, goalHex);
          frontier.push({ coord: next, priority });
          cameFrom.set(nextKey, current);
          if (!visitedKeys.includes(nextKey)) {
            visitedKeys.push(nextKey);
          }
        }
      }
    }

    if (!foundGoal) {
      return { found: false, path: [], visited: visitedKeys, cost: 0 };
    }

    // Reconstruct path
    const path: string[] = [];
    let curr: CubeCoord | null = goalHex;
    while (curr !== null) {
      const stepKey: string = `${curr.q},${curr.r},${curr.s}`;
      path.unshift(stepKey);
      curr = cameFrom.get(stepKey) ?? null;
    }

    return { found: true, path, visited: visitedKeys, cost: path.length - 1 };
  }, [startHex, goalHex, barriers]);

  const handleHexClick = (c: CubeCoord) => {
    const key = `${c.q},${c.r},${c.s}`;
    if (clickMode === "START") {
      setStartHex(c);
    } else if (clickMode === "GOAL") {
      setGoalHex(c);
    } else {
      if (
        (c.q === startHex.q && c.r === startHex.r) ||
        (c.q === goalHex.q && c.r === goalHex.r)
      ) {
        return;
      }
      setBarriers((prev) =>
        prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
      );
    }
  };

  const tsCode = `// Hexagonal Grid A* Pathfinding Algorithm (Cube Coordinates)
export interface CubeCoord { q: number; r: number; s: number; }

export function cubeDistance(a: CubeCoord, b: CubeCoord): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.s - b.s)) / 2;
}

const HEX_DIRECTIONS: CubeCoord[] = [
  { q: 1, r: 0, s: -1 }, { q: 1, r: -1, s: 0 }, { q: 0, r: -1, s: 1 },
  { q: -1, r: 0, s: 1 }, { q: -1, r: 1, s: 0 }, { q: 0, r: 1, s: -1 }
];

export function findHexPathAStar(
  start: CubeCoord,
  goal: CubeCoord,
  isBlocked: (c: CubeCoord) => boolean
): CubeCoord[] | null {
  const startKey = \`\${start.q},\${start.r},\${start.s}\`;
  const frontier: { node: CubeCoord; fScore: number }[] = [{ node: start, fScore: 0 }];
  const cameFrom = new Map<string, CubeCoord | null>([[startKey, null]]);
  const gScore = new Map<string, number>([[startKey, 0]]);

  while (frontier.length > 0) {
    frontier.sort((a, b) => a.fScore - b.fScore);
    const current = frontier.shift()!.node;

    if (current.q === goal.q && current.r === goal.r && current.s === goal.s) {
      // Reconstruct Path
      const path: CubeCoord[] = [];
      let temp: CubeCoord | null = current;
      while (temp !== null) {
        path.unshift(temp);
        temp = cameFrom.get(\`\${temp.q},\${temp.r},\${temp.s}\`) || null;
      }
      return path;
    }

    for (const dir of HEX_DIRECTIONS) {
      const neighbor = { q: current.q + dir.q, r: current.r + dir.r, s: current.s + dir.s };
      if (isBlocked(neighbor)) continue;

      const neighborKey = \`\${neighbor.q},\${neighbor.r},\${neighbor.s}\`;
      const tentativeG = (gScore.get(\`\${current.q},\${current.r},\${current.s}\`) ?? Infinity) + 1;

      if (tentativeG < (gScore.get(neighborKey) ?? Infinity)) {
        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeG);
        const fScore = tentativeG + cubeDistance(neighbor, goal);
        frontier.push({ node: neighbor, fScore });
      }
    }
  }
  return null; // No path found
}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tsCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const svgSize = 340;
  const hexRadius = 24;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-200">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            A* Search Heuristic
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Hexagonal Cube Distance
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Route className="w-6 h-6 text-emerald-400" />
          Hexagonal Grid A* Pathfinding Algorithm Simulator
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Interactive hexagonal pathfinding simulator executing A* search on cube coordinates with Euclidean distance heuristics, obstacle navigation, and TypeScript code export.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Interactive Visualizer (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Click Tool:</span>
              <div className="flex gap-1.5">
                {[
                  { id: "BARRIER", label: "Toggle Wall" },
                  { id: "START", label: "Set Start" },
                  { id: "GOAL", label: "Set Goal" }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setClickMode(t.id as any)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition ${
                      clickMode === t.id
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Visualizer */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 flex items-center justify-center select-none">
              <svg width={svgSize} height={svgSize}>
                {gridHexes.map((hex) => {
                  const key = `${hex.q},${hex.r},${hex.s}`;
                  const { x, y } = hexToPixel(hex.q, hex.r, hexRadius, centerX, centerY);
                  const isStart = hex.q === startHex.q && hex.r === startHex.r;
                  const isGoal = hex.q === goalHex.q && hex.r === goalHex.r;
                  const isWall = barriers.includes(key);
                  const isPath = pathResult.path.includes(key);
                  const isVisited = pathResult.visited.includes(key);

                  let fillColor = "#0f172a";
                  let strokeColor = "#1e293b";

                  if (isStart) {
                    fillColor = "#3b82f6";
                    strokeColor = "#60a5fa";
                  } else if (isGoal) {
                    fillColor = "#10b981";
                    strokeColor = "#34d399";
                  } else if (isWall) {
                    fillColor = "#334155";
                    strokeColor = "#64748b";
                  } else if (isPath) {
                    fillColor = "#065f46";
                    strokeColor = "#34d399";
                  } else if (isVisited) {
                    fillColor = "#172554";
                    strokeColor = "#1e3a8a";
                  }

                  return (
                    <g key={key} onClick={() => handleHexClick(hex)} className="cursor-pointer group">
                      <polygon
                        points={getHexCornerPoints(x, y, hexRadius - 1.5)}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={isPath ? "2.5" : "1.5"}
                        className="transition-colors group-hover:stroke-indigo-400"
                      />
                      <text
                        x={x}
                        y={y + 3}
                        fontSize="8"
                        textAnchor="middle"
                        fill={isStart || isGoal || isPath ? "#ffffff" : isWall ? "#94a3b8" : "#475569"}
                        className="pointer-events-none font-mono font-bold"
                      >
                        {isStart ? "S" : isGoal ? "G" : isPath ? "•" : `${hex.q},${hex.r}`}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Path Result Status */}
            <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
              pathResult.found
                ? "bg-emerald-950/40 border-emerald-800/50 text-emerald-300"
                : "bg-rose-950/40 border-rose-800/50 text-rose-300"
            }`}>
              <div className="flex items-center gap-2">
                {pathResult.found ? <Route className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                <span className="font-semibold">
                  {pathResult.found
                    ? `Optimal Path: ${pathResult.cost} steps`
                    : "No Path Available (Blocked by Obstacles)"}
                </span>
              </div>
              <span className="font-mono text-[11px] opacity-80">Explored: {pathResult.visited.length} hexes</span>
            </div>
          </div>
        </div>

        {/* Right Code Display (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-emerald-400" /> TypeScript A* Implementation
              </span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded flex items-center gap-1 transition shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy TS Code"}
              </button>
            </div>
            <pre className="w-full bg-slate-950/90 font-mono text-xs text-slate-300 border border-slate-800 rounded-xl p-4 overflow-x-auto max-h-[380px] leading-relaxed shadow-inner">
              <code>{tsCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HexGridAStarPathfindingAlgorithm;
