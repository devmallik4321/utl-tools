"use client";

import { useState, useMemo } from "react";
import { Activity, Copy, Check, Sparkles, Scale, Heart, ShieldCheck } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function BodyFatNavyCalculator() {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [weightLbs, setWeightLbs] = useState<number>(180);
  const [heightInches, setHeightInches] = useState<number>(70); // 5 ft 10 in
  const [neckInches, setNeckInches] = useState<number>(15.5);
  const [waistInches, setWaistInches] = useState<number>(33.5);
  const [hipInches, setHipInches] = useState<number>(38.0); // For female
  const [copied, setCopied] = useState<boolean>(false);

  const { bodyFatPct, category, fatMassLbs, leanMassLbs, meetsNavyStandard } = useMemo(() => {
    let bf = 0;

    if (gender === "male") {
      const diff = Math.max(1, waistInches - neckInches);
      bf = 86.010 * Math.log10(diff) - 70.041 * Math.log10(heightInches) + 36.76;
    } else {
      const sumDiff = Math.max(1, waistInches + hipInches - neckInches);
      bf = 163.205 * Math.log10(sumDiff) - 97.684 * Math.log10(heightInches) - 78.387;
    }

    const clampedBf = Math.max(2, Math.min(60, bf));

    // Categories
    let cat = "Average";
    if (gender === "male") {
      if (clampedBf < 6) cat = "Essential Fat";
      else if (clampedBf <= 13) cat = "Athletes";
      else if (clampedBf <= 17) cat = "Fitness";
      else if (clampedBf <= 24) cat = "Average";
      else cat = "Obese";
    } else {
      if (clampedBf < 14) cat = "Essential Fat";
      else if (clampedBf <= 20) cat = "Athletes";
      else if (clampedBf <= 24) cat = "Fitness";
      else if (clampedBf <= 31) cat = "Average";
      else cat = "Obese";
    }

    const fatMass = weightLbs * (clampedBf / 100);
    const leanMass = weightLbs - fatMass;

    // US Navy standard threshold: ~22% for males under 30, ~33% for females
    const meetsNavy = gender === "male" ? clampedBf <= 22 : clampedBf <= 33;

    return {
      bodyFatPct: clampedBf.toFixed(1),
      category: cat,
      fatMassLbs: Math.round(fatMass),
      leanMassLbs: Math.round(leanMass),
      meetsNavyStandard: meetsNavy,
    };
  }, [gender, weightLbs, heightInches, neckInches, waistInches, hipInches]);

  const handleCopy = async () => {
    const summary = `US Navy Body Fat Assessment (${gender.toUpperCase()}, ${weightLbs} lbs, ${heightInches} in):\n• Body Fat Percentage: ${bodyFatPct}%\n• Body Composition Category: ${category}\n• Total Fat Mass: ${fatMassLbs} lbs\n• Total Lean Body Mass: ${leanMassLbs} lbs\n• US Navy Readiness Standard: ${meetsNavyStandard ? "PASS (Within Standard)" : "EXCEEDS STANDARD"}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Gender Switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => setGender("male")}
          className={`px-4 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
            gender === "male" ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
          }`}
        >
          Male Formula
        </button>
        <button
          onClick={() => setGender("female")}
          className={`px-4 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
            gender === "female" ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
          }`}
        >
          Female Formula
        </button>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-3 bg-card border border-border rounded-xl space-y-1">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Weight (lbs)
          </label>
          <input
            type="number"
            min={60}
            max={500}
            value={weightLbs}
            onChange={(e) => setWeightLbs(Math.max(50, parseFloat(e.target.value) || 50))}
            className="w-full px-3 py-1.5 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-3 bg-card border border-border rounded-xl space-y-1">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Height (Inches)
          </label>
          <input
            type="number"
            min={48}
            max={96}
            value={heightInches}
            onChange={(e) => setHeightInches(Math.max(40, parseFloat(e.target.value) || 40))}
            className="w-full px-3 py-1.5 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground font-mono">
            {Math.floor(heightInches / 12)}'{heightInches % 12}"
          </span>
        </div>

        <div className="p-3 bg-card border border-border rounded-xl space-y-1">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Neck (Inches)
          </label>
          <input
            type="number"
            min={10}
            max={30}
            step={0.25}
            value={neckInches}
            onChange={(e) => setNeckInches(Math.max(8, parseFloat(e.target.value) || 8))}
            className="w-full px-3 py-1.5 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Around Adam's apple</span>
        </div>

        <div className="p-3 bg-card border border-border rounded-xl space-y-1">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Waist (Inches)
          </label>
          <input
            type="number"
            min={20}
            max={65}
            step={0.25}
            value={waistInches}
            onChange={(e) => setWaistInches(Math.max(15, parseFloat(e.target.value) || 15))}
            className="w-full px-3 py-1.5 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Navel / belly button</span>
        </div>

        {gender === "female" && (
          <div className="p-3 bg-card border border-border rounded-xl space-y-1">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              Hips (Inches)
            </label>
            <input
              type="number"
              min={25}
              max={70}
              step={0.25}
              value={hipInches}
              onChange={(e) => setHipInches(Math.max(20, parseFloat(e.target.value) || 20))}
              className="w-full px-3 py-1.5 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
            />
            <span className="text-[10px] text-muted-foreground">Widest point of buttocks</span>
          </div>
        )}
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-500" />
            US Navy Body Composition &amp; Fitness Category
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
              Body Fat
            </span>
            <p className="text-3xl font-extrabold text-foreground">{bodyFatPct}%</p>
            <span className="text-[10px] text-muted-foreground font-sans">Category: {category}</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Fat Mass</span>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{fatMassLbs} lbs</p>
            <span className="text-[10px] text-muted-foreground font-sans">Adipose body tissue</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Lean Body Mass
            </span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{leanMassLbs} lbs</p>
            <span className="text-[10px] text-muted-foreground font-sans">Muscle, bone, water, organs</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Navy Standard</span>
            <p className={`text-xl font-bold ${meetsNavyStandard ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
              {meetsNavyStandard ? "PASS" : "EXCEEDS"}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">
              {gender === "male" ? "≤22% Navy standard" : "≤33% Navy standard"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
