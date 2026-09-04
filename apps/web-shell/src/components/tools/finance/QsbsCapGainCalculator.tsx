'use client';

import React, { useState, useId } from 'react';
import {
  DollarSign,
  ShieldCheck,
  Percent,
  TrendingUp,
  RotateCcw,
  Copy,
  Check,
  Info,
  Scale,
  AlertTriangle
} from 'lucide-react';

interface QsbsPreset {
  name: string;
  basis: number;
  grossGain: number;
  acquisitionDateBucket: 'after-2010' | '2009-2010' | 'before-2009';
  holdingPeriodMet: boolean;
  filingStatus: 'single_or_mfj' | 'mfs';
  stateRatePct: number;
}

const PRESETS: QsbsPreset[] = [
  {
    name: 'Early Founder ($10k Basis Exit)',
    basis: 10000,
    grossGain: 15000000,
    acquisitionDateBucket: 'after-2010',
    holdingPeriodMet: true,
    filingStatus: 'single_or_mfj',
    stateRatePct: 0,
  },
  {
    name: 'Angel Investor ($2M Basis 10x Rule)',
    basis: 2000000,
    grossGain: 28000000,
    acquisitionDateBucket: 'after-2010',
    holdingPeriodMet: true,
    filingStatus: 'single_or_mfj',
    stateRatePct: 0,
  },
  {
    name: 'California Non-Conforming Exit',
    basis: 50000,
    grossGain: 12000000,
    acquisitionDateBucket: 'after-2010',
    holdingPeriodMet: true,
    filingStatus: 'single_or_mfj',
    stateRatePct: 13.3,
  },
];

