"use client";

import { useState, useMemo } from "react";
import { CheckCircle2, XCircle, ArrowLeftRight, Copy, Check, Sparkles, Eye } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function ColorContrastChecker() {
  const [textColor, setTextColor] = useState<string>("#1e293b"); // Slate 800
  const [bgColor, setBgColor] = useState<string>("#ffffff"); // White
  const [copied, setCopied] = useState<boolean>(false);

  // Relative Luminance calculation per WCAG 2.1 specification
  const getLuminance = (hex: string): number => {
    let cleanHex = hex.replace("#", "");
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split("").map((c) => c + c).join("");
    }
    if (cleanHex.length !== 6) return 0;

    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

    const a = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  };

  const contrastRatio = useMemo(() => {
    const lum1 = getLuminance(textColor);
    const lum2 = getLuminance(bgColor);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  }, [textColor, bgColor]);

  const ratioFormatted = contrastRatio.toFixed(2);

  // WCAG 2.1 Criteria
  const passesAANormal = contrastRatio >= 4.5;
  const passesAALarge = contrastRatio >= 3.0;
  const passesAAUI = contrastRatio >= 3.0;
  const passesAAANormal = contrastRatio >= 7.0;
  const passesAAALarge = contrastRatio >= 4.5;

  const swapColors = () => {
    const temp = textColor;
    setTextColor(bgColor);
    setBgColor(temp);
  };

  const handleCopy = async () => {
    const summary = `WCAG Color Contrast Audit\n• Foreground: ${textColor}\n• Background: ${bgColor}\n• Contrast Ratio: ${ratioFormatted}:1\n• AA Normal Text (>=4.5:1): ${passesAANormal ? "PASS" : "FAIL"}\n• AA Large Text (>=3.0:1): ${passesAALarge ? "PASS" : "FAIL"}\n• AAA Normal Text (>=7.0:1): ${passesAAANormal ? "PASS" : "FAIL"}\n• AAA Large Text (>=4.5:1): ${passesAAALarge ? "PASS" : "FAIL"}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Color Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Text Color Input */}
        <div className="sm:col-span-5 p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Foreground / Text Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-10 h-10 rounded-lg border border-border cursor-pointer p-0.5 bg-background"
            />
            <input
              type="text"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="flex-1 px-3 py-2 text-sm font-mono bg-background border border-border rounded-lg uppercase"
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="sm:col-span-2 flex justify-center">
          <button
            type="button"
            onClick={swapColors}
            className="p-3 bg-muted/60 hover:bg-muted text-foreground border border-border rounded-full transition-all hover:scale-105"
            title="Swap foreground and background colors"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* Background Color Input */}
        <div className="sm:col-span-5 p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Background Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-10 h-10 rounded-lg border border-border cursor-pointer p-0.5 bg-background"
            />
            <input
              type="text"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="flex-1 px-3 py-2 text-sm font-mono bg-background border border-border rounded-lg uppercase"
            />
          </div>
        </div>
      </div>

      {/* Contrast Ratio Score Header */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-blue-500" />
            WCAG 2.1 Contrast Ratio Analysis
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Report"}</span>
          </button>
        </div>

        {/* Big Score Card */}
        <div className="p-6 bg-card rounded-xl border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Calculated Contrast Ratio
            </span>
            <p className="text-4xl sm:text-5xl font-extrabold font-mono text-foreground mt-1">
              {ratioFormatted} : 1
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono ${passesAANormal ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"}`}>
              AA {passesAANormal ? "PASSED" : "FAILED"}
            </span>
            <span className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono ${passesAAANormal ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}>
              AAA {passesAAANormal ? "PASSED" : "FAILED"}
            </span>
          </div>
        </div>

        {/* Criteria Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 bg-card rounded-xl border border-border space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">AA Normal Text</span>
              {passesAANormal ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-rose-500" />}
            </div>
            <span className="text-[11px] text-muted-foreground block">Requires &ge; 4.5:1</span>
            <span className="text-[10px] font-mono text-muted-foreground">Body text &lt; 18pt</span>
          </div>

          <div className="p-3.5 bg-card rounded-xl border border-border space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">AA Large Text</span>
              {passesAALarge ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-rose-500" />}
            </div>
            <span className="text-[11px] text-muted-foreground block">Requires &ge; 3.0:1</span>
            <span className="text-[10px] font-mono text-muted-foreground">&ge; 18pt or 14pt bold</span>
          </div>

          <div className="p-3.5 bg-card rounded-xl border border-border space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">AAA Normal Text</span>
              {passesAAANormal ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-rose-500" />}
            </div>
            <span className="text-[11px] text-muted-foreground block">Requires &ge; 7.0:1</span>
            <span className="text-[10px] font-mono text-muted-foreground">Enhanced accessibility</span>
          </div>

          <div className="p-3.5 bg-card rounded-xl border border-border space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">AAA Large Text</span>
              {passesAAALarge ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-rose-500" />}
            </div>
            <span className="text-[11px] text-muted-foreground block">Requires &ge; 4.5:1</span>
            <span className="text-[10px] font-mono text-muted-foreground">Enhanced large text</span>
          </div>
        </div>

        {/* Live Visual Typography Preview */}
        <div className="space-y-2 pt-2 border-t border-border">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Live Visual Render Preview:
          </span>
          <div
            style={{ backgroundColor: bgColor, color: textColor }}
            className="p-6 rounded-xl border border-border/80 shadow-xs space-y-3 transition-colors"
          >
            <h3 className="text-xl font-bold tracking-tight">The quick brown fox jumps over the lazy dog.</h3>
            <p className="text-sm leading-relaxed">
              Accessible design ensures that content is clear and legible for everyone, including people with color vision deficiencies and low vision.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                style={{ backgroundColor: textColor, color: bgColor }}
                className="px-4 py-2 text-xs font-bold rounded-lg shadow-xs"
              >
                Sample Action Button
              </button>
              <span className="text-xs opacity-75">Sample secondary text element</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
