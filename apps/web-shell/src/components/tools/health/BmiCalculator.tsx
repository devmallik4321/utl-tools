"use client";

import { useState } from "react";
import { Activity, Heart, AlertCircle, Info, CheckCircle2 } from "lucide-react";

export function BmiCalculator() {
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");

  // Metric state
  const [heightCm, setHeightCm] = useState<number>(175);
  const [weightKg, setWeightKg] = useState<number>(70);

  // Imperial state
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(9);
  const [weightLbs, setWeightLbs] = useState<number>(154);

  const calculateBmi = () => {
    let bmi = 0;
    if (unit === "metric") {
      const heightMeters = heightCm / 100;
      if (heightMeters > 0) {
        bmi = weightKg / (heightMeters * heightMeters);
      }
    } else {
      const totalInches = heightFt * 12 + heightIn;
      if (totalInches > 0) {
        bmi = (weightLbs / (totalInches * totalInches)) * 703;
      }
    }
    return Math.round(bmi * 10) / 10;
  };

  const bmi = calculateBmi();

  const getBmiCategory = (val: number) => {
    if (val < 18.5) {
      return {
        category: "Underweight",
        color: "text-blue-500",
        bg: "bg-blue-500",
        badge: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
        desc: "Below standard weight range. Consider consulting a healthcare provider or nutritionist regarding nutritional density.",
      };
    }
    if (val <= 24.9) {
      return {
        category: "Normal / Healthy Weight",
        color: "text-emerald-500",
        bg: "bg-emerald-500",
        badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
        desc: "Within the optimal statistical weight bracket associated with lowest relative health risk.",
      };
    }
    if (val <= 29.9) {
      return {
        category: "Overweight",
        color: "text-amber-500",
        bg: "bg-amber-500",
        badge: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
        desc: "Moderately above standard range. Regular aerobic exercise and balanced nutrition can help manage cardiovascular health.",
      };
    }
    return {
      category: "Obese (Class I-III)",
      color: "text-rose-500",
      bg: "bg-rose-500",
      badge: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
      desc: "Significantly above standard range. Associated with elevated risks of hypertension, Type 2 diabetes, and sleep apnea.",
    };
  };

  const info = getBmiCategory(bmi);

  // Healthy weight range calculations
  const getHealthyRange = () => {
    if (unit === "metric") {
      const h = heightCm / 100;
      const minKg = Math.round(18.5 * h * h);
      const maxKg = Math.round(24.9 * h * h);
      return `${minKg} kg – ${maxKg} kg`;
    } else {
      const totalInches = heightFt * 12 + heightIn;
      const minLbs = Math.round((18.5 * totalInches * totalInches) / 703);
      const maxLbs = Math.round((24.9 * totalInches * totalInches) / 703);
      return `${minLbs} lbs – ${maxLbs} lbs`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Unit Toggle */}
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
          Metric (cm / kg)
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
          Imperial (ft / in / lbs)
        </button>
      </div>

      {/* Input Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-card border border-border rounded-xl">
        {unit === "metric" ? (
          <>
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Height (Centimeters)
              </label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(Math.max(1, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Weight (Kilograms)
              </label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(Math.max(1, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono font-bold focus:outline-none"
              />
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Feet (ft)
                </label>
                <input
                  type="number"
                  value={heightFt}
                  onChange={(e) => setHeightFt(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono font-bold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                  Inches (in)
                </label>
                <input
                  type="number"
                  value={heightIn}
                  onChange={(e) => setHeightIn(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono font-bold focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
                Weight (Pounds / lbs)
              </label>
              <input
                type="number"
                value={weightLbs}
                onChange={(e) => setWeightLbs(Math.max(1, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg font-mono font-bold focus:outline-none"
              />
            </div>
          </>
        )}
      </div>

      {/* Result Display Banner */}
      <div className="p-6 bg-card border border-border rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Your Calculated BMI
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-4xl sm:text-5xl font-black font-mono text-foreground">{bmi}</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${info.badge}`}>
                {info.category}
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-muted-foreground block">WHO Healthy Weight Target</span>
            <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {getHealthyRange()}
            </span>
          </div>
        </div>

        {/* Visual WHO Spectrum Bar */}
        <div className="space-y-1.5">
          <div className="h-3 w-full rounded-full overflow-hidden flex bg-muted">
            <div className="bg-blue-400 h-full w-[18.5%]" title="Underweight (< 18.5)" />
            <div className="bg-emerald-500 h-full w-[25%]" title="Normal (18.5 - 24.9)" />
            <div className="bg-amber-400 h-full w-[20%]" title="Overweight (25.0 - 29.9)" />
            <div className="bg-rose-500 h-full w-[36.5%]" title="Obese (≥ 30.0)" />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
            <span>15.0</span>
            <span>18.5 (Normal)</span>
            <span>25.0 (Overweight)</span>
            <span>30.0 (Obese)</span>
            <span>40.0</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed pt-1">
          {info.desc}
        </p>
      </div>

      {/* Clinical Transparency Note */}
      <div className="p-4 bg-muted/30 border border-border rounded-xl flex items-start gap-2.5 text-xs text-muted-foreground">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <span>
          <strong>Important Clinical Note:</strong> BMI is a generalized population screening ratio based purely on height and mass. It cannot measure body fat percentage directly, nor does it account for high athletic muscle mass, bone density, age, or pregnancy. This tool does not provide medical diagnoses.
        </span>
      </div>
    </div>
  );
}
