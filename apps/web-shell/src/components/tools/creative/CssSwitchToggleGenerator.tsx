"use client";

import { useState, useMemo } from "react";
import { Sparkles, Copy, Check, Sliders, ToggleLeft, ToggleRight, FileCode, Layers } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function CssSwitchToggleGenerator() {
  const [switchWidth, setSwitchWidth] = useState<number>(56); // px
  const [switchHeight, setSwitchHeight] = useState<number>(30); // px
  const [activeColor, setActiveColor] = useState<string>("#3b82f6");
  const [inactiveColor, setInactiveColor] = useState<string>("#334155");
  const [knobColor, setKnobColor] = useState<string>("#ffffff");
  const [durationSec, setDurationSec] = useState<number>(0.25);
  const [interactiveChecked, setInteractiveChecked] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const { fullCss, fullHtml } = useMemo(() => {
    const knobSize = switchHeight - 6;
    const travelDistance = switchWidth - knobSize - 6;

    const css = `/* Accessible Pure CSS Toggle Switch (Zero JavaScript) */
.switch-label {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

/* Visually hidden native checkbox with accessibility preserved */
.switch-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

/* Switch Pill Track */
.switch-track {
  width: ${switchWidth}px;
  height: ${switchHeight}px;
  background-color: ${inactiveColor};
  border-radius: 9999px;
  position: relative;
  transition: background-color ${durationSec}s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Switch Sliding Knob */
.switch-track::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  width: ${knobSize}px;
  height: ${knobSize}px;
  background-color: ${knobColor};
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
  transition: transform ${durationSec}s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Checked State */
.switch-input:checked + .switch-track {
  background-color: ${activeColor};
}

.switch-input:checked + .switch-track::after {
  transform: translateX(${travelDistance}px);
}

/* Keyboard Focus Ring (WCAG Accessibility) */
.switch-input:focus-visible + .switch-track {
  outline: 2px solid ${activeColor};
  outline-offset: 3px;
}`;

    const html = `<label class="switch-label">
  <input type="checkbox" class="switch-input" checked />
  <span class="switch-track" aria-hidden="true"></span>
</label>`;

    return { fullCss: css, fullHtml: html };
  }, [switchWidth, switchHeight, activeColor, inactiveColor, knobColor, durationSec]);

  const handleCopy = async () => {
    const combined = `${fullHtml}\n\n<style>\n${fullCss}\n</style>`;
    const ok = await copyToClipboard(combined);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const knobSize = switchHeight - 6;
  const travelDistance = switchWidth - knobSize - 6;

  return (
    <div className="space-y-6">
      {/* Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Switch Width</span>
            <span className="font-mono">{switchWidth}px</span>
          </div>
          <input
            type="range"
            min={40}
            max={90}
            value={switchWidth}
            onChange={(e) => setSwitchWidth(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Switch Height</span>
            <span className="font-mono">{switchHeight}px</span>
          </div>
          <input
            type="range"
            min={22}
            max={50}
            value={switchHeight}
            onChange={(e) => setSwitchHeight(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Transition Duration</span>
            <span className="font-mono">{durationSec}s</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={0.6}
            step={0.05}
            value={durationSec}
            onChange={(e) => setDurationSec(parseFloat(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Active Track Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={activeColor}
              onChange={(e) => setActiveColor(e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
            <input
              type="text"
              value={activeColor}
              onChange={(e) => setActiveColor(e.target.value)}
              className="w-full px-2 py-1 font-mono text-xs bg-background border border-border rounded-lg"
            />
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Inactive Track Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={inactiveColor}
              onChange={(e) => setInactiveColor(e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
            <input
              type="text"
              value={inactiveColor}
              onChange={(e) => setInactiveColor(e.target.value)}
              className="w-full px-2 py-1 font-mono text-xs bg-background border border-border rounded-lg"
            />
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Knob Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={knobColor}
              onChange={(e) => setKnobColor(e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
            <input
              type="text"
              value={knobColor}
              onChange={(e) => setKnobColor(e.target.value)}
              className="w-full px-2 py-1 font-mono text-xs bg-background border border-border rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Live Interactive Preview */}
      <div className="p-8 bg-slate-950 border border-border rounded-2xl flex flex-col items-center justify-center space-y-4">
        <span className="text-xs text-slate-400 font-mono">
          Interactive Live Preview (Click or press Spacebar to toggle)
        </span>

        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-slate-300">Off</span>

          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={interactiveChecked}
              onChange={(e) => setInteractiveChecked(e.target.checked)}
              className="sr-only peer"
            />
            <div
              style={{
                width: `${switchWidth}px`,
                height: `${switchHeight}px`,
                backgroundColor: interactiveChecked ? activeColor : inactiveColor,
                transition: `background-color ${durationSec}s ease`,
              }}
              className="rounded-full relative p-[3px] peer-focus-visible:ring-2 peer-focus-visible:ring-blue-400 peer-focus-visible:ring-offset-2"
            >
              <div
                style={{
                  width: `${knobSize}px`,
                  height: `${knobSize}px`,
                  backgroundColor: knobColor,
                  transform: interactiveChecked ? `translateX(${travelDistance}px)` : "translateX(0px)",
                  transition: `transform ${durationSec}s cubic-bezier(0.34, 1.56, 0.64, 1)`,
                }}
                className="rounded-full shadow-md"
              />
            </div>
          </label>

          <span className="text-sm font-semibold text-slate-300">On</span>
        </div>
      </div>

      {/* Code Snippets */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between font-sans">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-emerald-500" />
            Pure CSS &amp; Accessible HTML Markup
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
