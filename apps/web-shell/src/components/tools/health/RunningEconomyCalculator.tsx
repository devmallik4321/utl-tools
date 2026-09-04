'use client';

import React, { useState, useId } from 'react';
import {
  Activity,
  Heart,
  Flame,
  TrendingUp,
  Award,
  Copy,
  Check,
  RotateCcw,
  Info,
  Zap,
  Gauge
} from 'lucide-react';

interface RunningPreset {
  name: string;
  vo2Submax: number; // mL/kg/min
  speedKmh: number; // km/h
  weightKg: number;
  rer: number;
}

const PRESETS: RunningPreset[] = [
  {
    name: 'Elite Marathoner (~185 mL/kg/km)',
    vo2Submax: 52.0,
    speedKmh: 17.0, // 3:31 min/km pace
    weightKg: 58,
    rer: 0.88,
  },
  {
    name: 'Competitive Club Runner (Sub-3 hr)',
    vo2Submax: 48.5,
    speedKmh: 14.5, // 4:08 min/km pace
    weightKg: 68,
    rer: 0.90,
  },
  {
    name: 'Recreational Road Runner',
    vo2Submax: 42.0,
    speedKmh: 11.0, // 5:27 min/km pace
    weightKg: 74,
    rer: 0.92,
  },
];

