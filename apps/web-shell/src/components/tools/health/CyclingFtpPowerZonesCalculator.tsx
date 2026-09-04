'use client';

import React, { useState, useMemo } from 'react';
import { Zap, Activity, Award, Flame, Timer, ShieldAlert, Info } from 'lucide-react';

interface CogganZone {
  zone: string;
  name: string;
  minPct: number;
  maxPct: number;
  minWatts: number;
  maxWatts: number;
  minWkg: number;
  maxWkg: number;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

export function CyclingFtpPowerZonesCalculator() {
  const [testProtocol, setTestProtocol] = useState<'20min' | 'direct' | 'ramp'>('20min');
  const [testAverageWatts, setTestAverageWatts] = useState<number>(275);
  const [directFtpWatts, setDirectFtpWatts] = useState<number>(260);
  const [riderWeightKg, setRiderWeightKg] = useState<number>(72);

  const calculatedFtp = useMemo(() => {
    if (testProtocol === '20min') {
      // 95% of 20-minute all-out effort
      return Math.round(testAverageWatts * 0.95);
    } else if (testProtocol === 'ramp') {
      // 75% of last completed minute of ramp test
      return Math.round(testAverageWatts * 0.75);
    }
    return directFtpWatts;
  }, [testProtocol, testAverageWatts, directFtpWatts]);

  const ftpWkg = (calculatedFtp / Math.max(1, riderWeightKg)).toFixed(2);

  const zones: CogganZone[] = useMemo(() => {
    const f = calculatedFtp;
    const w = Math.max(1, riderWeightKg);

    return [
      {
        zone: 'Zone 1',
        name: 'Active Recovery',
        minPct: 0,
        maxPct: 55,
        minWatts: 0,
        maxWatts: Math.round(f * 0.55),
        minWkg: 0,
        maxWkg: parseFloat(((f * 0.55) / w).toFixed(2)),
        color: 'text-slate-300',
        bgColor: 'bg-slate-800/60',
        borderColor: 'border-slate-700',
        description: 'Easy spinning, promotes blood flow and recovery between hard sessions.'
      },
      {
        zone: 'Zone 2',
        name: 'Endurance',
        minPct: 56,
        maxPct: 75,
        minWatts: Math.round(f * 0.56),
        maxWatts: Math.round(f * 0.75),
        minWkg: parseFloat(((f * 0.56) / w).toFixed(2)),
        maxWkg: parseFloat(((f * 0.75) / w).toFixed(2)),
        color: 'text-blue-400',
        bgColor: 'bg-blue-950/20',
        borderColor: 'border-blue-500/30',
        description: 'All-day base aerobic training, builds fat metabolism and mitochondrial density.'
      },
      {
        zone: 'Zone 3',
        name: 'Tempo',
        minPct: 76,
        maxPct: 90,
        minWatts: Math.round(f * 0.76),
        maxWatts: Math.round(f * 0.90),
        minWkg: parseFloat(((f * 0.76) / w).toFixed(2)),
        maxWkg: parseFloat(((f * 0.90) / w).toFixed(2)),
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-950/20',
        borderColor: 'border-emerald-500/30',
        description: 'Brisk pace, requires concentration, aerobic stamina development.'
      },
      {
        zone: 'Zone 4',
        name: 'Lactate Threshold (FTP)',
        minPct: 91,
        maxPct: 105,
        minWatts: Math.round(f * 0.91),
        maxWatts: Math.round(f * 1.05),
        minWkg: parseFloat(((f * 0.91) / w).toFixed(2)),
        maxWkg: parseFloat(((f * 1.05) / w).toFixed(2)),
        color: 'text-amber-400',
        bgColor: 'bg-amber-950/20',
        borderColor: 'border-amber-500/30',
        description: 'Maximal sustainable 40-60 min power. Sweet Spot falls at 88%-94% of FTP.'
      },
      {
        zone: 'Zone 5',
        name: 'VO2 Max',
        minPct: 106,
        maxPct: 120,
        minWatts: Math.round(f * 1.06),
        maxWatts: Math.round(f * 1.20),
        minWkg: parseFloat(((f * 1.06) / w).toFixed(2)),
        maxWkg: parseFloat(((f * 1.20) / w).toFixed(2)),
        color: 'text-orange-400',
        bgColor: 'bg-orange-950/20',
        borderColor: 'border-orange-500/30',
        description: '3-8 minute severe efforts to increase maximum oxygen uptake and cardiac output.'
      },
      {
        zone: 'Zone 6',
        name: 'Anaerobic Capacity',
        minPct: 121,
        maxPct: 150,
        minWatts: Math.round(f * 1.21),
        maxWatts: Math.round(f * 1.50),
        minWkg: parseFloat(((f * 1.21) / w).toFixed(2)),
        maxWkg: parseFloat(((f * 1.50) / w).toFixed(2)),
        color: 'text-rose-400',
        bgColor: 'bg-rose-950/20',
        borderColor: 'border-rose-500/30',
        description: '30s to 2 min intense intervals testing glycogen buffering and anaerobic power.'
      },
      {
        zone: 'Zone 7',
        name: 'Neuromuscular Power',
        minPct: 151,
        maxPct: 250,
        minWatts: Math.round(f * 1.51),
        maxWatts: Math.round(f * 2.50),
        minWkg: parseFloat(((f * 1.51) / w).toFixed(2)),
        maxWkg: parseFloat(((f * 2.50) / w).toFixed(2)),
        color: 'text-purple-400',
        bgColor: 'bg-purple-950/20',
        borderColor: 'border-purple-500/30',
        description: 'Maximal sprints under 15 seconds, neuromuscular recruitment and ATP-CP system.'
      }
    ];
  }, [calculatedFtp, riderWeightKg]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Cycling FTP (Functional Threshold Power) Zones Calculator</h1>
            <p className="text-sm text-slate-400">
              Calculate cycling Functional Threshold Power and Coggan 7-tier wattage and W/kg training power zones from 20-minute time trials or ramp tests.
            </p>
          </div>
        </div>

        {/* FTP Banner */}
        <div className="mt-4 p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 block">Functional Threshold Power (FTP)</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-amber-400 font-mono">{calculatedFtp}</span>
              <span className="text-sm text-slate-400 font-normal">WATTS</span>
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Power-to-Weight Ratio</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-cyan-400 font-mono">{ftpWkg}</span>
              <span className="text-sm text-slate-400 font-normal">W/kg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-white">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Test & Athlete Setup</h2>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Test Protocol</label>
            <select
              value={testProtocol}
              onChange={(e) => setTestProtocol(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="20min">20-Minute Time Trial (95% Rule)</option>
              <option value="ramp">Ramp Test Step Power (75% Rule)</option>
              <option value="direct">Direct FTP Entry</option>
            </select>
          </div>

          {testProtocol !== 'direct' ? (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {testProtocol === '20min' ? '20-Minute Average Watts' : 'Final Step Power (Watts)'}
              </label>
              <input
                type="number"
                min="50"
                max="600"
                value={testAverageWatts}
                onChange={(e) => setTestAverageWatts(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Known FTP (Watts)</label>
              <input
                type="number"
                min="50"
                max="600"
                value={directFtpWatts}
                onChange={(e) => setDirectFtpWatts(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Rider Weight (kg)</label>
            <input
              type="number"
              min="30"
              max="150"
              value={riderWeightKg}
              onChange={(e) => setRiderWeightKg(Math.max(1, Number(e.target.value)))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 block">Sweet Spot Target:</span>
            <p className="font-mono text-amber-300">
              {Math.round(calculatedFtp * 0.88)} - {Math.round(calculatedFtp * 0.94)} Watts (88% - 94% FTP)
            </p>
          </div>
        </div>

        {/* Zones */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Coggan 7-Zone Power Profile</h2>

          <div className="space-y-2">
            {zones.map((z) => (
              <div
                key={z.zone}
                className={`p-3 rounded-xl border ${z.bgColor} ${z.borderColor} flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className={`font-bold text-xs ${z.color}`}>{z.zone}</span>
                    <span className="text-xs font-medium text-slate-200">{z.name}</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-white">
                    {z.minWatts} – {z.maxWatts} <span className="text-[10px] font-normal text-slate-400">W</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{z.minPct}% - {z.maxPct}% FTP</span>
                  <span className="font-mono text-slate-300">{z.minWkg} - {z.maxWkg} W/kg</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CyclingFtpPowerZonesCalculator;
