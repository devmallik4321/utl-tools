'use client';

import React, { useState, useMemo } from 'react';
import { Gauge, Activity, Flame, Timer, Zap, ShieldAlert, Info } from 'lucide-react';

interface MasIntervalTier {
  name: string;
  pctMas: number;
  speedKmh: number;
  paceMinKm: string;
  dist15s: number; // distance covered in 15 seconds
  dist30s: number; // distance covered in 30 seconds
  protocol: string;
  color: string;
  borderColor: string;
  bgColor: string;
}

export function MaximumAerobicSpeedCalculator() {
  const [testMethod, setTestMethod] = useState<'1500m' | '5min' | 'directKmh'>('1500m');
  const [minutes, setMinutes] = useState<number>(5);
  const [seconds, setSeconds] = useState<number>(15); // 5:15 for 1500m
  const [fiveMinMeters, setFiveMinMeters] = useState<number>(1400); // 1400m in 5 min
  const [directKmh, setDirectKmh] = useState<number>(17.0);

  const masData = useMemo(() => {
    let speedMps = 0; // meters per second

    if (testMethod === '1500m') {
      const totalSeconds = minutes * 60 + seconds;
      speedMps = totalSeconds > 0 ? 1500 / totalSeconds : 4.0;
    } else if (testMethod === '5min') {
      speedMps = fiveMinMeters / 300;
    } else {
      speedMps = directKmh / 3.6;
    }

    const kmh = speedMps * 3.6;
    const paceSecPerKm = speedMps > 0 ? 1000 / speedMps : 240;
    const paceMin = Math.floor(paceSecPerKm / 60);
    const paceSec = Math.round(paceSecPerKm % 60);
    const formattedBasePace = `${paceMin}:${paceSec < 10 ? '0' : ''}${paceSec} /km`;

    const tiers: MasIntervalTier[] = [
      {
        name: 'Aerobic Capacity (Continuous)',
        pctMas: 90,
        speedKmh: kmh * 0.90,
        paceMinKm: formatPace(speedMps * 0.90),
        dist15s: Math.round(speedMps * 0.90 * 15),
        dist30s: Math.round(speedMps * 0.90 * 30),
        protocol: 'Sustained tempo intervals (e.g. 3 x 8 min with 2 min jog rest).',
        color: 'text-blue-400',
        borderColor: 'border-blue-500/30',
        bgColor: 'bg-blue-950/20'
      },
      {
        name: 'Threshold / 100% MAS',
        pctMas: 100,
        speedKmh: kmh * 1.00,
        paceMinKm: formattedBasePace,
        dist15s: Math.round(speedMps * 15),
        dist30s: Math.round(speedMps * 30),
        protocol: 'Long aerobic intervals (e.g. 4 x 3 min at 100% MAS, 2 min active recovery).',
        color: 'text-emerald-400',
        borderColor: 'border-emerald-500/30',
        bgColor: 'bg-emerald-950/20'
      },
      {
        name: 'Eurofit High-Intensity (110% MAS)',
        pctMas: 110,
        speedKmh: kmh * 1.10,
        paceMinKm: formatPace(speedMps * 1.10),
        dist15s: Math.round(speedMps * 1.10 * 15),
        dist30s: Math.round(speedMps * 1.10 * 30),
        protocol: 'Short intervals: 15s run / 15s rest for 2 sets of 8-10 reps.',
        color: 'text-amber-400',
        borderColor: 'border-amber-500/30',
        bgColor: 'bg-amber-950/20'
      },
      {
        name: 'Tabata Supramaximal (120% MAS)',
        pctMas: 120,
        speedKmh: kmh * 1.20,
        paceMinKm: formatPace(speedMps * 1.20),
        dist15s: Math.round(speedMps * 1.20 * 15),
        dist30s: Math.round(speedMps * 1.20 * 30),
        protocol: 'Supramaximal sprint intervals: 20s run / 10s rest for 8 reps (4 min).',
        color: 'text-rose-400',
        borderColor: 'border-rose-500/30',
        bgColor: 'bg-rose-950/20'
      }
    ];

    return {
      speedMps,
      kmh,
      formattedBasePace,
      tiers
    };
  }, [testMethod, minutes, seconds, fiveMinMeters, directKmh]);

  function formatPace(mps: number): string {
    if (mps <= 0) return '0:00 /km';
    const secKm = 1000 / mps;
    const m = Math.floor(secKm / 60);
    const s = Math.round(secKm % 60);
    return `${m}:${s < 10 ? '0' : ''}${s} /km`;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Maximum Aerobic Speed (MAS) Intervals Calculator</h1>
            <p className="text-sm text-slate-400">
              Calculate athletic Maximum Aerobic Speed (MAS) and prescribe exact distance targets for short high-intensity aerobic intervals (Eurofit & Tabata).
            </p>
          </div>
        </div>

        {/* Highlights */}
        <div className="mt-4 p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 block">Maximum Aerobic Speed (MAS)</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-rose-400 font-mono">
                {masData.kmh.toFixed(1)}
              </span>
              <span className="text-sm font-normal text-slate-400">KM/H ({masData.speedMps.toFixed(2)} m/s)</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Base 100% MAS Pace</span>
            <span className="text-2xl font-bold text-slate-100 font-mono">
              {masData.formattedBasePace}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-white">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Field Test Protocol</h2>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Testing Method</label>
            <select
              value={testMethod}
              onChange={(e) => setTestMethod(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
            >
              <option value="1500m">1500m Time Trial Test</option>
              <option value="5min">5-Minute Time Trial Test</option>
              <option value="directKmh">Direct MAS Input (km/h)</option>
            </select>
          </div>

          {testMethod === '1500m' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Minutes</label>
                <input
                  type="number"
                  min="2"
                  max="15"
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Seconds</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
                />
              </div>
            </div>
          )}

          {testMethod === '5min' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Total Distance in 5 Mins (Meters)</label>
              <input
                type="number"
                min="500"
                max="2500"
                step="25"
                value={fiveMinMeters}
                onChange={(e) => setFiveMinMeters(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
              />
            </div>
          )}

          {testMethod === 'directKmh' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Known MAS (km/h)</label>
              <input
                type="number"
                min="8"
                max="25"
                step="0.1"
                value={directKmh}
                onChange={(e) => setDirectKmh(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100"
              />
            </div>
          )}

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 block">What is MAS?</span>
            <p>
              Maximum Aerobic Speed is the lowest running speed at which an athlete reaches maximum oxygen uptake (VO2 max). Training at 100%-120% MAS optimizes cardiac stroke volume and aerobic power.
            </p>
          </div>
        </div>

        {/* Intervals Table */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">High-Intensity Interval Prescription</h2>

          <div className="space-y-2.5">
            {masData.tiers.map((t) => (
              <div
                key={t.name}
                className={`p-3.5 rounded-xl border ${t.bgColor} ${t.borderColor} space-y-1.5`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`font-bold text-xs ${t.color}`}>{t.pctMas}% MAS</span>
                    <span className="text-xs font-medium text-slate-200">{t.name}</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-white">
                    {t.speedKmh.toFixed(1)} km/h <span className="text-xs text-slate-400 font-normal">({t.paceMinKm})</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-mono">15s Target: <strong>{t.dist15s}m</strong></span>
                  <span className="font-mono">30s Target: <strong>{t.dist30s}m</strong></span>
                </div>

                <p className="text-[11px] text-slate-400 border-t border-slate-800/60 pt-1">
                  {t.protocol}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MaximumAerobicSpeedCalculator;
