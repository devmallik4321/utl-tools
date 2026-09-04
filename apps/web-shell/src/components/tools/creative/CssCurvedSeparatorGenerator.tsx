"use client";

import { useState, useMemo } from "react";
import { Sparkles, Copy, Check, Eye, Sliders, RefreshCw, Layers, ArrowDownUp } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

type ShapeType = "wave" | "tilt" | "concave" | "convex" | "hills" | "arrow";

export function CssCurvedSeparatorGenerator() {
  const [shape, setShape] = useState<ShapeType>("wave");
  const [height, setHeight] = useState<number>(80);
  const [fillColor, setFillColor] = useState<string>("#3b82f6");
  const [bgColor, setBgColor] = useState<string>("#0f172a");
  const [flipX, setFlipX] = useState<boolean>(false);
  const [flipY, setFlipY] = useState<boolean>(false);
  const [position, setPosition] = useState<"bottom" | "top">("bottom");
  const [copiedSvg, setCopiedSvg] = useState<boolean>(false);
  const [copiedCss, setCopiedCss] = useState<boolean>(false);

  const pathD = useMemo(() => {
    switch (shape) {
      case "wave":
        return "M 0 0 C 300 100, 700 -50, 1200 50 L 1200 120 L 0 120 Z";
      case "tilt":
        return "M 0 100 L 1200 0 L 1200 120 L 0 120 Z";
      case "concave":
        return "M 0 0 Q 600 100, 1200 0 L 1200 120 L 0 120 Z";
      case "convex":
        return "M 0 100 Q 600 0, 1200 100 L 1200 120 L 0 120 Z";
      case "hills":
        return "M 0 40 Q 300 110, 600 40 T 1200 40 L 1200 120 L 0 120 Z";
      case "arrow":
        return "M 0 0 L 600 90 L 1200 0 L 1200 120 L 0 120 Z";
      default:
        return "M 0 0 L 1200 0 L 1200 120 L 0 120 Z";
    }
  }, [shape]);

  const transformStyle = useMemo(() => {
    const scaleX = flipX ? -1 : 1;
    const scaleY = flipY || position === "top" ? -1 : 1;
    if (scaleX === 1 && scaleY === 1) return "";
    return `scale(${scaleX}, ${scaleY})`;
  }, [flipX, flipY, position]);

  const rawSvgCode = useMemo(() => {
    const transformAttr = transformStyle ? ` style="transform: ${transformStyle}; transform-origin: center;"` : "";
    return `<div class="custom-shape-divider" style="position: relative; width: 100%; overflow: hidden; line-height: 0;">
  <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style="position: relative; display: block; width: calc(100% + 1.3px); height: ${height}px;${transformAttr ? ` ${transformAttr.slice(7, -1)}` : ""}">
    <path d="${pathD}" fill="${fillColor}" />
  </svg>
</div>`;
  }, [pathD, fillColor, height, transformStyle]);

  const cssReactSnippet = useMemo(() => {
    return `export function SectionDivider() {
  return (
    <div className="relative w-full overflow-hidden leading-none">
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="relative block w-full h-[${height}px]"
        style={{ transform: "${transformStyle || "none"}", transformOrigin: "center" }}
      >
        <path d="${pathD}" fill="${fillColor}" />
      </svg>
    </div>
  );
}`;
  }, [pathD, fillColor, height, transformStyle]);

  const handleCopySvg = async () => {
    const ok = await copyToClipboard(rawSvgCode);
    if (ok) {
      setCopiedSvg(true);
      setTimeout(() => setCopiedSvg(false), 2000);
    }
  };

  const handleCopyCss = async () => {
    const ok = await copyToClipboard(cssReactSnippet);
    if (ok) {
      setCopiedCss(true);
      setTimeout(() => setCopiedCss(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Preview Canvas */}
      <div className="p-6 bg-card border border-border rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-primary" />
            Live Full-Width Section Divider Render
          </span>
          <span className="text-xs text-muted-foreground">
            Height: {height}px • Position: {position}
          </span>
        </div>

        {/* Mock Section Container */}
        <div className="w-full rounded-xl overflow-hidden border border-border/80 shadow-md">
          {/* Top Section */}
          <div
            style={{ backgroundColor: bgColor }}
            className="p-8 text-center text-white transition-colors duration-300 relative"
          >
            <h4 className="text-lg font-bold">Primary Hero Section</h4>
            <p className="text-xs text-white/70 mt-1">Seamless fluid transition into adjacent section</p>

            {position === "bottom" && (
              <div
                className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none pointer-events-none"
                style={{ height: `${height}px` }}
              >
                <svg
                  viewBox="0 0 1200 120"
                  preserveAspectRatio="none"
                  className="w-full h-full"
                  style={{ transform: transformStyle, transformOrigin: "center" }}
                >
                  <path d={pathD} fill={fillColor} />
                </svg>
              </div>
            )}
          </div>

          {/* Bottom Section */}
          <div
            style={{ backgroundColor: fillColor }}
            className="p-8 text-center text-white transition-colors duration-300 relative"
          >
            {position === "top" && (
              <div
                className="absolute top-0 left-0 right-0 overflow-hidden leading-none pointer-events-none"
                style={{ height: `${height}px` }}
              >
                <svg
                  viewBox="0 0 1200 120"
                  preserveAspectRatio="none"
                  className="w-full h-full"
                  style={{ transform: transformStyle, transformOrigin: "center" }}
                >
                  <path d={pathD} fill={bgColor} />
                </svg>
              </div>
            )}
            <h4 className="text-lg font-bold">Adjacent Feature Content</h4>
            <p className="text-xs text-white/80 mt-1">100% Responsive SVG vector scaling</p>
          </div>
        </div>
      </div>

      {/* Shape Preset Picker */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Divider Waveform Archetype
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {(["wave", "tilt", "concave", "convex", "hills", "arrow"] as ShapeType[]).map((t) => (
            <button
              key={t}
              onClick={() => setShape(t)}
              className={`px-3 py-2 text-xs font-bold rounded-lg border capitalize transition-colors ${
                shape === t
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-secondary hover:bg-secondary/80 text-foreground border-border"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Controls & Customization */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Divider Height ({height}px)
          </label>
          <input
            type="range"
            min={30}
            max={200}
            step={5}
            value={height}
            onChange={(e) => setHeight(parseInt(e.target.value))}
            className="w-full accent-primary mt-2"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Fill Color
          </label>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="color"
              value={fillColor}
              onChange={(e) => setFillColor(e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer bg-background"
            />
            <input
              type="text"
              value={fillColor}
              onChange={(e) => setFillColor(e.target.value)}
              className="w-28 px-2 py-1 text-xs font-mono bg-background border border-border rounded text-foreground uppercase"
            />
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Section Background
          </label>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer bg-background"
            />
            <input
              type="text"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-28 px-2 py-1 text-xs font-mono bg-background border border-border rounded text-foreground uppercase"
            />
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Transform &amp; Orient
          </label>
          <div className="space-y-1 text-xs text-muted-foreground mt-1">
            <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
              <input
                type="checkbox"
                checked={flipX}
                onChange={(e) => setFlipX(e.target.checked)}
                className="rounded accent-primary"
              />
              Flip Horizontally
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:text-foreground">
              <input
                type="checkbox"
                checked={flipY}
                onChange={(e) => setFlipY(e.target.checked)}
                className="rounded accent-primary"
              />
              Invert Shape Vertically
            </label>
          </div>
        </div>
      </div>

      {/* Code Export Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* HTML / Inline SVG */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              HTML + SVG Embed Code
            </span>
            <button
              onClick={handleCopySvg}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground rounded border border-border transition-colors"
            >
              {copiedSvg ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSvg ? "Copied" : "Copy HTML/SVG"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 border border-border/70 rounded-lg text-xs font-mono text-muted-foreground overflow-x-auto max-h-48">
            {rawSvgCode}
          </pre>
        </div>

        {/* React / Tailwind */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              React / Tailwind Component
            </span>
            <button
              onClick={handleCopyCss}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground rounded border border-border transition-colors"
            >
              {copiedCss ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCss ? "Copied" : "Copy React"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 border border-border/70 rounded-lg text-xs font-mono text-muted-foreground overflow-x-auto max-h-48">
            {cssReactSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
}
