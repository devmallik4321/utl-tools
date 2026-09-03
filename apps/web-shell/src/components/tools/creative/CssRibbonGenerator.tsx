"use client";

import { useState, useMemo } from "react";
import { Bookmark, Copy, Check, Sparkles, Layers, Sliders } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

type RibbonPosition = "top-right" | "top-left" | "bookmark";

export function CssRibbonGenerator() {
  const [position, setPosition] = useState<RibbonPosition>("top-right");
  const [ribbonText, setRibbonText] = useState<string>("POPULAR");
  const [ribbonColor, setRibbonColor] = useState<string>("#ef4444");
  const [foldColor, setFoldColor] = useState<string>("#991b1b");
  const [textColor, setTextColor] = useState<string>("#ffffff");
  const [copied, setCopied] = useState<boolean>(false);

  const { fullCss, previewStyle } = useMemo(() => {
    let css = "";
    if (position === "top-right") {
      css = `/* Pure CSS Top-Right Folded Corner Ribbon */
.ribbon-wrapper {
  width: 150px;
  height: 150px;
  overflow: hidden;
  position: absolute;
  top: -10px;
  right: -10px;
}

.ribbon {
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 1px;
  color: ${textColor};
  text-align: center;
  transform: rotate(45deg);
  position: relative;
  padding: 7px 0;
  left: -5px;
  top: 30px;
  width: 220px;
  background-color: ${ribbonColor};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
}

.ribbon::before,
.ribbon::after {
  content: "";
  position: absolute;
  top: 100%;
  z-index: -1;
  border-bottom: 3px solid transparent;
  border-top: 3px solid ${foldColor};
}

.ribbon::before {
  left: 0;
  border-left: 3px solid transparent;
  border-right: 3px solid ${foldColor};
}

.ribbon::after {
  right: 0;
  border-right: 3px solid transparent;
  border-left: 3px solid ${foldColor};
}`;
    } else if (position === "top-left") {
      css = `/* Pure CSS Top-Left Folded Corner Ribbon */
.ribbon-wrapper {
  width: 150px;
  height: 150px;
  overflow: hidden;
  position: absolute;
  top: -10px;
  left: -10px;
}

.ribbon {
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 1px;
  color: ${textColor};
  text-align: center;
  transform: rotate(-45deg);
  position: relative;
  padding: 7px 0;
  right: -5px;
  top: 30px;
  width: 220px;
  background-color: ${ribbonColor};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
}

.ribbon::before,
.ribbon::after {
  content: "";
  position: absolute;
  top: 100%;
  z-index: -1;
  border-bottom: 3px solid transparent;
  border-top: 3px solid ${foldColor};
}

.ribbon::before {
  left: 0;
  border-left: 3px solid transparent;
  border-right: 3px solid ${foldColor};
}

.ribbon::after {
  right: 0;
  border-right: 3px solid transparent;
  border-left: 3px solid ${foldColor};
}`;
    } else {
      // Bookmark badge
      css = `/* Pure CSS Bookmark Badge with Folded Cut */
.bookmark-ribbon {
  position: absolute;
  top: -8px;
  right: 24px;
  background: ${ribbonColor};
  color: ${textColor};
  font-size: 11px;
  font-weight: bold;
  padding: 10px 14px 14px;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.bookmark-ribbon::before {
  content: "";
  position: absolute;
  top: 0;
  left: -8px;
  border-top: 8px solid transparent;
  border-right: 8px solid ${foldColor};
}`;
    }

    return { fullCss: css, previewStyle: {} };
  }, [position, ribbonText, ribbonColor, foldColor, textColor]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(fullCss);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Position Selector */}
      <div className="grid grid-cols-3 gap-2">
        {(["top-right", "top-left", "bookmark"] as RibbonPosition[]).map((p) => (
          <button
            key={p}
            onClick={() => setPosition(p)}
            className={`px-3 py-2 text-xs font-bold rounded-xl border capitalize transition-colors ${
              position === p ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
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
            Ribbon Text
          </label>
          <input
            type="text"
            value={ribbonText}
            onChange={(e) => setRibbonText(e.target.value)}
            className="w-full px-3 py-2 text-sm font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Ribbon Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={ribbonColor}
              onChange={(e) => setRibbonColor(e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
            <input
              type="text"
              value={ribbonColor}
              onChange={(e) => setRibbonColor(e.target.value)}
              className="w-full px-2 py-1 font-mono text-xs bg-background border border-border rounded-lg"
            />
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Fold Shadow Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={foldColor}
              onChange={(e) => setFoldColor(e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
            <input
              type="text"
              value={foldColor}
              onChange={(e) => setFoldColor(e.target.value)}
              className="w-full px-2 py-1 font-mono text-xs bg-background border border-border rounded-lg"
            />
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Text Color
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
      </div>

      {/* Live Visual Preview Card */}
      <div className="p-12 bg-muted/30 border border-border rounded-2xl flex items-center justify-center">
        <div className="relative w-80 h-52 bg-card border border-border rounded-2xl p-6 shadow-xl flex flex-col justify-between overflow-hidden">
          {/* Corner Ribbon Render */}
          {position === "top-right" && (
            <div className="absolute -top-2.5 -right-2.5 w-36 h-36 overflow-hidden pointer-events-none">
              <div
                style={{ backgroundColor: ribbonColor, color: textColor }}
                className="absolute top-8 -right-8 w-44 py-1.5 text-center text-xs font-extrabold tracking-wider shadow-md transform rotate-45 uppercase"
              >
                {ribbonText}
              </div>
            </div>
          )}

          {position === "top-left" && (
            <div className="absolute -top-2.5 -left-2.5 w-36 h-36 overflow-hidden pointer-events-none">
              <div
                style={{ backgroundColor: ribbonColor, color: textColor }}
                className="absolute top-8 -left-8 w-44 py-1.5 text-center text-xs font-extrabold tracking-wider shadow-md transform -rotate-45 uppercase"
              >
                {ribbonText}
              </div>
            </div>
          )}

          {position === "bookmark" && (
            <div
              style={{
                backgroundColor: ribbonColor,
                color: textColor,
                clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)",
              }}
              className="absolute top-0 right-6 px-3.5 pt-2 pb-4 text-xs font-extrabold tracking-wider shadow-md uppercase"
            >
              {ribbonText}
            </div>
          )}

          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Enterprise Plan</span>
            <h3 className="text-2xl font-black text-foreground">$49<span className="text-xs text-muted-foreground font-normal">/mo</span></h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Includes unlimited API queries, custom webhooks, and 24/7 dedicated support.
          </p>
          <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow">
            Select Plan
          </button>
        </div>
      </div>

      {/* Generated CSS */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Bookmark className="w-4 h-4 text-emerald-500" />
            CSS Folded Ribbon Code
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
