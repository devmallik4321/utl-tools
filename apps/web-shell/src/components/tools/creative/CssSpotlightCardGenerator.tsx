"use client";

import { useState, useRef, useMemo } from "react";
import { Sparkles, Copy, Check, Sliders, Palette, MousePointer, FileCode } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function CssSpotlightCardGenerator() {
  const [spotlightColor, setSpotlightColor] = useState<string>("#3b82f6");
  const [spotlightRadius, setSpotlightRadius] = useState<number>(300); // px
  const [spotlightOpacity, setSpotlightOpacity] = useState<number>(0.2);
  const [cardBg, setCardBg] = useState<string>("#0f172a");
  const [borderRadius, setBorderRadius] = useState<number>(16); // px
  const [copied, setCopied] = useState<boolean>(false);

  // Live mouse tracking for preview
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 150, y: 100 });
  const [isHovered, setIsHovered] = useState<boolean>(true);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const { fullCss, jsSnippet, htmlSnippet } = useMemo(() => {
    const css = `/* Pure CSS & Vanilla JS Spotlight Card Effect (Linear / Raycast Style) */
.spotlight-card {
  position: relative;
  background-color: ${cardBg};
  border-radius: ${borderRadius}px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  padding: 2rem;
  color: #f8fafc;
}

/* Mouse-following illumination overlay */
.spotlight-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  background: radial-gradient(
    ${spotlightRadius}px circle at var(--mouse-x, 0px) var(--mouse-y, 0px),
    ${spotlightColor},
    transparent 80%
  );
  z-index: 1;
}

.spotlight-card:hover::before {
  opacity: ${spotlightOpacity};
}`;

    const js = `// Attach mouse-move listener to update CSS custom properties
document.querySelectorAll('.spotlight-card').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', \`\${e.clientX - rect.left}px\`);
    card.style.setProperty('--mouse-y', \`\${e.clientY - rect.top}px\`);
  });
});`;

    const html = `<div class="spotlight-card">
  <div style="position: relative; z-index: 2;">
    <h3>Interactive Spotlight Card</h3>
    <p>Move your cursor over this card to see the radial illumination effect.</p>
  </div>
</div>`;

    return { fullCss: css, jsSnippet: js, htmlSnippet: html };
  }, [spotlightColor, spotlightRadius, spotlightOpacity, cardBg, borderRadius]);

  const handleCopy = async () => {
    const combined = `${htmlSnippet}\n\n<style>\n${fullCss}\n</style>\n\n<script>\n${jsSnippet}\n</script>`;
    const ok = await copyToClipboard(combined);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Spotlight Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={spotlightColor}
              onChange={(e) => setSpotlightColor(e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
            <input
              type="text"
              value={spotlightColor}
              onChange={(e) => setSpotlightColor(e.target.value)}
              className="w-full px-2 py-1 font-mono text-xs bg-background border border-border rounded-lg"
            />
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Card Background Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={cardBg}
              onChange={(e) => setCardBg(e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
            <input
              type="text"
              value={cardBg}
              onChange={(e) => setCardBg(e.target.value)}
              className="w-full px-2 py-1 font-mono text-xs bg-background border border-border rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Spotlight Radius</span>
            <span className="font-mono">{spotlightRadius}px</span>
          </div>
          <input
            type="range"
            min={150}
            max={600}
            step={25}
            value={spotlightRadius}
            onChange={(e) => setSpotlightRadius(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Spotlight Opacity</span>
            <span className="font-mono">{Math.round(spotlightOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min={0.05}
            max={0.5}
            step={0.02}
            value={spotlightOpacity}
            onChange={(e) => setSpotlightOpacity(parseFloat(e.target.value))}
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
      </div>

      {/* Interactive Live Preview Box */}
      <div className="p-8 bg-slate-950 border border-border rounded-2xl flex items-center justify-center min-h-[240px]">
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          style={{
            backgroundColor: cardBg,
            borderRadius: `${borderRadius}px`,
          }}
          className="relative max-w-md w-full p-8 border border-white/10 overflow-hidden cursor-crosshair select-none transition-all duration-150"
        >
          {/* Spotlight illumination pseudo-layer */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: `radial-gradient(${spotlightRadius}px circle at ${mousePos.x}px ${mousePos.y}px, ${spotlightColor}, transparent 80%)`,
              opacity: isHovered ? spotlightOpacity : 0,
              transition: "opacity 0.2s ease",
            }}
          />

          <div className="relative z-10 space-y-2 text-slate-100">
            <div className="flex items-center gap-2">
              <MousePointer className="w-4 h-4 text-blue-400" />
              <h5 className="font-bold text-sm tracking-wide">Interactive Spotlight Card</h5>
            </div>
            <p className="text-xs text-slate-400">
              Hover and glide your mouse across this card to experience the radial illumination effect.
            </p>
            <div className="text-[10px] font-mono text-blue-400/80 pt-2">
              X: {mousePos.x}px, Y: {mousePos.y}px
            </div>
          </div>
        </div>
      </div>

      {/* Generated Code Snippet */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-emerald-500" />
            Pure CSS &amp; Vanilla JavaScript Snippet
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied All!" : "Copy Code"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {`${fullCss}\n\n/* Vanilla JS Hook */\n${jsSnippet}`}
        </pre>
      </div>
    </div>
  );
}
