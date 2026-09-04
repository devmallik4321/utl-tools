"use client";

import { useState, useMemo } from "react";
import { Sparkles, Copy, Check, Sliders, Eye, RefreshCw, BarChart2, Activity } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const PRESETS = [
  { name: "Upward Growth", data: "14, 18, 16, 25, 32, 28, 41, 49, 44, 62, 75, 88" },
  { name: "Volatile Market", data: "45, 52, 38, 65, 42, 70, 35, 80, 55, 62, 48, 72" },
  { name: "Spike & Recovery", data: "20, 22, 21, 23, 85, 45, 30, 26, 24, 25, 27, 28" },
  { name: "Seasonal Wave", data: "30, 45, 60, 50, 32, 28, 44, 58, 48, 35, 42, 55" },
];

export function SvgSparklineGenerator() {
  const [dataInput, setDataInput] = useState<string>("14, 18, 16, 25, 32, 28, 41, 49, 44, 62, 75, 88");
  const [width, setWidth] = useState<number>(200);
  const [height, setHeight] = useState<number>(50);
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [strokeColor, setStrokeColor] = useState<string>("#10b981");
  const [fillType, setFillType] = useState<"gradient" | "solid" | "none">("gradient");
  const [fillColor, setFillColor] = useState<string>("#10b981");
  const [fillOpacity, setFillOpacity] = useState<number>(0.15);
  const [curveType, setCurveType] = useState<"smooth" | "linear">("smooth");
  const [showEndDot, setShowEndDot] = useState<boolean>(true);
  const [showMinMaxDots, setShowMinMaxDots] = useState<boolean>(false);
  const [copiedSvg, setCopiedSvg] = useState<boolean>(false);
  const [copiedReact, setCopiedReact] = useState<boolean>(false);

  const {
    points,
    minVal,
    maxVal,
    firstVal,
    lastVal,
    changePct,
    pathD,
    areaD,
    minPoint,
    maxPoint,
    lastPoint,
    valid,
  } = useMemo(() => {
    const raw = dataInput
      .split(/[\s,]+/)
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n));

    if (raw.length < 2) {
      return {
        points: [],
        minVal: 0,
        maxVal: 0,
        firstVal: 0,
        lastVal: 0,
        changePct: 0,
        pathD: "",
        areaD: "",
        minPoint: null,
        maxPoint: null,
        lastPoint: null,
        valid: false,
      };
    }

    const min = Math.min(...raw);
    const max = Math.max(...raw);
    const range = max - min || 1;

    const padX = Math.max(strokeWidth * 2, 4);
    const padY = Math.max(strokeWidth * 2, 6);
    const innerW = width - padX * 2;
    const innerH = height - padY * 2;

    const pts = raw.map((val, idx) => {
      const x = padX + (idx / (raw.length - 1)) * innerW;
      const y = padY + innerH - ((val - min) / range) * innerH;
      return { x, y, val, idx };
    });

    // Build SVG Path (Linear or Monotone/Cubic Spline)
    let d = "";
    if (curveType === "linear" || pts.length === 2) {
      d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)} ` + pts.slice(1).map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
    } else {
      // Smooth Bezier Curve through points
      d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(0, i - 1)];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[Math.min(pts.length - 1, i + 2)];

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
      }
    }

    // Area closed path for gradient fill
    const bottomY = height - 1;
    const area = `${d} L ${pts[pts.length - 1].x.toFixed(1)} ${bottomY} L ${pts[0].x.toFixed(1)} ${bottomY} Z`;

    const minPt = pts.find((p) => p.val === min) || pts[0];
    const maxPt = pts.find((p) => p.val === max) || pts[0];
    const lastPt = pts[pts.length - 1];

    const chg = raw[0] !== 0 ? ((raw[raw.length - 1] - raw[0]) / Math.abs(raw[0])) * 100 : 0;

    return {
      points: pts,
      minVal: min,
      maxVal: max,
      firstVal: raw[0],
      lastVal: raw[raw.length - 1],
      changePct: chg,
      pathD: d,
      areaD: area,
      minPoint: minPt,
      maxPoint: maxPt,
      lastPoint: lastPt,
      valid: true,
    };
  }, [dataInput, width, height, strokeWidth, curveType]);

  const rawSvgCode = useMemo(() => {
    if (!valid) return "";
    const gradId = "sparkline-grad";
    let fillElement = "";
    let defsElement = "";

    if (fillType === "gradient") {
      defsElement = `  <defs>\n    <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">\n      <stop offset="0%" stop-color="${fillColor}" stop-opacity="${fillOpacity}" />\n      <stop offset="100%" stop-color="${fillColor}" stop-opacity="0" />\n    </linearGradient>\n  </defs>\n`;
      fillElement = `  <path d="${areaD}" fill="url(#${gradId})" />\n`;
    } else if (fillType === "solid") {
      fillElement = `  <path d="${areaD}" fill="${fillColor}" fill-opacity="${fillOpacity}" />\n`;
    }

    let dots = "";
    if (showEndDot && lastPoint) {
      dots += `  <circle cx="${lastPoint.x.toFixed(1)}" cy="${lastPoint.y.toFixed(1)}" r="${strokeWidth + 1.5}" fill="${strokeColor}" />\n`;
    }
    if (showMinMaxDots && minPoint && maxPoint) {
      dots += `  <circle cx="${minPoint.x.toFixed(1)}" cy="${minPoint.y.toFixed(1)}" r="${strokeWidth + 1}" fill="#ef4444" />\n`;
      dots += `  <circle cx="${maxPoint.x.toFixed(1)}" cy="${maxPoint.y.toFixed(1)}" r="${strokeWidth + 1}" fill="#10b981" />\n`;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" fill="none">\n${defsElement}${fillElement}  <path d="${pathD}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />\n${dots}</svg>`;
  }, [valid, width, height, pathD, areaD, strokeColor, strokeWidth, fillType, fillColor, fillOpacity, showEndDot, showMinMaxDots, lastPoint, minPoint, maxPoint]);

  const reactCode = useMemo(() => {
    return `export function Sparkline() {\n  return (\n    ${rawSvgCode.split("\n").join("\n    ")}\n  );\n}`;
  }, [rawSvgCode]);

  const handleCopySvg = async () => {
    const ok = await copyToClipboard(rawSvgCode);
    if (ok) {
      setCopiedSvg(true);
      setTimeout(() => setCopiedSvg(false), 2000);
    }
  };

  const handleCopyReact = async () => {
    const ok = await copyToClipboard(reactCode);
    if (ok) {
      setCopiedReact(true);
      setTimeout(() => setCopiedReact(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Preview Canvas */}
      <div className="p-6 bg-card border border-border rounded-2xl flex flex-col items-center justify-center gap-4">
        <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-primary" />
          Interactive SVG Live Render
        </span>

        {valid ? (
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 bg-background border border-border rounded-xl shadow-sm inline-flex items-center justify-center">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                width={width}
                height={height}
                className="overflow-visible"
              >
                {fillType === "gradient" && (
                  <defs>
                    <linearGradient id="preview-spark-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={fillColor} stopOpacity={fillOpacity} />
                      <stop offset="100%" stopColor={fillColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                )}
                {fillType === "gradient" && (
                  <path d={areaD} fill="url(#preview-spark-grad)" />
                )}
                {fillType === "solid" && (
                  <path d={areaD} fill={fillColor} fillOpacity={fillOpacity} />
                )}
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {showEndDot && lastPoint && (
                  <circle
                    cx={lastPoint.x}
                    cy={lastPoint.y}
                    r={strokeWidth + 1.5}
                    fill={strokeColor}
                  />
                )}
                {showMinMaxDots && minPoint && maxPoint && (
                  <>
                    <circle cx={minPoint.x} cy={minPoint.y} r={strokeWidth + 1} fill="#ef4444" />
                    <circle cx={maxPoint.x} cy={maxPoint.y} r={strokeWidth + 1} fill="#10b981" />
                  </>
                )}
              </svg>
            </div>

            {/* Micro Metric Banner Sample */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-border">
              <span>Start: <strong className="text-foreground font-mono">{firstVal}</strong></span>
              <span>•</span>
              <span>End: <strong className="text-foreground font-mono">{lastVal}</strong></span>
              <span>•</span>
              <span className={`font-semibold ${changePct >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                {changePct >= 0 ? "+" : ""}{changePct.toFixed(1)}%
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-rose-500 py-6">Please enter at least 2 valid numeric data points.</div>
        )}
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">Presets:</span>
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => setDataInput(p.data)}
            className="px-2.5 py-1 text-xs rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-colors"
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Input & Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Data Series Input */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Numeric Series (Comma or Space Separated)
          </label>
          <textarea
            rows={3}
            value={dataInput}
            onChange={(e) => setDataInput(e.target.value)}
            className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground resize-none"
            placeholder="e.g. 10, 25, 18, 40, 32, 55"
          />
          <span className="text-[11px] text-muted-foreground block">
            {points.length} points detected • Min: {minVal} • Max: {maxVal}
          </span>
        </div>

        {/* Dimension Controls */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                Width ({width}px)
              </label>
              <input
                type="range"
                min={80}
                max={400}
                step={10}
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value))}
                className="w-full accent-primary mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                Height ({height}px)
              </label>
              <input
                type="range"
                min={24}
                max={120}
                step={4}
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value))}
                className="w-full accent-primary mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                Stroke ({strokeWidth}px)
              </label>
              <input
                type="range"
                min={1}
                max={5}
                step={0.5}
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseFloat(e.target.value))}
                className="w-full accent-primary mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                Curve Style
              </label>
              <select
                value={curveType}
                onChange={(e) => setCurveType(e.target.value as "smooth" | "linear")}
                className="w-full mt-1 px-2 py-1 text-xs bg-background border border-border rounded-md text-foreground font-semibold"
              >
                <option value="smooth">Smooth Spline</option>
                <option value="linear">Linear Straight</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Style & Color Settings */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-primary" />
          Color &amp; Fill Customization
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">Stroke Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className="w-8 h-8 rounded border border-border cursor-pointer bg-background"
              />
              <input
                type="text"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className="w-24 px-2 py-1 text-xs font-mono bg-background border border-border rounded text-foreground uppercase"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">Area Fill Type</label>
            <select
              value={fillType}
              onChange={(e) => setFillType(e.target.value as "gradient" | "solid" | "none")}
              className="w-full px-2 py-1.5 text-xs bg-background border border-border rounded text-foreground font-semibold"
            >
              <option value="gradient">Gradient Fade to Bottom</option>
              <option value="solid">Solid Translucent Fill</option>
              <option value="none">No Fill (Line Only)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Callout Dots
            </label>
            <div className="space-y-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={showEndDot}
                  onChange={(e) => setShowEndDot(e.target.checked)}
                  className="rounded accent-primary"
                />
                Show Current End Dot
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={showMinMaxDots}
                  onChange={(e) => setShowMinMaxDots(e.target.checked)}
                  className="rounded accent-primary"
                />
                Highlight Min / Max Dots
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Code Export Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Raw SVG */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Pure SVG Code
            </span>
            <button
              onClick={handleCopySvg}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground rounded border border-border transition-colors"
            >
              {copiedSvg ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSvg ? "Copied" : "Copy SVG"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 border border-border/70 rounded-lg text-xs font-mono text-muted-foreground overflow-x-auto max-h-48">
            {rawSvgCode}
          </pre>
        </div>

        {/* React Component */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              React / JSX Component
            </span>
            <button
              onClick={handleCopyReact}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground rounded border border-border transition-colors"
            >
              {copiedReact ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedReact ? "Copied" : "Copy React"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 border border-border/70 rounded-lg text-xs font-mono text-muted-foreground overflow-x-auto max-h-48">
            {reactCode}
          </pre>
        </div>
      </div>
    </div>
  );
}
