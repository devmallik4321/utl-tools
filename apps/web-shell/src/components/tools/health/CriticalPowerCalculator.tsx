"use client";

import { useState, useMemo } from "react";
import { Zap, Activity, Flame, ShieldAlert, Copy, Check, Info, TrendingUp, Clock, Target } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function CriticalPowerCalculator() {
  const [weightKg, setWeightKg] = useState<number>(72);

  // Trial 1: Short All-Out (e.g., 3 minutes = 180 sec)
  const [t1Min, setT1Min] = useState<number>(3);
  const [t1Sec, setT1Sec] = useState<number>(0);
  const [p1Watts, setP1Watts] = useState<number>(360);

  // Trial 2: Long All-Out (e.g., 12 minutes = 720 sec)
  const [t2Min, setT2Min] = useState<number>(12);
  const [t2Sec, setT2Sec] = useState<number>(0);
  const [p2Watts, setP2Watts] = useState<number>(280);

  // Target attack power for exhaustion prediction
  const [attackPower, setAttackPower] = useState<number>(340);

  const [copied, setCopied] = useState<boolean>(false);

  const results = useMemo(() => {
    const t1 = t1Min * 60 + t1Sec;
    const t2 = t2Min * 60 + t2Sec;

    if (t1 <= 0 || t2 <= 0 || t2 <= t1 || p1Watts <= 0 || p2Watts <= 0) {
      return {
        isValid: false,
        error: "Trial 2 duration must be strictly longer than Trial 1, with positive power values.",
        cpWatts: 0,
        cpWkg: 0,
        wPrimeJoules: 0,
        wPrimeKj: 0,
        timeToExhaustionSec: 0,
        durations: [],
        zones: [],
      };
    }

    const work1 = p1Watts * t1; // Joules
    const work2 = p2Watts * t2; // Joules

    // Monod & Scherrer 2-parameter model:
    // W = CP * t + W'
    // CP = (W2 - W1) / (t2 - t1)
    const cp = (work2 - work1) / (t2 - t1);
    const wPrime = work1 - cp * t1; // Joules

    if (cp <= 0 || wPrime <= 0) {
      return {
        isValid: false,
        error: "Non-physiological result: Trial 1 power must be higher than Trial 2 power.",
        cpWatts: 0,
        cpWkg: 0,
        wPrimeJoules: 0,
        wPrimeKj: 0,
        timeToExhaustionSec: 0,
        durations: [],
        zones: [],
      };
    }

    const cpWkg = weightKg > 0 ? cp / weightKg : 0;
    const wPrimeKj = wPrime / 1000;

    // Time to exhaustion at attack power (if > CP)
    let tte = 0;
    if (attackPower > cp) {
      tte = wPrime / (attackPower - cp);
    }

    // Standard predicted power across durations: P(t) = CP + W' / t
    const testDurations = [
      { label: "1 min (60s)", sec: 60 },
      { label: "3 min (180s)", sec: 180 },
      { label: "5 min (300s)", sec: 300 },
      { label: "10 min (600s)", sec: 600 },
      { label: "20 min (1200s)", sec: 1200 },
      { label: "60 min (3600s)", sec: 3600 },
    ].map((d) => {
      const pred = cp + wPrime / d.sec;
      return {
        label: d.label,
        watts: Math.round(pred),
        wkg: (pred / weightKg).toFixed(2),
      };
    });

    // 6 Training Zones based on CP
    const zones = [
      { name: "Zone 1: Active Recovery", range: `< ${Math.round(cp * 0.55)} W`, desc: "Easy spinning, lactate clearing" },
      { name: "Zone 2: Aerobic Endurance", range: `${Math.round(cp * 0.56)} – ${Math.round(cp * 0.75)} W`, desc: "Mitochondrial & fat oxidation base" },
      { name: "Zone 3: Tempo / Sweet Spot", range: `${Math.round(cp * 0.76)} – ${Math.round(cp * 0.90)} W`, desc: "Sustained aerobic cruising" },
      { name: "Zone 4: Critical Power (Threshold)", range: `${Math.round(cp * 0.91)} – ${Math.round(cp * 1.05)} W`, desc: "Max steady state (quasi-infinite W')" },
      { name: "Zone 5: VO2 Max (Supra-CP)", range: `${Math.round(cp * 1.06)} – ${Math.round(cp * 1.25)} W`, desc: "Rapid W' depletion, high glycolytic rate" },
      { name: "Zone 6: Anaerobic Capacity", range: `> ${Math.round(cp * 1.26)} W`, desc: "Near instantaneous W' drain" },
    ];

    return {
      isValid: true,
      error: null,
      cpWatts: Math.round(cp),
      cpWkg: parseFloat(cpWkg.toFixed(2)),
      wPrimeJoules: Math.round(wPrime),
      wPrimeKj: parseFloat(wPrimeKj.toFixed(1)),
      timeToExhaustionSec: Math.round(tte),
      durations: testDurations,
      zones,
    };
  }, [t1Min, t1Sec, p1Watts, t2Min, t2Sec, p2Watts, weightKg, attackPower]);

  const handleCopy = async () => {
    if (!results.isValid) return;
    const text = `Monod & Scherrer Critical Power (CP) & W' Analysis:
• Critical Power (CP): ${results.cpWatts} Watts (${results.cpWkg} W/kg)
• Anaerobic Work Capacity (W'): ${results.wPrimeKj} kJ (${results.wPrimeJoules.toLocaleString()} J)
• Athlete Weight: ${weightKg} kg
--------------------------------------------------
TIME TRIAL INPUTS:
• Trial 1: ${t1Min}m ${t1Sec}s @ ${p1Watts} Watts
• Trial 2: ${t2Min}m ${t2Sec}s @ ${p2Watts} Watts
--------------------------------------------------
TIME TO EXHAUSTION (TTE):
• Exhaustion at ${attackPower} Watts: ${results.timeToExhaustionSec > 0 ? `${Math.floor(results.timeToExhaustionSec / 60)}m ${results.timeToExhaustionSec % 60}s` : "Sustainable (Below CP)"}
--------------------------------------------------
PREDICTED POWER PROFILE:
${results.durations.map((d) => `• ${d.label}: ${d.watts} W (${d.wkg} W/kg)`).join("\n")}`;

    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Athlete Weight & Context */}
      <div className="p-4 bg-card border border-border rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Monod &amp; Scherrer 2-Parameter Critical Power (CP) &amp; W&apos; Model
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">
            Body Weight (kg):
          </label>
          <input
            type="number"
            min={30}
            max={180}
            value={weightKg}
            onChange={(e) => setWeightKg(Math.max(1, parseFloat(e.target.value) || 1))}
            className="w-20 px-2 py-1 text-sm font-mono font-bold bg-background border border-border rounded-md text-foreground"
          />
        </div>
      </div>

      {/* Two All-Out Trials */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Trial 1 */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              Trial 1: Short Duration All-Out (e.g. 3 min)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase block">
                Duration (Min : Sec)
              </label>
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={t1Min}
                  onChange={(e) => setT1Min(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-2 py-1.5 text-sm font-mono font-bold bg-background border border-border rounded-md text-foreground text-center"
                />
                <span className="font-mono text-muted-foreground">:</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={t1Sec}
                  onChange={(e) => setT1Sec(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-full px-2 py-1.5 text-sm font-mono font-bold bg-background border border-border rounded-md text-foreground text-center"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase block">
                Average Power (Watts)
              </label>
              <input
                type="number"
                step={5}
                value={p1Watts}
                onChange={(e) => setP1Watts(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full mt-1 px-3 py-1.5 text-sm font-mono font-bold bg-background border border-border rounded-md text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Trial 2 */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-500" />
              Trial 2: Long Duration All-Out (e.g. 12 min)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase block">
                Duration (Min : Sec)
              </label>
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={t2Min}
                  onChange={(e) => setT2Min(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-2 py-1.5 text-sm font-mono font-bold bg-background border border-border rounded-md text-foreground text-center"
                />
                <span className="font-mono text-muted-foreground">:</span>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={t2Sec}
                  onChange={(e) => setT2Sec(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-full px-2 py-1.5 text-sm font-mono font-bold bg-background border border-border rounded-md text-foreground text-center"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase block">
                Average Power (Watts)
              </label>
              <input
                type="number"
                step={5}
                value={p2Watts}
                onChange={(e) => setP2Watts(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full mt-1 px-3 py-1.5 text-sm font-mono font-bold bg-background border border-border rounded-md text-foreground"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results KPIs */}
      {results.isValid ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
              Critical Power (CP)
            </span>
            <div className="text-3xl font-mono font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {results.cpWatts} <span className="text-lg">Watts</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              {results.cpWkg} W/kg • True Aerobic Ceiling
            </p>
          </div>

          <div className="p-5 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl">
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
              W&apos; (Anaerobic Capacity)
            </span>
            <div className="text-3xl font-mono font-black text-indigo-600 dark:text-indigo-400 mt-1">
              {results.wPrimeKj} <span className="text-lg">kJ</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              {results.wPrimeJoules.toLocaleString()} Joules battery above CP
            </p>
          </div>

          <div className="p-5 bg-card border border-border rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                Attack Exhaustion Simulator
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground rounded border border-border transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                step={5}
                value={attackPower}
                onChange={(e) => setAttackPower(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-24 px-2 py-1 text-xs font-mono font-bold bg-background border border-border rounded text-foreground"
              />
              <span className="text-xs text-muted-foreground">Watts attack</span>
            </div>
            <p className="text-xs font-semibold text-foreground mt-2">
              {attackPower > results.cpWatts ? (
                <>
                  Battery empty in:{" "}
                  <span className="text-rose-500 font-mono font-bold">
                    {Math.floor(results.timeToExhaustionSec / 60)}m {results.timeToExhaustionSec % 60}s
                  </span>
                </>
              ) : (
                <span className="text-emerald-500 font-medium">Sustainable indefinitely below CP</span>
              )}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-500 text-xs">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{results.error}</span>
        </div>
      )}

      {/* Predicted Power & Training Zones */}
      {results.isValid && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Predicted Duration Power */}
          <div className="p-4 bg-card border border-border rounded-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Target className="w-4 h-4 text-primary" />
              Modeled Power-Duration Curve
            </h4>
            <div className="divide-y divide-border/60">
              {results.durations.map((d) => (
                <div key={d.label} className="py-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">{d.label}</span>
                  <div className="font-mono text-right">
                    <span className="font-bold text-foreground">{d.watts} W</span>
                    <span className="text-muted-foreground ml-2 text-[11px]">({d.wkg} W/kg)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Power Training Zones */}
          <div className="p-4 bg-card border border-border rounded-xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-primary" />
              CP-Calibrated Training Zones
            </h4>
            <div className="divide-y divide-border/60">
              {results.zones.map((z) => (
                <div key={z.name} className="py-1.5 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <div>
                    <span className="font-semibold text-foreground block">{z.name}</span>
                    <span className="text-[11px] text-muted-foreground">{z.desc}</span>
                  </div>
                  <span className="font-mono font-bold text-primary shrink-0 sm:text-right">
                    {z.range}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
