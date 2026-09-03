"use client";

import { useState, useMemo } from "react";
import { Heart, Activity, Copy, Check, Sparkles, Flame, ShieldAlert, Zap } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function KarvonenHeartRateCalculator() {
  const [age, setAge] = useState<number>(32);
  const [restingHr, setRestingHr] = useState<number>(60); // bpm
  const [maxHrOverride, setMaxHrOverride] = useState<number | "">(""); // optional custom max HR
  const [copied, setCopied] = useState<boolean>(false);

  const {
    maxHr,
    hrr,
    zones,
  } = useMemo(() => {
    // Tanaka formula for Max HR: 208 - (0.7 * age)
    const defaultMax = Math.round(208 - 0.7 * age);
    const finalMax = typeof maxHrOverride === "number" && maxHrOverride > 0 ? maxHrOverride : defaultMax;
    const reserve = Math.max(10, finalMax - restingHr);

    const calcZone = (minPct: number, maxPct: number) => {
      const minBpm = Math.round(reserve * minPct + restingHr);
      const maxBpm = Math.round(reserve * maxPct + restingHr);
      return `${minBpm} – ${maxBpm} bpm`;
    };

    const zoneList = [
      {
        zone: "Zone 1: Active Recovery",
        pct: "50% – 60%",
        range: calcZone(0.50, 0.60),
        benefit: "Warm-up, cooldown, active recovery, and low-stress blood flow.",
        color: "text-blue-500 border-blue-500/30",
      },
      {
        zone: "Zone 2: Aerobic Base (Longevity)",
        pct: "60% – 70%",
        range: calcZone(0.60, 0.70),
        benefit: "Mitochondrial biogenesis, optimal fat oxidation, and cardiac stroke volume.",
        color: "text-emerald-500 border-emerald-500/30",
      },
      {
        zone: "Zone 3: Tempo / Aerobic Endurance",
        pct: "70% – 80%",
        range: calcZone(0.70, 0.80),
        benefit: "Carbohydrate metabolism, moderate lactate clearance, and marathon pace.",
        color: "text-amber-500 border-amber-500/30",
      },
      {
        zone: "Zone 4: Anaerobic / Lactate Threshold",
        pct: "80% – 90%",
        range: calcZone(0.80, 0.90),
        benefit: "Increases lactate threshold, high-intensity intervals, and 5K/10K race pace.",
        color: "text-orange-500 border-orange-500/30",
      },
      {
        zone: "Zone 5: VO2 Max / Neuromuscular",
        pct: "90% – 100%",
        range: calcZone(0.90, 1.00),
        benefit: "Peak power, sprint intervals, and maximal oxygen consumption.",
        color: "text-rose-500 border-rose-500/30",
      },
    ];

    return {
      maxHr: finalMax,
      hrr: reserve,
      zones: zoneList,
    };
  }, [age, restingHr, maxHrOverride]);

  const handleCopy = async () => {
    const summary = `Karvonen Heart Rate Reserve (HRR) Training Zones (Age: ${age}, Resting HR: ${restingHr} bpm, Max HR: ${maxHr} bpm, HRR: ${hrr} bpm):\n` +
      zones.map((z) => `• ${z.zone} (${z.pct}): ${z.range} — ${z.benefit}`).join("\n");
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
            onChange={(e) => setAge(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Resting Heart Rate (BPM)
          </label>
          <input
            type="number"
            min={30}
            max={120}
            value={restingHr}
            onChange={(e) => setRestingHr(Math.max(30, parseInt(e.target.value) || 30))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-rose-600 dark:text-rose-400"
          />
          <span className="text-[10px] text-muted-foreground">Measured right after waking up</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Max HR Override (Optional)
          </label>
          <input
            type="number"
            min={100}
            max={230}
            value={maxHrOverride}
            placeholder={`Tanaka: ${Math.round(208 - 0.7 * age)} bpm`}
            onChange={(e) => setMaxHrOverride(e.target.value ? parseInt(e.target.value) : "")}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Leave empty to use Tanaka clinical formula</span>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            Heart Rate Reserve Metrics &amp; Clinically Adjusted Zones
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Zones"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Estimated Max HR
            </span>
            <p className="text-3xl font-extrabold text-foreground">{maxHr} bpm</p>
            <span className="text-[10px] text-muted-foreground font-sans">Tanaka / tested ceiling</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Resting HR Floor
            </span>
            <p className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">{restingHr} bpm</p>
            <span className="text-[10px] text-muted-foreground font-sans">Baseline cardiac output</span>
          </div>

          <div className="p-4 bg-card rounded-xl border-2 border-emerald-500/40 space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase font-sans">
              Heart Rate Reserve (HRR)
            </span>
            <p className="text-3xl font-extrabold text-foreground">{hrr} bpm</p>
            <span className="text-[10px] text-muted-foreground font-sans">Usable training dynamic range</span>
          </div>
        </div>

        {/* Zones Breakdown List */}
        <div className="space-y-2.5">
          {zones.map((z, idx) => (
            <div
              key={idx}
              className={`p-3.5 bg-card rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${z.color}`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-foreground font-sans">{z.zone}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-mono font-semibold text-muted-foreground">
                    {z.pct} HRR
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-sans">{z.benefit}</p>
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
