"use client";

import { useState, useMemo } from "react";
import { Sparkles, Copy, Check, Sliders, Shield, Star, Heart } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

type SvgShape = "shield" | "star" | "heart";

export function SvgDropShadowGenerator() {
  const [dx, setDx] = useState<number>(4);
  const [dy, setDy] = useState<number>(8);
  const [blur, setBlur] = useState<number>(6);
  const [shadowColor, setShadowColor] = useState<string>("#0f172a");
  const [shadowOpacity, setShadowOpacity] = useState<number>(40);
  const [fillColor, setFillColor] = useState<string>("#3b82f6");
  const [shape, setShape] = useState<SvgShape>("shield");
  const [copied, setCopied] = useState<boolean>(false);

  const { filterId, filterXml, completeSvgCode } = useMemo(() => {
    const id = "svg-drop-shadow";
    const opacityDec = (shadowOpacity / 100).toFixed(2);

    const filterTag = `<filter id="${id}" x="-30%" y="-30%" width="160%" height="160%">
  <feDropShadow dx="${dx}" dy="${dy}" stdDeviation="${blur}" flood-color="${shadowColor}" flood-opacity="${opacityDec}" />
</filter>`;

    let pathD = "";
    if (shape === "shield") {
      pathD = "M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z";
    } else if (shape === "star") {
      pathD = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";
    } else {
      pathD = "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";
    }

    const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="120" height="120">
  <defs>
    ${filterTag}
  </defs>
  <path
    d="${pathD}"
    fill="${fillColor}"
    filter="url(#${id})"
  />
</svg>`;

    return {
      filterId: id,
      filterXml: filterTag,
      completeSvgCode: fullSvg,
    };
  }, [dx, dy, blur, shadowColor, shadowOpacity, fillColor, shape]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(completeSvgCode);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Shape Selector */}
      <div className="flex gap-2">
        {(["shield", "star", "heart"] as SvgShape[]).map((s) => (
          <button
            key={s}
            onClick={() => setShape(s)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border capitalize transition-colors ${
              shape === s ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>X Offset (dx)</span>
            <span className="font-mono">{dx}px</span>
          </div>
          <input
            type="range"
            min={-20}
            max={20}
            value={dx}
            onChange={(e) => setDx(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Y Offset (dy)</span>
            <span className="font-mono">{dy}px</span>
          </div>
          <input
            type="range"
            min={-20}
            max={30}
            value={dy}
            onChange={(e) => setDy(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Blur (stdDev)</span>
            <span className="font-mono">{blur}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={25}
            value={blur}
            onChange={(e) => setBlur(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Opacity</span>
            <span className="font-mono">{shadowOpacity}%</span>
          </div>
          <input
            type="range"
            min={5}
            max={100}
            value={shadowOpacity}
            onChange={(e) => setShadowOpacity(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>
      </div>

      {/* Color Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            SVG Element Fill Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={fillColor}
              onChange={(e) => setFillColor(e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
            <input
              type="text"
              value={fillColor}
              onChange={(e) => setFillColor(e.target.value)}
              className="w-full px-2 py-1 font-mono text-xs bg-background border border-border rounded-lg"
            />
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Shadow Flood Color
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

      {/* Live Canvas Preview */}
      <div className="p-12 bg-muted/30 border border-border rounded-2xl flex items-center justify-center min-h-[220px]">
        <div dangerouslySetInnerHTML={{ __html: completeSvgCode }} />
      </div>

      {/* Generated SVG Code */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            SVG Filter Definition &amp; Vector Element
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy SVG"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {completeSvgCode}
        </pre>
      </div>
    </div>
  );
}
