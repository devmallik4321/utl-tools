"use client";

import { useState, useMemo } from "react";
import { Utensils, Flame, Copy, Check, Sparkles, PieChart, Dumbbell } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const GOAL_PRESETS = [
  { name: "Fat Loss / Cutting", p: 40, c: 30, f: 30, desc: "High protein satiety" },
  { name: "Balanced Maintenance", p: 30, c: 40, f: 30, desc: "Standard healthy lifestyle" },
  { name: "Lean Muscle Bulk", p: 30, c: 45, f: 25, desc: "Higher carbohydrate energy" },
  { name: "Keto / Low-Carb", p: 25, c: 5, f: 70, desc: "Ketogenic fat adaptation" },
];

export function MacroSplitCalculator() {
  const [totalCalories, setTotalCalories] = useState<number>(2200);
  const [proteinPct, setProteinPct] = useState<number>(35);
  const [carbPct, setCarbPct] = useState<number>(35);
  const [fatPct, setFatPct] = useState<number>(30);
  const [mealsPerDay, setMealsPerDay] = useState<number>(3);
  const [copied, setCopied] = useState<boolean>(false);

  const { proteinGrams, carbGrams, fatGrams, perMealProtein, perMealCarbs, perMealFat } = useMemo(() => {
    // Protein: 4 kcal/g, Carbs: 4 kcal/g, Fat: 9 kcal/g
    const pKcal = totalCalories * (proteinPct / 100);
    const cKcal = totalCalories * (carbPct / 100);
    const fKcal = totalCalories * (fatPct / 100);

    const pG = pKcal / 4;
    const cG = cKcal / 4;
    const fG = fKcal / 9;

    const meals = Math.max(1, mealsPerDay);

    return {
      proteinGrams: Math.round(pG),
      carbGrams: Math.round(cG),
      fatGrams: Math.round(fG),
      perMealProtein: Math.round(pG / meals),
      perMealCarbs: Math.round(cG / meals),
      perMealFat: Math.round(fG / meals),
    };
  }, [totalCalories, proteinPct, carbPct, fatPct, mealsPerDay]);

  const setPreset = (preset: (typeof GOAL_PRESETS)[0]) => {
    setProteinPct(preset.p);
    setCarbPct(preset.c);
    setFatPct(preset.f);
  };

  const handleCopy = async () => {
    const summary = `Daily Macronutrient Target (${totalCalories.toLocaleString()} kcal/day):\n• Protein: ${proteinGrams}g (${proteinPct}% | ${perMealProtein}g/meal)\n• Carbohydrates: ${carbGrams}g (${carbPct}% | ${perMealCarbs}g/meal)\n• Healthy Fats: ${fatGrams}g (${fatPct}% | ${perMealFat}g/meal)\n• Meal Schedule: ${mealsPerDay} meals per day (~${Math.round(totalCalories / mealsPerDay)} kcal/meal)`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {GOAL_PRESETS.map((g) => (
          <button
            key={g.name}
            onClick={() => setPreset(g)}
            className={`p-2.5 text-left rounded-xl border transition-colors ${
              proteinPct === g.p && carbPct === g.c && fatPct === g.f
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            <span className="text-xs font-bold block">{g.name}</span>
            <span className="text-[10px] opacity-75">
              {g.p}P / {g.c}C / {g.f}F
            </span>
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Target Calories (kcal / day)
          </label>
          <input
            type="number"
            min={800}
            max={8000}
            step={50}
            value={totalCalories}
            onChange={(e) => setTotalCalories(Math.max(500, parseInt(e.target.value) || 2000))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Meals Per Day
          </label>
          <select
            value={mealsPerDay}
            onChange={(e) => setMealsPerDay(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={2}>2 Meals (Intermittent Fasting)</option>
            <option value={3}>3 Meals (Standard Breakfast, Lunch, Dinner)</option>
            <option value={4}>4 Meals (3 Meals + 1 Shake)</option>
            <option value={5}>5 Meals (Bodybuilder Split)</option>
          </select>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Utensils className="w-4 h-4 text-emerald-500" />
            Macronutrient Gram Targets ({mealsPerDay} Meals / Day)
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Macros"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <div className="flex justify-between items-center font-sans">
              <span className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400">Protein</span>
              <span className="text-xs text-muted-foreground">{proteinPct}%</span>
            </div>
            <p className="text-3xl font-extrabold text-foreground">{proteinGrams} g</p>
            <span className="text-[10px] text-muted-foreground font-sans">{perMealProtein}g per meal (4 kcal/g)</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <div className="flex justify-between items-center font-sans">
              <span className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">Carbs</span>
              <span className="text-xs text-muted-foreground">{carbPct}%</span>
            </div>
            <p className="text-3xl font-extrabold text-foreground">{carbGrams} g</p>
            <span className="text-[10px] text-muted-foreground font-sans">{perMealCarbs}g per meal (4 kcal/g)</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <div className="flex justify-between items-center font-sans">
              <span className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400">Healthy Fats</span>
              <span className="text-xs text-muted-foreground">{fatPct}%</span>
            </div>
            <p className="text-3xl font-extrabold text-foreground">{fatGrams} g</p>
            <span className="text-[10px] text-muted-foreground font-sans">{perMealFat}g per meal (9 kcal/g)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
