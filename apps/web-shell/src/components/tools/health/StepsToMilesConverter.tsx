"use client";

import { useState, useMemo } from "react";
import { Footprints, Flame, Clock, Navigation, Copy, Check, Sparkles, Heart } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function StepsToMilesConverter() {
  const [steps, setSteps] = useState<number>(10000);
  const [heightInches, setHeightInches] = useState<number>(70); // 5 ft 10 in
  const [weightLbs, setWeightLbs] = useState<number>(165);
  const [pace, setPace] = useState<number>(3.0); // 3.0 mph moderate
  const [copied, setCopied] = useState<boolean>(false);

  const { miles, kilometers, calories, walkingTimeMinutes, strideInches } = useMemo(() => {
    // Average stride length = height * 0.414 (for walking)
    const stride = heightInches * 0.414;
    const totalInches = steps * stride;
    const mi = totalInches / (12 * 5280);
    const km = mi * 1.60934;

    // Time walking in minutes
    const timeHours = pace > 0 ? mi / pace : 0;
    const timeMins = Math.round(timeHours * 60);

    // Calories: MET of moderate walking (3.0 mph) ~ 3.5
    // Calories/min = (MET * 3.5 * weightKg) / 200
    const weightKg = weightLbs * 0.453592;
    const met = pace >= 3.5 ? 4.3 : pace >= 3.0 ? 3.5 : 2.8;
    const cals = Math.round(((met * 3.5 * weightKg) / 200) * timeMins);

    return {
      miles: mi.toFixed(2),
      kilometers: km.toFixed(2),
      calories: cals,
      walkingTimeMinutes: timeMins,
      strideInches: stride.toFixed(1),
    };
  }, [steps, heightInches, weightLbs, pace]);

  const handleCopy = async () => {
    const summary = `Daily Walking Activity (${steps.toLocaleString()} Steps):\n• Distance: ${miles} Miles (${kilometers} km)\n• Calories Burned: ~${calories} kcal\n• Active Walking Time: ${walkingTimeMinutes} Minutes (${(walkingTimeMinutes / 60).toFixed(1)} hrs)\n• Estimated Stride: ${strideInches} inches`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Daily Step Count
          </label>
          <input
            type="number"
            min={100}
            step={500}
            value={steps}
            onChange={(e) => setSteps(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Height (Inches)
          </label>
          <input
            type="number"
            min={48}
            max={90}
            value={heightInches}
            onChange={(e) => setHeightInches(Math.max(1, parseInt(e.target.value) || 70))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground font-mono">
            {Math.floor(heightInches / 12)} ft {heightInches % 12} in (~{(heightInches * 2.54).toFixed(0)} cm)
          </span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Body Weight (lbs)
          </label>
          <input
            type="number"
            min={50}
            value={weightLbs}
            onChange={(e) => setWeightLbs(Math.max(1, parseInt(e.target.value) || 160))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground font-mono">~{(weightLbs * 0.453592).toFixed(0)} kg</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Walking Pace
          </label>
          <select
            value={pace}
            onChange={(e) => setPace(parseFloat(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={2.5}>Leisurely (2.5 mph)</option>
            <option value={3.0}>Moderate (3.0 mph)</option>
            <option value={3.5}>Brisk (3.5 mph)</option>
          </select>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Footprints className="w-4 h-4 text-emerald-500" />
            Distance, Duration &amp; Caloric Expenditure
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Summary"}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Miles Walked</span>
            <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{miles} mi</p>
            <span className="text-[10px] text-muted-foreground font-sans">Imperial distance</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Kilometers</span>
            <p className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">{kilometers} km</p>
            <span className="text-[10px] text-muted-foreground font-sans">Metric distance</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Calories Burned</span>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">~{calories}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Active kilocalories</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Active Time</span>
            <p className="text-2xl font-bold text-foreground">{walkingTimeMinutes} Mins</p>
            <span className="text-[10px] text-muted-foreground font-sans">
              ~{(walkingTimeMinutes / 60).toFixed(1)} hours of walking
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