export function RunningEconomyCalculator() {
  const vo2Id = useId();
  const speedId = useId();
  const weightId = useId();
  const rerId = useId();

  const [vo2Submax, setVo2Submax] = useState<number>(48.5);
  const [speedKmh, setSpeedKmh] = useState<number>(14.5);
  const [weightKg, setWeightKg] = useState<number>(68);
  const [rer, setRer] = useState<number>(0.90);
  const [copied, setCopied] = useState<boolean>(false);

  // Oxygen Cost of Running (C_R): mL O2 / kg / km
  // speed in km/min = speedKmh / 60
  // RE = vo2Submax / (speedKmh / 60) = (vo2Submax * 60) / speedKmh
  const runningEconomyO2 = speedKmh > 0 ? (vo2Submax * 60) / speedKmh : 0;

  // Energy equivalent per liter of O2 via Péronnet & Massicotte formula:
  // kcal / L O2 = 3.815 + 1.232 * RER
  const kcalPerLiterO2 = 3.815 + 1.232 * Math.min(1.0, Math.max(0.7, rer));

  // Energy cost of running: kcal / kg / km
  const energyCostKcal = (runningEconomyO2 / 1000) * kcalPerLiterO2;

  // Energy cost in kJ / kg / km (1 kcal = 4.184 kJ)
  const energyCostKj = energyCostKcal * 4.184;

  // Total energy expenditure per hour (kcal/h)
  const hourlyKcal = energyCostKcal * weightKg * speedKmh;

  // Pace in min/km
  const paceSecondsTotal = speedKmh > 0 ? Math.round(3600 / speedKmh) : 0;
  const paceMin = Math.floor(paceSecondsTotal / 60);
  const paceSec = paceSecondsTotal % 60;
  const formattedPace = `${paceMin}:${paceSec.toString().padStart(2, '0')}/km`;

  // Classification Tier
  const getEconomyTier = (re: number) => {
    if (re <= 190) return { label: 'World-Class Elite', color: 'text-emerald-400', badge: 'Top 1% Global' };
    if (re <= 205) return { label: 'Highly Trained / Advanced', color: 'text-sky-400', badge: 'Competitive' };
    if (re <= 220) return { label: 'Trained Amateur', color: 'text-teal-400', badge: 'Good' };
    if (re <= 240) return { label: 'Moderate / Recreational', color: 'text-amber-400', badge: 'Average' };
    return { label: 'Low Economy (High Energy Cost)', color: 'text-rose-400', badge: 'Developing' };
  };

  const tier = getEconomyTier(runningEconomyO2);

  const applyPreset = (p: RunningPreset) => {
    setVo2Submax(p.vo2Submax);
    setSpeedKmh(p.speedKmh);
    setWeightKg(p.weightKg);
    setRer(p.rer);
  };

  const handleCopy = () => {
    const text = [
      `Running Economy & Aerobic Cost Profile`,
      `---------------------------------------`,
      `Oxygen Cost (Running Economy): ${runningEconomyO2.toFixed(1)} mL O2/kg/km (${tier.label})`,
      `Energy Cost of Running:        ${energyCostKcal.toFixed(2)} kcal/kg/km (${energyCostKj.toFixed(1)} kJ/kg/km)`,
      `Hourly Energy Burn:            ${Math.round(hourlyKcal)} kcal/hr`,
      `Submaximal Speed / Pace:       ${speedKmh.toFixed(1)} km/h (${formattedPace})`,
      `Measured Submaximal VO2:       ${vo2Submax.toFixed(1)} mL/kg/min`,
      `Respiratory Exchange (RER):    ${rer.toFixed(2)}`,
      `Caloric Density:               ${kcalPerLiterO2.toFixed(3)} kcal/L O2`,
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
            {copied ? 'Copied' : 'Copy Analysis'}
          </button>
          <button
            onClick={() => applyPreset(PRESETS[0])}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Running Economy (O2 Cost)</span>
          <div className={`mt-1 text-2xl font-bold tracking-tight ${tier.color}`}>
            {runningEconomyO2.toFixed(1)} <span className="text-xs font-normal text-slate-400">mL/kg/km</span>
          </div>
          <div className="mt-1 text-xs text-slate-400">{tier.label}</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Energy Cost of Running</span>
          <div className="mt-1 text-2xl font-bold text-sky-400 tracking-tight">
            {energyCostKcal.toFixed(2)} <span className="text-xs font-normal text-slate-400">kcal/kg/km</span>
          </div>
          <div className="mt-1 text-xs text-slate-400">{energyCostKj.toFixed(1)} kJ/kg/km</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Hourly Caloric Burn</span>
          <div className="mt-1 text-2xl font-bold text-amber-400 tracking-tight">
            {Math.round(hourlyKcal)} <span className="text-xs font-normal text-slate-400">kcal/hr</span>
          </div>
          <div className="mt-1 text-xs text-slate-400">At {speedKmh.toFixed(1)} km/h pace</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Running Pace</span>
          <div className="mt-1 text-2xl font-bold text-emerald-400 tracking-tight font-mono">
            {formattedPace}
          </div>
          <div className="mt-1 text-xs text-slate-400">{speedKmh.toFixed(1)} km/h</div>
        </div>
      </div>

      {/* Inputs + Physiological Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs Panel */}
        <div className="lg:col-span-5 space-y-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Gauge className="w-4 h-4 text-emerald-400" />
            Physiological Laboratory Inputs
          </h3>

          <div>
            <label htmlFor={vo2Id} className="block text-xs font-medium text-slate-400 mb-1">
              Submaximal Oxygen Uptake (VO2 in mL/kg/min)
            </label>
            <input
              id={vo2Id}
              type="number"
              step="0.5"
              min="15"
              max="90"
              value={vo2Submax}
              onChange={(e) => setVo2Submax(Math.max(10, Number(e.target.value) || 0))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={speedId} className="block text-xs font-medium text-slate-400 mb-1">
                Treadmill Speed (km/h)
              </label>
              <input
                id={speedId}
                type="number"
                step="0.5"
                min="5"
                max="25"
                value={speedKmh}
                onChange={(e) => setSpeedKmh(Math.max(1, Number(e.target.value) || 1))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label htmlFor={weightId} className="block text-xs font-medium text-slate-400 mb-1">
                Athlete Weight (kg)
              </label>
              <input
                id={weightId}
                type="number"
                step="1"
                min="35"
                max="160"
                value={weightKg}
                onChange={(e) => setWeightKg(Math.max(30, Number(e.target.value) || 60))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label htmlFor={rerId} className="block text-xs font-medium text-slate-400 mb-1">
              Respiratory Exchange Ratio (RER = VCO2 / VO2): <span className="text-emerald-400 font-mono font-bold">{rer.toFixed(2)}</span>
            </label>
            <input
              id={rerId}
              type="range"
              min="0.70"
              max="1.00"
              step="0.01"
              value={rer}
              onChange={(e) => setRer(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Submaximal aerobic range: 0.70 (100% fat oxidation) to 1.00 (100% carbohydrate oxidation)
            </span>
          </div>
        </div>

        {/* Right Reference Spectrum & Benchmarks */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-sky-400" />
              Running Economy Benchmark Spectrum
            </h3>

            {/* Spectrum Visual Indicator */}
            <div className="space-y-2">
              <div className="w-full h-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 via-amber-500 to-rose-500 rounded-full relative">
                {/* Pointer marker */}
                <div
                  className="absolute -top-1.5 w-6 h-6 -ml-3 bg-white border-2 border-slate-900 rounded-full shadow-md transition-all flex items-center justify-center"
                  style={{
                    left: `${Math.min(100, Math.max(0, ((runningEconomyO2 - 170) / (260 - 170)) * 100))}%`,
                  }}
                >
                  <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>170 mL (Super Elite)</span>
                <span>205 mL (Trained)</span>
                <span>240 mL (Recreational)</span>
                <span>260+ mL</span>
              </div>
            </div>
          </div>

          {/* Benchmark Table */}
          <div className="rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">O2 Cost (mL/kg/km)</th>
                  <th className="px-4 py-3 text-right">Energy Cost (kcal/kg/km)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                <tr className="text-emerald-400">
                  <td className="px-4 py-2.5 font-medium">World Class Elite Marathoner</td>
                  <td className="px-4 py-2.5 text-right font-mono">&lt; 190 mL</td>
                  <td className="px-4 py-2.5 text-right font-mono">&lt; 0.93 kcal</td>
                </tr>
                <tr className="text-sky-400">
                  <td className="px-4 py-2.5 font-medium">Sub-3hr Club Competitor</td>
                  <td className="px-4 py-2.5 text-right font-mono">190 – 210 mL</td>
                  <td className="px-4 py-2.5 text-right font-mono">0.93 – 1.03 kcal</td>
                </tr>
                <tr className="text-teal-400">
                  <td className="px-4 py-2.5 font-medium">Well-Trained Endurance Runner</td>
                  <td className="px-4 py-2.5 text-right font-mono">210 – 225 mL</td>
                  <td className="px-4 py-2.5 text-right font-mono">1.03 – 1.10 kcal</td>
                </tr>
                <tr className="text-amber-400">
                  <td className="px-4 py-2.5 font-medium">Recreational Runner</td>
                  <td className="px-4 py-2.5 text-right font-mono">225 – 245 mL</td>
                  <td className="px-4 py-2.5 text-right font-mono">1.10 – 1.20 kcal</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Scientific Background Notes */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2 text-xs text-slate-400">
        <h4 className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-4 h-4 text-sky-400" />
          The Science of Running Economy (RE) in Distance Running
        </h4>
        <p>
          Running economy represents the steady-state aerobic demand required to maintain a given submaximal velocity. Unlike VO2 max (which dictates your aerobic ceiling), running economy determines how much speed you extract from every liter of oxygen consumed. Elite runners consume significantly less oxygen per kilometer due to superior biomechanics, tendon elastic energy recoil, and muscle fiber composition.
        </p>
      </div>
    </div>
  );
}

export default RunningEconomyCalculator;

