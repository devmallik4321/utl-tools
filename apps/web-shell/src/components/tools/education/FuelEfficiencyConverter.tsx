"use client";

import { useState, useMemo } from "react";
import { Gauge, Copy, Check, Sparkles, Fuel } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function FuelEfficiencyConverter() {
  const [val, setVal] = useState<number>(30);
  const [unit, setUnit] = useState<"us_mpg" | "uk_mpg" | "l100km" | "kml">("us_mpg");
  const [copied, setCopied] = useState<boolean>(false);

  const results = useMemo(() => {
    if (val <= 0) return { usMpg: "0", ukMpg: "0", l100km: "0", kml: "0" };

    let usMpg = 0;
    if (unit === "us_mpg") {
      usMpg = val;
    } else if (unit === "uk_mpg") {
      // 1 UK Gallon = 1.20095 US Gallons
      usMpg = val / 1.20095;
    } else if (unit === "l100km") {
      // US MPG = 235.214583 / L/100km
      usMpg = 235.214583 / val;
    } else if (unit === "kml") {
      // 1 km/L = 2.35214583 US MPG
      usMpg = val * 2.35214583;
    }

    const ukMpg = usMpg * 1.20095;
    const l100km = usMpg > 0 ? 235.214583 / usMpg : 0;
    const kml = usMpg / 2.35214583;

    return {
      usMpg: usMpg.toFixed(2),
      ukMpg: ukMpg.toFixed(2),
      l100km: l100km.toFixed(2),
      kml: kml.toFixed(2),
    };
  }, [val, unit]);

  const handleCopy = async () => {
    const summary = `Fuel Economy Conversion (${val} ${unit}):\n• US MPG: ${results.usMpg} MPG\n• UK Imperial MPG: ${results.ukMpg} MPG\n• Metric Consumption: ${results.l100km} L/100km\n• Kilometers per Liter: ${results.kml} km/L`;
    const ok = await copyToClipboard(summary);
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
            Fuel Efficiency Value
          </label>
          <input
            type="number"
            min={1}
            step="0.5"
            value={val}
            onChange={(e) => setVal(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Measurement Unit
          </label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as any)}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value="us_mpg">US MPG (Miles per US Gallon)</option>
            <option value="uk_mpg">UK MPG (Miles per Imperial Gallon)</option>
            <option value="l100km">Liters per 100 km (L/100km)</option>
            <option value="kml">Kilometers per Liter (km/L)</option>
          </select>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Fuel className="w-4 h-4 text-emerald-500" />
            Equivalent Fuel Consumption Across Standards
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Equivalents"}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">US MPG</span>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{results.usMpg}</p>
            <span className="text-[10px] text-muted-foreground font-sans">US Gallon baseline</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">UK Imperial MPG</span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{results.ukMpg}</p>
            <span className="text-[10px] text-muted-foreground font-sans">UK / Canadian standard</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">L/100 km</span>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{results.l100km}</p>
            <span className="text-[10px] text-muted-foreground font-sans">European / Metric standard</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">km / Liter</span>
            <p className="text-2xl font-bold text-foreground">{results.kml}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Asian / Latin American</span>
          </div>
        </div>
      </div>
    </div>
  );
}
