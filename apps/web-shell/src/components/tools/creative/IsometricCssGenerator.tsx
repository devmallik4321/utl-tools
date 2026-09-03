"use client";

import { useState, useMemo } from "react";
import { Box, Copy, Check, Sparkles, Sliders, Layers } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

type IsoPreset = "isometric-top" | "isometric-left" | "isometric-right";

export function IsometricCssGenerator() {
  const [preset, setPreset] = useState<IsoPreset>("isometric-top");
  const [depth, setDepth] = useState<number>(12);
  const [textColor, setTextColor] = useState<string>("#3b82f6");
  const [shadowColor, setShadowColor] = useState<string>("#1d4ed8");
  const [demoText, setDemoText] = useState<string>("UTL.TOOLS");
  const [copied, setCopied] = useState<boolean>(false);

  const { transformRule, textShadowRule, fullCss } = useMemo(() => {
    let transform = "rotateX(60deg) rotateY(0deg) rotateZ(-45deg)";
    if (preset === "isometric-left") {
      transform = "rotateY(45deg) rotateX(-20deg) skewY(-10deg)";
    } else if (preset === "isometric-right") {
      transform = "rotateY(-45deg) rotateX(-20deg) skewY(10deg)";
    }

    // Build multi-layered extruded text shadow
    const shadows: string[] = [];
    for (let i = 1; i <= depth; i++) {
      shadows.push(`${i}px ${i}px 0px ${shadowColor}`);
    }
    // Ambient drop shadow
    shadows.push(`${depth + 4}px ${depth + 4}px 14px rgba(0, 0, 0, 0.3)`);
    const shadowStr = shadows.join(", ");

    const css = `/* Pure CSS Isometric 3D Projection */\n.isometric-container {\n  perspective: 1000px;\n}\n\n.isometric-text {\n  transform: ${transform};\n  color: ${textColor};\n  text-shadow: ${shadowStr};\n  transform-style: preserve-3d;\n  transition: transform 0.3s ease;\n}`;

    return {
      transformRule: transform,
      textShadowRule: shadowStr,
      fullCss: css,
    };
  }, [preset, depth, textColor, shadowColor]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(fullCss);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Preset Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {(["isometric-top", "isometric-left", "isometric-right"] as IsoPreset[]).map((p) => (
          <button
            key={p}
            onClick={() => setPreset(p)}
            className={`px-3 py-2 text-xs font-bold rounded-xl border capitalize transition-colors ${
              preset === p ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            {p.replace("-", " ")}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Demo Text
          </label>
          <input
            type="text"
            value={demoText}
            onChange={(e) => setDemoText(e.target.value)}
            className="w-full px-3 py-2 text-sm font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Extrusion Depth: {depth}px
          </label>
          <input
            type="range"
            min={2}
            max={30}
            value={depth}
            onChange={(e) => setDepth(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Face Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
            <input
              type="text"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-full px-2 py-1 font-mono text-xs bg-background border border-border rounded-lg"
            />
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Extrusion Shadow
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={shadowColor}
              onChange={(e) => setShadowColor(e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
            <input
              type="text"
              value={shadowColor}
              onChange={(e) => setShadowColor(e.target.value)}
              className="w-full px-2 py-1 font-mono text-xs bg-background border border-border rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Live 3D Preview Canvas */}
      <div className="p-12 bg-muted/40 border border-border rounded-2xl flex items-center justify-center min-h-[260px] overflow-hidden">
        <div style={{ perspective: "1000px" }}>
          <div
            style={{
              transform: transformRule,
              color: textColor,
              textShadow: textShadowRule,
              transformStyle: "preserve-3d",
            }}
            className="text-4xl sm:text-6xl font-black uppercase tracking-wider select-none font-sans"
          >
            {demoText}
          </div>
        </div>
      </div>

      {/* Generated CSS */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Box className="w-4 h-4 text-emerald-500" />
            CSS Isometric 3D Transform Rules
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
          {fullCss}
        </pre>
      </div>
    </div>
  );
}
