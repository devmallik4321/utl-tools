"use client";

import { useState, useMemo } from "react";
import { Grid, Copy, Check, Sparkles, Layers, MousePointer, FileCode } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function HexPixelPickerCalculator() {
  const [screenX, setScreenX] = useState<number>(180);
  const [screenY, setScreenY] = useState<number>(120);
  const [hexSize, setHexSize] = useState<number>(40); // outer radius
  const [orientation, setOrientation] = useState<"pointy" | "flat">("pointy");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const {
    fracQ,
    fracR,
    roundQ,
    roundR,
    cubeX,
    cubeY,
    cubeZ,
    centerPxX,
    centerPxY,
    tsCode,
  } = useMemo(() => {
    let q = 0;
    let r = 0;

    if (orientation === "pointy") {
      q = ((Math.sqrt(3) / 3) * screenX - (1 / 3) * screenY) / hexSize;
      r = ((2 / 3) * screenY) / hexSize;
    } else {
      q = ((2 / 3) * screenX) / hexSize;
      r = ((-1 / 3) * screenX + (Math.sqrt(3) / 3) * screenY) / hexSize;
    }

    // Cube Rounding algorithm
    const x = q;
    const z = r;
    const y = -x - z;

    let rx = Math.round(x);
    let ry = Math.round(y);
    let rz = Math.round(z);

    const xDiff = Math.abs(rx - x);
    const yDiff = Math.abs(ry - y);
    const zDiff = Math.abs(rz - z);

    if (xDiff > yDiff && xDiff > zDiff) {
      rx = -ry - rz;
    } else if (yDiff > zDiff) {
      ry = -rx - rz;
    } else {
      rz = -rx - ry;
    }

    const finalQ = rx;
    const finalR = rz;

    // Calculate center pixel of picked hex
    let cx = 0;
    let cy = 0;
    if (orientation === "pointy") {
      cx = hexSize * (Math.sqrt(3) * finalQ + (Math.sqrt(3) / 2) * finalR);
      cy = hexSize * ((3 / 2) * finalR);
    } else {
      cx = hexSize * ((3 / 2) * finalQ);
      cy = hexSize * ((Math.sqrt(3) / 2) * finalQ + Math.sqrt(3) * finalR);
    }

    const code = `// Red Blob Games Screen Pixel -> Hexagonal Coordinate Picker
export function pixelToHex(x: number, y: number, size: number, orientation: 'pointy' | 'flat') {
  let q = 0;
  let r = 0;
  if (orientation === 'pointy') {
    q = (Math.sqrt(3)/3 * x - 1/3 * y) / size;
    r = (2/3 * y) / size;
  } else {
    q = (2/3 * x) / size;
    r = (-1/3 * x + Math.sqrt(3)/3 * y) / size;
  }

  // Cube Rounding to nearest discrete hex
  const xCube = q;
  const zCube = r;
  const yCube = -xCube - zCube;

  let rx = Math.round(xCube);
  let ry = Math.round(yCube);
  let rz = Math.round(zCube);

  const xDiff = Math.abs(rx - xCube);
  const yDiff = Math.abs(ry - yCube);
  const zDiff = Math.abs(rz - zCube);

  if (xDiff > yDiff && xDiff > zDiff) {
    rx = -ry - rz;
  } else if (yDiff > zDiff) {
    ry = -rx - rz;
  } else {
    rz = -rx - ry;
  }

  return { q: rx, r: rz, cube: { x: rx, y: ry, z: rz } };
}`;

    return {
      fracQ: q.toFixed(3),
      fracR: r.toFixed(3),
      roundQ: finalQ,
      roundR: finalR,
      cubeX: rx,
      cubeY: ry,
      cubeZ: rz,
      centerPxX: Math.round(cx),
      centerPxY: Math.round(cy),
      tsCode: code,
    };
  }, [screenX, screenY, hexSize, orientation]);

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
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Mouse Screen X (px)
          </label>
          <input
            type="number"
            value={screenX}
            onChange={(e) => setScreenX(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Mouse Screen Y (px)
          </label>
          <input
            type="number"
            value={screenY}
            onChange={(e) => setScreenY(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Hex Radius (Size px)
          </label>
          <input
            type="number"
            min={10}
            step={5}
            value={hexSize}
            onChange={(e) => setHexSize(Math.max(5, parseInt(e.target.value) || 5))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Hex Orientation
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setOrientation("pointy")}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors ${
                orientation === "pointy" ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
              }`}
            >
              Pointy-Top
            </button>
            <button
              onClick={() => setOrientation("flat")}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors ${
                orientation === "flat" ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
              }`}
            >
              Flat-Top
            </button>
          </div>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <MousePointer className="w-4 h-4 text-emerald-500" />
            Picked Hex Tile Coordinates (Cube Rounded)
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border-2 border-emerald-500/40 space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase font-sans">
              Discrete Axial Tile
            </span>
            <p className="text-3xl font-extrabold text-foreground">
              ({roundQ}, {roundR})
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">q = column, r = row</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Discrete Cube Vector
            </span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ({cubeX}, {cubeY}, {cubeZ})
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">{cubeX} + {cubeY} + {cubeZ} = 0</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Fractional Coords
            </span>
            <p className="text-xl font-bold text-foreground">
              ({fracQ}, {fracR})
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Unrounded projection</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Picked Hex Center
            </span>
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
              {centerPxX}, {centerPxY} px
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Snapped center coordinate</span>
          </div>
        </div>
      </div>

      {/* Code Snippet */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between font-sans">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-emerald-500" />
            TypeScript Pixel to Hex Coordinate Picking Library
          </h4>
          <button
            onClick={() => handleCopy("ts", tsCode)}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copiedKey === "ts" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === "ts" ? "Copied!" : "Copy Code"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {tsCode}
        </pre>
      </div>
    </div>
  );
}
