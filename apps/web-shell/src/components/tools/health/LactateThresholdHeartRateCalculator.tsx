'use client';

import React, { useState, useMemo } from 'react';
import { Heart, Activity, Flame, Zap, ShieldAlert, Award, Timer, Info } from 'lucide-react';

interface ZoneDef {
  zone: string;
  name: string;
  minPct: number;
  maxPct: number;
  minBpm: number;
  maxBpm: number;
  rpe: string;
  color: string;
  bgColor: string;
  borderColor: string;
  adaptation: string;
}

export function LactateThresholdHeartRateCalculator() {
  const [lthr, setLthr] = useState<number>(168);
  const [modality, setModality] = useState<'running' | 'cycling'>('running');
  const [protocol, setProtocol] = useState<'friel30' | 'direct' | 'race5k'>('friel30');
  const [maxHr, setMaxHr] = useState<number>(192);

  // Time Trial Inputs if using protocol calculation
  const [full30MinAvgHr, setFull30MinAvgHr] = useState<number>(166);
  const [last20MinAvgHr, setLast20MinAvgHr] = useState<number>(168);

  const activeLthr = protocol === 'friel30' ? last20MinAvgHr : lthr;

  const zones: ZoneDef[] = useMemo(() => {
    if (modality === 'running') {
      return [
        {
          zone: 'Zone 1',
          name: 'Active Recovery',
          minPct: 0,
          maxPct: 85,
          minBpm: Math.round(activeLthr * 0.65),
          maxBpm: Math.round(activeLthr * 0.85) - 1,
          rpe: '1 - 2 (Very Easy, conversational)',
          color: 'text-slate-300',
          bgColor: 'bg-slate-800/60',
          borderColor: 'border-slate-700',
          adaptation: 'Promotes muscle blood flow, glycogen replenishment, waste clearance.'
        },
        {
          zone: 'Zone 2',
          name: 'Aerobic Endurance',
          minPct: 85,
          maxPct: 89,
          minBpm: Math.round(activeLthr * 0.85),
          maxBpm: Math.round(activeLthr * 0.89),
          rpe: '3 - 4 (Easy, all-day pace)',
          color: 'text-blue-400',
          bgColor: 'bg-blue-950/20',
          borderColor: 'border-blue-500/30',
          adaptation: 'Mitochondrial biogenesis, fat oxidation, capillary bed expansion.'
        },
        {
          zone: 'Zone 3',
          name: 'Tempo',
          minPct: 90,
          maxPct: 94,
          minBpm: Math.round(activeLthr * 0.90),
          maxBpm: Math.round(activeLthr * 0.94),
          rpe: '5 - 6 (Comfortably hard, rhythmic)',
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-950/20',
          borderColor: 'border-emerald-500/30',
          adaptation: 'Aerobic power, glycogen storage capacity, sustained pace stamina.'
        },
        {
          zone: 'Zone 4',
          name: 'Sub-Threshold',
          minPct: 95,
          maxPct: 99,
          minBpm: Math.round(activeLthr * 0.95),
          maxBpm: Math.round(activeLthr * 0.99),
          rpe: '7 - 8 (Hard, deep rhythmic breathing)',
          color: 'text-amber-400',
          bgColor: 'bg-amber-950/20',
          borderColor: 'border-amber-500/30',
          adaptation: 'Increases lactate clearance threshold, muscular endurance.'
        },
        {
          zone: 'Zone 5a',
          name: 'Super-Threshold',
          minPct: 100,
          maxPct: 102,
          minBpm: Math.round(activeLthr * 1.00),
          maxBpm: Math.round(activeLthr * 1.02),
          rpe: '8.5 - 9 (Very hard, race pace)',
          color: 'text-orange-400',
          bgColor: 'bg-orange-950/20',
          borderColor: 'border-orange-500/30',
          adaptation: 'Lactate tolerance, maximum aerobic power (VO2 kinetics).'
        },
        {
          zone: 'Zone 5b',
          name: 'Aerobic Capacity (VO2 Max)',
          minPct: 103,
          maxPct: 106,
          minBpm: Math.round(activeLthr * 1.03),
          maxBpm: Math.round(activeLthr * 1.06),
          rpe: '9 - 9.5 (Extremely hard, 3-5 min intervals)',
          color: 'text-rose-400',
          bgColor: 'bg-rose-950/20',
          borderColor: 'border-rose-500/30',
          adaptation: 'Stroke volume enlargement, maximum oxygen uptake (VO2max).'
        },
        {
          zone: 'Zone 5c',
          name: 'Anaerobic Power',
          minPct: 106,
          maxPct: 115,
          minBpm: Math.round(activeLthr * 1.07),
          maxBpm: maxHr || Math.round(activeLthr * 1.15),
          rpe: '10 (Maximal sprint, neuromuscular)',
          color: 'text-purple-400',
          bgColor: 'bg-purple-950/20',
          borderColor: 'border-purple-500/30',
          adaptation: 'Neuromuscular recruitment, fast-twitch motor unit firing.'
        }
      ];
    } else {
      // Cycling (Joe Friel Cycling zones)
      return [
        {
          zone: 'Zone 1',
          name: 'Active Recovery',
          minPct: 0,
          maxPct: 81,
          minBpm: Math.round(activeLthr * 0.60),
          maxBpm: Math.round(activeLthr * 0.81) - 1,
          rpe: '1 - 2 (Spinning, gentle)',
          color: 'text-slate-300',
          bgColor: 'bg-slate-800/60',
          borderColor: 'border-slate-700',
          adaptation: 'Flushing metabolic byproducts, passive recovery.'
        },
        {
          zone: 'Zone 2',
          name: 'Aerobic Endurance',
          minPct: 81,
          maxPct: 89,
          minBpm: Math.round(activeLthr * 0.81),
          maxBpm: Math.round(activeLthr * 0.89),
          rpe: '3 - 4 (Endurance base building)',
          color: 'text-blue-400',
          bgColor: 'bg-blue-950/20',
          borderColor: 'border-blue-500/30',
          adaptation: 'Fat utilization, mitochondrial density, slow-twitch efficiency.'
        },
        {
          zone: 'Zone 3',
          name: 'Tempo',
          minPct: 90,
          maxPct: 93,
          minBpm: Math.round(activeLthr * 0.90),
          maxBpm: Math.round(activeLthr * 0.93),
          rpe: '5 - 6 (Steady peloton pace)',
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-950/20',
          borderColor: 'border-emerald-500/30',
          adaptation: 'Muscular endurance, cardiac output.'
        },
        {
          zone: 'Zone 4',
          name: 'Sub-Threshold',
          minPct: 94,
          maxPct: 99,
          minBpm: Math.round(activeLthr * 0.94),
          maxBpm: Math.round(activeLthr * 0.99),
          rpe: '7 - 8 (Time trial effort)',
          color: 'text-amber-400',
          bgColor: 'bg-amber-950/20',
          borderColor: 'border-amber-500/30',
          adaptation: 'Lactate threshold delay, functional threshold power stabilization.'
        },
        {
          zone: 'Zone 5a',
          name: 'Super-Threshold',
          minPct: 100,
          maxPct: 102,
          minBpm: Math.round(activeLthr * 1.00),
          maxBpm: Math.round(activeLthr * 1.02),
          rpe: '8.5 - 9 (Hill climb attack pace)',
          color: 'text-orange-400',
          bgColor: 'bg-orange-950/20',
          borderColor: 'border-orange-500/30',
          adaptation: 'Buffering anaerobic acidosis.'
        },
        {
          zone: 'Zone 5b',
          name: 'Aerobic Capacity (VO2 Max)',
          minPct: 103,
          maxPct: 106,
          minBpm: Math.round(activeLthr * 1.03),
          maxBpm: Math.round(activeLthr * 1.06),
          rpe: '9 - 9.5 (Breakaway effort)',
          color: 'text-rose-400',
          bgColor: 'bg-rose-950/20',
          borderColor: 'border-rose-500/30',
          adaptation: 'Maximal oxygen consumption and peak cardiovascular capacity.'
        },
        {
          zone: 'Zone 5c',
          name: 'Anaerobic Power',
          minPct: 106,
          maxPct: 115,
          minBpm: Math.round(activeLthr * 1.07),
          maxBpm: maxHr || Math.round(activeLthr * 1.15),
          rpe: '10 (Final sprint to the line)',
          color: 'text-purple-400',
          bgColor: 'bg-purple-950/20',
          borderColor: 'border-purple-500/30',
          adaptation: 'Peak neuromuscular power and ATP-CP system.'
        }
      ];
    }
  }, [modality, activeLthr, maxHr]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Lactate Threshold Heart Rate (LTHR) Calculator</h1>
            <p className="text-sm text-slate-400">
              Calculate personalized aerobic and anaerobic training zones based on Joe Friel's 30-minute time trial protocol for endurance athletes.
            </p>
          </div>
        </div>

        {/* LTHR Banner */}
        <div className="mt-4 p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 block">Identified Lactate Threshold (LTHR)</span>
            <span className="text-3xl font-black text-rose-400 font-mono">
              {activeLthr} <span className="text-sm font-normal text-slate-400">BPM</span>
            </span>
          </div>
          <div className="text-xs text-slate-400 max-w-sm">
            LTHR marks the point where blood lactate accumulation begins to exceed your body's ability to clear it. Training relative to LTHR is significantly more accurate than age-predicted Max HR.
          </div>
        </div>
      </div>

      {/* Inputs & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-white">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-rose-400" />
            <span>Test Protocol & Athlete Parameters</span>
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Sport Discipline</label>
              <select
                value={modality}
                onChange={(e) => setModality(e.target.value as 'running' | 'cycling')}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
              >
                <option value="running">Running</option>
                <option value="cycling">Cycling (Bike / Trainer)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Testing Method</label>
              <select
                value={protocol}
                onChange={(e) => setProtocol(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
              >
                <option value="friel30">Joe Friel 30-Min TT</option>
                <option value="direct">Direct LTHR Entry</option>
              </select>
            </div>
          </div>

          {protocol === 'friel30' ? (
            <div className="space-y-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center space-x-2 text-xs font-semibold text-rose-300">
                <Timer className="w-4 h-4" />
                <span>30-Minute Solo Time Trial Protocol</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Warm up thoroughly. Ride/run all-out solo for 30 minutes. Press the lap button at minute 10. Your LTHR is the average heart rate of the <strong>final 20 minutes</strong>.
              </p>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Final 20-Minute Avg HR (BPM)</label>
                <input
                  type="number"
                  min="100"
                  max="220"
                  value={last20MinAvgHr}
                  onChange={(e) => setLast20MinAvgHr(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Known LTHR (BPM)</label>
              <input
                type="number"
                min="100"
                max="220"
                value={lthr}
                onChange={(e) => setLthr(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Maximum Heart Rate (Optional cap)</label>
            <input
              type="number"
              min="120"
              max="230"
              value={maxHr}
              onChange={(e) => setMaxHr(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/40 text-xs text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 block">Why Cycling LTHR is Lower:</span>
            <span>
              On a bicycle, body weight is supported by the saddle, and upper body muscles do not contract to stabilize stride impact. As a result, cycling LTHR typically measures 5 to 8 BPM lower than running LTHR for the same athlete.
            </span>
          </div>
        </div>

        {/* Zones Table */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Target Physiological Zones</span>
            </h2>
            <span className="text-xs text-slate-400 capitalize">{modality} Training Zones</span>
          </div>

          <div className="space-y-2.5">
            {zones.map((z) => (
              <div
                key={z.zone}
                className={`p-3 rounded-xl border ${z.bgColor} ${z.borderColor} transition-all`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className={`font-bold text-xs ${z.color}`}>{z.zone}</span>
                    <span className="text-xs font-medium text-slate-200">{z.name}</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-white">
                    {z.minBpm} – {z.maxBpm} <span className="text-[10px] font-normal text-slate-400">BPM</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>{z.rpe}</span>
                  <span className="font-mono text-slate-300">{z.minPct}% - {z.maxPct}% of LTHR</span>
                </div>

                <div className="text-[11px] text-slate-400 border-t border-slate-800/60 pt-1 mt-1">
                  {z.adaptation}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LactateThresholdHeartRateCalculator;
