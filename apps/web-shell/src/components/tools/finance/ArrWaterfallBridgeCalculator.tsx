'use client';

import React, { useState, useId } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  Download,
  Info
} from 'lucide-react';

interface WaterfallPreset {
  name: string;
  startingArr: number;
  newBookings: number;
  expansion: number;
  contraction: number;
  churn: number;
}

const PRESETS: WaterfallPreset[] = [
  {
    name: 'High-Growth Enterprise SaaS',
    startingArr: 5000000,
    newBookings: 2200000,
    expansion: 1100000,
    contraction: 150000,
    churn: 250000,
  },
  {
    name: 'Steady Mid-Market SaaS',
    startingArr: 1200000,
    newBookings: 350000,
    expansion: 180000,
    contraction: 60000,
    churn: 90000,
  },
  {
    name: 'Early Stage / Post-Seed',
    startingArr: 250000,
    newBookings: 200000,
    expansion: 40000,
    contraction: 15000,
    churn: 25000,
  },
];

export function ArrWaterfallBridgeCalculator() {
  const startId = useId();
  const newBookingsId = useId();
  const expansionId = useId();
  const contractionId = useId();
  const churnId = useId();

  const [startingArr, setStartingArr] = useState<number>(5000000);
  const [newBookings, setNewBookings] = useState<number>(2200000);
  const [expansion, setExpansion] = useState<number>(1100000);
  const [contraction, setContraction] = useState<number>(150000);
  const [churn, setChurn] = useState<number>(250000);
  const [copied, setCopied] = useState<boolean>(false);

  // Calculations
  const grossAdditions = newBookings + expansion;
  const grossDeductions = contraction + churn;
  const netNewArr = grossAdditions - grossDeductions;
  const endingArr = Math.max(0, startingArr + netNewArr);

  // Retention & Growth Metrics
  const nrr = startingArr > 0 ? ((startingArr + expansion - contraction - churn) / startingArr) * 100 : 0;
  const grr = startingArr > 0 ? (Math.max(0, startingArr - contraction - churn) / startingArr) * 100 : 0;
  const arrGrowthPct = startingArr > 0 ? ((endingArr - startingArr) / startingArr) * 100 : 0;
  const quickRatio = grossDeductions > 0 ? grossAdditions / grossDeductions : grossAdditions > 0 ? 999 : 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatPct = (val: number) => {
    return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;
  };

  const applyPreset = (preset: WaterfallPreset) => {
    setStartingArr(preset.startingArr);
    setNewBookings(preset.newBookings);
    setExpansion(preset.expansion);
    setContraction(preset.contraction);
    setChurn(preset.churn);
  };

  const handleReset = () => {
    applyPreset(PRESETS[0]);
  };

  const handleCopySummary = () => {
    const summary = [
      `B2B SaaS ARR Waterfall Bridge Summary`,
      `---------------------------------------`,
      `Starting ARR:       ${formatCurrency(startingArr)}`,
      `(+) New Bookings:   ${formatCurrency(newBookings)}`,
      `(+) Expansion ARR:  ${formatCurrency(expansion)}`,
      `(-) Contraction:    ${formatCurrency(contraction)}`,
      `(-) Churned ARR:    ${formatCurrency(churn)}`,
      `---------------------------------------`,
      `Net New ARR:        ${formatCurrency(netNewArr)} (${formatPct(arrGrowthPct)})`,
      `Ending ARR:         ${formatCurrency(endingArr)}`,
      ``,
      `Key Efficiency & Retention Metrics:`,
      `• Net Retention Rate (NRR):   ${nrr.toFixed(1)}%`,
      `• Gross Retention Rate (GRR): ${grr.toFixed(1)}%`,
      `• SaaS Quick Ratio:           ${quickRatio >= 999 ? 'Inf' : quickRatio.toFixed(2)}x`,
    ].join('\n');

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Waterfall bars max scale
  const maxWaterfallVal = Math.max(startingArr, endingArr, grossAdditions, 1);

  return (
    <div className="space-y-8">
      {/* Header Controls / Presets */}
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
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Summary'}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Ending ARR</span>
          <div className="mt-1 text-2xl font-bold text-white tracking-tight">{formatCurrency(endingArr)}</div>
          <div className="mt-1 text-xs text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            {formatPct(arrGrowthPct)} vs Beginning
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Net Retention (NRR)</span>
          <div className={`mt-1 text-2xl font-bold tracking-tight ${nrr >= 110 ? 'text-emerald-400' : nrr >= 100 ? 'text-blue-400' : 'text-amber-400'}`}>
            {nrr.toFixed(1)}%
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {nrr >= 120 ? 'Top Quartile (>120%)' : nrr >= 100 ? 'Healthy Net Expansion' : 'Net Contraction Alert'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Gross Retention (GRR)</span>
          <div className={`mt-1 text-2xl font-bold tracking-tight ${grr >= 90 ? 'text-emerald-400' : grr >= 80 ? 'text-blue-400' : 'text-rose-400'}`}>
            {grr.toFixed(1)}%
          </div>
          <div className="mt-1 text-xs text-slate-400">Max 100% (Excludes Expansion)</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">SaaS Quick Ratio</span>
          <div className={`mt-1 text-2xl font-bold tracking-tight ${quickRatio >= 4 ? 'text-emerald-400' : quickRatio >= 2 ? 'text-blue-400' : 'text-amber-400'}`}>
            {quickRatio >= 999 ? 'Inf' : `${quickRatio.toFixed(2)}x`}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {quickRatio >= 4 ? 'Elite Growth Efficiency' : quickRatio >= 2 ? 'Sustainable' : 'High Leaky Bucket'}
          </div>
        </div>
      </div>

      {/* Inputs + Waterfall Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs Panel */}
        <div className="lg:col-span-5 space-y-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Waterfall Drivers ($)
          </h3>

          <div>
            <label htmlFor={startId} className="block text-xs font-medium text-slate-400 mb-1">
              Beginning / Starting ARR
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-slate-500">$</span>
              <input
                id={startId}
                type="number"
                min="0"
                step="10000"
                value={startingArr}
                onChange={(e) => setStartingArr(Math.max(0, Number(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Additions (+)</span>
            <div className="grid grid-cols-1 gap-3 mt-2">
              <div>
                <label htmlFor={newBookingsId} className="block text-xs font-medium text-slate-400 mb-1">
                  New Customer Bookings (New Logos)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500">$</span>
                  <input
                    id={newBookingsId}
                    type="number"
                    min="0"
                    step="5000"
                    value={newBookings}
                    onChange={(e) => setNewBookings(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={expansionId} className="block text-xs font-medium text-slate-400 mb-1">
                  Expansion ARR (Upsell & Cross-sell)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500">$</span>
                  <input
                    id={expansionId}
                    type="number"
                    min="0"
                    step="5000"
                    value={expansion}
                    onChange={(e) => setExpansion(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Deductions (-)</span>
            <div className="grid grid-cols-1 gap-3 mt-2">
              <div>
                <label htmlFor={contractionId} className="block text-xs font-medium text-slate-400 mb-1">
                  Contraction ARR (Downgrades / Seat Cuts)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500">$</span>
                  <input
                    id={contractionId}
                    type="number"
                    min="0"
                    step="5000"
                    value={contraction}
                    onChange={(e) => setContraction(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={churnId} className="block text-xs font-medium text-slate-400 mb-1">
                  Churned ARR (Lost Accounts / Cancellations)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500">$</span>
                  <input
                    id={churnId}
                    type="number"
                    min="0"
                    step="5000"
                    value={churn}
                    onChange={(e) => setChurn(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Visual Waterfall & Bridge Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-sky-400" />
              Visual ARR Bridge Breakdown
            </h3>

            {/* Visual Bar representation */}
            <div className="space-y-3 pt-2">
              {/* Beginning */}
              <div>
                <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                  <span>Starting ARR</span>
                  <span>{formatCurrency(startingArr)}</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.min(100, (startingArr / maxWaterfallVal) * 100)}%` }}
                  />
                </div>
              </div>

              {/* New Logos */}
              <div>
                <div className="flex justify-between text-xs text-emerald-400 font-medium mb-1">
                  <span>+ New Bookings (Logos)</span>
                  <span>+{formatCurrency(newBookings)}</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, (newBookings / maxWaterfallVal) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Expansion */}
              <div>
                <div className="flex justify-between text-xs text-teal-400 font-medium mb-1">
                  <span>+ Expansion ARR</span>
                  <span>+{formatCurrency(expansion)}</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full"
                    style={{ width: `${Math.min(100, (expansion / maxWaterfallVal) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Contraction */}
              <div>
                <div className="flex justify-between text-xs text-amber-400 font-medium mb-1">
                  <span>- Contraction ARR</span>
                  <span>-{formatCurrency(contraction)}</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${Math.min(100, (contraction / maxWaterfallVal) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Churn */}
              <div>
                <div className="flex justify-between text-xs text-rose-400 font-medium mb-1">
                  <span>- Churned ARR</span>
                  <span>-{formatCurrency(churn)}</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${Math.min(100, (churn / maxWaterfallVal) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Ending */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex justify-between text-xs text-white font-bold mb-1">
                  <span>Ending ARR</span>
                  <span>{formatCurrency(endingArr)}</span>
                </div>
                <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${Math.min(100, (endingArr / maxWaterfallVal) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table Breakdown */}
          <div className="rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Component</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">% of Starting</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-200">Starting ARR</td>
                  <td className="px-4 py-2.5 text-right font-mono">{formatCurrency(startingArr)}</td>
                  <td className="px-4 py-2.5 text-right text-slate-400">100.0%</td>
                </tr>
                <tr className="text-emerald-400">
                  <td className="px-4 py-2.5 font-medium">(+) New Bookings</td>
                  <td className="px-4 py-2.5 text-right font-mono">+{formatCurrency(newBookings)}</td>
                  <td className="px-4 py-2.5 text-right font-mono">+{startingArr > 0 ? ((newBookings / startingArr) * 100).toFixed(1) : 0}%</td>
                </tr>
                <tr className="text-teal-400">
                  <td className="px-4 py-2.5 font-medium">(+) Expansion ARR</td>
                  <td className="px-4 py-2.5 text-right font-mono">+{formatCurrency(expansion)}</td>
                  <td className="px-4 py-2.5 text-right font-mono">+{startingArr > 0 ? ((expansion / startingArr) * 100).toFixed(1) : 0}%</td>
                </tr>
                <tr className="text-amber-400">
                  <td className="px-4 py-2.5 font-medium">(-) Contraction ARR</td>
                  <td className="px-4 py-2.5 text-right font-mono">-{formatCurrency(contraction)}</td>
                  <td className="px-4 py-2.5 text-right font-mono">-{startingArr > 0 ? ((contraction / startingArr) * 100).toFixed(1) : 0}%</td>
                </tr>
                <tr className="text-rose-400">
                  <td className="px-4 py-2.5 font-medium">(-) Churned ARR</td>
                  <td className="px-4 py-2.5 text-right font-mono">-{formatCurrency(churn)}</td>
                  <td className="px-4 py-2.5 text-right font-mono">-{startingArr > 0 ? ((churn / startingArr) * 100).toFixed(1) : 0}%</td>
                </tr>
                <tr className="bg-slate-800/40 font-semibold text-white">
                  <td className="px-4 py-3">Net New ARR</td>
                  <td className={`px-4 py-3 text-right font-mono ${netNewArr >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {netNewArr >= 0 ? '+' : ''}{formatCurrency(netNewArr)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{formatPct(arrGrowthPct)}</td>
                </tr>
                <tr className="bg-slate-800/70 font-bold text-white">
                  <td className="px-4 py-3">Ending ARR</td>
                  <td className="px-4 py-3 text-right font-mono text-indigo-400">{formatCurrency(endingArr)}</td>
                  <td className="px-4 py-3 text-right font-mono">{startingArr > 0 ? ((endingArr / startingArr) * 100).toFixed(1) : 0}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Explanatory Guide */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-4 h-4 text-sky-400" />
          SaaS Waterfall Bridge Definitions & Industry Benchmarks
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/70 space-y-1">
            <span className="font-semibold text-slate-200">Net Retention Rate (NRR)</span>
            <p>
              Measures percentage of recurring revenue retained from existing customers over a period, including expansion, contraction, and churn. Top-tier enterprise SaaS benchmarks target &gt;120% NRR.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/70 space-y-1">
            <span className="font-semibold text-slate-200">Gross Retention Rate (GRR)</span>
            <p>
              Reflects the percentage of annual revenue retained excluding any expansion upsells. Capped at 100%. Healthy B2B enterprise SaaS typically sustains &gt;90% GRR.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/70 space-y-1">
            <span className="font-semibold text-slate-200">SaaS Quick Ratio</span>
            <p>
              Calculated as (New Bookings + Expansion) / (Contraction + Churn). A ratio &gt;4.0x signifies hyper-efficient growth where additions vastly outpace customer revenue leakage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArrWaterfallBridgeCalculator;

