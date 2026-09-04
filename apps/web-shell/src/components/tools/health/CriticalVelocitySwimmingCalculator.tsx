'use client';

import React, { useState, useId } from 'react';
import {
  Waves,
  Timer,
  Activity,
  TrendingUp,
  Award,
  Copy,
  Check,
  RotateCcw,
  Info,
  Zap,
  Gauge
} from 'lucide-react';

interface CssPreset {
  name: string;
  time400Sec: number;
  time200Sec: number;
}

const PRESETS: CssPreset[] = [
  {
    name: 'Elite Collegiate Swimmer',
    time400Sec: 250, // 4:10
    time200Sec: 118, // 1:58
  },
  {
    name: 'Competitive Triathlete / Masters',
    time400Sec: 320, // 5:20
    time200Sec: 152, // 2:32
  },
  {
    name: 'Recreational Club Swimmer',
    time400Sec: 420, // 7:00
    time200Sec: 200, // 3:20
  },
];

export function CriticalVelocitySwimmingCalculator() {
  const [time400Min, setTime400Min] = useState<number>(5);
  const [time400Sec, setTime400Sec] = useState<number>(20);
  const [time200Min, setTime200Min] = useState<number>(2);
  const [time200Sec, setTime200Sec] = useState<number>(32);
  const [copied, setCopied] = useState<boolean>(false);

  const totalTime400 = time400Min * 60 + time400Sec;
  const totalTime200 = time200Min * 60 + time200Sec;

  // Formula: CSS (m/s) = (400 - 200) / (T400 - T200)
  const timeDelta = Math.max(1, totalTime400 - totalTime200);
  const cssMps = 200 / timeDelta;

  // CSS Pace per 100m in seconds
  const cssSecPer100m = cssMps > 0 ? 100 / cssMps : 0;
  const cssPaceMin = Math.floor(cssSecPer100m / 60);
  const cssPaceSec = Math.round(cssSecPer100m % 60);
  const formattedCssPace = `${cssPaceMin}:${cssPaceSec.toString().padStart(2, '0')}/100m`;

  // Anaerobic Work Capacity D' in meters = 400 - (CSS * T400)
  const dPrimeMeters = Math.max(0, 400 - cssMps * totalTime400);

  // Training Zones based on CSS pace / 100m
  const trainingZones = [
    {
      zone: 'Zone 1: Active Recovery',
      offset: '+8 to +10s',
      paceSec: cssSecPer100m + 9,
      desc: 'Warm-up, recovery between hard reps, aerobic base maintenance',
    },
    {
      zone: 'Zone 2: Aerobic Endurance',
      offset: '+4 to +6s',
      paceSec: cssSecPer100m + 5,
      desc: 'Over-distance long swims, continuous base mileage',
    },
    {
      zone: 'Zone 3: CSS Aerobic Threshold',
      offset: '0s (Base CSS)',
      paceSec: cssSecPer100m,
      desc: 'Maximal steady-state, race-pace endurance repeats (e.g. 10x100m)',
    },
    {
      zone: 'Zone 4: Lactate Threshold',
      offset: '-2 to -4s',
      paceSec: Math.max(30, cssSecPer100m - 3),
      desc: 'Lactate tolerance sets with short rest intervals',
    },
    {
      zone: 'Zone 5: VO2 Max / Sprint',
      offset: '-6 to -8s',
      paceSec: Math.max(25, cssSecPer100m - 7),
      desc: 'High-intensity anaerobic sprint capacity (25m - 50m all-out)',
    },
  ];

  const formatPace = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}/100m`;
  };

  const applyPreset = (p: CssPreset) => {
    setTime400Min(Math.floor(p.time400Sec / 60));
    setTime400Sec(p.time400Sec % 60);
    setTime200Min(Math.floor(p.time200Sec / 60));
    setTime200Sec(p.time200Sec % 60);
  };

  const handleCopy = () => {
    const text = [
      `Critical Swim Speed (CSS) Aerobic Profile`,
      `-----------------------------------------`,
      `400m Time Trial:    ${time400Min}:${time400Sec.toString().padStart(2, '0')} (${totalTime400}s)`,
      `200m Time Trial:    ${time200Min}:${time200Sec.toString().padStart(2, '0')} (${totalTime200}s)`,
      `Critical Velocity:  ${cssMps.toFixed(2)} m/s`,
      `CSS Base Pace:      ${formattedCssPace}`,
      `Anaerobic Reserve:  ${dPrimeMeters.toFixed(1)} meters (D')`,
      `-----------------------------------------`,
      `Prescribed Training Pace Zones (/100m):`,
      ...trainingZones.map((z) => `• ${z.zone}: ${formatPace(z.paceSec)} (${z.offset})`),
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Presets Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Presets:</span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                onClick={() => applyPreset(p)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Zones'}
          </button>
          <button
            onClick={() => applyPreset(PRESETS[1])}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Critical Swim Speed (Pace)</span>
          <div className="mt-1 text-2xl font-bold text-sky-400 tracking-tight font-mono">{formattedCssPace}</div>
          <div className="mt-1 text-xs text-slate-400">Aerobic threshold pace / 100m</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Critical Velocity</span>
          <div className="mt-1 text-2xl font-bold text-emerald-400 tracking-tight">{cssMps.toFixed(2)} m/s</div>
          <div className="mt-1 text-xs text-slate-400">{(cssMps * 3.6).toFixed(1)} km/h</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Anaerobic Reserve (D&apos;)</span>
          <div className="mt-1 text-2xl font-bold text-amber-400 tracking-tight">{Math.round(dPrimeMeters)} m</div>
          <div className="mt-1 text-xs text-slate-400">Anaerobic distance capacity</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Predicted 1500m Time</span>
          <div className="mt-1 text-2xl font-bold text-white tracking-tight font-mono">
            {Math.floor((15 * cssSecPer100m) / 60)}:{Math.round((15 * cssSecPer100m) % 60).toString().padStart(2, '0')}
          </div>
          <div className="mt-1 text-xs text-slate-400">At steady-state threshold</div>
        </div>
      </div>

      {/* Inputs + Prescribed Zones Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Time Trial Inputs */}
        <div className="lg:col-span-5 space-y-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Timer className="w-4 h-4 text-sky-400" />
            Time Trial Lab Results
          </h3>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-sky-400">400m Time Trial</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block font-mono">Minutes</label>
                <input
                  type="number"
                  min="2"
                  max="15"
                  value={time400Min}
                  onChange={(e) => setTime400Min(Math.max(1, Number(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-sm text-white font-mono text-center focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block font-mono">Seconds</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={time400Sec}
                  onChange={(e) => setTime400Sec(Math.min(59, Math.max(0, Number(e.target.value) || 0)))}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-sm text-white font-mono text-center focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
            <span className="text-[11px] text-slate-500 block">Total: {totalTime400} seconds</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-emerald-400">200m Time Trial</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block font-mono">Minutes</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={time200Min}
                  onChange={(e) => setTime200Min(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-sm text-white font-mono text-center focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block font-mono">Seconds</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={time200Sec}
                  onChange={(e) => setTime200Sec(Math.min(59, Math.max(0, Number(e.target.value) || 0)))}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-sm text-white font-mono text-center focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <span className="text-[11px] text-slate-500 block">Total: {totalTime200} seconds</span>
          </div>
        </div>

        {/* Prescribed Training Zones Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Pace Zone</th>
                  <th className="px-4 py-3 text-center">Offset</th>
                  <th className="px-4 py-3 text-right">Target Pace / 100m</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                {trainingZones.map((z, idx) => (
                  <tr key={idx} className={idx === 2 ? 'bg-sky-950/30 font-semibold' : ''}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-200">{z.zone}</div>
                      <div className="text-[10px] text-slate-400">{z.desc}</div>
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-slate-400">{z.offset}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-sky-400">
                      {formatPace(z.paceSec)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Guide Notes */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2 text-xs text-slate-400">
        <h4 className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-4 h-4 text-sky-400" />
          The Science of Critical Swim Speed (CSS)
        </h4>
        <p>
          First established by Ginn and Wakayoshi in swimming physiology, Critical Swim Speed represents the slope of the distance-time relationship between two all-out time trials (typically 400m and 200m). By subtracting the anaerobic capacity (D&apos;), CSS reveals the swimmer&apos;s true aerobic threshold speed sustainable without rapid fatigue accumulation.
        </p>
      </div>
    </div>
  );
}

export default CriticalVelocitySwimmingCalculator;
