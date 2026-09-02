"use client";

import { useState, useMemo } from "react";
import { Shapes, Copy, Check, Sparkles, MoveUp, MoveRight, MoveDown, MoveLeft } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

type Direction = "up" | "right" | "down" | "left" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

export function CssTriangleGenerator() {
  const [direction, setDirection] = useState<Direction>("up");
  const [width, setWidth] = useState<number>(30);
  const [height, setHeight] = useState<number>(30);
  const [color, setColor] = useState<string>("#3b82f6");
  const [copied, setCopied] = useState<boolean>(false);

  const { borderStyle, cssCode } = useMemo(() => {
    let borderWidth = "";
    let borderColor = "";

    const halfW = width / 2;
    const halfH = height / 2;

    switch (direction) {
      case "up":
        borderWidth = `0 ${halfW}px ${height}px ${halfW}px`;
        borderColor = `transparent transparent ${color} transparent`;
        break;
      case "down":
        borderWidth = `${height}px ${halfW}px 0 ${halfW}px`;
        borderColor = `${color} transparent transparent transparent`;
        break;
      case "left":
        borderWidth = `${halfH}px ${width}px ${halfH}px 0`;
        borderColor = `transparent ${color} transparent transparent`;
        break;
      case "right":
        borderWidth = `${halfH}px 0 ${halfH}px ${width}px`;
        borderColor = `transparent transparent transparent ${color}`;
        break;
      case "top-left":
        borderWidth = `${height}px ${width}px 0 0`;
        borderColor = `${color} transparent transparent transparent`;
        break;
      case "top-right":
        borderWidth = `0 ${width}px ${height}px 0`;
        borderColor = `transparent ${color} transparent transparent`;
        break;
      case "bottom-left":
        borderWidth = `${height}px 0 0 ${width}px`;
        borderColor = `transparent transparent transparent ${color}`;
        break;
      case "bottom-right":
        borderWidth = `0 0 ${height}px ${width}px`;
        borderColor = `transparent transparent ${color} transparent`;
        break;
    }

    const code = `.triangle {\n  width: 0;\n  height: 0;\n  border-style: solid;\n  border-width: ${borderWidth};\n  border-color: ${borderColor};\n}`;

    return {
      borderStyle: {
        width: 0,
        height: 0,
        borderStyle: "solid",
        borderWidth,
        borderColor,
      },
      cssCode: code,
    };
  }, [direction, width, height, color]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(cssCode);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual Canvas */}
      <div className="p-8 bg-muted/30 border border-border rounded-2xl flex items-center justify-center min-h-[180px]">
        <div style={borderStyle as any} />
      </div>

      {/* Direction Controls */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Triangle Orientation Direction
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { dir: "up", label: "Top / Up" },
            { dir: "right", label: "Right" },
            { dir: "down", label: "Bottom / Down" },
            { dir: "left", label: "Left" },
            { dir: "top-left", label: "Top-Left" },
            { dir: "top-right", label: "Top-Right" },
            { dir: "bottom-left", label: "Bottom-Left" },
            { dir: "bottom-right", label: "Bottom-Right" },
          ].map((d) => (
            <button
              key={d.dir}
              onClick={() => setDirection(d.dir as any)}
              className={`py-2 px-1 text-xs font-bold rounded-lg border text-center transition-colors ${
                direction === d.dir
                  ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                  : "bg-background border-border text-foreground hover:bg-muted"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dimensions & Color */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-foreground uppercase">Width</span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{width}px</span>
          </div>
          <input
            type="range"
            min={10}
            max={120}
            value={width}
            onChange={(e) => setWidth(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-foreground uppercase">Height</span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{height}px</span>
          </div>
          <input
            type="range"
            min={10}
            max={120}
            value={height}
            onChange={(e) => setHeight(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Triangle Fill Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer shrink-0"
            />
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full px-3 py-1.5 font-mono text-xs bg-background border border-border rounded-lg text-foreground"
            />
          </div>
        </div>
      </div>

      {/* CSS Code Output */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Shapes className="w-4 h-4 text-emerald-500" />
            Pure CSS Triangle Code Snippet
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
