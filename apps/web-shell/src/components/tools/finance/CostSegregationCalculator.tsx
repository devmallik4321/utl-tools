'use client';

import React, { useState, useMemo } from 'react';
import { Building2, DollarSign, PieChart, ShieldAlert, CheckCircle2, TrendingUp, Info } from 'lucide-react';

export function CostSegregationCalculator() {
  const [purchasePrice, setPurchasePrice] = useState<number>(3500000);
  const [landValuePct, setLandValuePct] = useState<number>(20); // 20% land (non-depreciable)
  const [propertyType, setPropertyType] = useState<'commercial' | 'residential'>('commercial');
  const [bonusDeprRate, setBonusDeprRate] = useState<number>(60); // 60% in 2024, 40% in 2025
  const [investorTaxBracket, setInvestorTaxBracket] = useState<number>(37); // 37% top bracket

  // Cost Segregation asset class reallocations (Percentages of depreciable building basis)
  const [fiveYearPct, setFiveYearPct] = useState<number>(15); // Personal property (carpet, lighting, cabinetry)
  const [fifteenYearPct, setFifteenYearPct] = useState<number>(12); // Land improvements (paving, fences, curbs)

  const calculations = useMemo(() => {
    const landValue = purchasePrice * (landValuePct / 100);
    const depreciableBasis = Math.max(0, purchasePrice - landValue);

    // Standard straight line without cost seg:
    // Commercial: 39 years (~2.564% per year)
    // Residential: 27.5 years (~3.636% per year)
    const recoveryYears = propertyType === 'commercial' ? 39 : 27.5;
    const standardYear1Depr = depreciableBasis / recoveryYears;
    const standardYear1TaxSavings = standardYear1Depr * (investorTaxBracket / 100);

    // With Cost Segregation:
    const fiveYearBasis = depreciableBasis * (fiveYearPct / 100);
    const fifteenYearBasis = depreciableBasis * (fifteenYearPct / 100);
    const remainingBuildingBasis = Math.max(0, depreciableBasis - fiveYearBasis - fifteenYearBasis);

    // Bonus depreciation applied to <20 year property (5-year and 15-year property qualify!)
    const eligibleBonusBasis = fiveYearBasis + fifteenYearBasis;
    const bonusDeduction = eligibleBonusBasis * (bonusDeprRate / 100);

    // Remaining 5-yr and 15-yr normal MACRS Year 1
    const residual5Yr = fiveYearBasis - (fiveYearBasis * (bonusDeprRate / 100));
    const residual15Yr = fifteenYearBasis - (fifteenYearBasis * (bonusDeprRate / 100));
    const macrs5Yr = residual5Yr * 0.20; // 20% 5-yr half-year
    const macrs15Yr = residual15Yr * 0.05; // 5% 15-yr half-year

    // Remaining building basis straight line
    const remainingBuildingYear1 = remainingBuildingBasis / recoveryYears;

    const totalCostSegYear1Depr = bonusDeduction + macrs5Yr + macrs15Yr + remainingBuildingYear1;
    const costSegYear1TaxSavings = totalCostSegYear1Depr * (investorTaxBracket / 100);

    const netFirstYearDeductionIncrease = Math.max(0, totalCostSegYear1Depr - standardYear1Depr);
    const netFirstYearCashSavings = Math.max(0, costSegYear1TaxSavings - standardYear1TaxSavings);

    return {
      depreciableBasis,
      standardYear1Depr,
      standardYear1TaxSavings,
      fiveYearBasis,
      fifteenYearBasis,
      remainingBuildingBasis,
      bonusDeduction,
      totalCostSegYear1Depr,
      costSegYear1TaxSavings,
      netFirstYearDeductionIncrease,
      netFirstYearCashSavings
    };
  }, [purchasePrice, landValuePct, propertyType, bonusDeprRate, investorTaxBracket, fiveYearPct, fifteenYearPct]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Real Estate Cost Segregation & Bonus Depreciation Calculator</h1>
            <p className="text-sm text-slate-400">
              Accelerate real estate tax deductions by segregating 5-year personal property and 15-year land improvements to trigger immediate Year 1 bonus depreciation.
            </p>
          </div>
        </div>

        {/* Highlights */}
        <div className="mt-4 p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 block">Year 1 Accelerated Tax Write-Off</span>
            <span className="text-3xl font-black text-emerald-400 font-mono">
              ${calculations.totalCostSegYear1Depr.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Extra Year 1 Cash Tax Shield</span>
            <span className="text-2xl font-bold text-cyan-400 font-mono">
              +${calculations.netFirstYearCashSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-white">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Property & Tax Inputs</h2>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Acquisition Purchase Price ($)</label>
            <input
              type="number"
              min="100000"
              step="100000"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(Math.max(1, Number(e.target.value)))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Land Allocation (%)</label>
              <input
                type="number"
                min="5"
                max="50"
                value={landValuePct}
                onChange={(e) => setLandValuePct(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Property Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="commercial">Commercial (39-Yr)</option>
                <option value="residential">Residential (27.5-Yr)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Bonus Depr Rate (%)</label>
              <select
                value={bonusDeprRate}
                onChange={(e) => setBonusDeprRate(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="60">60% (2024 Placed in Service)</option>
                <option value="40">40% (2025 Placed in Service)</option>
                <option value="20">20% (2026 Placed in Service)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tax Bracket (%)</label>
              <input
                type="number"
                min="10"
                max="50"
                value={investorTaxBracket}
                onChange={(e) => setInvestorTaxBracket(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold uppercase text-slate-400">Reallocated Asset Buckets</h3>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">5-Year Personal Property (Fixtures, Carpets)</span>
                <span className="font-mono text-emerald-400">{fiveYearPct}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="35"
                value={fiveYearPct}
                onChange={(e) => setFiveYearPct(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">15-Year Land Improvements (Paving, Curbs)</span>
                <span className="font-mono text-emerald-400">{fifteenYearPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={fifteenYearPct}
                onChange={(e) => setFifteenYearPct(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-6">
          <h2 className="text-base font-semibold text-slate-200">First-Year Depreciation Comparison</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <span className="text-xs font-semibold text-slate-400 block">Standard Straight-Line</span>
              <div className="text-2xl font-bold font-mono text-slate-300">
                ${calculations.standardYear1Depr.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <span className="text-xs text-slate-400 block">
                Cash Tax Savings: ${calculations.standardYear1TaxSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
              <span className="text-xs font-semibold text-emerald-400 block">With Cost Segregation</span>
              <div className="text-2xl font-bold font-mono text-emerald-300">
                ${calculations.totalCostSegYear1Depr.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <span className="text-xs text-emerald-300 font-semibold block">
                Cash Tax Savings: ${calculations.costSegYear1TaxSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2 text-xs text-slate-400">
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 flex-shrink-0 text-emerald-400 mt-0.5" />
              <span>
                By completing an engineering-based Cost Segregation study, real estate syndicators and property investors can front-load deductions into Year 1, creating substantial passive paper losses to offset active or real estate professional status income.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CostSegregationCalculator;
