"use client";

import { useState, useMemo } from "react";
import { Dumbbell, Trophy, Copy, Check, Sparkles, Flame, Percent } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const EXERCISES = ["Barbell Bench Press", "Barbell Back Squat", "Deadlift", "Overhead Press"];

export function OneRepMaxCalculator() {
  const [weight, setWeight] = useState<number>(225);
  const [reps, setReps] = useState<number>(5);
  const [unit, setUnit] = useState<"lbs" | "kg">("lbs");
  const [exercise, setExercise] = useState<string>("Barbell Bench Press");
  const [copied, setCopied] = useState<boolean>(false);

  const { oneRepMax, brzycki1Rm, epley1Rm, lombardi1Rm, percentages } = useMemo(() => {
    if (reps === 1) {
      const p = [95, 90, 85, 80, 75, 70, 65, 60, 50].map((pct) => ({
        pct,
        weight: Math.round(weight * (pct / 100)),
        repsEst: pct >= 95 ? "1-2" : pct >= 90 ? "3-4" : pct >= 85 ? "5-6" : pct >= 80 ? "7-8" : pct >= 75 ? "9-10" : "12+",
      }));
      return {
        oneRepMax: weight,
        brzycki1Rm: weight,
        epley1Rm: weight,
        lombardi1Rm: weight,
        percentages: p,
      };
    }

    // Brzycki: weight * (36 / (37 - reps))
    const brz = reps < 37 ? weight * (36 / (37 - reps)) : weight;
    // Epley: weight * (1 + reps / 30)
    const epl = weight * (1 + reps / 30);
    // Lombardi: weight * (reps ^ 0.10)
    const lom = weight * Math.pow(reps, 0.1);

    const avg = Math.round((brz + epl + lom) / 3);

    const p = [95, 90, 85, 80, 75, 70, 65, 60, 50].map((pct) => ({
      pct,
      weight: Math.round(avg * (pct / 100)),
      repsEst: pct >= 95 ? "1-2" : pct >= 90 ? "3-4" : pct >= 85 ? "5-6" : pct >= 80 ? "7-8" : pct >= 75 ? "9-10" : "12+",
    }));

    return {
      oneRepMax: avg,
      brzycki1Rm: Math.round(brz),
      epley1Rm: Math.round(epl),
      lombardi1Rm: Math.round(lom),
      percentages: p,
    };
  }, [weight, reps]);

  const handleCopy = async () => {
    const summary = `1-Rep Max Assessment for ${exercise} (${weight} ${unit} × ${reps} reps):\n• Estimated 1RM: ${oneRepMax} ${unit}\n• Brzycki Formula: ${brzycki1Rm} ${unit}\n• Epley Formula: ${epley1Rm} ${unit}\n• Lombardi Formula: ${lombardi1Rm} ${unit}\n• Working Sets:\n  - 90% (Heavy Strength): ${Math.round(oneRepMax * 0.9)} ${unit}\n  - 85% (Strength / Hypertrophy): ${Math.round(oneRepMax * 0.85)} ${unit}\n  - 75% (Volume): ${Math.round(oneRepMax * 0.75)} ${unit}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Exercise Selector */}
      <div className="flex flex-wrap gap-2">
        {EXERCISES.map((ex) => (
          <button
            key={ex}
            onClick={() => setExercise(ex)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
              exercise === ex ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            {ex}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              Lift Weight
            </label>
            <div className="flex rounded-lg overflow-hidden border border-border text-[10px] font-bold">
              <button
                onClick={() => setUnit("lbs")}
                className={`px-2 py-0.5 ${unit === "lbs" ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"}`}
              >
                lbs
              </button>
              <button
                onClick={() => setUnit("kg")}
                className={`px-2 py-0.5 ${unit === "kg" ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"}`}
              >
                kg
              </button>
            </div>
          </div>
          <input
            type="number"
            min={10}
            max={1200}
            step={5}
            value={weight}
            onChange={(e) => setWeight(Math.max(1, parseFloat(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2 sm:col-span-2">
          <div className="flex justify-between text-xs font-semibold uppercase">
            <span>Repetitions Completed</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{reps} reps</span>
          </div>
          <input
            type="range"
            min={1}
            max={15}
            value={reps}
            onChange={(e) => setReps(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>1 rep (known max)</span>
            <span>5 reps (strength)</span>
            <span>10 reps (hypertrophy)</span>
            <span>15 reps</span>
          </div>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-emerald-500" />
            Estimated 1-Rep Max Single
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Report"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border-2 border-emerald-500/40 space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase font-sans">
              Estimated 1RM
            </span>
            <p className="text-3xl font-extrabold text-foreground">
              {oneRepMax} <span className="text-sm font-normal text-muted-foreground">{unit}</span>
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Ensemble average max lift</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Brzycki Formula
            </span>
            <p className="text-2xl font-bold text-foreground">
              {brzycki1Rm} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Standard powerlifting rule</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Epley Formula
            </span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {epley1Rm} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Strength / athletic standard</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Lombardi Formula</span>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {lombardi1Rm} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Power curve modeling</span>
          </div>
        </div>
      </div>

      {/* Percentage Zones Table */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <h5 className="text-xs font-bold text-foreground uppercase tracking-wider">
          Percentage Training Zones &amp; Rep Targets
        </h5>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 font-mono text-xs text-center">
          {percentages.map((p) => (
            <div key={p.pct} className="p-2.5 bg-muted/40 rounded-xl space-y-0.5 border border-border/50">
              <span className="text-muted-foreground text-[11px] font-sans font-semibold">{p.pct}% 1RM</span>
              <p className="text-base font-extrabold text-foreground">{p.weight} {unit}</p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans block">{p.repsEst} reps</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
