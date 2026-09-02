"use client";

import { useState, useMemo } from "react";
import { Palette, Copy, Check, Sparkles, Plus, Trash2, Sliders } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface ColorStop {
  id: string;
  color: string;
  stop: number;
}

const PRESETS = [
  { name: "Ocean Breeze", type: "linear", angle: 135, stops: [{ id: "1", color: "#06b6d4", stop: 0 }, { id: "2", color: "#3b82f6", stop: 100 }] },
  { name: "Sunset Horizon", type: "linear", angle: 90, stops: [{ id: "1", color: "#f97316", stop: 0 }, { id: "2", color: "#ec4899", stop: 100 }] },
  { name: "Neon Glow", type: "linear", angle: 45, stops: [{ id: "1", color: "#8b5cf6", stop: 0 }, { id: "2", color: "#06b6d4", stop: 100 }] },
  { name: "Emerald Forest", type: "linear", angle: 180, stops: [{ id: "1", color: "#10b981", stop: 0 }, { id: "2", color: "#047857", stop: 100 }] },
  { name: "Cyberpunk Night", type: "radial", angle: 0, stops: [{ id: "1", color: "#ec4899", stop: 0 }, { id: "2", color: "#1e1b4b", stop: 100 }] },
];

export function GradientGenerator() {
  const [gradientType, setGradientType] = useState<"linear" | "radial">("linear");
  const [angle, setAngle] = useState<number>(135);
  const [stops, setStops] = useState<ColorStop[]>([
    { id: "1", color: "#3b82f6", stop: 0 },
    { id: "2", color: "#8b5cf6", stop: 50 },
    { id: "3", color: "#ec4899", stop: 100 },
  ]);
  const [copied, setCopied] = useState<boolean>(false);

  const cssGradient = useMemo(() => {
    const sortedStops = [...stops].sort((a, b) => a.stop - b.stop);
    const stopsStr = sortedStops.map((s) => `${s.color} ${s.stop}%`).join(", ");

    if (gradientType === "linear") {
      return `linear-gradient(${angle}deg, ${stopsStr})`;
    } else {
      return `radial-gradient(circle, ${stopsStr})`;
    }
  }, [gradientType, angle, stops]);

  const cssCode = `background: ${cssGradient};\nbackground-image: ${cssGradient};`;

  const addStop = () => {
    if (stops.length >= 6) return;
    setStops([
      ...stops,
      { id: Date.now().toString(), color: "#10b981", stop: 75 },
    ]);
  };

  const removeStop = (id: string) => {
    if (stops.length <= 2) return;
    setStops(stops.filter((s) => s.id !== id));
  };

  const updateStop = (id: string, field: keyof ColorStop, val: any) => {
    setStops(stops.map((s) => (s.id === id ? { ...s, [field]: val } : s)));
  };

  const handleApplyPreset = (p: typeof PRESETS[0]) => {
    setGradientType(p.type as any);
    setAngle(p.angle);
    setStops(p.stops);
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(cssCode);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Presets Row */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => handleApplyPreset(p)}
            className="px-3 py-1 bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Visual Canvas */}
      <div className="p-3 bg-muted/40 border border-border rounded-2xl">
        <div
          style={{ background: cssGradient }}
          className="w-full h-56 rounded-xl shadow-lg border border-border/40 flex items-center justify-center text-white font-bold text-sm tracking-wider uppercase drop-shadow-md select-none"
        >
          {gradientType === "linear" ? `${angle}° Linear Gradient` : "Radial Gradient"}
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-foreground uppercase tracking-wider">Gradient Type</span>
            <div className="flex p-0.5 bg-muted rounded-lg border border-border">
              <button
                onClick={() => setGradientType("linear")}
                className={`px-2.5 py-0.5 rounded-md font-semibold ${
                  gradientType === "linear" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"
                }`}
              >
                Linear
              </button>
              <button
                onClick={() => setGradientType("radial")}
                className={`px-2.5 py-0.5 rounded-md font-semibold ${
                  gradientType === "radial" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"
                }`}
              >
                Radial
              </button>
            </div>
          </div>

          {gradientType === "linear" && (
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Angle Dial:</span>
                <span className="font-mono font-bold text-foreground">{angle}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                value={angle}
                onChange={(e) => setAngle(parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
          )}
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-foreground uppercase tracking-wider">
              Color Stops ({stops.length}/6)
            </span>
            <button
              onClick={addStop}
              disabled={stops.length >= 6}
              className="px-2 py-0.5 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md inline-flex items-center gap-1 disabled:opacity-40"
            >
              <Plus className="w-3 h-3" />
              <span>Add Stop</span>
            </button>
          </div>

          <div className="space-y-2">
            {stops.map((stop) => (
              <div key={stop.id} className="flex items-center gap-2 text-xs">
                <input
                  type="color"
                  value={stop.color}
                  onChange={(e) => updateStop(stop.id, "color", e.target.value)}
                  className="w-7 h-7 rounded border border-border cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={stop.color}
                  onChange={(e) => updateStop(stop.id, "color", e.target.value)}
                  className="w-20 px-2 py-1 font-mono text-xs bg-background border border-border rounded-md"
                />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={stop.stop}
                  onChange={(e) => updateStop(stop.id, "stop", parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <span className="font-mono w-10 text-right text-muted-foreground">{stop.stop}%</span>
                <button
                  onClick={() => removeStop(stop.id)}
                  disabled={stops.length <= 2}
                  className="text-muted-foreground hover:text-rose-500 disabled:opacity-30 p-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS Code Output */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-emerald-500" />
            CSS Background Gradient Rule
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
          {cssCode}
        </pre>
      </div>
    </div>
  );
}
