"use client";

import React, { useState, useMemo } from "react";
import { Zap, BatteryCharging, BatteryWarning, Activity, Plus, Trash2, Copy, Check, RotateCcw, Info, Flame, Timer } from "lucide-react";

interface Interval {
  id: string;
  name: string;
  durationSec: number;
  powerWatts: number;
}

const PRESET_WORKOUTS: Record<string, { label: string; intervals: Omit<Interval, "id">[] }> = {
  microbursts: {
    label: "40/20 Microbursts (6 sets)",
    intervals: [
      { name: "Warmup", durationSec: 180, powerWatts: 150 },
      { name: "Burst 1", durationSec: 40, powerWatts: 380 },
      { name: "Recovery 1", durationSec: 20, powerWatts: 140 },
      { name: "Burst 2", durationSec: 40, powerWatts: 380 },
      { name: "Recovery 2", durationSec: 20, powerWatts: 140 },
      { name: "Burst 3", durationSec: 40, powerWatts: 380 },
      { name: "Recovery 3", durationSec: 20, powerWatts: 140 },
      { name: "Burst 4", durationSec: 40, powerWatts: 380 },
      { name: "Recovery 4", durationSec: 20, powerWatts: 140 },
      { name: "Burst 5", durationSec: 40, powerWatts: 380 },
      { name: "Recovery 5", durationSec: 20, powerWatts: 140 },
      { name: "Burst 6", durationSec: 40, powerWatts: 380 },
      { name: "Cooldown", durationSec: 180, powerWatts: 130 }
    ]
  },
  overUnders: {
    label: "2x2 Over-Unders (3 Blocks)",
    intervals: [
      { name: "Warmup", durationSec: 300, powerWatts: 160 },
      { name: "Over 1", durationSec: 120, powerWatts: 310 },
      { name: "Under 1", durationSec: 120, powerWatts: 240 },
      { name: "Over 2", durationSec: 120, powerWatts: 310 },
      { name: "Under 2", durationSec: 120, powerWatts: 240 },
      { name: "Over 3", durationSec: 120, powerWatts: 310 },
      { name: "Under 3", durationSec: 120, powerWatts: 240 },
      { name: "Cooldown", durationSec: 300, powerWatts: 140 }
    ]
  },
  breakawaySurge: {
    label: "Breakaway Attack & Settle",
    intervals: [
      { name: "Warmup", durationSec: 240, powerWatts: 180 },
      { name: "Attack!", durationSec: 45, powerWatts: 500 },
      { name: "Sustained Solo", durationSec: 180, powerWatts: 290 },
      { name: "Peloton Lull", durationSec: 120, powerWatts: 210 },
      { name: "Sprint Finish", durationSec: 25, powerWatts: 650 },
      { name: "Cooldown", durationSec: 240, powerWatts: 130 }
    ]
  }
};

