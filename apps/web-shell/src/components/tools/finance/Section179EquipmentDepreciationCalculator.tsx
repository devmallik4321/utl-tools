'use client';

import React, { useState, useMemo } from 'react';
import { Calculator, DollarSign, PieChart, ShieldAlert, CheckCircle2, TrendingDown, ArrowRight, Info } from 'lucide-react';

interface TaxYearConfig {
  sec179Limit: number;
  phaseOutThreshold: number;
  bonusRate: number; // percentage
  heavySuvLimit: number;
}

const TAX_YEARS: Record<string, TaxYearConfig> = {
  '2024': {
    sec179Limit: 1220000,
    phaseOutThreshold: 3050000,
    bonusRate: 60,
    heavySuvLimit: 30500
  },
  '2025': {
    sec179Limit: 1250000,
    phaseOutThreshold: 3130000,
    bonusRate: 40,
    heavySuvLimit: 31300
  },
  '2026': {
    sec179Limit: 1280000,
    phaseOutThreshold: 3200000,
    bonusRate: 20,
    heavySuvLimit: 32000
  }
};

export function Section179EquipmentDepreciationCalculator() {
  const [taxYear, setTaxYear] = useState<string>('2024');
  const [equipmentCost, setEquipmentCost] = useState<number>(350000);
  const [totalEquipmentPlacedInService, setTotalEquipmentPlacedInService] = useState<number>(350000);
  const [businessUsePct, setBusinessUsePct] = useState<number>(100);
  const [propertyType, setPropertyType] = useState<'standard' | 'suv'>('standard');
  const [taxBracket, setTaxBracket] = useState<number>(37); // 37% federal + state or 21% C-corp

  const yearConfig = TAX_YEARS[taxYear] || TAX_YEARS['2024'];

  const results = useMemo(() => {
    // Eligible cost based on business use
    const qualifyingCost = equipmentCost * (businessUsePct / 100);

    // Business use must be > 50% for Section 179
    const isSec179Eligible = businessUsePct > 50;

    // Phase-out reduction: Dollar for dollar over threshold
    const excessOverThreshold = Math.max(0, totalEquipmentPlacedInService - yearConfig.phaseOutThreshold);
    const adjustedSec179Limit = Math.max(0, yearConfig.sec179Limit - excessOverThreshold);

    // Section 179 deduction
    let sec179Deduction = 0;
    if (isSec179Eligible) {
      const cap = propertyType === 'suv' ? Math.min(adjustedSec179Limit, yearConfig.heavySuvLimit) : adjustedSec179Limit;
      sec179Deduction = Math.min(qualifyingCost, cap);
    }

    // Remaining basis after Sec 179
    const remainingBasisAfter179 = qualifyingCost - sec179Deduction;

    // Bonus Depreciation on remaining basis
    const bonusDeduction = remainingBasisAfter179 * (yearConfig.bonusRate / 100);

    // Normal MACRS (5-year half-year convention 20%) on remaining basis
    const remainingBasisAfterBonus = remainingBasisAfter179 - bonusDeduction;
    const macrsYear1Deduction = remainingBasisAfterBonus * 0.20;

    const totalYear1Deduction = sec179Deduction + bonusDeduction + macrsYear1Deduction;
    const cashTaxSavings = totalYear1Deduction * (taxBracket / 100);
    const netEquipmentCost = equipmentCost - cashTaxSavings;

    return {
      qualifyingCost,
      isSec179Eligible,
      adjustedSec179Limit,
      excessOverThreshold,
      sec179Deduction,
      remainingBasisAfter179,
      bonusDeduction,
      macrsYear1Deduction,
      totalYear1Deduction,
      cashTaxSavings,
      netEquipmentCost
    };
  }, [equipmentCost, totalEquipmentPlacedInService, businessUsePct, propertyType, taxBracket, yearConfig]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">IRS Section 179 & Bonus Depreciation Calculator</h1>
            <p className="text-sm text-slate-400">
              Calculate tax year {taxYear} equipment write-offs, phase-out thresholds, bonus depreciation phase-down, and Year 1 cash tax savings.
            </p>
          </div>
        </div>

        {/* Highlight Banner */}
        <div className="mt-4 p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-wrap gap-6 items-center justify-between text-sm">
          <div>
            <span className="text-xs text-slate-400 block">Total Year 1 Write-Off</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono">
              ${results.totalYear1Deduction.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Year 1 Cash Tax Savings</span>
            <span className="text-2xl font-bold text-cyan-400 font-mono">
              ${results.cashTaxSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Net Effective Out-of-Pocket</span>
            <span className="text-2xl font-bold text-slate-100 font-mono">
              ${results.netEquipmentCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-white">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span>Equipment & Tax Settings</span>
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tax Year</label>
              <select
                value={taxYear}
                onChange={(e) => setTaxYear(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="2024">2024 (60% Bonus)</option>
                <option value="2025">2025 (40% Bonus)</option>
                <option value="2026">2026 (20% Bonus)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Asset Category</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as 'standard' | 'suv')}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              >
                <option value="standard">Equipment / Machinery / Tech</option>
                <option value="suv">Heavy SUV (&gt;6,000 lbs GVWR)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Equipment Purchase Price ($)</label>
            <input
              type="number"
              min="0"
              step="5000"
              value={equipmentCost}
              onChange={(e) => {
                const val = Math.max(0, Number(e.target.value));
                setEquipmentCost(val);
                setTotalEquipmentPlacedInService(val);
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Total Placed in Service (All CapEx in {taxYear})</label>
            <input
              type="number"
              min="0"
              step="10000"
              value={totalEquipmentPlacedInService}
              onChange={(e) => setTotalEquipmentPlacedInService(Math.max(0, Number(e.target.value)))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Used to calculate the ${yearConfig.phaseOutThreshold.toLocaleString()} phase-out threshold.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Business Use (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={businessUsePct}
                onChange={(e) => setBusinessUsePct(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tax Bracket (%)</label>
              <input
                type="number"
                min="0"
                max="50"
                value={taxBracket}
                onChange={(e) => setTaxBracket(Math.min(50, Math.max(0, Number(e.target.value))))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Rules info */}
          <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Sec 179 Cap:</span>
              <span className="font-mono text-slate-200">${yearConfig.sec179Limit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Phase-Out Limit:</span>
              <span className="font-mono text-slate-200">${yearConfig.phaseOutThreshold.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Bonus Depreciation Rate:</span>
              <span className="font-mono text-slate-200">{yearConfig.bonusRate}%</span>
            </div>
          </div>
        </div>

        {/* Results Breakdown */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-6">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center space-x-2">
            <PieChart className="w-5 h-5 text-emerald-400" />
            <span>Depreciation Deduction Waterfall</span>
          </h2>

          <div className="space-y-3">
            {/* Step 1: Sec 179 */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="font-semibold text-sm text-amber-300 block">1. Section 179 Deduction</span>
                <span className="text-xs text-slate-400">
                  {results.isSec179Eligible
                    ? `Capped at max $${results.adjustedSec179Limit.toLocaleString()} after phase-out`
                    : 'Ineligible (business use must exceed 50%)'}
                </span>
              </div>
              <span className="font-mono font-bold text-lg text-emerald-400">
                ${results.sec179Deduction.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>

            {/* Step 2: Bonus Depr */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="font-semibold text-sm text-cyan-300 block">
                  2. {yearConfig.bonusRate}% First-Year Bonus Depreciation
                </span>
                <span className="text-xs text-slate-400">
                  Applied to remaining basis: ${results.remainingBasisAfter179.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <span className="font-mono font-bold text-lg text-emerald-400">
                ${results.bonusDeduction.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>

            {/* Step 3: Regular MACRS */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="font-semibold text-sm text-slate-200 block">3. Regular MACRS Year 1 (20% 5-Yr Half-Year)</span>
                <span className="text-xs text-slate-400">Applied to residual un-deducted basis</span>
              </div>
              <span className="font-mono font-bold text-lg text-emerald-400">
                ${results.macrsYear1Deduction.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>

            {/* Total */}
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between">
              <div>
                <span className="font-bold text-base text-emerald-300 block">Total Year 1 Tax Deduction</span>
                <span className="text-xs text-slate-300">
                  {((results.totalYear1Deduction / (equipmentCost || 1)) * 100).toFixed(1)}% of original equipment cost expensed immediately
                </span>
              </div>
              <span className="font-mono font-bold text-2xl text-emerald-400">
                ${results.totalYear1Deduction.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-400 space-y-2">
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 flex-shrink-0 text-amber-400 mt-0.5" />
              <span>
                <strong>IRS Section 179 Phase-out Rule:</strong> If total qualifying property placed in service during the tax year exceeds the statutory threshold (${yearConfig.phaseOutThreshold.toLocaleString()} in {taxYear}), the allowable Section 179 deduction is reduced dollar-for-dollar. Once purchases reach ${ (yearConfig.phaseOutThreshold + yearConfig.sec179Limit).toLocaleString() }, Section 179 is completely phased out, but <strong>Bonus Depreciation</strong> remains available.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Section179EquipmentDepreciationCalculator;
