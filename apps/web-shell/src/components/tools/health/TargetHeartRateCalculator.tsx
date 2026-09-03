"use client";

import { useState, useMemo } from "react";
import { Heart, Activity, Copy, Check, Sparkles, Flame, ShieldAlert, Zap } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function TargetHeartRateCalculator() {
  const [age, setAge] = useState<number>(35);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [selectedFormula, setSelectedFormula] = useState<"tanaka" | "fox" | "gellish" | "fairbarn">("tanaka");
  const [copied, setCopied] = useState<boolean>(false);

  const {
    tanakaMax,
    foxMax,
    gellishMax,
    fairbarnMax,
    activeMaxHr,
    targetZones,
  } = useMemo(() => {
    const fox = Math.round(220 - age);
    const tanaka = Math.round(208 - 0.7 * age);
    const gellish = Math.round(207 - 0.7 * age);
    const fairbarn = gender === "male"
      ? Math.round(201 - 0.63 * age)
      : Math.round(216 - 1.09 * age);

    let active = tanaka;
    if (selectedFormula === "fox") active = fox;
    if (selectedFormula === "gellish") active = gellish;
    if (selectedFormula === "fairbarn") active = fairbarn;

    const calcBpm = (pct: number) => Math.round(active * pct);

    const zones = [
      {
        name: "Warm-Up / Active Health",
        pct: "50% – 60%",
        range: `${calcBpm(0.50)} – ${calcBpm(0.60)} bpm`,
        desc: "Low-intensity recovery, blood pressure reduction, and joint lubrication.",
        color: "text-blue-500 border-blue-500/30",
      },
      {
        name: "Fat Burn / Aerobic Fitness",
        pct: "60% – 70%",
        range: `${calcBpm(0.60)} – ${calcBpm(0.70)} bpm`,
        desc: "Higher percentage of calories burned from fat, builds basic endurance.",
        color: "text-emerald-500 border-emerald-500/30",
      },
      {
        name: "Aerobic / Cardio Power",
        pct: "70% – 85%",
        range: `${calcBpm(0.70)} – ${calcBpm(0.85)} bpm`,
        desc: "Increases cardiovascular capacity, lung volume, and aerobic stamina.",
        color: "text-amber-500 border-amber-500/30",
      },
      {
        name: "Anaerobic / Peak Intensity",
        pct: "85% – 95%",
        range: `${calcBpm(0.85)} – ${calcBpm(0.95)} bpm`,
        desc: "High-intensity interval training (HIIT), fast-twitch muscle recruitment.",
        color: "text-rose-500 border-rose-500/30",
      },
    ];

    return {
      tanakaMax: tanaka,
      foxMax: fox,
      gellishMax: gellish,
      fairbarnMax: fairbarn,
      activeMaxHr: active,
      targetZones: zones,
    };
  }, [age, gender, selectedFormula]);

  const handleCopy = async () => {
    const summary = `Target Heart Rate Zone Analysis (Age: ${age}, Gender: ${gender}, Formula: ${selectedFormula.toUpperCase()} = ${activeMaxHr} bpm):\n` +
      targetZones.map((z) => `• ${z.name} (${z.pct}): ${z.range} — ${z.desc}`).join("\n") +
      `\nFormula Comparison:\n• Tanaka (2001): ${tanakaMax} bpm\n• Fox (220-age): ${foxMax} bpm\n• Gellish (2007): ${gellishMax} bpm\n• Fairbarn (Gender-adjusted): ${fairbarnMax} bpm`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Age (Years)
          </label>
          <input
            type="number"
            min={10}
            max={100}
            value={age}
            onChange={(e) => setAge(Math.max(10, parseInt(e.target.value) || 10))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Biological Sex
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setGender("male")}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors ${
                gender === "male" ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
              }`}
            >
              Male
            </button>
            <button
              onClick={() => setGender("female")}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors ${
                gender === "female" ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
              }`}
            >
              Female
            </button>
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Active Clinical Formula
          </label>
          <select
            value={selectedFormula}
            onChange={(e) => setSelectedFormula(e.target.value as any)}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value="tanaka">Tanaka (208 - 0.7×Age) - Recommended</option>
            <option value="fox">Fox &amp; Haskell (220 - Age) - Gym Standard</option>
            <option value="gellish">Gellish (207 - 0.7×Age) - Senior/Active</option>
            <option value="fairbarn">Fairbarn (Sex-Adjusted)</option>
          </select>
        </div>
      </div>

      {/* Formula Comparison Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div
          onClick={() => setSelectedFormula("tanaka")}
          className={`p-3 rounded-xl border cursor-pointer transition-colors ${
            selectedFormula === "tanaka" ? "bg-blue-600/10 border-blue-600 ring-1 ring-blue-600" : "bg-card border-border hover:bg-muted"
          }`}
        >
          <span className="text-[10px] text-muted-foreground uppercase font-sans font-semibold block">Tanaka (Clinical)</span>
          <p className="text-xl font-bold text-foreground mt-0.5">{tanakaMax} bpm</p>
          <span className="text-[10px] text-muted-foreground font-sans">208 - 0.7×age</span>
        </div>

        <div
          onClick={() => setSelectedFormula("fox")}
          className={`p-3 rounded-xl border cursor-pointer transition-colors ${
            selectedFormula === "fox" ? "bg-blue-600/10 border-blue-600 ring-1 ring-blue-600" : "bg-card border-border hover:bg-muted"
          }`}
        >
          <span className="text-[10px] text-muted-foreground uppercase font-sans font-semibold block">Fox (Gym Baseline)</span>
          <p className="text-xl font-bold text-foreground mt-0.5">{foxMax} bpm</p>
          <span className="text-[10px] text-muted-foreground font-sans">220 - age</span>
        </div>

        <div
          onClick={() => setSelectedFormula("gellish")}
          className={`p-3 rounded-xl border cursor-pointer transition-colors ${
            selectedFormula === "gellish" ? "bg-blue-600/10 border-blue-600 ring-1 ring-blue-600" : "bg-card border-border hover:bg-muted"
          }`}
        >
          <span className="text-[10px] text-muted-foreground uppercase font-sans font-semibold block">Gellish (Adults)</span>
          <p className="text-xl font-bold text-foreground mt-0.5">{gellishMax} bpm</p>
          <span className="text-[10px] text-muted-foreground font-sans">207 - 0.7×age</span>
        </div>

        <div
          onClick={() => setSelectedFormula("fairbarn")}
          className={`p-3 rounded-xl border cursor-pointer transition-colors ${
            selectedFormula === "fairbarn" ? "bg-blue-600/10 border-blue-600 ring-1 ring-blue-600" : "bg-card border-border hover:bg-muted"
          }`}
        >
          <span className="text-[10px] text-muted-foreground uppercase font-sans font-semibold block">Fairbarn (Sex)</span>
          <p className="text-xl font-bold text-foreground mt-0.5">{fairbarnMax} bpm</p>
          <span className="text-[10px] text-muted-foreground font-sans">Gender regression</span>
        </div>
      </div>

      {/* Target Zones Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            Target Heart Rate Training Zones (Max: {activeMaxHr} BPM)
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Target Zones"}</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {targetZones.map((z, idx) => (
            <div
              key={idx}
              className={`p-3.5 bg-card rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${z.color}`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-foreground font-sans">{z.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-mono font-semibold text-muted-foreground">
                    {z.pct} Max HR
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-sans">{z.desc}</p>
              </div>
              <span className="font-mono text-base font-extrabold text-foreground whitespace-nowrap">
                {z.range}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
