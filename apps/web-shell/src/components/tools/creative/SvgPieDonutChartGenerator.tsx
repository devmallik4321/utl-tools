"use client";

import { useState, useMemo } from "react";
import { PieChart, Copy, Check, Sparkles, Sliders, FileCode, Layers } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface SliceItem {
  label: string;
  value: number;
  color: string;
}

const DEFAULT_SLICES: SliceItem[] = [
  { label: "Engineering", value: 45, color: "#3b82f6" },
  { label: "Sales & Marketing", value: 30, color: "#10b981" },
  { label: "Operations", value: 15, color: "#f59e0b" },
  { label: "G&A / Legal", value: 10, color: "#8b5cf6" },
];

export function SvgPieDonutChartGenerator() {
  const [slices, setSlices] = useState<SliceItem[]>(DEFAULT_SLICES);
  const [innerRadius, setInnerRadius] = useState<number>(45); // 0 = Pie, >0 = Donut
  const [outerRadius, setOuterRadius] = useState<number>(80);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { slicePaths, totalValue, fullSvgCode, reactComponentCode } = useMemo(() => {
    const total = slices.reduce((acc, s) => acc + (s.value || 0), 0) || 1;
    const size = outerRadius * 2 + 40;
    const center = size / 2;

    let cumulativeAngle = -Math.PI / 2; // Start at 12 o'clock

    const paths = slices.map((slice) => {
      const sliceAngle = ((slice.value || 0) / total) * (2 * Math.PI);
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + sliceAngle;
      cumulativeAngle = endAngle;

      // Outer arc points
      const x1 = center + outerRadius * Math.cos(startAngle);
      const y1 = center + outerRadius * Math.sin(startAngle);
      const x2 = center + outerRadius * Math.cos(endAngle);
      const y2 = center + outerRadius * Math.sin(endAngle);

      const largeArc = sliceAngle > Math.PI ? 1 : 0;

      let d = "";
      if (innerRadius === 0) {
        // Pie Slice
        d = `M ${center} ${center} L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      } else {
        // Donut Arc
        const ix1 = center + innerRadius * Math.cos(endAngle);
        const iy1 = center + innerRadius * Math.sin(endAngle);
        const ix2 = center + innerRadius * Math.cos(startAngle);
        const iy2 = center + innerRadius * Math.sin(startAngle);

        d = `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;
      }

      return {
        label: slice.label,
        value: slice.value,
        pct: Math.round(((slice.value || 0) / total) * 100),
        color: slice.color,
        pathData: d,
      };
    });

    const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
${paths.map((p) => `  <path d="${p.pathData}" fill="${p.color}" />`).join("\n")}
</svg>`;

    const react = `// Pure React SVG Pie/Donut Chart Component
export function DonutChart() {
  return (
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
${paths.map((p) => `      <path d="${p.pathData}" fill="${p.color}" className="transition-opacity hover:opacity-80" />`).join("\n")}
    </svg>
  );
}`;

    return {
      slicePaths: paths,
      totalValue: total,
      fullSvgCode: svg,
      reactComponentCode: react,
    };
  }, [slices, innerRadius, outerRadius]);

  const updateSliceValue = (index: number, val: number) => {
    const updated = [...slices];
    updated[index].value = Math.max(1, val);
    setSlices(updated);
  };

  const handleCopy = async (key: string, val: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const size = outerRadius * 2 + 40;

  return (
    <div className="space-y-6">
      {/* Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Chart Style (Inner Hole Radius)</span>
            <span className="font-mono">{innerRadius === 0 ? "Pie Chart (0px)" : `Donut Chart (${innerRadius}px)`}</span>
          </div>
          <input
            type="range"
            min={0}
            max={65}
            value={innerRadius}
            onChange={(e) => setInnerRadius(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Outer Radius</span>
            <span className="font-mono">{outerRadius}px</span>
          </div>
          <input
            type="range"
            min={50}
            max={110}
            value={outerRadius}
            onChange={(e) => setOuterRadius(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>
      </div>

      {/* Slices Values */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
          Chart Slices Data &amp; Colors
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {slices.map((slice, idx) => (
            <div key={idx} className="p-3 bg-muted/40 rounded-xl space-y-1.5 border border-border">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }} />
                <span className="text-xs font-bold text-foreground truncate">{slice.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={slice.value}
                  onChange={(e) => updateSliceValue(idx, parseFloat(e.target.value) || 1)}
                  className="w-full px-2 py-1 text-xs font-mono font-bold bg-background border border-border rounded-lg text-foreground"
                />
                <span className="text-xs font-mono text-muted-foreground">
                  {Math.round((slice.value / totalValue) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Interactive Preview */}
      <div className="p-8 bg-slate-950 border border-border rounded-2xl flex flex-col sm:flex-row items-center justify-center gap-8">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-lg">
          {slicePaths.map((p, idx) => (
            <path
              key={idx}
              d={p.pathData}
              fill={p.color}
              className="transition-all duration-300 hover:opacity-85 hover:scale-[1.02] origin-center cursor-pointer"
            >
              <title>{`${p.label}: ${p.value} (${p.pct}%)`}</title>
            </path>
          ))}
        </svg>

        {/* Legend */}
        <div className="space-y-2 font-mono text-xs">
          {slicePaths.map((p, idx) => (
            <div key={idx} className="flex items-center gap-2 text-slate-300">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
              <span className="font-semibold">{p.label}:</span>
              <span className="text-slate-400">
                {p.value} ({p.pct}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Code Snippets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-foreground">React JSX Component</span>
            <button
              onClick={() => handleCopy("react", reactComponentCode)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "react" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "react" ? "Copied!" : "Copy React"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 rounded-lg text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all max-h-[300px]">
            {reactComponentCode}
          </pre>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-foreground">Pure SVG Markup</span>
            <button
              onClick={() => handleCopy("svg", fullSvgCode)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "svg" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "svg" ? "Copied!" : "Copy SVG"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 rounded-lg text-blue-600 dark:text-blue-400 overflow-x-auto select-all max-h-[300px]">
            {fullSvgCode}
          </pre>
        </div>
      </div>
    </div>
  );
}
