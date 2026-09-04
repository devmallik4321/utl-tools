'use client';

import React, { useState, useId } from 'react';
import {
  Flame,
  TrendingUp,
  DollarSign,
  Gauge,
  Copy,
  Check,
  RotateCcw,
  Info,
  Scale,
  Calendar
} from 'lucide-react';

interface BurnPreset {
  name: string;
  netBurn: number;
  netNewArr: number;
  cashOnHand: number;
  periodMonths: number;
}

const PRESETS: BurnPreset[] = [
  {
    name: 'Top-Tier Efficient Growth (<1.0x)',
    netBurn: 1200000,
    netNewArr: 1600000,
    cashOnHand: 9000000,
    periodMonths: 12,
  },
  {
    name: 'Typical Series A/B Growth (1.2x)',
    netBurn: 3000000,
    netNewArr: 2500000,
    cashOnHand: 14000000,
    periodMonths: 12,
  },
  {
    name: 'High-Burn Turnaround Alert (>2.0x)',
    netBurn: 4000000,
    netNewArr: 1500000,
    cashOnHand: 6000000,
    periodMonths: 12,
  },
];

export function BurnMultipleEfficiencyCalculator() {
  const burnId = useId();
  const arrId = useId();
  const cashId = useId();
  const periodId = useId();

  const [netBurn, setNetBurn] = useState<number>(1200000);
  const [netNewArr, setNetNewArr] = useState<number>(1600000);
  const [cashOnHand, setCashOnHand] = useState<number>(9000000);
  const [periodMonths, setPeriodMonths] = useState<number>(12);
  const [copied, setCopied] = useState<boolean>(false);

  // Burn Multiple = Net Burn / Net New ARR
  const burnMultiple = netNewArr > 0 ? netBurn / netNewArr : netBurn > 0 ? 999 : 0;

  // Monthly burn rate
  const monthlyBurn = periodMonths > 0 ? netBurn / periodMonths : 0;
  const runwayMonths = monthlyBurn > 0 ? cashOnHand / monthlyBurn : 999;

  // Target ARR needed to reach 1.0x and 0.8x
  const targetArr1x = netBurn;
  const targetArr08x = netBurn / 0.8;

  // Tier Classification (Craft Ventures / David Sacks framework)
  const getTier = (bm: number) => {
    if (bm < 1.0) return { label: 'Amazing (Top Quartile)', color: 'text-emerald-400', desc: 'Generates more than $1 of recurring ARR for every $1 burned.' };
    if (bm <= 1.5) return { label: 'Good (Healthy Venture Growth)', color: 'text-sky-400', desc: 'Acceptable venture capital burn rate for expanding SaaS startups.' };
    if (bm <= 2.0) return { label: 'Suspect (Capital Inefficient)', color: 'text-amber-400', desc: 'Warning zone: costs are outpacing net revenue addition.' };
    return { label: 'Bad (High Burn Alert)', color: 'text-rose-400', desc: 'Critical risk: burning over $2 for every $1 of new ARR added.' };
  };

  const tier = getTier(burnMultiple);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const applyPreset = (p: BurnPreset) => {
    setNetBurn(p.netBurn);
    setNetNewArr(p.netNewArr);
    setCashOnHand(p.cashOnHand);
    setPeriodMonths(p.periodMonths);
  };

  const handleCopy = () => {
    const text = [
      `SaaS Burn Multiple & Capital Efficiency Analysis`,
      `-------------------------------------------------`,
      `Net Cash Burn:         ${formatCurrency(netBurn)} (${periodMonths} months)`,
      `Net New ARR Generated: ${formatCurrency(netNewArr)}`,
      `Cash Balance on Hand:  ${formatCurrency(cashOnHand)}`,
      `-------------------------------------------------`,
      `Burn Multiple:         ${burnMultiple >= 999 ? 'Inf' : burnMultiple.toFixed(2)}x (${tier.label})`,
      `Monthly Cash Burn:     ${formatCurrency(monthlyBurn)}/month`,
      `Runway Remaining:      ${runwayMonths >= 999 ? 'Infinite' : runwayMonths.toFixed(1)} months`,
      `Target ARR for 1.0x:   ${formatCurrency(targetArr1x)}`,
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
          <span className="text-xs font-medium text-slate-400">Burn Multiple</span>
          <div className={`mt-1 text-2xl font-bold tracking-tight ${tier.color}`}>
            {burnMultiple >= 999 ? 'Inf' : `${burnMultiple.toFixed(2)}x`}
          </div>
          <div className="mt-1 text-xs text-slate-400">{tier.label}</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Cash Runway Remaining</span>
          <div className={`mt-1 text-2xl font-bold tracking-tight ${runwayMonths >= 18 ? 'text-emerald-400' : runwayMonths >= 12 ? 'text-sky-400' : 'text-rose-400'}`}>
            {runwayMonths >= 999 ? 'Infinite' : `${runwayMonths.toFixed(1)} mos`}
          </div>
          <div className="mt-1 text-xs text-slate-400 font-mono">{(runwayMonths / 12).toFixed(1)} years of cash</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Monthly Cash Burn</span>
          <div className="mt-1 text-2xl font-bold text-white tracking-tight">{formatCurrency(monthlyBurn)}</div>
          <div className="mt-1 text-xs text-slate-400">Net outflow / month</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Burn per $1 New ARR</span>
          <div className="mt-1 text-2xl font-bold text-amber-400 tracking-tight font-mono">
            {netNewArr > 0 ? `$${(netBurn / netNewArr).toFixed(2)}` : 'N/A'}
          </div>
          <div className="mt-1 text-xs text-slate-400">Spent per $1 recurring ARR</div>
        </div>
      </div>

      {/* Grid Inputs + Benchmark Scale */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs Panel */}
        <div className="lg:col-span-5 space-y-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-400" />
            Financial Capital Inputs
          </h3>

          <div>
            <label htmlFor={burnId} className="block text-xs font-medium text-slate-400 mb-1">
              Net Cash Burn in Period ($)
            </label>
            <input
              id={burnId}
              type="number"
              step="50000"
              value={netBurn}
              onChange={(e) => setNetBurn(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>

          <div>
            <label htmlFor={arrId} className="block text-xs font-medium text-slate-400 mb-1">
              Net New ARR Generated in Period ($)
            </label>
            <input
              id={arrId}
              type="number"
              step="50000"
              value={netNewArr}
              onChange={(e) => setNetNewArr(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label htmlFor={cashId} className="block text-xs font-medium text-slate-400 mb-1">
              Current Cash Balance on Hand ($)
            </label>
            <input
              id={cashId}
              type="number"
              step="500000"
              value={cashOnHand}
              onChange={(e) => setCashOnHand(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <div>
            <label htmlFor={periodId} className="block text-xs font-medium text-slate-400 mb-1">
              Measurement Period Duration
            </label>
            <select
              id={periodId}
              value={periodMonths}
              onChange={(e) => setPeriodMonths(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            >
              <option value="12">Annual (12 Months / Full Year)</option>
              <option value="6">Trailing 6 Months</option>
              <option value="3">Quarterly (3 Months / Single Quarter)</option>
            </select>
          </div>
        </div>

        {/* Right Benchmark Spectrum */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Gauge className="w-4 h-4 text-sky-400" />
              David Sacks / Craft Ventures Benchmark Scale
            </h3>

            {/* Visual Indicator Bar */}
            <div className="space-y-2">
              <div className="w-full h-3.5 bg-gradient-to-r from-emerald-500 via-sky-500 via-amber-500 to-rose-500 rounded-full relative">
                <div
                  className="absolute -top-1.5 w-6 h-6 -ml-3 bg-white border-2 border-slate-900 rounded-full shadow-md transition-all flex items-center justify-center"
                  style={{
                    left: `${Math.min(100, Math.max(0, (burnMultiple / 2.5) * 100))}%`,
                  }}
                >
                  <div className="w-2 h-2 bg-slate-900 rounded-full" />
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>0.5x (Elite)</span>
                <span>1.0x (Good)</span>
                <span>1.5x (Suspect)</span>
                <span>2.0x+ (High Burn)</span>
              </div>
            </div>
          </div>

          {/* Benchmark Table */}
          <div className="rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Burn Multiple</th>
                  <th className="px-4 py-3 text-center">Rating</th>
                  <th className="px-4 py-3 text-right">Interpretation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                <tr className="text-emerald-400">
                  <td className="px-4 py-2.5 font-mono font-bold">&lt; 1.0x</td>
                  <td className="px-4 py-2.5 text-center">Amazing</td>
                  <td className="px-4 py-2.5 text-right font-sans text-slate-300">Capital efficient; top 10% SaaS</td>
                </tr>
                <tr className="text-sky-400">
                  <td className="px-4 py-2.5 font-mono font-bold">1.0x – 1.5x</td>
                  <td className="px-4 py-2.5 text-center">Good</td>
                  <td className="px-4 py-2.5 text-right font-sans text-slate-300">Healthy standard venture growth</td>
                </tr>
                <tr className="text-amber-400">
                  <td className="px-4 py-2.5 font-mono font-bold">1.5x – 2.0x</td>
                  <td className="px-4 py-2.5 text-center">Suspect</td>
                  <td className="px-4 py-2.5 text-right font-sans text-slate-300">Efficiency leak; watch CAC</td>
                </tr>
                <tr className="text-rose-400">
                  <td className="px-4 py-2.5 font-mono font-bold">&gt; 2.0x</td>
                  <td className="px-4 py-2.5 text-center">Bad</td>
                  <td className="px-4 py-2.5 text-right font-sans text-slate-300">Burning capital faster than growth</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Guide Notes */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2 text-xs text-slate-400">
        <h4 className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-4 h-4 text-sky-400" />
          The Power of the Burn Multiple Metric
        </h4>
        <p>
          Formulated by venture capitalist David Sacks of Craft Ventures, the Burn Multiple is the ultimate top-level indicator of startup capital efficiency. Unlike Magic Number or CAC payback (which isolate sales and marketing), the Burn Multiple reflects every dollar leaving the bank (engineering, overhead, marketing, executive salaries) relative to recurring top-line ARR created.
        </p>
      </div>
    </div>
  );
}

export default BurnMultipleEfficiencyCalculator;
