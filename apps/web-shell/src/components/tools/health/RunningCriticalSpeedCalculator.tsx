"use client";

import React, { useState, useMemo } from "react";
import { Activity, Gauge, Flame, TrendingUp, Clock, Copy, Check } from "lucide-react";

interface RunnerPreset {
  name: string;
  d1: number;
  t1Minutes: number;
  t1Seconds: number;
  d2: number;
  t2Minutes: number;
  t2Seconds: number;
}

const PRESETS: RunnerPreset[] = [
  {
    name: "Sub-Elite 5k/10k Specialist",
    d1: 3000,
    t1Minutes: 9,
    t1Seconds: 0, // 9:00 (540s)
    d2: 5000,
    t2Minutes: 15,
    t2Seconds: 30 // 15:30 (930s)
  },
  {
    name: "Competitive Club Runner",
    d1: 1500,
    t1Minutes: 5,
    t1Seconds: 15, // 5:15 (315s)
    d2: 5000,
    t2Minutes: 19,
    t2Seconds: 30 // 19:30 (1170s)
  },
  {
    name: "Marathon Base Runner",
    d1: 5000,
    t1Minutes: 22,
    t1Seconds: 0,
    d2: 10000,
    t2Minutes: 46,
    t2Seconds: 0
  }
];

export function RunningCriticalSpeedCalculator() {
  const [d1, setD1] = useState<number>(3000); // meters
  const [t1Min, setT1Min] = useState<number>(9);
  const [t1Sec, setT1Sec] = useState<number>(0);

  const [d2, setD2] = useState<number>(5000); // meters
  const [t2Min, setT2Min] = useState<number>(15);
  const [t2Sec, setT2Sec] = useState<number>(30);

  const [copied, setCopied] = useState(false);

  const results = useMemo(() => {
    const t1TotalSec = t1Min * 60 + t1Sec;
    const t2TotalSec = t2Min * 60 + t2Sec;

    if (t2TotalSec <= t1TotalSec || d2 <= d1 || t1TotalSec <= 0) {
      return null;
    }

    // Two-parameter model: d = CS * t + D'
    // CS = (d2 - d1) / (t2 - t1) [m/s]
    const csMps = (d2 - d1) / (t2TotalSec - t1TotalSec);
    // D' = d1 - CS * t1 [meters]
    const dPrimeMeters = d1 - csMps * t1TotalSec;

    // Speeds & Paces
    const csKmh = csMps * 3.6;
    const secPerKm = csMps > 0 ? 1000 / csMps : 0;
    const paceKmMin = Math.floor(secPerKm / 60);
    const paceKmSec = Math.round(secPerKm % 60);

    const secPerMile = csMps > 0 ? 1609.344 / csMps : 0;
    const paceMileMin = Math.floor(secPerMile / 60);
    const paceMileSec = Math.round(secPerMile % 60);

    // Format pace
    const formatPace = (m: number, s: number) => `${m}:${s < 10 ? "0" : ""}${s}`;

    // Race Time Predictions: t = (d - D') / CS (valid for severe & heavy domains ~ 800m to 10k)
    const predictTime = (targetDist: number): string => {
      if (csMps <= 0) return "--:--";
      const totalSeconds = (targetDist - dPrimeMeters) / csMps;
      if (totalSeconds <= 0) return "--:--";
      const min = Math.floor(totalSeconds / 60);
      const sec = Math.round(totalSeconds % 60);
      return `${min}:${sec < 10 ? "0" : ""}${sec}`;
    };

    return {
      csMps: csMps.toFixed(2),
      csKmh: csKmh.toFixed(2),
      dPrime: Math.round(dPrimeMeters),
      paceKm: formatPace(paceKmMin, paceKmSec),
      paceMile: formatPace(paceMileMin, paceMileSec),
      predictions: [
        { dist: "1,500m", time: predictTime(1500) },
        { dist: "3,000m", time: predictTime(3000) },
        { dist: "5,000m", time: predictTime(5000) },
        { dist: "10,000m", time: predictTime(10000) }
      ],
      trainingZones: [
        {
          zone: "Severe Domain (>105% CS)",
          desc: "VO2max depletion intervals, depletes D' rapidly",
          pace: formatPace(Math.floor((secPerKm / 1.08) / 60), Math.round((secPerKm / 1.08) % 60))
        },
        {
          zone: "Heavy Domain (95% - 100% CS)",
          desc: "Critical Speed cruise threshold, sustainable 30-50 min",
          pace: formatPace(paceKmMin, paceKmSec)
        },
        {
          zone: "Moderate Domain (<85% CS)",
          desc: "Aerobic recovery & long base runs, steady state",
          pace: formatPace(Math.floor((secPerKm / 0.82) / 60), Math.round((secPerKm / 0.82) % 60))
        }
      ]
    };
  }, [d1, t1Min, t1Sec, d2, t2Min, t2Sec]);

  const loadPreset = (p: RunnerPreset) => {
    setD1(p.d1);
    setT1Min(p.t1Minutes);
    setT1Sec(p.t1Seconds);
    setD2(p.d2);
    setT2Min(p.t2Minutes);
    setT2Sec(p.t2Seconds);
  };

  const handleCopy = async () => {
    if (!results) return;
    const text = [
      `=== RUNNING CRITICAL SPEED & D' AEROBIC PROFILE ===`,
      `Trial 1: ${d1}m in ${t1Min}:${t1Sec < 10 ? "0" : ""}${t1Sec}`,
      `Trial 2: ${d2}m in ${t2Min}:${t2Sec < 10 ? "0" : ""}${t2Sec}`,
      `-------------------------------------------------`,
      `Critical Speed (CS): ${results.csMps} m/s (${results.csKmh} km/h)`,
      `CS Threshold Pace: ${results.paceKm} /km | ${results.paceMile} /mile`,
      `Anaerobic Reserve Capacity (D'): ${results.dPrime} meters`,
      `-------------------------------------------------`,
      `Predicted Race Times:`,
      ...results.predictions.map((p) => `- ${p.dist}: ${p.time}`),
      `=================================================`
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Monod & Scherrer 2-Parameter Model
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Physiological Threshold
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Activity className="w-6 h-6 text-rose-400" />
              Running Critical Speed & Anaerobic Capacity (D&apos;) Calculator
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Calculate aerobic Critical Speed (<code className="text-rose-300">CS</code>) and anaerobic running reserve capacity (<code className="text-rose-300">D&apos;</code>) from two maximal time trials to prescribe personalized threshold paces.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => loadPreset(p)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 rounded-lg border border-slate-700 transition"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Trials (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Trial 1 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" /> Shorter Time Trial (e.g. 1.5k – 3k)
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Distance (m)</label>
                <input
                  type="number"
                  value={d1}
                  onChange={(e) => setD1(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Minutes</label>
                <input
                  type="number"
                  value={t1Min}
                  onChange={(e) => setT1Min(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Seconds</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={t1Sec}
                  onChange={(e) => setT1Sec(Math.max(0, Math.min(59, Number(e.target.value))))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Trial 2 */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" /> Longer Time Trial (e.g. 5k – 10k)
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Distance (m)</label>
                <input
                  type="number"
                  value={d2}
                  onChange={(e) => setD2(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Minutes</label>
                <input
                  type="number"
                  value={t2Min}
                  onChange={(e) => setT2Min(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Seconds</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={t2Sec}
                  onChange={(e) => setT2Sec(Math.max(0, Math.min(59, Number(e.target.value))))}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Results Dashboard (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {results ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <Gauge className="w-4 h-4" /> Aerobic Profile Results
                </h4>
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded border border-slate-700 flex items-center gap-1 transition"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy Profile"}
                </button>
              </div>

              {/* Main Metric Banner */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Critical Speed (CS)</div>
                  <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
                    {results.csMps} <span className="text-xs font-normal text-slate-500">m/s</span>
                  </div>
                  <div className="text-xs font-mono text-slate-300 mt-1">
                    {results.paceKm} /km <span className="text-slate-500">({results.paceMile} /mi)</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Anaerobic Capacity (D&apos;)</div>
                  <div className="text-2xl font-black font-mono text-rose-400 mt-0.5">
                    {results.dPrime} <span className="text-xs font-normal text-slate-500">meters</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Reserve battery above CS
                  </div>
                </div>
              </div>

              {/* Training Zones */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300">Prescribed Training Paces</div>
                {results.trainingZones.map((z, idx) => (
                  <div key={idx} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-200">{z.zone}</div>
                      <div className="text-[11px] text-slate-400">{z.desc}</div>
                    </div>
                    <div className="font-mono text-indigo-300 font-bold ml-2">{z.pace} /km</div>
                  </div>
                ))}
              </div>

              {/* Race Predictions */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="text-xs font-semibold text-slate-300">Model Race Predictions</div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {results.predictions.map((p, idx) => (
                    <div key={idx} className="bg-slate-950 p-2 rounded border border-slate-800">
                      <div className="text-[10px] text-slate-400">{p.dist}</div>
                      <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">{p.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
              Enter two valid time trials with Trial 2 being longer distance and duration than Trial 1.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RunningCriticalSpeedCalculator;
