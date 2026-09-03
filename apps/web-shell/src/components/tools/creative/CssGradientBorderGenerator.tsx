"use client";

import { useState, useMemo } from "react";
import { Sparkles, Copy, Check, Sliders, Palette, Layers, FileCode } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function CssGradientBorderGenerator() {
  const [color1, setColor1] = useState<string>("#3b82f6");
  const [color2, setColor2] = useState<string>("#ec4899");
  const [color3, setColor3] = useState<string>("#8b5cf6");
  const [borderWidth, setBorderWidth] = useState<number>(2); // px
  const [borderRadius, setBorderRadius] = useState<number>(16); // px
  const [speedSec, setSpeedSec] = useState<number>(4); // seconds
  const [glowBlur, setGlowBlur] = useState<number>(12); // px
  const [copied, setCopied] = useState<boolean>(false);

  const { fullCss, htmlSnippet } = useMemo(() => {
    const css = `/* Pure CSS Modern Animated Rotating Gradient Border */
@property --angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

.gradient-border-card {
  position: relative;
  background: #0f172a;
  border-radius: ${borderRadius}px;
  padding: 2rem;
  color: #f8fafc;
}

.gradient-border-card::before,
.gradient-border-card::after {
  content: "";
  position: absolute;
  inset: -${borderWidth}px;
  border-radius: inherit;
  background: conic-gradient(
    from var(--angle),
    ${color1},
    ${color2},
    ${color3},
    ${color1}
  );
  z-index: -1;
  animation: rotateBorder ${speedSec}s linear infinite;
}

.gradient-border-card::after {
  filter: blur(${glowBlur}px);
  opacity: 0.7;
}

@keyframes rotateBorder {
  to {
    --angle: 360deg;
  }
}`;

    const html = `<div class="gradient-border-card">
  <h3>Interactive Gradient Border</h3>
  <p>Modern card border with glowing ambient blur and animated conic gradient.</p>
</div>`;

    return { fullCss: css, htmlSnippet: html };
  }, [color1, color2, color3, borderWidth, borderRadius, speedSec, glowBlur]);

  const handleCopy = async () => {
    const combined = `${htmlSnippet}\n\n<style>\n${fullCss}\n</style>`;
    const ok = await copyToClipboard(combined);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Gradient Color 1
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color1}
              onChange={(e) => setColor1(e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
            <input
              type="text"
              value={color1}
              onChange={(e) => setColor1(e.target.value)}
              className="w-full px-2 py-1 font-mono text-xs bg-background border border-border rounded-lg"
            />
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Gradient Color 2
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color2}
              onChange={(e) => setColor2(e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
            <input
              type="text"
              value={color2}
              onChange={(e) => setColor2(e.target.value)}
              className="w-full px-2 py-1 font-mono text-xs bg-background border border-border rounded-lg"
            />
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Gradient Color 3
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color3}
              onChange={(e) => setColor3(e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
            <input
              type="text"
              value={color3}
              onChange={(e) => setColor3(e.target.value)}
              className="w-full px-2 py-1 font-mono text-xs bg-background border border-border rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Border Width</span>
            <span className="font-mono">{borderWidth}px</span>
          </div>
          <input
            type="range"
            min={1}
            max={8}
            value={borderWidth}
            onChange={(e) => setBorderWidth(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Border Radius</span>
            <span className="font-mono">{borderRadius}px</span>
          </div>
          <input
            type="range"
            min={4}
            max={32}
            value={borderRadius}
            onChange={(e) => setBorderRadius(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Speed (Loop)</span>
            <span className="font-mono">{speedSec}s</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={speedSec}
            onChange={(e) => setSpeedSec(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Ambient Glow</span>
            <span className="font-mono">{glowBlur}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={25}
            value={glowBlur}
            onChange={(e) => setGlowBlur(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>
      </div>

      {/* Live Preview Box */}
      <div className="p-12 bg-slate-950 border border-border rounded-2xl flex items-center justify-center min-h-[220px]">
        <div
          style={{
            borderRadius: `${borderRadius}px`,
            padding: `${borderWidth}px`,
            background: `conic-gradient(from 45deg, ${color1}, ${color2}, ${color3}, ${color1})`,
            boxShadow: `0 0 ${glowBlur}px ${color2}80`,
          }}
          className="relative transition-all duration-300 max-w-sm w-full"
        >
          <div
            style={{ borderRadius: `${Math.max(2, borderRadius - borderWidth)}px` }}
            className="p-6 bg-slate-900 text-slate-100 space-y-2 select-none"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
              <h5 className="font-bold text-sm tracking-wide">Vercel / Stripe Style Card</h5>
            </div>
            <p className="text-xs text-slate-400">
              Modern CSS rotating gradient border with customizable glow, border radius, and animation timing.
            </p>
          </div>
        </div>
      </div>

      {/* Generated CSS */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-emerald-500" />
            CSS @property &amp; Conic Gradient Snippet
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied CSS!" : "Copy Snippet"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {fullCss}
        </pre>
      </div>
    </div>
  );
}
