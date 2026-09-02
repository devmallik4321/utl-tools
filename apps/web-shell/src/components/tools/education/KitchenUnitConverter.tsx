"use client";

import { useState, useMemo } from "react";
import { Utensils, Copy, Check, Sparkles, Flame } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function KitchenUnitConverter() {
  const [amount, setAmount] = useState<number>(1);
  const [unitType, setUnitType] = useState<"volume" | "temp">("volume");

  // Volume state
  const [fromVolume, setFromVolume] = useState<string>("cup");

  // Temp state
  const [tempF, setTempF] = useState<number>(350);

  const [copied, setCopied] = useState<boolean>(false);

  // Volume conversions relative to 1 cup (US)
  // 1 cup = 16 tbsp = 48 tsp = 8 fl oz = 236.588 ml
  const volumeResults = useMemo(() => {
    const toCups: Record<string, number> = {
      cup: 1,
      tbsp: 1 / 16,
      tsp: 1 / 48,
      floz: 1 / 8,
      ml: 1 / 236.588,
      liter: 4.22675,
      pint: 2,
      quart: 4,
    };

    const cups = amount * (toCups[fromVolume] || 1);

    return {
      cups: cups.toFixed(2),
      tbsp: (cups * 16).toFixed(1),
      tsp: (cups * 48).toFixed(1),
      floz: (cups * 8).toFixed(1),
      ml: (cups * 236.588).toFixed(0),
      liters: (cups * 0.236588).toFixed(3),
    };
  }, [amount, fromVolume]);

  const tempResults = useMemo(() => {
    const c = ((tempF - 32) * 5) / 9;
    let gasMark = "-";
    if (tempF >= 275 && tempF < 300) gasMark = "1";
    else if (tempF >= 300 && tempF < 325) gasMark = "2";
    else if (tempF >= 325 && tempF < 350) gasMark = "3";
    else if (tempF >= 350 && tempF < 375) gasMark = "4 (Standard)";
    else if (tempF >= 375 && tempF < 400) gasMark = "5";
    else if (tempF >= 400 && tempF < 425) gasMark = "6";
    else if (tempF >= 425 && tempF < 450) gasMark = "7";
    else if (tempF >= 450) gasMark = "8+";

    return {
      celsius: c.toFixed(1),
      gasMark,
    };
  }, [tempF]);

  const handleCopy = async () => {
    let summary = "";
    if (unitType === "volume") {
      summary = `Kitchen Volume Conversion (${amount} ${fromVolume}):\n• Cups: ${volumeResults.cups}\n• Tablespoons: ${volumeResults.tbsp} tbsp\n• Teaspoons: ${volumeResults.tsp} tsp\n• Fluid Ounces: ${volumeResults.floz} fl oz\n• Milliliters: ${volumeResults.ml} ml`;
    } else {
      summary = `Oven Temperature: ${tempF}°F = ${tempResults.celsius}°C (Gas Mark: ${tempResults.gasMark})`;
    }
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Toggle */}
      <div className="flex p-0.5 bg-muted rounded-xl border border-border max-w-xs text-xs">
        <button
          onClick={() => setUnitType("volume")}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-colors ${
            unitType === "volume" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"
          }`}
        >
          Liquid &amp; Dry Volume
        </button>
        <button
          onClick={() => setUnitType("temp")}
          className={`flex-1 py-1.5 rounded-lg font-bold transition-colors ${
            unitType === "temp" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"
          }`}
        >
          Oven Temperature
        </button>
      </div>

      {unitType === "volume" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-card border border-border rounded-xl space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                Measurement Amount
              </label>
              <input
                type="number"
                min={0.1}
                step="0.25"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
              />
            </div>

            <div className="p-4 bg-card border border-border rounded-xl space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                Base Unit
              </label>
              <select
                value={fromVolume}
                onChange={(e) => setFromVolume(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
              >
                <option value="cup">Cups (US Standard)</option>
                <option value="tbsp">Tablespoons (tbsp)</option>
                <option value="tsp">Teaspoons (tsp)</option>
                <option value="floz">Fluid Ounces (fl oz)</option>
                <option value="ml">Milliliters (ml)</option>
                <option value="liter">Liters (L)</option>
                <option value="pint">Pints (pt)</option>
                <option value="quart">Quarts (qt)</option>
              </select>
            </div>
          </div>

          <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-emerald-500" />
                Equivalent Cooking Volumes
              </h4>
              <button
                onClick={handleCopy}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Equivalents"}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 bg-card rounded-lg border border-border space-y-1">
                <span className="text-muted-foreground font-sans block">Cups</span>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{volumeResults.cups}</p>
              </div>

              <div className="p-3 bg-card rounded-lg border border-border space-y-1">
                <span className="text-muted-foreground font-sans block">Tablespoons (tbsp)</span>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{volumeResults.tbsp}</p>
              </div>

              <div className="p-3 bg-card rounded-lg border border-border space-y-1">
                <span className="text-muted-foreground font-sans block">Teaspoons (tsp)</span>
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{volumeResults.tsp}</p>
              </div>

              <div className="p-3 bg-card rounded-lg border border-border space-y-1">
                <span className="text-muted-foreground font-sans block">Fluid Ounces (fl oz)</span>
                <p className="text-xl font-bold text-foreground">{volumeResults.floz}</p>
              </div>

              <div className="p-3 bg-card rounded-lg border border-border space-y-1">
                <span className="text-muted-foreground font-sans block">Milliliters (ml)</span>
                <p className="text-xl font-bold text-foreground">{volumeResults.ml} ml</p>
              </div>

              <div className="p-3 bg-card rounded-lg border border-border space-y-1">
                <span className="text-muted-foreground font-sans block">Liters (L)</span>
                <p className="text-xl font-bold text-foreground">{volumeResults.liters} L</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-card border border-border rounded-xl space-y-2 max-w-sm">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              Oven Temperature (°F)
            </label>
            <input
              type="number"
              min={100}
              max={600}
              value={tempF}
              onChange={(e) => setTempF(parseInt(e.target.value) || 350)}
              className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
            />
          </div>

          <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                Temperature Equivalents
              </h4>
              <button
                onClick={handleCopy}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Temps"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
              <div className="p-4 bg-card rounded-xl border border-border space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Celsius (°C)</span>
                <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {tempResults.celsius}°C
                </p>
              </div>

              <div className="p-4 bg-card rounded-xl border border-border space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Fahrenheit (°F)</span>
                <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{tempF}°F</p>
              </div>

              <div className="p-4 bg-card rounded-xl border border-border space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Gas Mark</span>
                <p className="text-2xl font-bold text-foreground">Mark {tempResults.gasMark}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
