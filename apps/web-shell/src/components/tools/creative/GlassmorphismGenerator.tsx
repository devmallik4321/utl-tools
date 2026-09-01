"use client";

import { useState } from "react";
import { Sparkles, Copy, Check, Sliders, Layers, Eye } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function GlassmorphismGenerator() {
  const [blur, setBlur] = useState<number>(16);
  const [opacity, setOpacity] = useState<number>(25); // 25%
  const [borderOpacity, setBorderOpacity] = useState<number>(30); // 30%
  const [borderRadius, setBorderRadius] = useState<number>(16);
  const [tintColor, setTintColor] = useState<string>("white"); // white, black, blue, purple
  const [activeTab, setActiveTab] = useState<"css" | "tailwind">("css");
  const [copied, setCopied] = useState<boolean>(false);

  const getRgb = () => {
    if (tintColor === "black") return "0, 0, 0";
    if (tintColor === "blue") return "59, 130, 246";
    if (tintColor === "purple") return "147, 51, 234";
    return "255, 255, 255";
  };

  const rgb = getRgb();
  const bgAlpha = (opacity / 100).toFixed(2);
  const borderAlpha = (borderOpacity / 100).toFixed(2);

  const cssCode = `/* Glassmorphism CSS */
background: rgba(${rgb}, ${bgAlpha});
backdrop-filter: blur(${blur}px);
-webkit-backdrop-filter: blur(${blur}px);
border-radius: ${borderRadius}px;
border: 1px solid rgba(${rgb}, ${borderAlpha});
box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);`;

  const tailwindCode = `<!-- Tailwind CSS Classes -->
<div className="bg-[rgba(${rgb},${bgAlpha})] backdrop-blur-[${blur}px] rounded-[${borderRadius}px] border border-[rgba(${rgb},${borderAlpha})] shadow-xl p-6">
  <!-- Your Content -->
</div>`;

  const handleCopy = async () => {
    const code = activeTab === "css" ? cssCode : tailwindCode;
    const ok = await copyToClipboard(code);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls and Live Preview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Sliders Panel */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-4">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
            Glass Properties
          </span>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Blur Radius</span>
                <span className="font-mono font-bold">{blur}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                value={blur}
                onChange={(e) => setBlur(parseInt(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Background Opacity</span>
                <span className="font-mono font-bold">{opacity}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={90}
                value={opacity}
                onChange={(e) => setOpacity(parseInt(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Border Edge Opacity</span>
                <span className="font-mono font-bold">{borderOpacity}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={80}
                value={borderOpacity}
                onChange={(e) => setBorderOpacity(parseInt(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Border Radius</span>
                <span className="font-mono font-bold">{borderRadius}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                value={borderRadius}
                onChange={(e) => setBorderRadius(parseInt(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1">Glass Tint Color</label>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {[
                  { id: "white", name: "Frost White" },
                  { id: "black", name: "Dark Smoke" },
                  { id: "blue", name: "Cyan Glow" },
                  { id: "purple", name: "Neon Violet" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTintColor(t.id)}
                    className={`py-1.5 px-2 rounded-lg font-semibold border transition-colors ${
                      tintColor === t.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                        : "bg-background border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Graphic Preview Canvas */}
        <div className="relative h-80 rounded-2xl overflow-hidden flex items-center justify-center p-6 bg-gradient-to-tr from-pink-500 via-indigo-600 to-cyan-400 shadow-inner">
          {/* Background Decorative Shapes */}
          <div className="absolute -top-6 -left-6 w-32 h-32 bg-yellow-300 rounded-full blur-xs opacity-80" />
          <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-purple-500 rounded-full blur-xs opacity-80" />

          {/* Frosted Glass Card */}
          <div
            style={{
              background: `rgba(${rgb}, ${bgAlpha})`,
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
              borderRadius: `${borderRadius}px`,
              border: `1px solid rgba(${rgb}, ${borderAlpha})`,
              boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
            }}
            className="relative z-10 w-full max-w-xs p-5 space-y-3 text-white transition-all duration-150 select-none"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold tracking-widest uppercase opacity-90">Glassmorphism Card</span>
              <Sparkles className="w-4 h-4 text-yellow-200" />
            </div>
            <p className="text-sm font-medium leading-snug drop-shadow-xs">
              Modern translucent UI with dynamic background refraction &amp; frosted specular edges.
            </p>
            <div className="pt-2 flex justify-between items-center text-[10px] opacity-75 font-mono border-t border-white/20">
              <span>blur({blur}px)</span>
              <span>opacity({opacity}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Code Output Pane */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("css")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                activeTab === "css" ? "bg-card border border-border text-foreground shadow-2xs" : "text-muted-foreground"
              }`}
            >
              Vanilla CSS
            </button>
            <button
              onClick={() => setActiveTab("tailwind")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                activeTab === "tailwind" ? "bg-card border border-border text-foreground shadow-2xs" : "text-muted-foreground"
              }`}
            >
              Tailwind CSS
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Code"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {activeTab === "css" ? cssCode : tailwindCode}
        </pre>
      </div>
    </div>
  );
}
