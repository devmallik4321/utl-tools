"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Eye, ShieldAlert, Sparkles, Copy, Check, RefreshCw, Layers, Code2 } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface HexCoord {
  q: number;
  r: number;
}

function hexDistance(a: HexCoord, b: HexCoord): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - (b.q + b.r)) + Math.abs(a.r - b.r)) / 2;
}

function hexLerp(a: HexCoord, b: HexCoord, t: number): { x: number; y: number; z: number } {
  const az = -a.q - a.r;
  const bz = -b.q - b.r;
  return {
    x: a.q + (b.q - a.q) * t,
    y: a.r + (b.r - a.r) * t,
    z: az + (bz - az) * t,
  };
}

function cubeRound(cube: { x: number; y: number; z: number }): HexCoord {
  let rx = Math.round(cube.x);
  let ry = Math.round(cube.y);
  let rz = Math.round(cube.z);

  const xDiff = Math.abs(rx - cube.x);
  const yDiff = Math.abs(ry - cube.y);
  const zDiff = Math.abs(rz - cube.z);

  if (xDiff > yDiff && xDiff > zDiff) {
    rx = -ry - rz;
  } else if (yDiff > zDiff) {
    ry = -rx - rz;
  }
  return { q: rx, r: ry };
}

function hexLinedraw(a: HexCoord, b: HexCoord): HexCoord[] {
  const N = hexDistance(a, b);
  const results: HexCoord[] = [];
  const step = 1.0 / Math.max(N, 1);
  for (let i = 0; i <= N; i++) {
    results.push(cubeRound(hexLerp(a, b, step * i)));
  }
  return results;
}

