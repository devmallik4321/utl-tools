"use client";

import { useState, useMemo } from "react";
import { Heart, Activity, Copy, Check, Sparkles, Flame, ShieldCheck, Zap, TrendingDown } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function CardiacDriftCalculator() {
  const [sportMode, setSportMode] = useState<"cycling" | "running">("cycling");
  const [half1Power, setHalf1Power] = useState<number>(200); // Watts or km/h
  const [half1Hr, setHalf1Hr] = useState<number>(142); // bpm
  const [half2Power, setHalf2Power] = useState<number>(198); // Watts or km/h
  const [half2Hr, setHalf2Hr] = useState<number>(152); // bpm
  const [copied, setCopied] = useState<boolean>(false);

  const {
    er1,
    er2,
    decouplingPct,
    isAerobicallyFit,
    frielRating,
    ratingColor,
    coachingAdvice,
  } = useMemo(() => {
    const ratio1 = half1Hr > 0 ? half1Power / half1Hr : 0;
    const ratio2 = half2Hr > 0 ? half2Power / half2Hr : 0;

    const drift = ratio1 > 0 ? ((ratio1 - ratio2) / ratio1) * 100 : 0;

    let rating = "Aerobically Fit (< 5.0%)";
    let color = "text-emerald-500 border-emerald-500/30";
    let advice = "Outstanding aerobic endurance base. Your cardiovascular system maintained metabolic equilibrium across the entire workout. You are ready to introduce tempo and threshold intervals.";

    if (drift > 8.0) {
      rating = "Severe Decoupling (> 8.0%)";
      color = "text-rose-500 border-rose-500/30";
      advice = "High cardiac drift detected. Your heart worked significantly harder in the second half for the same output. Indicates underdeveloped mitochondrial base, dehydration, heat accumulation, or pacing above LT1.";
    } else if (drift >= 5.0) {
      rating = "Moderate Drift (5.0% – 8.0%)";
      color = "text-amber-500 border-amber-500/30";
      advice = "Moderate aerobic decoupling. Endurance is developing, but long-duration fatigue still causes cardiac drift. Continue Zone 2 aerobic volume before progressing to high intensity.";
    }

    return {
      er1: ratio1.toFixed(3),
      er2: ratio2.toFixed(3),
      decouplingPct: drift.toFixed(2),
      isAerobicallyFit: drift < 5.0,
      frielRating: rating,
      ratingColor: color,
      coachingAdvice: advice,
    };
  }, [sportMode, half1Power, half1Hr, half2Power, half2Hr]);

  const handleCopy = async () => {
    const unit = sportMode === "cycling" ? "Watts" : "km/h";
    const summary = `Aerobic Decoupling (Cardiac Drift Pw:Hr) Analysis:\n• Decoupling Rate: ${decouplingPct}% (${frielRating})\n• 1st Half: ${half1Power} ${unit} @ ${half1Hr} bpm (ER: ${er1})\n• 2nd Half: ${half2Power} ${unit} @ ${half2Hr} bpm (ER: ${er2})\n• Joe Friel Standard: ${isAerobicallyFit ? "Pass (< 5.0% - Ready for build phase)" : "Needs Work (> 5.0% - Build aerobic base)"}\n• Coaching Advice: ${coachingAdvice}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sport Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setSportMode("cycling")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
            sportMode === "cycling" ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
          }`}
        >
          Cycling (Power Pw:Hr in Watts)
        </button>
        <button
          onClick={() => setSportMode("running")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
            sportMode === "running" ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
          }`}
        >
          Running (Pace / Speed Pa:Hr in km/h)
        </button>
      </div>

      {/* Inputs for Halves */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
            First Half of Workout
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                Avg {sportMode === "cycling" ? "Power (Watts)" : "Speed (km/h)"}
              </label>
              <input
                type="number"
                step={sportMode === "cycling" ? 5 : 0.2}
                value={half1Power}
                onChange={(e) => setHalf1Power(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Avg Heart Rate (bpm)</label>
              <input
                type="number"
                value={half1Hr}
                onChange={(e) => setHalf1Hr(Math.max(40, parseInt(e.target.value) || 40))}
                className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Second Half of Workout
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">
                Avg {sportMode === "cycling" ? "Power (Watts)" : "Speed (km/h)"}
              </label>
              <input
                type="number"
                step={sportMode === "cycling" ? 5 : 0.2}
                value={half2Power}
                onChange={(e) => setHalf2Power(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Avg Heart Rate (bpm)</label>
              <input
                type="number"
                value={half2Hr}
                onChange={(e) => setHalf2Hr(Math.max(40, parseInt(e.target.value) || 40))}
                className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-rose-600 dark:text-rose-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-500" />
            Cardiac Drift &amp; Aerobic Decoupling Metrics
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Decoupling"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border-2 border-emerald-500/40 space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase font-sans">
              Decoupling Rate
            </span>
            <p className="text-3xl font-extrabold text-foreground">{decouplingPct}%</p>
            <span className="text-[10px] text-muted-foreground font-sans">Pw:Hr / Pa:Hr drift</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Joe Friel Verdict
            </span>
            <p className="text-base font-bold text-foreground font-sans">{frielRating}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Target: &lt; 5.0%</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              1st Half Efficiency
            </span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{er1}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Output / Heart Rate</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              2nd Half Efficiency
            </span>
            <p className="text-2xl font-bold text-foreground">{er2}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Output / Heart Rate</span>
          </div>
        </div>

        <div className="p-3.5 bg-card rounded-xl border border-border text-xs text-muted-foreground">
          <strong className="text-foreground">Coaching Science: </strong>
          {coachingAdvice}
        </div>
      </div>
    </div>
  );
}
