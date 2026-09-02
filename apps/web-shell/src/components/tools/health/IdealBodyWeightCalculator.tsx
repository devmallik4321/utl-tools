"use client";

import { useState, useMemo } from "react";
import { Scale, Heart, Copy, Check, Sparkles, Activity } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function IdealBodyWeightCalculator() {
  const [sex, setSex] = useState<"male" | "female">("male");
  const [feet, setFeet] = useState<number>(5);
  const [inches, setInches] = useState<number>(10); // 5'10"
  const [copied, setCopied] = useState<boolean>(false);

  const { devineLbs, devineKg, robinsonLbs, millerLbs, healthyBmiMinLbs, healthyBmiMaxLbs } = useMemo(() => {
    const totalInches = feet * 12 + inches;
    const inchesOver60 = Math.max(0, totalInches - 60);

    // Devine Formula (kg)
    const baseDevine = sex === "male" ? 50 : 45.5;
    const devKg = baseDevine + 2.3 * inchesOver60;
    const devLbs = devKg * 2.20462;

    // Robinson Formula (kg)
    const baseRob = sex === "male" ? 52 : 49;
    const multRob = sex === "male" ? 1.9 : 1.7;
    const robKg = baseRob + multRob * inchesOver60;
    const robLbs = robKg * 2.20462;

    // Miller Formula (kg)
    const baseMil = sex === "male" ? 56.2 : 53.1;
    const multMil = sex === "male" ? 1.41 : 1.36;
    const milKg = baseMil + multMil * inchesOver60;
    const milLbs = milKg * 2.20462;

    // Healthy BMI (18.5 to 24.9) weight in lbs
    // BMI = (weight_lbs / height_inches^2) * 703
    const heightSq = totalInches * totalInches;
    const minBmiLbs = (18.5 * heightSq) / 703;
    const maxBmiLbs = (24.9 * heightSq) / 703;

    return {
      devineLbs: Math.round(devLbs),
      devineKg: devKg.toFixed(1),
      robinsonLbs: Math.round(robLbs),
      millerLbs: Math.round(milLbs),
      healthyBmiMinLbs: Math.round(minBmiLbs),
      healthyBmiMaxLbs: Math.round(maxBmiLbs),
    };
  }, [sex, feet, inches]);

  const handleCopy = async () => {
    const summary = `Ideal Body Weight (IBW) for ${sex.toUpperCase()} (${feet}'${inches}"):\n• Devine Clinical Standard: ${devineLbs} lbs (${devineKg} kg)\n• Robinson Formula: ${robinsonLbs} lbs\n• Miller Formula: ${millerLbs} lbs\n• Healthy BMI Range (18.5 - 24.9): ${healthyBmiMinLbs} - ${healthyBmiMaxLbs} lbs`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sex Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setSex("male")}
          className={`px-4 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
            sex === "male"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-card border-border text-foreground hover:bg-muted"
          }`}
        >
          Male
        </button>
        <button
          onClick={() => setSex("female")}
          className={`px-4 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
            sex === "female"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-card border-border text-foreground hover:bg-muted"
          }`}
        >
          Female
        </button>
      </div>

      {/* Height Inputs */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2 max-w-sm">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Height (Feet &amp; Inches)
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              type="number"
              min={4}
              max={7}
              value={feet}
              onChange={(e) => setFeet(Math.max(3, parseInt(e.target.value) || 3))}
              className="w-full px-3 py-2 font-mono font-bold bg-background border border-border rounded-lg text-foreground"
            />
            <span className="text-[10px] text-muted-foreground">Feet</span>
          </div>
          <div>
            <input
              type="number"
              min={0}
              max={11}
              value={inches}
              onChange={(e) => setInches(Math.min(11, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-full px-3 py-2 font-mono font-bold bg-background border border-border rounded-lg text-foreground"
            />
            <span className="text-[10px] text-muted-foreground">Inches</span>
          </div>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-emerald-500" />
            Ideal Body Weight Clinical Projections
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Targets"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Devine Formula</span>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{devineLbs} lbs</p>
            <span className="text-[10px] text-muted-foreground font-sans">{devineKg} kg (Hospital standard)</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Robinson (1983)</span>
            <p className="text-2xl font-bold text-foreground">{robinsonLbs} lbs</p>
            <span className="text-[10px] text-muted-foreground font-sans">Empirical regression</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Miller (1983)</span>
            <p className="text-2xl font-bold text-foreground">{millerLbs} lbs</p>
            <span className="text-[10px] text-muted-foreground font-sans">Metabolic formula</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Healthy BMI Range</span>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {healthyBmiMinLbs} - {healthyBmiMaxLbs} lbs
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">18.5 to 24.9 BMI bracket</span>
          </div>
        </div>
      </div>
    </div>
  );
}
