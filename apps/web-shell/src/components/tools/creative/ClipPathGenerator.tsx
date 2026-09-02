"use client";

import { useState } from "react";
import { Scissors, Copy, Check, Sparkles, Shapes } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SHAPES: Record<string, { name: string; polygon: string }> = {
  triangle: { name: "Triangle", polygon: "50% 0%, 0% 100%, 100% 100%" },
  trapezoid: { name: "Trapezoid", polygon: "20% 0%, 80% 0%, 100% 100%, 0% 100%" },
  parallelogram: { name: "Parallelogram", polygon: "25% 0%, 100% 0%, 75% 100%, 0% 100%" },
  rhombus: { name: "Rhombus / Diamond", polygon: "50% 0%, 100% 50%, 50% 100%, 0% 50%" },
  chevron: { name: "Chevron Right", polygon: "75% 0%, 100% 50%, 75% 100%, 0% 100%, 25% 50%, 0% 0%" },
  star: { name: "5-Point Star", polygon: "50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%" },
  hexagon: { name: "Hexagon", polygon: "25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%" },
  octagon: { name: "Octagon", polygon: "30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%" },
};

export function ClipPathGenerator() {
  const [selectedShape, setSelectedShape] = useState<string>("triangle");
  const [copied, setCopied] = useState<boolean>(false);

  const current = SHAPES[selectedShape] || SHAPES.triangle;
  const cssCode = `clip-path: polygon(${current.polygon});\n-webkit-clip-path: polygon(${current.polygon});`;

  const handleCopy = async () => {
    const ok = await copyToClipboard(cssCode);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(SHAPES).map(([key, item]) => (
          <button
            key={key}
            onClick={() => setSelectedShape(key)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
              selectedShape === key
                ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* Visual Canvas */}
      <div className="p-10 bg-muted/40 border border-border rounded-2xl flex items-center justify-center min-h-[260px]">
        <div
          style={{ clipPath: `polygon(${current.polygon})` }}
          className="w-52 h-52 bg-gradient-to-tr from-blue-600 via-indigo-600 to-pink-500 shadow-xl flex items-center justify-center text-white font-bold text-sm tracking-wider uppercase drop-shadow-md select-none transition-all duration-300"
        >
          {current.name}
        </div>
      </div>

      {/* CSS Code Snippet */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Scissors className="w-4 h-4 text-emerald-500" />
            CSS `clip-path: polygon(...)` Rule
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
