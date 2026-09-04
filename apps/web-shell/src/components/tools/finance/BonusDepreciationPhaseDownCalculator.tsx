'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, DollarSign, TrendingDown, PieChart, ShieldAlert, CheckCircle2, Info } from 'lucide-react';

interface YearSchedule {
  year: number;
  bonusRate: number;
  bonusDeduction: number;
  macrsYear1: number;
  totalYear1Deduction: number;
  taxSavings: number;
}

export function BonusDepreciationPhaseDownCalculator() {
  const [capexAmount, setCapexAmount] = useState<number>(1000000); // $1M equipment purchase
  const [taxBracket, setTaxBracket] = useState<number>(37); // 37% tax rate
  const [discountRate, setDiscountRate] = useState<number>(8); // 8% cost of capital for NPV

  const phaseDownSchedule: YearSchedule[] = useMemo(() => {
    const rates: Record<number, number> = {
      2023: 80,
      2024: 60,
      2025: 40,
      2026: 20,
      2027: 0
    };

    return Object.entries(rates).map(([yrStr, rate]) => {
      const year = parseInt(yrStr, 10);
      const bonusDeduction = capexAmount * (rate / 100);
      const remainingBasis = capexAmount - bonusDeduction;
      // Normal 5-year MACRS half-year convention is 20% on remaining basis
      const macrsYear1 = remainingBasis * 0.20;
      const totalYear1Deduction = bonusDeduction + macrsYear1;
      const taxSavings = totalYear1Deduction * (taxBracket / 100);

      return {
        year,
        bonusRate: rate,
        bonusDeduction,
        macrsYear1,
        totalYear1Deduction,
        taxSavings
      };
    });
  }, [capexAmount, taxBracket]);

  const taxDifference = useMemo(() => {
    const yr2024 = phaseDownSchedule.find((s) => s.year === 2024)?.taxSavings || 0;
    const yr2027 = phaseDownSchedule.find((s) => s.year === 2027)?.taxSavings || 0;
    return yr2024 - yr2027;
  }, [phaseDownSchedule]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">TCJA Bonus Depreciation Phase-Down Calculator</h1>
            <p className="text-sm text-slate-400">
              Model the statutory 20% annual step-down in first-year bonus depreciation under the Tax Cuts and Jobs Act to optimize capital asset purchase timing.
            </p>
          </div>
        </div>

        {/* Highlights */}
        <div className="mt-4 p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 block">Immediate 2024 Tax Savings (60% Bonus)</span>
            <span className="text-3xl font-black text-emerald-400 font-mono">
              ${phaseDownSchedule.find((s) => s.year === 2024)?.taxSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">2024 vs 2027 Year 1 Cash Difference</span>
            <span className="text-2xl font-bold text-amber-400 font-mono">
              +${taxDifference.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-white">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span>CapEx Investment Settings</span>
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Qualifying Asset Purchase Cost ($)</label>
            <input
              type="number"
              min="10000"
              step="50000"
              value={capexAmount}
              onChange={(e) => setCapexAmount(Math.max(1, Number(e.target.value)))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Effective Marginal Tax Rate (%)</label>
            <input
              type="number"
              min="10"
              max="50"
              value={taxBracket}
              onChange={(e) => setTaxBracket(Math.min(50, Math.max(1, Number(e.target.value))))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 block">TCJA Phase-Down Rules:</span>
            <p>
              Under IRC Section 168(k), 100% bonus expired on Dec 31, 2022. It decreases by 20% each year: 80% (2023), 60% (2024), 40% (2025), 20% (2026), and fully sunsets to 0% in 2027 unless extended by Congress.
            </p>
          </div>
        </div>

        {/* Schedule Table */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4">
          <h2 className="text-base font-semibold text-slate-200">Year 1 Write-Off by Placed-in-Service Year</h2>

          <div className="space-y-2.5">
            {phaseDownSchedule.map((s) => (
              <div
                key={s.year}
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  s.year === 2024
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-white'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm font-mono">{s.year}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                      {s.bonusRate}% Bonus
                    </span>
                    {s.year === 2024 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                        CURRENT YEAR
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Bonus: ${s.bonusDeduction.toLocaleString()} + MACRS: ${s.macrsYear1.toLocaleString()}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold font-mono block">
                    ${s.totalYear1Deduction.toLocaleString()} write-off
                  </span>
                  <span className="text-xs text-emerald-400 font-mono">
                    ${s.taxSavings.toLocaleString()} tax savings
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BonusDepreciationPhaseDownCalculator;
