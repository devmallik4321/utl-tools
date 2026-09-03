"use client";

import { useState, useMemo } from "react";
import { CheckSquare, ToggleLeft, Copy, Check, Sparkles, Sliders } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

type ControlType = "checkbox" | "switch" | "radio";

export function CssCustomCheckboxGenerator() {
  const [controlType, setControlType] = useState<ControlType>("switch");
  const [activeColor, setActiveColor] = useState<string>("#3b82f6");
  const [sizePx, setSizePx] = useState<number>(20);
  const [isChecked, setIsChecked] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const { fullCss, htmlSnippet } = useMemo(() => {
    let css = "";
    let html = "";

    if (controlType === "switch") {
      const switchW = sizePx * 2;
      const switchH = sizePx + 4;
      const knobSize = sizePx;

      css = `/* Pure CSS Accessible iOS-Style Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.toggle-switch input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch .slider {
  width: ${switchW}px;
  height: ${switchH}px;
  background-color: #cbd5e1;
  border-radius: 9999px;
  position: relative;
  transition: background-color 0.25s ease;
}

.toggle-switch .slider::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: ${knobSize}px;
  height: ${knobSize}px;
  background-color: #ffffff;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.25s ease;
}

.toggle-switch input:checked + .slider {
  background-color: ${activeColor};
}

.toggle-switch input:checked + .slider::after {
  transform: translateX(${switchW - knobSize - 4}px);
}

.toggle-switch input:focus-visible + .slider {
  outline: 2px solid ${activeColor};
  outline-offset: 2px;
}`;

      html = `<label class="toggle-switch">
  <input type="checkbox" checked>
  <span class="slider"></span>
  <span style="margin-left: 10px; font-family: sans-serif; font-size: 14px;">Enable Feature</span>
</label>`;
    } else if (controlType === "checkbox") {
      css = `/* Pure CSS Accessible Custom Checkbox */
.custom-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.custom-checkbox input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.custom-checkbox .checkmark {
  width: ${sizePx}px;
  height: ${sizePx}px;
  border: 2px solid #94a3b8;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.custom-checkbox .checkmark::after {
  content: "";
  display: none;
  width: ${Math.round(sizePx * 0.28)}px;
  height: ${Math.round(sizePx * 0.55)}px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  margin-top: -2px;
}

.custom-checkbox input:checked + .checkmark {
  background-color: ${activeColor};
  border-color: ${activeColor};
}

.custom-checkbox input:checked + .checkmark::after {
  display: block;
}

.custom-checkbox input:focus-visible + .checkmark {
  outline: 2px solid ${activeColor};
  outline-offset: 2px;
}`;

      html = `<label class="custom-checkbox">
  <input type="checkbox" checked>
  <span class="checkmark"></span>
  <span style="font-family: sans-serif; font-size: 14px;">I accept the terms</span>
</label>`;
    } else {
      // Radio
      css = `/* Pure CSS Accessible Radio Button */
.custom-radio {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.custom-radio input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.custom-radio .dot {
  width: ${sizePx}px;
  height: ${sizePx}px;
  border: 2px solid #94a3b8;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.custom-radio .dot::after {
  content: "";
  display: none;
  width: ${Math.round(sizePx * 0.5)}px;
  height: ${Math.round(sizePx * 0.5)}px;
  background-color: ${activeColor};
  border-radius: 50%;
}

.custom-radio input:checked + .dot {
  border-color: ${activeColor};
}

.custom-radio input:checked + .dot::after {
  display: block;
}

.custom-radio input:focus-visible + .dot {
  outline: 2px solid ${activeColor};
  outline-offset: 2px;
}`;

      html = `<label class="custom-radio">
  <input type="radio" name="plan" checked>
  <span class="dot"></span>
  <span style="font-family: sans-serif; font-size: 14px;">Standard Subscription</span>
</label>`;
    }

    return { fullCss: css, htmlSnippet: html };
  }, [controlType, activeColor, sizePx]);

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
      {/* Control Type Selector */}
      <div className="grid grid-cols-3 gap-2">
        {(["switch", "checkbox", "radio"] as ControlType[]).map((t) => (
          <button
            key={t}
            onClick={() => setControlType(t)}
            className={`px-3 py-2 text-xs font-bold rounded-xl border capitalize transition-colors ${
              controlType === t ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            {t === "switch" ? "Toggle Switch" : t === "checkbox" ? "Custom Checkbox" : "Radio Button"}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Active Accent Color
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
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Size</span>
            <span className="font-mono">{sizePx}px</span>
          </div>
          <input
            type="range"
            min={16}
            max={32}
            value={sizePx}
            onChange={(e) => setSizePx(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>
      </div>

      {/* Interactive Live Preview Box */}
      <div className="p-10 bg-muted/30 border border-border rounded-2xl flex items-center justify-center min-h-[160px]">
        <label className="inline-flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
            className="sr-only"
          />

          {controlType === "switch" && (
            <div
              style={{
                width: sizePx * 2,
                height: sizePx + 4,
                backgroundColor: isChecked ? activeColor : "#cbd5e1",
              }}
              className="relative rounded-full transition-colors duration-200"
            >
              <div
                style={{
                  width: sizePx,
                  height: sizePx,
                  transform: isChecked ? `translateX(${sizePx - 4}px)` : "translateX(2px)",
                  top: 2,
                }}
                className="absolute bg-white rounded-full shadow-md transition-transform duration-200"
              />
            </div>
          )}

          {controlType === "checkbox" && (
            <div
              style={{
                width: sizePx,
                height: sizePx,
                backgroundColor: isChecked ? activeColor : "transparent",
                borderColor: isChecked ? activeColor : "#94a3b8",
              }}
              className="rounded-md border-2 flex items-center justify-center transition-all duration-150"
            >
              {isChecked && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
            </div>
          )}

          {controlType === "radio" && (
            <div
              style={{
                width: sizePx,
                height: sizePx,
                borderColor: isChecked ? activeColor : "#94a3b8",
              }}
              className="rounded-full border-2 flex items-center justify-center transition-all duration-150"
            >
              {isChecked && (
                <div
                  style={{
                    width: sizePx * 0.5,
                    height: sizePx * 0.5,
                    backgroundColor: activeColor,
                  }}
                  className="rounded-full"
                />
              )}
            </div>
          )}

          <span className="text-sm font-semibold text-foreground">
            Click to Toggle State ({isChecked ? "Active" : "Inactive"})
          </span>
        </label>
      </div>

      {/* Generated HTML & CSS */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4 text-emerald-500" />
            Pure CSS &amp; Semantic HTML
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied HTML & CSS!" : "Copy Snippet"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {fullCss}
        </pre>
      </div>
    </div>
  );
}
