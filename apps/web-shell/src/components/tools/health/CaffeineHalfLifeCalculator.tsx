"use client";

import { useState, useMemo } from "react";
import { Coffee, Moon, Clock, Copy, Check, Sparkles, Activity, AlertCircle } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const DRINK_PRESETS = [
  { name: "Brewed Coffee (8 oz)", mg: 95 },
  { name: "Double Espresso (2 oz)", mg: 150 },
  { name: "Cold Brew (12 oz)", mg: 200 },
  { name: "Energy Drink (16 oz)", mg: 160 },
  { name: "Matcha / Green Tea", mg: 35 },
  { name: "Black Tea (8 oz)", mg: 47 },
];

export function CaffeineHalfLifeCalculator() {
  const [caffeineMg, setCaffeineMg] = useState<number>(150);
  const [drinkTime, setDrinkTime] = useState<string>("14:00"); // 2:00 PM
  const [bedTime, setBedTime] = useState<string>("23:00"); // 11:00 PM
  const [copied, setCopied] = useState<boolean>(false);

  const { elapsedHours, remainingAtBedtime, safeClearTimeStr, sleepRiskLevel } = useMemo(() => {
    const halfLife = 5.7; // average human half-life in hours

    const [dHours, dMins] = drinkTime.split(":").map(Number);
    const [bHours, bMins] = bedTime.split(":").map(Number);

    let diffHours = bHours + bMins / 60 - (dHours + dMins / 60);
    if (diffHours < 0) diffHours += 24; // spans midnight

    // C(t) = C0 * 0.5^(t / halfLife)
    const remaining = caffeineMg * Math.pow(0.5, diffHours / halfLife);

    // Time to clear below 25mg:
    // 25 = C0 * 0.5^(t / halfLife) => log(25/C0) = (t/halfLife) * log(0.5)
    let hoursToSafe = 0;
    if (caffeineMg > 25) {
      hoursToSafe = halfLife * (Math.log(25 / caffeineMg) / Math.log(0.5));
    }
    const safeDate = new Date();
    safeDate.setHours(dHours, dMins + hoursToSafe * 60, 0, 0);
    const safeTimeStr = safeDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

    let risk = "Low Impact";
    if (remaining > 50) risk = "High Sleep Disruption";
    else if (remaining > 25) risk = "Moderate Sleep Delay";

    return {
      elapsedHours: diffHours.toFixed(1),
      remainingAtBedtime: Math.round(remaining),
      safeClearTimeStr: safeTimeStr,
      sleepRiskLevel: risk,
    };
  }, [caffeineMg, drinkTime, bedTime]);

  const handleCopy = async () => {
    const summary = `Caffeine Half-Life Sleep Impact (${caffeineMg} mg consumed at ${drinkTime}):\n• Bloodstream Caffeine at Bedtime (${bedTime}): ~${remainingAtBedtime} mg (${elapsedHours} hours elapsed)\n• Sleep Disruption Level: ${sleepRiskLevel}\n• Clears Below 25 mg Threshold at: ${safeClearTimeStr}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Drink Presets */}
      <div className="flex flex-wrap gap-2">
        {DRINK_PRESETS.map((d) => (
          <button
            key={d.name}
            onClick={() => setCaffeineMg(d.mg)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
              caffeineMg === d.mg
                ? "bg-amber-600 text-white border-amber-600"
                : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            {d.name} ({d.mg} mg)
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Caffeine Amount (mg)
          </label>
          <input
            type="number"
            min={10}
            max={1000}
            value={caffeineMg}
            onChange={(e) => setCaffeineMg(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-amber-600 dark:text-amber-400"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Consumption Time
          </label>
          <input
            type="time"
            value={drinkTime}
            onChange={(e) => setDrinkTime(e.target.value)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Planned Bedtime
          </label>
          <input
            type="time"
            value={bedTime}
            onChange={(e) => setBedTime(e.target.value)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-500" />
            Caffeine Bloodstream Level at Bedtime
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
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Remaining at Bed</span>
            <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">~{remainingAtBedtime} mg</p>
            <span className="text-[10px] text-muted-foreground font-sans">Active in bloodstream</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Elapsed Window</span>
            <p className="text-2xl font-bold text-foreground">{elapsedHours} hrs</p>
            <span className="text-[10px] text-muted-foreground font-sans">Between drink and sleep</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Sleep Impact</span>
            <p
              className={`text-lg font-bold ${
                remainingAtBedtime > 50
                  ? "text-rose-600 dark:text-rose-400"
                  : remainingAtBedtime > 25
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {sleepRiskLevel}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">&lt; 25 mg recommended for deep sleep</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Clears Below 25mg</span>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{safeClearTimeStr}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Optimal restorative sleep time</span>
          </div>
        </div>
      </div>
    </div>
  );
}
