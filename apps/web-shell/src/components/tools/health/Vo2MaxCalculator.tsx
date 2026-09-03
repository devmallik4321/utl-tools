"use client";

import { useState, useMemo } from "react";
import { Activity, Heart, Copy, Check, Sparkles, Trophy, Flame } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

type TestMethod = "cooper" | "heartRate";

export function Vo2MaxCalculator() {
  const [method, setMethod] = useState<TestMethod>("cooper");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState<number>(32);
  const [distanceMeters, setDistanceMeters] = useState<number>(2500); // 12-min Cooper run distance
  const [restingHr, setRestingHr] = useState<number>(58); // bpm
  const [maxHr, setMaxHr] = useState<number>(185); // bpm
  const [copied, setCopied] = useState<boolean>(false);

  const { vo2Max, category, longevityTier } = useMemo(() => {
    let vo2 = 0;

    if (method === "cooper") {
      // Cooper 12-minute run formula: (distance_meters - 504.9) / 44.73
      vo2 = (distanceMeters - 504.9) / 44.73;
    } else {
      // Uth-Sørensen-Overgaard-Pedersen formula: 15.3 * (HRmax / HRrest)
      if (restingHr > 0) {
        vo2 = 15.3 * (maxHr / restingHr);
      }
    }

    const score = Math.max(10, Math.min(90, vo2));

    // Categorization based on ACSM standards for ~30-39 age group
    let cat = "Good";
    if (gender === "male") {
      if (score >= 52) cat = "Superior (Top 5%)";
      else if (score >= 46) cat = "Excellent";
      else if (score >= 41) cat = "Good (Above Average)";
      else if (score >= 35) cat = "Fair";
      else cat = "Poor";
    } else {
      if (score >= 46) cat = "Superior (Top 5%)";
      else if (score >= 40) cat = "Excellent";
      else if (score >= 35) cat = "Good (Above Average)";
      else if (score >= 30) cat = "Fair";
      else cat = "Poor";
    }

    let longevity = "High Cardiovascular Fitness";
    if (cat.includes("Superior") || cat.includes("Excellent")) {
      longevity = "Lowest All-Cause Mortality Risk (Top Decile)";
    } else if (cat.includes("Poor")) {
      longevity = "Elevated Cardiovascular Disease Risk";
    }

    return {
      vo2Max: score.toFixed(1),
      category: cat,
      longevityTier: longevity,
    };
  }, [method, gender, age, distanceMeters, restingHr, maxHr]);

  const handleCopy = async () => {
    const summary = `Cardiorespiratory Fitness Assessment (VO2 Max):\n• Estimated VO2 Max: ${vo2Max} mL/kg/min\n• Athletic Category: ${category}\n• Mortality & Longevity Risk Tier: ${longevityTier}\n• Tested via: ${method === "cooper" ? `Cooper 12-Min Run (${distanceMeters}m)` : `Heart Rate Ratio (${restingHr} rest / ${maxHr} max)`}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Method Switcher */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setMethod("cooper")}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
            method === "cooper" ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
          }`}
        >
          Cooper 12-Minute Run Test
        </button>
        <button
          onClick={() => setMethod("heartRate")}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
            method === "heartRate" ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
          }`}
        >
          Resting / Max Heart Rate Method
        </button>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Biological Sex &amp; Age
          </label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="w-full px-2 py-1.5 text-xs font-bold bg-background border border-border rounded-lg"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <input
              type="number"
              min={15}
              max={95}
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value) || 30)}
              className="w-full px-2 py-1.5 text-xs font-mono font-bold bg-background border border-border rounded-lg"
            />
          </div>
        </div>

        {method === "cooper" ? (
          <div className="p-4 bg-card border border-border rounded-xl space-y-2 sm:col-span-3">
            <div className="flex justify-between text-xs font-semibold uppercase">
              <span>12-Minute Run Distance</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                {distanceMeters} meters ({(distanceMeters / 1609.34).toFixed(2)} miles)
              </span>
            </div>
            <input
              type="range"
              min={1000}
              max={4200}
              step={50}
              value={distanceMeters}
              onChange={(e) => setDistanceMeters(parseInt(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>
        ) : (
          <>
            <div className="p-4 bg-card border border-border rounded-xl space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                Resting Heart Rate
              </label>
              <input
                type="number"
                min={35}
                max={120}
                value={restingHr}
                onChange={(e) => setRestingHr(Math.max(30, parseInt(e.target.value) || 30))}
                className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
              />
              <span className="text-[10px] text-muted-foreground">bpm upon waking</span>
            </div>

            <div className="p-4 bg-card border border-border rounded-xl space-y-2 sm:col-span-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                Maximum Heart Rate
              </label>
              <input
                type="number"
                min={130}
                max={225}
                value={maxHr}
                onChange={(e) => setMaxHr(Math.max(100, parseInt(e.target.value) || 100))}
                className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-rose-600 dark:text-rose-400"
              />
              <span className="text-[10px] text-muted-foreground">bpm peak or ~220 - age</span>
            </div>
          </>
        )}
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-500" />
            Aerobic Capacity &amp; Longevity Benchmark
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy VO2 Max"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border-2 border-emerald-500/40 space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase font-sans">
              Estimated VO2 Max
            </span>
            <p className="text-3xl font-extrabold text-foreground">{vo2Max}</p>
            <span className="text-[10px] text-muted-foreground font-sans">mL / kg / min</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Fitness Tier</span>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{category}</p>
            <span className="text-[10px] text-muted-foreground font-sans">ACSM population percentile</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Longevity Profile
            </span>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{longevityTier}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Cardiorespiratory health indicator</span>
          </div>
        </div>
      </div>
    </div>
  );
}
