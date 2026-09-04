'use client';

import React, { useState, useId } from 'react';
import {
  DollarSign,
  TrendingUp,
  Percent,
  Calendar,
  Grid,
  Copy,
  Check,
  RotateCcw,
  Info,
  Scale
} from 'lucide-react';

interface LtvPreset {
  name: string;
  arpuMonthly: number;
  grossMarginPct: number;
  monthlyChurnPct: number;
  cac: number;
}

const PRESETS: LtvPreset[] = [
  {
    name: 'Mid-Market B2B SaaS',
    arpuMonthly: 1200,
    grossMarginPct: 80,
    monthlyChurnPct: 1.5,
    cac: 9500,
  },
  {
    name: 'Enterprise High-ACV SaaS',
    arpuMonthly: 6000,
    grossMarginPct: 85,
    monthlyChurnPct: 0.8,
    cac: 45000,
  },
  {
    name: 'Product-Led Growth (PLG)',
    arpuMonthly: 150,
    grossMarginPct: 75,
    monthlyChurnPct: 3.0,
    cac: 900,
  },
];

export function LtvCacPaybackSensitivityCalculator() {
  const arpuId = useId();
  const marginId = useId();
  const churnId = useId();
  const cacId = useId();

  const [arpuMonthly, setArpuMonthly] = useState<number>(1200);
  const [grossMarginPct, setGrossMarginPct] = useState<number>(80);
  const [monthlyChurnPct, setMonthlyChurnPct] = useState<number>(1.5);
  const [cac, setCac] = useState<number>(9500);
  const [copied, setCopied] = useState<boolean>(false);

  // Financial Calculations
  const grossProfitMonthly = arpuMonthly * (grossMarginPct / 100);
  const churnDecimal = Math.max(0.001, monthlyChurnPct / 100);
  const customerLifetimeMonths = 1 / churnDecimal;

  // LTV = (ARPU * Gross Margin) / Churn
  const ltv = grossProfitMonthly / churnDecimal;
  const ltvCacRatio = cac > 0 ? ltv / cac : 0;

  // CAC Payback = CAC / (ARPU * Gross Margin) in months
  const cacPaybackMonths = grossProfitMonthly > 0 ? cac / grossProfitMonthly : 0;

  // Sensitivity Matrix Variations
  const cacMultipliers = [0.7, 0.85, 1.0, 1.15, 1.3];
  const churnMultipliers = [0.6, 0.8, 1.0, 1.25, 1.5];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const applyPreset = (p: LtvPreset) => {
    setArpuMonthly(p.arpuMonthly);
    setGrossMarginPct(p.grossMarginPct);
    setMonthlyChurnPct(p.monthlyChurnPct);
    setCac(p.cac);
  };

  const handleCopy = () => {
    const text = [
      `SaaS LTV/CAC & Payback Sensitivity Analysis`,
      `--------------------------------------------`,
      `Monthly ARPU:          ${formatCurrency(arpuMonthly)}`,
      `Gross Margin:          ${grossMarginPct}%`,
      `Monthly Churn:         ${monthlyChurnPct.toFixed(2)}% (Annualized: ${(100 * (1 - Math.pow(1 - monthlyChurnPct / 100, 12))).toFixed(1)}%)`,
      `Blended CAC:           ${formatCurrency(cac)}`,
      `--------------------------------------------`,
      `Customer Lifetime:     ${customerLifetimeMonths.toFixed(1)} months`,
      `Customer LTV:          ${formatCurrency(ltv)}`,
      `LTV : CAC Ratio:       ${ltvCacRatio.toFixed(2)}x`,
      `CAC Payback Period:    ${cacPaybackMonths.toFixed(1)} months`,
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
          <span className="text-xs font-medium text-slate-400">CAC Payback Period</span>
          <div className={`mt-1 text-2xl font-bold tracking-tight ${cacPaybackMonths <= 12 ? 'text-emerald-400' : cacPaybackMonths <= 18 ? 'text-blue-400' : 'text-amber-400'}`}>
            {cacPaybackMonths.toFixed(1)} <span className="text-xs font-normal text-slate-400">mos</span>
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {cacPaybackMonths <= 12 ? 'Top Quartile (<12 mos)' : cacPaybackMonths <= 18 ? 'Healthy SaaS Standard' : 'Capital Intensive'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">LTV : CAC Ratio</span>
          <div className={`mt-1 text-2xl font-bold tracking-tight ${ltvCacRatio >= 4 ? 'text-emerald-400' : ltvCacRatio >= 3 ? 'text-sky-400' : 'text-amber-400'}`}>
            {ltvCacRatio.toFixed(2)}x
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {ltvCacRatio >= 3 ? 'Efficient Unit Economics' : 'Sub-Optimal Margin'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Customer Lifetime Value (LTV)</span>
          <div className="mt-1 text-2xl font-bold text-emerald-400 tracking-tight">{formatCurrency(ltv)}</div>
          <div className="mt-1 text-xs text-slate-400">Gross-profit adjusted</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Avg Customer Lifetime</span>
          <div className="mt-1 text-2xl font-bold text-white tracking-tight">
            {customerLifetimeMonths.toFixed(1)} <span className="text-xs font-normal text-slate-400">mos</span>
          </div>
          <div className="mt-1 text-xs text-slate-400 font-mono">{(customerLifetimeMonths / 12).toFixed(1)} years</div>
        </div>
      </div>

      {/* Inputs + Sensitivity Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs Panel */}
        <div className="lg:col-span-5 space-y-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Unit Economics Drivers
          </h3>

          <div>
            <label htmlFor={arpuId} className="block text-xs font-medium text-slate-400 mb-1">
              Monthly ARPU ($ Recurring Revenue / Customer)
            </label>
            <input
              id={arpuId}
              type="number"
              step="50"
              value={arpuMonthly}
              onChange={(e) => setArpuMonthly(Math.max(1, Number(e.target.value) || 0))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={marginId} className="block text-xs font-medium text-slate-400 mb-1">
                Gross Margin (%)
              </label>
              <input
                id={marginId}
                type="number"
                step="1"
                min="10"
                max="100"
                value={grossMarginPct}
                onChange={(e) => setGrossMarginPct(Math.max(1, Number(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label htmlFor={churnId} className="block text-xs font-medium text-slate-400 mb-1">
                Monthly Churn (%)
              </label>
              <input
                id={churnId}
                type="number"
                step="0.1"
                min="0.1"
                max="30"
                value={monthlyChurnPct}
                onChange={(e) => setMonthlyChurnPct(Math.max(0.01, Number(e.target.value) || 0.1))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label htmlFor={cacId} className="block text-xs font-medium text-slate-400 mb-1">
              Blended Customer Acquisition Cost (CAC in $)
            </label>
            <input
              id={cacId}
              type="number"
              step="500"
              value={cac}
              onChange={(e) => setCac(Math.max(1, Number(e.target.value) || 0))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        {/* Right Sensitivity Matrix */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Grid className="w-4 h-4 text-sky-400" />
              CAC Payback Sensitivity Matrix (Months)
            </h3>
            <p className="text-xs text-slate-400">
              Evaluates payback duration under varying CAC expenditure (rows) and customer retention churn scenarios (columns).
            </p>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="bg-slate-800/80 text-slate-400 text-[10px] uppercase font-mono">
                    <th className="p-2 text-left">CAC \ Churn</th>
                    {churnMultipliers.map((cm, i) => (
                      <th key={i} className="p-2">
                        {(monthlyChurnPct * cm).toFixed(1)}%
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono text-xs">
                  {cacMultipliers.map((cacM, rowIdx) => {
                    const simCac = cac * cacM;
                    const isBaseRow = cacM === 1.0;
                    return (
                      <tr key={rowIdx} className={isBaseRow ? 'bg-slate-800/30 font-semibold' : ''}>
                        <td className="p-2 text-left text-slate-300 font-sans">
                          {formatCurrency(simCac)}
                        </td>
                        {churnMultipliers.map((cm, colIdx) => {
                          const simPayback = grossProfitMonthly > 0 ? simCac / grossProfitMonthly : 0;
                          const isBaseCell = cacM === 1.0 && cm === 1.0;
                          let cellColor = 'text-emerald-400 bg-emerald-950/20';
                          if (simPayback > 18) cellColor = 'text-rose-400 bg-rose-950/20';
                          else if (simPayback > 12) cellColor = 'text-amber-400 bg-amber-950/20';

                          return (
                            <td
                              key={colIdx}
                              className={`p-2 border border-slate-800/60 ${cellColor} ${
                                isBaseCell ? 'ring-2 ring-sky-400 font-bold' : ''
                              }`}
                            >
                              {simPayback.toFixed(1)}m
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-3 text-[10px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> &lt;12 mos (Elite)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" /> 12-18 mos (Good)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" /> &gt;18 mos (High Risk)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Notes */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2 text-xs text-slate-400">
        <h4 className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-4 h-4 text-sky-400" />
          The Mathematics of SaaS Cash Flow Efficiency
        </h4>
        <p>
          CAC Payback measures how many months of gross profit are required to recoup the upfront sales and marketing expenditure to acquire a customer. Venture investors view payback &lt;12 months as the gold standard for deploying aggressive growth capital without running into acute cash depletion.
        </p>
      </div>
    </div>
  );
}

export default LtvCacPaybackSensitivityCalculator;
