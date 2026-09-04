"use client";

import { useState, useMemo } from "react";
import { Activity, Flame, Zap, Target, Copy, Check, TrendingUp, Info } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function MasRunningIntervalsCalculator() {
  const [testProtocol, setTestProtocol] = useState<"five_min" | "distance">("five_min");

  // 5-min test input (Distance in meters ran in 300s)
  const [fiveMinMeters, setFiveMinMeters] = useState<number>(1400); // 1400m in 5 mins -> 4.67 m/s

  // Fixed distance test input
  const [distanceMeters, setDistanceMeters] = useState<number>(1500);
  const [timeMin, setTimeMin] = useState<number>(5);
  const [timeSec, setTimeSec] = useState<number>(30);

  const [copied, setCopied] = useState<boolean>(false);

  const results = useMemo(() => {
    let masMs = 0;

    if (testProtocol === "five_min") {
      masMs = fiveMinMeters > 0 ? fiveMinMeters / 300 : 0;
    } else {
      const totalSec = timeMin * 60 + timeSec;
      masMs = totalSec > 0 ? distanceMeters / totalSec : 0;
    }

    const masKmh = masMs * 3.6;
    const paceSecPerKm = masKmh > 0 ? 3600 / masKmh : 0;
    const paceMin = Math.floor(paceSecPerKm / 60);
    const paceSec = Math.round(paceSecPerKm % 60);
    const paceKm = `${paceMin}:${paceSec.toString().padStart(2, "0")} /km`;

    // ACSM formula: VO2max ≈ 3.5 * MAS(km/h)
    const estimatedVo2 = 3.5 * masKmh;

    // HIIT Interval Prescriptions
    const protocols = [
      {
        name: "120% MAS Short Intervals (15:15s Eurofit)",
        intensity: "120% MAS",
        workSec: 15,
        restSec: 15,
        reps: "2 sets of 8-10 reps",
        repDistanceM: Math.round(masMs * 1.2 * 15),
        desc: "Classic Dan Baker pitch conditioning. Run target distance in exactly 15s, rest 15s.",
      },
      {
        name: "115% MAS Medium Intervals (30:30s)",
        intensity: "115% MAS",
        workSec: 30,
        restSec: 30,
        reps: "1-2 sets of 6-8 reps",
        repDistanceM: Math.round(masMs * 1.15 * 30),
        desc: "High aerobic volume with sustained heart rate near 95% HRmax.",
      },
      {
        name: "130% MAS Supramaximal HIIT (Tabata 20:10s)",
        intensity: "130% MAS",
        workSec: 20,
        restSec: 10,
        reps: "8 reps (4 minutes total)",
        repDistanceM: Math.round(masMs * 1.3 * 20),
        desc: "Severe anaerobic glycolysis demand and maximal cardiovascular pump.",
      },
      {
        name: "100% MAS Aerobic Grid (Pitch Box)",
        intensity: "100% MAS (Work) / 70% MAS (Rest)",
        workSec: 15,
        restSec: 15,
        reps: "6-8 laps around rectangle",
        repDistanceM: Math.round(masMs * 1.0 * 15),
        desc: "Straightaway run at 100% MAS, cross end-line recovery at 70% MAS.",
      },
    ];

    return {
      masMs: masMs.toFixed(2),
      masKmh: masKmh.toFixed(1),
      paceKm,
      estimatedVo2: estimatedVo2.toFixed(1),
      protocols,
    };
  }, [testProtocol, fiveMinMeters, distanceMeters, timeMin, timeSec]);

  const handleCopy = async () => {
    const text = `Maximum Aerobic Speed (MAS) & HIIT Prescription:
• MAS: ${results.masMs} m/s (${results.masKmh} km/h)
• 100% MAS Pace: ${results.paceKm}
• Estimated VO2 Max: ${results.estimatedVo2} mL/kg/min
--------------------------------------------------
TARGET CONE DISTANCES FOR INTERVAL TRAINING:
${results.protocols.map((p) => `• ${p.name}:
  - Distance: ${p.repDistanceM} meters in ${p.workSec}s
  - Recovery: ${p.restSec}s passive rest
  - Volume: ${p.reps}`).join("\n")}
--------------------------------------------------
Methodology: Dan Baker & Eurofit MAS sports science protocol.`;

    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Protocol Selector */}
      <div className="p-4 bg-card border border-border rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Maximum Aerobic Speed (MAS) Running Assessment
          </span>
        </div>
        <div className="flex bg-secondary p-0.5 rounded-lg border border-border">
          <button
            onClick={() => setTestProtocol("five_min")}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
              testProtocol === "five_min"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            5-Minute Time Trial
          </button>
          <button
            onClick={() => setTestProtocol("distance")}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
              testProtocol === "distance"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Fixed Distance (1500m / 2000m)
          </button>
        </div>
      </div>

      {/* Inputs */}
      {testProtocol === "five_min" ? (
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Distance Covered in 5 Minutes (Meters)
          </label>
          <input
            type="number"
            step={25}
            value={fiveMinMeters}
            onChange={(e) => setFiveMinMeters(Math.max(100, parseFloat(e.target.value) || 100))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
          <span className="text-[11px] text-muted-foreground block">
            Typical athletic range: 1,200m (recreational) to 1,650m (elite) in 300 seconds.
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-card border border-border rounded-xl space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              Time Trial Distance (Meters)
            </label>
            <input
              type="number"
              step={100}
              value={distanceMeters}
              onChange={(e) => setDistanceMeters(Math.max(100, parseFloat(e.target.value) || 100))}
              className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
            />
          </div>

          <div className="p-4 bg-card border border-border rounded-xl space-y-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              Time Taken (Min : Sec)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={59}
                value={timeMin}
                onChange={(e) => setTimeMin(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground text-center"
              />
              <span className="font-mono text-muted-foreground">:</span>
              <input
                type="number"
                min={0}
                max={59}
                value={timeSec}
                onChange={(e) => setTimeSec(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground text-center"
              />
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
            Maximum Aerobic Speed (MAS)
          </span>
          <div className="text-3xl font-mono font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {results.masMs} <span className="text-lg">m/s</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            {results.masKmh} km/h • Velocity at VO2 Max
          </p>
        </div>

        <div className="p-5 bg-card border border-border rounded-2xl">
          <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
            100% MAS Pace
          </span>
          <div className="text-3xl font-mono font-black text-foreground mt-1">
            {results.paceKm}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Baseline continuous threshold speed
          </p>
        </div>

        <div className="p-5 bg-card border border-border rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
              Estimated VO2 Max
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground rounded border border-border transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Copied" : "Copy Prescription"}</span>
            </button>
          </div>
          <div className="text-3xl font-mono font-black text-foreground mt-1">
            {results.estimatedVo2}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            mL / kg / min (ACSM running metabolic model)
          </p>
        </div>
      </div>

      {/* Prescribed Interval Protocols */}
      <div className="p-5 bg-card border border-border rounded-2xl space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Individualized HIIT Pitch Conditioning Protocols
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.protocols.map((p) => (
            <div key={p.name} className="p-4 bg-muted/30 border border-border rounded-xl space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-foreground">{p.name}</h4>
                  <span className="text-[11px] font-mono text-primary font-semibold">{p.intensity}</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-mono font-black text-foreground">{p.repDistanceM}m</span>
                  <span className="text-[11px] text-muted-foreground block">per {p.workSec}s rep</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{p.desc}</p>
              <div className="text-[11px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/60">
                <span>Rest: <strong className="text-foreground">{p.restSec}s</strong></span>
                <span>Volume: <strong className="text-foreground">{p.reps}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
