"use client";

import { useState, useMemo } from "react";
import { Palette, Copy, Check, Sparkles, Sliders, RefreshCw } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface MeshPoint {
  id: string;
  color: string;
  x: number;
  y: number;
}

const PRESETS = [
  {
    name: "Aurora Glow",
    base: "#0f172a",
    points: [
      { id: "1", color: "#3b82f6", x: 15, y: 20 },
      { id: "2", color: "#10b981", x: 85, y: 25 },
      { id: "3", color: "#8b5cf6", x: 25, y: 80 },
      { id: "4", color: "#ec4899", x: 80, y: 75 },
    ],
  },
  {
    name: "Sunset Ember",
    base: "#18181b",
    points: [
      { id: "1", color: "#f97316", x: 20, y: 30 },
      { id: "2", color: "#ef4444", x: 80, y: 20 },
      { id: "3", color: "#eab308", x: 50, y: 80 },
      { id: "4", color: "#8b5cf6", x: 85, y: 85 },
    ],
  },
  {
    name: "Cyberpunk Violet",
    base: "#030712",
    points: [
      { id: "1", color: "#a855f7", x: 20, y: 20 },
      { id: "2", color: "#06b6d4", x: 80, y: 30 },
      { id: "3", color: "#f43f5e", x: 30, y: 85 },
      { id: "4", color: "#3b82f6", x: 75, y: 80 },
    ],
  },
];

export function MeshGradientGenerator() {
  const [baseColor, setBaseColor] = useState<string>(PRESETS[0].base);
  const [points, setPoints] = useState<MeshPoint[]>(PRESETS[0].points);
  const [blurRadius, setBlurRadius] = useState<number>(40);
  const [copied, setCopied] = useState<boolean>(false);

  const { cssBackground, fullSnippet } = useMemo(() => {
    const radials = points.map(
      (p) => `radial-gradient(circle at ${p.x}% ${p.y}%, ${p.color} 0%, transparent ${blurRadius}%)`
    );

    const bgImage = radials.join(",\n    ");
    const snippet = `/* Pure CSS Mesh Gradient Background */\n.mesh-gradient-bg {\n  background-color: ${baseColor};\n  background-image:\n    ${bgImage};\n}`;

    return {
      cssBackground: `${radials.join(", ")}, ${baseColor}`,
      fullSnippet: snippet,
    };
  }, [baseColor, points, blurRadius]);

  const loadPreset = (preset: (typeof PRESETS)[0]) => {
    setBaseColor(preset.base);
    setPoints(preset.points);
  };

  const updatePoint = (id: string, field: keyof MeshPoint, val: any) => {
    setPoints(points.map((p) => (p.id === id ? { ...p, [field]: val } : p)));
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(fullSnippet);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => loadPreset(p)}
            className="px-3 py-1 bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Mesh Points Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {points.map((p, i) => (
          <div key={p.id} className="p-3 bg-card border border-border rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">Point #{i + 1}</span>
              <input
                type="color"
                value={p.color}
                onChange={(e) => updatePoint(p.id, "color", e.target.value)}
                className="w-6 h-6 rounded border border-border cursor-pointer"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div>
                <label className="text-[10px] text-muted-foreground block font-sans">X: {p.x}%</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={p.x}
                  onChange={(e) => updatePoint(p.id, "x", parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block font-sans">Y: {p.y}%</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={p.y}
                  onChange={(e) => updatePoint(p.id, "y", parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Preview Canvas */}
      <div className="p-4 bg-muted/30 border border-border rounded-2xl flex flex-col items-center">
        <div
          style={{
            background: cssBackground,
          }}
          className="w-full h-64 rounded-xl shadow-lg border border-border flex items-center justify-center text-white/90 text-sm font-bold tracking-wider"
        >
          <span className="px-4 py-1.5 bg-black/40 backdrop-blur-md rounded-lg border border-white/20">
            Interactive Mesh Canvas
          </span>
        </div>
      </div>

      {/* Generated CSS */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-emerald-500" />
            Pure CSS Radial Mesh Rules
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy CSS"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {fullSnippet}
        </pre>
      </div>
    </div>
  );
}
