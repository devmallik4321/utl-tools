"use client";

import { useState } from "react";
import { Droplet, Activity, Sun, CheckCircle2 } from "lucide-react";

export function WaterIntakeCalculator() {
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [weightKg, setWeightKg] = useState<number>(75);
  const [weightLbs, setWeightLbs] = useState<number>(165);
  const [exerciseMinutes, setExerciseMinutes] = useState<number>(45);
  const [climate, setClimate] = useState<"temperate" | "hot" | "cold">("temperate");

  const calculateIntake = () => {
    let weightInKg = unit === "metric" ? weightKg : weightLbs * 0.453592;

    // Baseline: 35ml per kg of body weight
    let baseLiters = (weightInKg * 35) / 1000;

    // Exercise addition: ~350ml per 30 mins
    let exerciseLiters = (exerciseMinutes / 30) * 0.35;

    // Climate factor
    let climateMultiplier = climate === "hot" ? 1.2 : climate === "cold" ? 1.05 : 1.0;

    let totalLiters = (baseLiters + exerciseLiters) * climateMultiplier;
    totalLiters = Math.round(totalLiters * 10) / 10;

    const totalMl = Math.round(totalLiters * 1000);
    const totalOz = Math.round(totalLiters * 33.814);
    const glasses = Math.round(totalMl / 250);

    return {
      liters: totalLiters,
      ml: totalMl,
      oz: totalOz,
      glasses,
    };
  };

  const results = calculateIntake();

  return (
    <div className="space-y-6">
      {/* Unit Switcher */}
      <div className="flex gap-2 p-1.5 bg-card border border-border rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setUnit("metric")}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            unit === "metric"
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Metric (kg)
        </button>
        <button
          type="button"
          onClick={() => setUnit("imperial")}
          className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            unit === "imperial"
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Imperial (lbs)
        </button>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-card border border-border rounded-xl">
        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
            Body Weight ({unit === "metric" ? "kg" : "lbs"})
          </label>
          <input
            type="number"
            value={unit === "metric" ? weightKg : weightLbs}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              if (unit === "metric") setWeightKg(val);
              else setWeightLbs(val);
            }}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono font-bold focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
            Daily Exercise (Minutes)
          </label>
          <input
            type="number"
            min={0}
            max={300}
            value={exerciseMinutes}
            onChange={(e) => setExerciseMinutes(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono font-bold focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
            Environment / Climate
          </label>
          <select
            value={climate}
            onChange={(e) => setClimate(e.target.value as any)}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none"
          >
            <option value="temperate">Moderate / Temperate</option>
            <option value="hot">Hot / Humid (+20% fluid needs)</option>
            <option value="cold">Cold / High Altitude (+5%)</option>
          </select>
        </div>
      </div>

      {/* Target Result Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-6 bg-card border border-border rounded-xl space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Liters Target
          </span>
          <p className="text-3xl font-black font-mono text-blue-600 dark:text-blue-400">
            {results.liters} <span className="text-sm font-normal text-muted-foreground">L / day</span>
          </p>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Milliliters
          </span>
          <p className="text-3xl font-black font-mono text-cyan-600 dark:text-cyan-400">
            {results.ml.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">ml</span>
          </p>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Fluid Ounces
          </span>
          <p className="text-3xl font-black font-mono text-teal-600 dark:text-teal-400">
            {results.oz} <span className="text-sm font-normal text-muted-foreground">fl oz</span>
          </p>
        </div>

        <div className="p-6 bg-card border border-border rounded-xl space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            250ml Glasses
          </span>
          <p className="text-3xl font-black font-mono text-foreground">
            ~{results.glasses} <span className="text-sm font-normal text-muted-foreground">glasses</span>
          </p>
        </div>
      </div>
    </div>
  );
}
