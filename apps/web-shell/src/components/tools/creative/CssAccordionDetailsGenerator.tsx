"use client";

import { useState, useMemo } from "react";
import { Sparkles, Copy, Check, Sliders, ChevronDown, FileCode, Layers } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function CssAccordionDetailsGenerator() {
  const [durationSec, setDurationSec] = useState<number>(0.3);
  const [borderRadius, setBorderRadius] = useState<number>(12); // px
  const [accentColor, setAccentColor] = useState<string>("#3b82f6");
  const [copied, setCopied] = useState<boolean>(false);

  const { fullCss, fullHtml } = useMemo(() => {
    const css = `/* Pure CSS Animated <details> Accordion (Zero JavaScript) */
/* Uses modern CSS Grid grid-template-rows: 0fr -> 1fr interpolation */

.css-accordion {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 600px;
}

.css-accordion-item {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: ${borderRadius}px;
  background-color: #0f172a;
  overflow: hidden;
  transition: border-color ${durationSec}s ease;
}

.css-accordion-item[open] {
  border-color: ${accentColor};
}

.css-accordion-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  cursor: pointer;
  font-weight: 600;
  color: #f8fafc;
  list-style: none; /* Hide default browser arrow */
  user-select: none;
}

.css-accordion-summary::-webkit-details-marker {
  display: none;
}

.css-accordion-icon {
  width: 1rem;
  height: 1rem;
  transition: transform ${durationSec}s ease;
}

.css-accordion-item[open] .css-accordion-icon {
  transform: rotate(180deg);
  color: ${accentColor};
}

/* CSS Grid Height Animation Trick */
.css-accordion-content-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows ${durationSec}s cubic-bezier(0.4, 0, 0.2, 1);
}

.css-accordion-item[open] .css-accordion-content-wrapper {
  grid-template-rows: 1fr;
}

.css-accordion-inner {
  min-height: 0;
  overflow: hidden;
  padding: 0 1.25rem;
  color: #94a3b8;
  font-size: 0.875rem;
  line-height: 1.5;
}

.css-accordion-item[open] .css-accordion-inner {
  padding-bottom: 1.25rem;
}`;

    const html = `<div class="css-accordion">
  <details class="css-accordion-item" open>
    <summary class="css-accordion-summary">
      <span>What is the pure CSS grid animation technique?</span>
      <svg class="css-accordion-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </summary>
    <div class="css-accordion-content-wrapper">
      <div class="css-accordion-inner">
        By transitioning <code>grid-template-rows: 0fr</code> to <code>1fr</code>, browsers can smoothly interpolate the height of dynamic content without fixed pixel heights or JavaScript!
      </div>
    </div>
  </details>

  <details class="css-accordion-item">
    <summary class="css-accordion-summary">
      <span>Do I need any JavaScript listeners?</span>
      <svg class="css-accordion-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </summary>
    <div class="css-accordion-content-wrapper">
      <div class="css-accordion-inner">
        Zero JavaScript required! Native browser keyboard navigation, accessibility, and ARIA roles are automatically preserved by the HTML5 <code>&lt;details&gt;</code> element.
      </div>
    </div>
  </details>
</div>`;

    return { fullCss: css, fullHtml: html };
  }, [durationSec, borderRadius, accentColor]);

  const handleCopy = async () => {
    const combined = `${fullHtml}\n\n<style>\n${fullCss}\n</style>`;
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
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Transition Duration</span>
            <span className="font-mono">{durationSec}s</span>
          </div>
          <input
            type="range"
            min={0.15}
            max={0.8}
            step={0.05}
            value={durationSec}
            onChange={(e) => setDurationSec(parseFloat(e.target.value))}
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
            max={24}
            value={borderRadius}
            onChange={(e) => setBorderRadius(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Active Accent Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
            <input
              type="text"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-full px-2 py-1 font-mono text-xs bg-background border border-border rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Interactive Live Preview */}
      <div className="p-8 bg-slate-950 border border-border rounded-2xl flex flex-col items-center justify-center space-y-3">
        <span className="text-xs text-slate-400 font-mono">Live Interactive Preview (Click items to toggle)</span>

        <div className="w-full max-w-lg space-y-3">
          <details
            style={{ borderRadius: `${borderRadius}px` }}
            className="group border border-white/15 bg-slate-900 overflow-hidden open:border-blue-500 transition-colors"
          >
            <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-sm text-slate-100 list-none select-none">
              <span>What is the pure CSS grid animation technique?</span>
              <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-300 group-open:rotate-180 group-open:text-blue-400" />
            </summary>
            <div className="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-300">
              <div className="min-h-0 overflow-hidden px-4 pb-4 text-xs text-slate-400 leading-relaxed">
                By transitioning <code className="text-blue-400">grid-template-rows: 0fr</code> to <code className="text-blue-400">1fr</code>, browsers can smoothly interpolate the height of dynamic content without fixed pixel heights or JavaScript!
              </div>
            </div>
          </details>

          <details
            style={{ borderRadius: `${borderRadius}px` }}
            className="group border border-white/15 bg-slate-900 overflow-hidden open:border-blue-500 transition-colors"
          >
            <summary className="flex items-center justify-between p-4 cursor-pointer font-semibold text-sm text-slate-100 list-none select-none">
              <span>Do I need any JavaScript listeners?</span>
              <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-300 group-open:rotate-180 group-open:text-blue-400" />
            </summary>
            <div className="grid grid-rows-[0fr] group-open:grid-rows-[1fr] transition-[grid-template-rows] duration-300">
              <div className="min-h-0 overflow-hidden px-4 pb-4 text-xs text-slate-400 leading-relaxed">
                Zero JavaScript required! Native browser keyboard navigation, accessibility, and ARIA roles are automatically preserved by the standard HTML5 <code className="text-blue-400">&lt;details&gt;</code> element.
              </div>
            </div>
          </details>
        </div>
      </div>

      {/* Code Snippets */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between font-sans">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-emerald-500" />
            Pure CSS &amp; HTML5 Code Export
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
          {`${fullHtml}\n\n<style>\n${fullCss}\n</style>`}
        </pre>
      </div>
    </div>
  );
}