export function QsbsCapGainCalculator() {
  const basisId = useId();
  const gainId = useId();
  const dateBucketId = useId();
  const filingStatusId = useId();
  const stateRateId = useId();

  const [basis, setBasis] = useState<number>(10000);
  const [grossGain, setGrossGain] = useState<number>(15000000);
  const [acquisitionDateBucket, setAcquisitionDateBucket] = useState<'after-2010' | '2009-2010' | 'before-2009'>('after-2010');
  const [holdingPeriodMet, setHoldingPeriodMet] = useState<boolean>(true);
  const [filingStatus, setFilingStatus] = useState<'single_or_mfj' | 'mfs'>('single_or_mfj');
  const [stateRatePct, setStateRatePct] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  // Statutory Maximum Cap: Greater of $10M ($5M if MFS) OR 10 * Basis
  const baseDollarCap = filingStatus === 'mfs' ? 5000000 : 10000000;
  const tenTimesBasisCap = 10 * basis;
  const statutoryCap = Math.max(baseDollarCap, tenTimesBasisCap);

  // Exclusion Percentage based on acquisition date
  let exclusionTierPct = 1.0;
  if (acquisitionDateBucket === '2009-2010') exclusionTierPct = 0.75;
  if (acquisitionDateBucket === 'before-2009') exclusionTierPct = 0.50;

  // Actual gain eligible for exclusion
  const eligibleGainUnderCap = holdingPeriodMet ? Math.min(grossGain, statutoryCap) : 0;
  const excludedGain = eligibleGainUnderCap * exclusionTierPct;
  const taxableGain = grossGain - excludedGain;

  // Federal Long Term Capital Gains (20%) + Net Investment Income Tax (3.8%) = 23.8%
  const fedLtcgRate = 0.238;
  const standardFedTaxWithoutQsbs = grossGain * fedLtcgRate;
  const actualFedTax = taxableGain * fedLtcgRate;
  const federalTaxSavings = Math.max(0, standardFedTaxWithoutQsbs - actualFedTax);

  // State Tax (States like California DO NOT conform to Section 1202 and tax 100% of the gain)
  const stateTax = grossGain * (stateRatePct / 100);

  const totalTaxPaid = actualFedTax + stateTax;
  const netAfterTax = grossGain - totalTaxPaid;
  const effectiveTaxRate = grossGain > 0 ? (totalTaxPaid / grossGain) * 100 : 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const applyPreset = (p: QsbsPreset) => {
    setBasis(p.basis);
    setGrossGain(p.grossGain);
    setAcquisitionDateBucket(p.acquisitionDateBucket);
    setHoldingPeriodMet(p.holdingPeriodMet);
    setFilingStatus(p.filingStatus);
    setStateRatePct(p.stateRatePct);
  };

  const handleCopy = () => {
    const text = [
      `Section 1202 QSBS Capital Gain Exclusion Summary`,
      `-------------------------------------------------`,
      `Gross Capital Gain:          ${formatCurrency(grossGain)}`,
      `Adjusted Stock Basis:        ${formatCurrency(basis)}`,
      `Statutory Exclusion Cap:     ${formatCurrency(statutoryCap)} (Greater of $10M or 10x Basis)`,
      `Qualifying Excluded Gain:    ${formatCurrency(excludedGain)} (${(exclusionTierPct * 100).toFixed(0)}% Tier)`,
      `Taxable Federal Gain:        ${formatCurrency(taxableGain)}`,
      `-------------------------------------------------`,
      `Federal Tax Savings:         ${formatCurrency(federalTaxSavings)}`,
      `Federal Tax Due (23.8%):     ${formatCurrency(actualFedTax)}`,
      `State Tax (${stateRatePct}%):            ${formatCurrency(stateTax)}`,
      `Net After-Tax Proceeds:      ${formatCurrency(netAfterTax)}`,
      `Effective Tax Rate:          ${effectiveTaxRate.toFixed(1)}%`,
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
            {copied ? 'Copied' : 'Copy Summary'}
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
          <span className="text-xs font-medium text-slate-400">Statutory Exclusion Cap</span>
          <div className="mt-1 text-2xl font-bold text-white tracking-tight">{formatCurrency(statutoryCap)}</div>
          <div className="mt-1 text-xs text-slate-400">
            {tenTimesBasisCap > baseDollarCap ? 'Driven by 10x Basis Rule' : 'Driven by $10M Baseline'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Total Tax-Free Gain</span>
          <div className="mt-1 text-2xl font-bold text-emerald-400 tracking-tight">{formatCurrency(excludedGain)}</div>
          <div className="mt-1 text-xs text-emerald-400">0% Federal Capital Gains Tax</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Federal Tax Saved</span>
          <div className="mt-1 text-2xl font-bold text-sky-400 tracking-tight">{formatCurrency(federalTaxSavings)}</div>
          <div className="mt-1 text-xs text-slate-400">vs 23.8% standard federal tax</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Effective Tax Rate</span>
          <div className={`mt-1 text-2xl font-bold tracking-tight ${effectiveTaxRate <= 5 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {effectiveTaxRate.toFixed(1)}%
          </div>
          <div className="mt-1 text-xs text-slate-400">Federal + State Blended</div>
        </div>
      </div>

      {/* Grid Inputs & Visual Gain Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Inputs */}
        <div className="lg:col-span-5 space-y-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Stock & Tax Parameters
          </h3>

          <div>
            <label htmlFor={gainId} className="block text-xs font-medium text-slate-400 mb-1">
              Total Realized Capital Gain ($)
            </label>
            <input
              id={gainId}
              type="number"
              step="100000"
              value={grossGain}
              onChange={(e) => setGrossGain(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label htmlFor={basisId} className="block text-xs font-medium text-slate-400 mb-1">
              Taxpayer Stock Basis ($ Original Cost)
            </label>
            <input
              id={basisId}
              type="number"
              step="5000"
              value={basis}
              onChange={(e) => setBasis(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              10x Basis Cap = {formatCurrency(tenTimesBasisCap)}
            </span>
          </div>

          <div>
            <label htmlFor={dateBucketId} className="block text-xs font-medium text-slate-400 mb-1">
              Stock Acquisition Date
            </label>
            <select
              id={dateBucketId}
              value={acquisitionDateBucket}
              onChange={(e) => setAcquisitionDateBucket(e.target.value as 'after-2010' | '2009-2010' | 'before-2009')}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="after-2010">Acquired After Sep 27, 2010 (100% Exclusion)</option>
              <option value="2009-2010">Acquired Feb 18, 2009 – Sep 27, 2010 (75% Exclusion)</option>
              <option value="before-2009">Acquired Before Feb 18, 2009 (50% Exclusion)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={filingStatusId} className="block text-xs font-medium text-slate-400 mb-1">
                Filing Status
              </label>
              <select
                id={filingStatusId}
                value={filingStatus}
                onChange={(e) => setFilingStatus(e.target.value as 'single_or_mfj' | 'mfs')}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="single_or_mfj">Single / Married Joint ($10M)</option>
                <option value="mfs">Married Filing Separate ($5M)</option>
              </select>
            </div>

            <div>
              <label htmlFor={stateRateId} className="block text-xs font-medium text-slate-400 mb-1">
                State Income Tax Rate (%)
              </label>
              <input
                id={stateRateId}
                type="number"
                step="0.1"
                min="0"
                max="15"
                value={stateRatePct}
                onChange={(e) => setStateRatePct(Math.max(0, Number(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-300">5-Year Holding Period Met?</span>
            <button
              type="button"
              onClick={() => setHoldingPeriodMet(!holdingPeriodMet)}
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                holdingPeriodMet ? 'bg-emerald-600' : 'bg-slate-800'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  holdingPeriodMet ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Right Breakdown Panel */}
        <div className="lg:col-span-7 space-y-6">
          {/* Visual Gain Allocation */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-sky-400" />
              Gain Allocation (Excluded vs Taxable)
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-emerald-400">QSBS Tax-Free Excluded Gain</span>
                  <span className="text-emerald-400 font-mono">{formatCurrency(excludedGain)}</span>
                </div>
                <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${grossGain > 0 ? Math.min(100, (excludedGain / grossGain) * 100) : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-rose-400">Taxable Capital Gain (Excess over Cap / Tier)</span>
                  <span className="text-rose-400 font-mono">{formatCurrency(taxableGain)}</span>
                </div>
                <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${grossGain > 0 ? Math.min(100, (taxableGain / grossGain) * 100) : 0}%` }}
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
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3 text-right">Basis / Cap Rule</th>
                  <th className="px-4 py-3 text-right">Value ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/50 font-mono">
                <tr>
                  <td className="px-4 py-2.5 font-sans font-medium text-slate-200">Statutory 10x Basis Limit</td>
                  <td className="px-4 py-2.5 text-right font-sans text-slate-400">10 &times; {formatCurrency(basis)}</td>
                  <td className="px-4 py-2.5 text-right text-slate-200">{formatCurrency(tenTimesBasisCap)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-sans font-medium text-slate-200">Statutory Fixed Dollar Limit</td>
                  <td className="px-4 py-2.5 text-right font-sans text-slate-400">{filingStatus === 'mfs' ? '$5M (MFS)' : '$10M (Single/MFJ)'}</td>
                  <td className="px-4 py-2.5 text-right text-slate-200">{formatCurrency(baseDollarCap)}</td>
                </tr>
                <tr className="text-emerald-400">
                  <td className="px-4 py-2.5 font-sans font-medium">Excluded Capital Gain (0% Fed)</td>
                  <td className="px-4 py-2.5 text-right font-sans text-emerald-400/80">{(exclusionTierPct * 100).toFixed(0)}% Exclusion Rate</td>
                  <td className="px-4 py-2.5 text-right font-bold">{formatCurrency(excludedGain)}</td>
                </tr>
                <tr className="text-rose-400">
                  <td className="px-4 py-2.5 font-sans font-medium">Federal Tax Liability (23.8%)</td>
                  <td className="px-4 py-2.5 text-right font-sans text-slate-400">20% LTCG + 3.8% NIIT on Taxable</td>
                  <td className="px-4 py-2.5 text-right">{formatCurrency(actualFedTax)}</td>
                </tr>
                {stateRatePct > 0 && (
                  <tr className="text-amber-400">
                    <td className="px-4 py-2.5 font-sans font-medium">State Income Tax (Non-Conforming)</td>
                    <td className="px-4 py-2.5 text-right font-sans text-slate-400">{stateRatePct.toFixed(1)}% on Total Gain</td>
                    <td className="px-4 py-2.5 text-right">{formatCurrency(stateTax)}</td>
                  </tr>
                )}
                <tr className="bg-slate-800/70 font-bold text-white text-xs">
                  <td className="px-4 py-3 font-sans">Net Cash Proceeds After Taxes</td>
                  <td className="px-4 py-3 text-right font-sans text-emerald-400">
                    Saves {formatCurrency(federalTaxSavings)}
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-400">{formatCurrency(netAfterTax)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Warning / State Non-Conformity Banner */}
      {stateRatePct > 0 && (
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/50 flex items-start gap-3 text-xs text-amber-300">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p>
            <strong>State Non-Conformity Alert:</strong> States such as California, Pennsylvania, New Jersey, and New York do not conform (or partially conform) to IRC Section 1202. In California, all capital gains are taxed as ordinary state income (up to 13.3%) without any QSBS exclusion.
          </p>
        </div>
      )}
    </div>
  );
}

export default QsbsCapGainCalculator;