export function CyclingWPrimeBalanceCalculator() {
  const [criticalPower, setCriticalPower] = useState<number>(275); // Watts (CP / FTP)
  const [wPrimeKj, setWPrimeKj] = useState<number>(20.0); // 20.0 kJ anaerobic capacity
  const [targetAttackWatts, setTargetAttackWatts] = useState<number>(400); // TTE solver target
  const [intervals, setIntervals] = useState<Interval[]>(() =>
    PRESET_WORKOUTS.microbursts.intervals.map((item, idx) => ({ ...item, id: `${idx + 1}` }))
  );

  const [copied, setCopied] = useState(false);

  // Run dynamic second-by-second Skiba W'bal simulation
  const simulation = useMemo(() => {
    const cp = Math.max(50, criticalPower);
    const w0Joules = Math.max(1000, wPrimeKj * 1000);
    let currentWPrime = w0Joules;
    let minWPrime = w0Joules;
    let minTimeSec = 0;
    let totalJoulesExpendedAboveCp = 0;
    let blownUp = false;
    let blowUpTimeSec: number | null = null;

    let globalSec = 0;

    interface IntervalSummary {
      id: string;
      name: string;
      durationSec: number;
      powerWatts: number;
      pctCp: number;
      startBalKj: number;
      startBalPct: number;
      endBalKj: number;
      endBalPct: number;
      deltaKj: number;
      isDepleting: boolean;
    }

    const intervalSummaries: IntervalSummary[] = [];

    for (const seg of intervals) {
      const startBal = currentWPrime;
      const isDepleting = seg.powerWatts > cp;

      for (let s = 0; s < seg.durationSec; s++) {
        globalSec++;
        if (seg.powerWatts > cp) {
          // Depletion: work above CP
          const expenditure = seg.powerWatts - cp;
          currentWPrime = Math.max(0, currentWPrime - expenditure);
          totalJoulesExpendedAboveCp += expenditure;
          if (currentWPrime <= 0 && !blownUp) {
            blownUp = true;
            blowUpTimeSec = globalSec;
          }
        } else {
          // Recovery: Skiba (2012) exponential reconstitution model
          const diff = cp - seg.powerWatts;
          const tau = 546 * Math.exp(-0.01 * diff) + 316;
          currentWPrime = w0Joules - (w0Joules - currentWPrime) * Math.exp(-1 / tau);
        }

        if (currentWPrime < minWPrime) {
          minWPrime = currentWPrime;
          minTimeSec = globalSec;
        }
      }

      intervalSummaries.push({
        id: seg.id,
        name: seg.name,
        durationSec: seg.durationSec,
        powerWatts: seg.powerWatts,
        pctCp: Math.round((seg.powerWatts / cp) * 100),
        startBalKj: +(startBal / 1000).toFixed(1),
        startBalPct: Math.round((startBal / w0Joules) * 100),
        endBalKj: +(currentWPrime / 1000).toFixed(1),
        endBalPct: Math.round((currentWPrime / w0Joules) * 100),
        deltaKj: +((currentWPrime - startBal) / 1000).toFixed(1),
        isDepleting
      });
    }

    const minBalPct = Math.round((minWPrime / w0Joules) * 100);
    const finalBalPct = Math.round((currentWPrime / w0Joules) * 100);

    // Time to exhaustion at current ending battery
    const tteSec =
      targetAttackWatts > cp && currentWPrime > 0
        ? Math.round(currentWPrime / (targetAttackWatts - cp))
        : 0;

    return {
      w0Kj: wPrimeKj,
      cp,
      currentBalKj: +(currentWPrime / 1000).toFixed(1),
      finalBalPct,
      minBalKj: +(minWPrime / 1000).toFixed(1),
      minBalPct,
      minTimeSec,
      totalAnaerobicKj: +(totalJoulesExpendedAboveCp / 1000).toFixed(1),
      blownUp,
      blowUpTimeSec,
      tteSec,
      intervalSummaries
    };
  }, [criticalPower, wPrimeKj, intervals, targetAttackWatts]);

  const handleApplyPreset = (key: string) => {
    const preset = PRESET_WORKOUTS[key];
    if (preset) {
      setIntervals(preset.intervals.map((item, idx) => ({ ...item, id: `${Date.now()}-${idx}` })));
    }
  };

  const handleAddInterval = () => {
    const newInt: Interval = {
      id: `${Date.now()}`,
      name: `Effort ${intervals.length + 1}`,
      durationSec: 60,
      powerWatts: Math.round(criticalPower * 1.2)
    };
    setIntervals([...intervals, newInt]);
  };

  const handleRemoveInterval = (id: string) => {
    setIntervals(intervals.filter((i) => i.id !== id));
  };

  const handleUpdateInterval = (id: string, field: keyof Interval, value: string | number) => {
    setIntervals(
      intervals.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  const handleCopy = async () => {
    const text = [
      `=== CYCLING W' BALANCE (SKIBA MODEL) AUDIT ===`,
      `Critical Power (CP / FTP): ${simulation.cp} Watts`,
      `Total Anaerobic Capacity (W'): ${simulation.w0Kj} kJ`,
      `-------------------------------------------`,
      `Minimum W' Bal Reached: ${simulation.minBalKj} kJ (${simulation.minBalPct}%) at T+${simulation.minTimeSec}s`,
      `Final W' Bal Remaining: ${simulation.currentBalKj} kJ (${simulation.finalBalPct}%)`,
      `Total Work Above CP: ${simulation.totalAnaerobicKj} kJ`,
      `Athlete Blown Up (0% Bal): ${simulation.blownUp ? `YES at T+${simulation.blowUpTimeSec}s` : "NO (Clean pacing)"}`,
      `TTE at ${targetAttackWatts}W: ${simulation.tteSec} seconds (${Math.floor(simulation.tteSec / 60)}m ${simulation.tteSec % 60}s)`,
      `===========================================`
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-200">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Skiba Dynamic Battery Model (2012 / 2015)
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Anaerobic Work Capacity
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          <Zap className="w-7 h-7 text-amber-400" />
          Cycling FTP &amp; W&apos; Balance Dynamic Battery Calculator
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2">
          Model real-time anaerobic work capacity depletion and exponential recovery (W&apos;bal) across power intervals,
          predicting physiological exhaustion and attack sustainability above Critical Power.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
            Final W&apos; Battery Bal
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400">
            {simulation.finalBalPct}%
          </div>
          <div className="text-xs text-slate-500 mt-1">{simulation.currentBalKj} kJ of {simulation.w0Kj} kJ left</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <BatteryWarning className="w-4 h-4 text-rose-400" />
            Lowest Battery Low-Point
          </div>
          <div className={`text-2xl sm:text-3xl font-bold ${simulation.minBalPct < 20 ? "text-rose-400" : "text-amber-400"}`}>
            {simulation.minBalPct}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {simulation.minBalKj} kJ at T+{simulation.minTimeSec}s
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-cyan-400" />
            Total Anaerobic Work
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-cyan-400">
            {simulation.totalAnaerobicKj} kJ
          </div>
          <div className="text-xs text-slate-500 mt-1">Expended above {simulation.cp}W CP</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Timer className="w-4 h-4 text-purple-400" />
            TTE @ {targetAttackWatts}W
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-purple-400">
            {simulation.tteSec}s
          </div>
          <div className="text-xs text-slate-500 mt-1">Time To Exhaustion until 0%</div>
        </div>
      </div>

      {/* Athlete Parameters & Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-md space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Physiological Parameters
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Critical Power (CP / FTP)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="100"
                max="550"
                step="5"
                value={criticalPower}
                onChange={(e) => setCriticalPower(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
              <span className="text-sm font-semibold text-slate-400">Watts</span>
            </div>
            <span className="text-xs text-slate-500 mt-1 block">Aerobic ceiling where anaerobic depletion begins</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              W&apos; Anaerobic Capacity (kJ: {wPrimeKj} kJ)
            </label>
            <input
              type="range"
              min="8"
              max="35"
              step="0.5"
              value={wPrimeKj}
              onChange={(e) => setWPrimeKj(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>8 kJ (Sprinter Low)</span>
              <span className="text-amber-400 font-mono">{wPrimeKj} kJ</span>
              <span>35 kJ (Track Specialist)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Simulate Attack Power (TTE Target)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={criticalPower + 10}
                max="1000"
                step="10"
                value={targetAttackWatts}
                onChange={(e) => setTargetAttackWatts(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 font-mono"
              />
              <span className="text-sm font-semibold text-slate-400">Watts</span>
            </div>
            <span className="text-xs text-slate-500 mt-1 block">Calculates hold duration with remaining battery</span>
          </div>
        </div>

        {/* Workout Presets & Summary */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-2">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Workout Presets &amp; Battery Status
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy Audit"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {Object.keys(PRESET_WORKOUTS).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleApplyPreset(key)}
                className="px-3 py-2 rounded-lg text-xs font-medium bg-slate-950 border border-slate-800 text-slate-300 hover:border-amber-500 hover:text-white transition-all text-left"
              >
                <div className="font-semibold text-white">{PRESET_WORKOUTS[key].label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{PRESET_WORKOUTS[key].intervals.length} intervals</div>
              </button>
            ))}
          </div>

          {/* Dynamic Battery Gauge */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Session Minimum Battery:</span>
              <span
                className={`font-mono font-bold ${
                  simulation.minBalPct < 20 ? "text-rose-400" : simulation.minBalPct < 50 ? "text-amber-400" : "text-emerald-400"
                }`}
              >
                {simulation.minBalPct}% ({simulation.minBalKj} kJ remaining)
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  simulation.minBalPct < 20
                    ? "bg-rose-500"
                    : simulation.minBalPct < 50
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${Math.max(3, Math.min(100, simulation.minBalPct))}%` }}
              />
            </div>
            {simulation.blownUp && (
              <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                <BatteryWarning className="w-4 h-4 shrink-0 text-rose-400" />
                <span><strong>Warning:</strong> Athlete depleted 100% of anaerobic capacity at T+{simulation.blowUpTimeSec}s (Exhaustion point)!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interval Editor & Breakdown Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-md overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Interval-by-Interval W&apos; Depletion &amp; Recovery Timeline
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Step-by-step breakdown of anaerobic expenditure during suprathreshold efforts and exponential recovery during sub-CP phases.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddInterval}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Interval
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950/80 uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Interval Name</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Power</th>
                <th className="py-2.5 px-3">% CP</th>
                <th className="py-2.5 px-3">Start W&apos;</th>
                <th className="py-2.5 px-3">&Delta; W&apos; (kJ)</th>
                <th className="py-2.5 px-3">End W&apos; Bal</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {simulation.intervalSummaries.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 font-sans font-semibold text-white">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateInterval(item.id, "name", e.target.value)}
                      className="bg-transparent border-b border-transparent hover:border-slate-600 focus:border-amber-500 focus:outline-none text-xs text-white"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="number"
                      min="5"
                      step="5"
                      value={item.durationSec}
                      onChange={(e) => handleUpdateInterval(item.id, "durationSec", Number(e.target.value))}
                      className="w-16 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-white"
                    />
                    <span className="text-slate-500 ml-1">s</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="number"
                      min="50"
                      step="5"
                      value={item.powerWatts}
                      onChange={(e) => handleUpdateInterval(item.id, "powerWatts", Number(e.target.value))}
                      className="w-16 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-xs text-white"
                    />
                    <span className="text-slate-500 ml-1">W</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                        item.pctCp > 100 ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"
                      }`}
                    >
                      {item.pctCp}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">{item.startBalPct}%</td>
                  <td className="py-2.5 px-3">
                    <span className={item.deltaKj < 0 ? "text-rose-400" : "text-emerald-400"}>
                      {item.deltaKj > 0 ? `+${item.deltaKj}` : item.deltaKj} kJ
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-white">
                    <span
                      className={
                        item.endBalPct < 25 ? "text-rose-400" : item.endBalPct < 60 ? "text-amber-400" : "text-emerald-400"
                      }
                    >
                      {item.endBalPct}% ({item.endBalKj} kJ)
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveInterval(item.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scientific Reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-1.5 text-slate-200 font-semibold text-sm">
            <Info className="w-4 h-4 text-amber-400" />
            The Monod-Scherrer &amp; Skiba W&apos; Dynamic Model
          </div>
          <p>
            In exercise physiology, <strong>Critical Power (CP)</strong> represents the asymptotic rate of work that can theoretically
            be maintained without continuous fatigue. <strong>W&apos; (W-prime)</strong> represents the finite quantity of work (in Joules or kJ)
            available from phosphocreatine, glycolysis, and stored glycogen above Critical Power.
          </p>
          <p>
            When power output $P &gt; CP$, W&apos; is drained at $(P - CP) \times \Delta t$. When $P &lt; CP$, W&apos; is reconstituted
            exponentially governed by the recovery time constant &tau;<sub>W</sub> = 546 &times; e<sup>-0.01(CP - P)</sup> + 316 (Skiba et al., 2012).
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-1.5 text-slate-200 font-semibold text-sm">
            <Zap className="w-4 h-4 text-emerald-400" />
            Tactical Race Applications
          </div>
          <p>
            In criteriums, road races, and cyclocross, winners are often determined not merely by raw FTP, but by who can
            repeatedly recharge their W&apos; battery during pack drafting and execute decisive attacks when competitors are depleted below 20%.
          </p>
          <p>
            If your W&apos; reaches 0 kJ, physiological exhaustion occurs and power drops instantaneously to or below Critical Power
            until recovery intervals allow phosphocreatine resynthesis.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CyclingWPrimeBalanceCalculator;