export function HexFovShadowcastingCalculator() {
  const [radius, setRadius] = useState<number>(4);
  const [obstacles, setObstacles] = useState<Set<string>>(() => new Set(["1,-1", "1,0", "0,2", "-1,2"]));
  const [copied, setCopied] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const center: HexCoord = { q: 0, r: 0 };

  const { allTiles, visibleTiles, hiddenTiles } = useMemo(() => {
    const tiles: HexCoord[] = [];
    for (let q = -radius; q <= radius; q++) {
      const r1 = Math.max(-radius, -q - radius);
      const r2 = Math.min(radius, -q + radius);
      for (let r = r1; r <= r2; r++) {
        tiles.push({ q, r });
      }
    }

    const visible = new Set<string>();
    visible.add("0,0"); // Center is always visible

    tiles.forEach((target) => {
      if (target.q === 0 && target.r === 0) return;
      const ray = hexLinedraw(center, target);
      let blocked = false;

      // Check all intermediate tiles before target
      for (let i = 1; i < ray.length - 1; i++) {
        const key = `${ray[i].q},${ray[i].r}`;
        if (obstacles.has(key)) {
          blocked = true;
          break;
        }
      }

      const targetKey = `${target.q},${target.r}`;
      if (!blocked) {
        visible.add(targetKey);
      }
    });

    const hidden = tiles.filter((t) => !visible.has(`${t.q},${t.r}`));

    return {
      allTiles: tiles,
      visibleTiles: visible,
      hiddenTiles: hidden,
    };
  }, [radius, obstacles]);

  // Canvas Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const hexSize = Math.min(width, height) / (radius * 3.8 + 2);

    function hexCorner(cx: number, cy: number, size: number, i: number) {
      const angleDeg = 60 * i - 30; // pointy-topped
      const angleRad = (Math.PI / 180) * angleDeg;
      return {
        x: cx + size * Math.cos(angleRad),
        y: cy + size * Math.sin(angleRad),
      };
    }

    function drawHex(c: CanvasRenderingContext2D, q: number, r: number, fill: string, stroke: string, isObstacle = false, isPlayer = false) {
      const x = centerX + hexSize * Math.sqrt(3) * (q + r / 2);
      const y = centerY + hexSize * (3 / 2) * r;

      c.beginPath();
      for (let i = 0; i < 6; i++) {
        const pt = hexCorner(x, y, hexSize - 1, i);
        if (i === 0) c.moveTo(pt.x, pt.y);
        else c.lineTo(pt.x, pt.y);
      }
      c.closePath();
      c.fillStyle = fill;
      c.fill();
      c.strokeStyle = stroke;
      c.lineWidth = 1;
      c.stroke();

      if (isPlayer) {
        c.fillStyle = "#ffffff";
        c.font = `bold ${Math.round(hexSize * 0.7)}px sans-serif`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText("★", x, y);
      } else if (isObstacle) {
        c.fillStyle = "#ffffff";
        c.font = `${Math.round(hexSize * 0.5)}px sans-serif`;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText("■", x, y);
      }
    }

    // Draw all tiles
    allTiles.forEach((tile) => {
      const key = `${tile.q},${tile.r}`;
      const isPlayer = tile.q === 0 && tile.r === 0;
      const isObs = obstacles.has(key);
      const isVis = visibleTiles.has(key);

      let fill = "#1e293b"; // hidden dark
      let stroke = "#334155";

      if (isPlayer) {
        fill = "#f59e0b"; // gold
        stroke = "#d97706";
      } else if (isObs) {
        fill = isVis ? "#ef4444" : "#7f1d1d"; // red obstacle
        stroke = "#991b1b";
      } else if (isVis) {
        fill = "#0284c7"; // illuminated cyan
        stroke = "#38bdf8";
      }

      drawHex(ctx, tile.q, tile.r, fill, stroke, isObs, isPlayer);
    });
  }, [allTiles, visibleTiles, obstacles, radius]);

  // Click handler to toggle obstacles
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const hexSize = Math.min(canvas.width, canvas.height) / (radius * 3.8 + 2);

    // Axial coordinate from pixel
    const px = clickX - centerX;
    const py = clickY - centerY;
    const q = (Math.sqrt(3) / 3 * px - 1 / 3 * py) / hexSize;
    const r = (2 / 3 * py) / hexSize;

    const rounded = cubeRound({ x: q, y: r, z: -q - r });
    if (rounded.q === 0 && rounded.r === 0) return; // Don't block player
    if (hexDistance(center, rounded) > radius) return; // Outside radius

    const key = `${rounded.q},${rounded.r}`;
    setObstacles((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleCopyJson = async () => {
    const list = Array.from(visibleTiles).map((k) => {
      const [q, r] = k.split(",").map(Number);
      return { q, r };
    });
    const ok = await copyToClipboard(JSON.stringify(list, null, 2));
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 bg-card border border-border rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Hexagonal Grid Field of View (FOV) &amp; Shadowcasting
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setObstacles(new Set())}
            className="px-2.5 py-1 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground rounded-lg border border-border transition-colors"
          >
            Clear Obstacles
          </button>
          <button
            onClick={() => setObstacles(new Set(["1,-1", "1,0", "0,2", "-1,2", "2,-2", "-2,1"]))}
            className="px-2.5 py-1 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground rounded-lg border border-border transition-colors"
          >
            Preset Pillars
          </button>
        </div>
      </div>

      {/* Interactive Canvas Canvas */}
      <div className="p-6 bg-card border border-border rounded-2xl flex flex-col items-center justify-center gap-4">
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">
            Interactive Canvas (Click any hex to toggle wall/obstacle)
          </span>
          <span>
            ★ Player • ■ Obstacle • Blue: Illuminated • Dark: In Shadow
          </span>
        </div>

        <canvas
          ref={canvasRef}
          width={420}
          height={380}
          onClick={handleCanvasClick}
          className="bg-background rounded-xl border border-border shadow-inner cursor-pointer"
        />

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <span>Radius: <strong className="text-foreground">{radius}</strong></span>
          <span>•</span>
          <span>Total Tiles: <strong className="text-foreground">{allTiles.length}</strong></span>
          <span>•</span>
          <span>Visible: <strong className="text-emerald-500 font-bold">{visibleTiles.size}</strong></span>
          <span>•</span>
          <span>Shadowed: <strong className="text-rose-500 font-bold">{hiddenTiles.length}</strong></span>
          <span>•</span>
          <span>Coverage: <strong className="text-foreground">{((visibleTiles.size / allTiles.length) * 100).toFixed(1)}%</strong></span>
        </div>
      </div>

      {/* Radius Control & Export */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-3">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Vision Radius ({radius} tiles)
          </label>
          <input
            type="range"
            min={2}
            max={6}
            step={1}
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            className="w-full accent-primary"
          />
          <span className="text-[11px] text-muted-foreground block">
            Adjusting radius dynamically recalculates line-of-sight raycasts to all {allTiles.length} hex coordinates.
          </span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              Visible Hex Coordinates Array
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              Export array of {visibleTiles.size} axial (q, r) tile coordinates currently within unobstructed field of view.
            </p>
          </div>
          <button
            onClick={handleCopyJson}
            className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Copied Visible Tiles JSON" : "Copy Visible Coordinates (JSON)"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
