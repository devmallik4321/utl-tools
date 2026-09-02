"use client";

import { useState, useMemo } from "react";
import { PieChart, Copy, Check, Sparkles, Plus, Trash2, Sliders } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface Slice {
  id: string;
  name: string;
  color: string;
  pct: number;
}

const DEFAULT_SLICES: Slice[] = [
  { id: "1", name: "Segment A", color: "#3b82f6", pct: 45 },
  { id: "2", name: "Segment B", color: "#10b981", pct: 30 },
  { id: "3", name: "Segment C", color: "#8b5cf6", pct: 25 },
];

export function ConicGradientGenerator() {
  const [slices, setSlices] = useState<Slice[]>(DEFAULT_SLICES);
  const [donutHole, setDonutHole] = useState<number>(0); // 0 = solid pie, >0 = donut
  const [copied, setCopied] = useState<boolean>(false);

  const { conicCss, fullCssSnippet } = useMemo(() => {
    let currentPct = 0;
    const stops: string[] = [];

    slices.forEach((s) => {
      const nextPct = currentPct + s.pct;
      stops.push(`${s.color} ${currentPct}% ${nextPct}%`);
      currentPct = nextPct;
    });

    const conic = `conic-gradient(\n  ${stops.join(",\n  ")}\n)`;

    let fullSnippet = `/* CSS Conic Gradient Pie Chart */\n.pie-chart {\n  width: 200px;\n  height: 200px;\n  border-radius: 50%;\n  background: ${conic};\n}`;

    if (donutHole > 0) {
      fullSnippet += `\n\n/* Donut Hole */\n.pie-chart::after {\n  content: "";\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  width: ${donutHole}%;\n  height: ${donutHole}%;\n  background: #ffffff; /* or parent background */\n  border-radius: 50%;\n}`;
    }

    return { conicCss: `conic-gradient(${stops.join(", ")})`, fullCssSnippet: fullSnippet };
  }, [slices, donutHole]);

  const updateSlice = (id: string, field: keyof Slice, val: any) => {
    setSlices(slices.map((s) => (s.id === id ? { ...s, [field]: val } : s)));
  };

  const addSlice = () => {
    if (slices.length >= 6) return;
    const newId = String(Date.now());
    setSlices([...slices, { id: newId, name: `Segment ${slices.length + 1}`, color: "#f59e0b", pct: 15 }]);
  };

  const removeSlice = (id: string) => {
    if (slices.length <= 2) return;
    setSlices(slices.filter((s) => s.id !== id));
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(fullCssSnippet);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Slices Editor */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Pie Slices &amp; Percentages
          </label>
          <button
            onClick={addSlice}
            disabled={slices.length >= 6}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1 disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Slice</span>
          </button>
        </div>

        <div className="space-y-2">
          {slices.map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-2 bg-muted/40 rounded-lg border border-border">
              <input
                type="color"
                value={s.color}
                onChange={(e) => updateSlice(s.id, "color", e.target.value)}
                className="w-7 h-7 rounded border border-border cursor-pointer"
              />
              <input
                type="text"
                value={s.name}
                onChange={(e) => updateSlice(s.id, "name", e.target.value)}
                className="text-xs font-bold bg-background border border-border rounded px-2 py-1 flex-1 text-foreground"
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={s.pct}
                  onChange={(e) => updateSlice(s.id, "pct", Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 px-2 py-1 text-xs font-mono font-bold text-center bg-background border border-border rounded text-foreground"
                />
                <span className="text-xs font-mono text-muted-foreground">%</span>
              </div>
              <button
                onClick={() => removeSlice(s.id)}
                disabled={slices.length <= 2}
                className="text-muted-foreground hover:text-rose-600 disabled:opacity-20"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Donut Hole Slider */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2 max-w-sm">
        <div className="flex justify-between items-center text-xs">
          <label className="font-semibold text-foreground uppercase tracking-wider">Donut Hole Ring</label>
          <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{donutHole}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={75}
          value={donutHole}
          onChange={(e) => setDonutHole(parseInt(e.target.value))}
          className="w-full accent-blue-600"
        />
      </div>

      {/* Live Preview Canvas */}
      <div className="p-8 bg-muted/30 border border-border rounded-2xl flex flex-col items-center justify-center">
        <div
          style={{
            background: conicCss,
          }}
          className="w-48 h-48 rounded-full shadow-lg relative flex items-center justify-center border border-border"
        >
          {donutHole > 0 && (
            <div
              style={{
                width: `${donutHole}%`,
                height: `${donutHole}%`,
              }}
              className="rounded-full bg-card shadow-inner border border-border flex items-center justify-center text-[10px] font-mono font-bold text-muted-foreground"
            >
              {donutHole}%
            </div>
          )}
        </div>
      </div>

      {/* Generated CSS */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-emerald-500" />
            CSS `conic-gradient(...)` Output
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
          {fullCssSnippet}
        </pre>
      </div>
    </div>
  );
}
