'use client';

import React, { useState, useMemo } from 'react';
import { Scale, DollarSign, Award, ShieldAlert, CheckCircle2, ArrowRight, Info, AlertTriangle } from 'lucide-react';

export function SafeMfnAmendmentCalculator() {
  // Existing MFN SAFE
  const [existingInvestment, setExistingInvestment] = useState<number>(100000);
  const [hasValuationCap, setHasValuationCap] = useState<boolean>(false);
  const [existingCap, setExistingCap] = useState<number>(10000000);
  const [existingDiscount, setExistingDiscount] = useState<number>(0);
  const [existingProRata, setExistingProRata] = useState<boolean>(false);

  // Subsequent Round SAFE
  const [subsequentCap, setSubsequentCap] = useState<number>(6000000);
  const [subsequentDiscount, setSubsequentDiscount] = useState<number>(20);
  const [subsequentProRata, setSubsequentProRata] = useState<boolean>(true);

  // Evaluation
  const comparison = useMemo(() => {
    const triggers: string[] = [];

    // Valuation cap trigger
    let capFavorable = false;
    if (!hasValuationCap) {
      // Uncapped MFN gets the new cap!
      capFavorable = true;
      triggers.push(`Acquires new $${(subsequentCap / 1000000).toFixed(1)}M valuation cap (previously uncapped).`);
    } else if (subsequentCap < existingCap) {
      capFavorable = true;
      triggers.push(`Valuation cap lowers from $${(existingCap / 1000000).toFixed(1)}M to $${(subsequentCap / 1000000).toFixed(1)}M.`);
    }

    // Discount trigger
    let discountFavorable = false;
    if (subsequentDiscount > existingDiscount) {
      discountFavorable = true;
      triggers.push(`Discount rate increases from ${existingDiscount}% to ${subsequentDiscount}%.`);
    }

    // Pro-rata trigger
    let proRataFavorable = false;
    if (!existingProRata && subsequentProRata) {
      proRataFavorable = true;
      triggers.push('Grants Pro-Rata side letter rights (not previously included).');
    }

    const mfnTriggered = triggers.length > 0;

    // Projected shares simulation at priced round Series A (e.g. $12M valuation, $1.00 base price)
    const pricedRoundValuation = 12000000;
    const baseSharePrice = 1.00;

    // Existing effective price
    let originalEffectivePrice = baseSharePrice;
    if (hasValuationCap && existingCap < pricedRoundValuation) {
      originalEffectivePrice = Math.min(originalEffectivePrice, baseSharePrice * (existingCap / pricedRoundValuation));
    }
    if (existingDiscount > 0) {
      originalEffectivePrice = Math.min(originalEffectivePrice, baseSharePrice * (1 - existingDiscount / 100));
    }

    // Amended effective price
    const effectiveCap = hasValuationCap ? Math.min(existingCap, subsequentCap) : subsequentCap;
    const effectiveDiscount = Math.max(existingDiscount, subsequentDiscount);

    let amendedEffectivePrice = baseSharePrice;
    if (effectiveCap < pricedRoundValuation) {
      amendedEffectivePrice = Math.min(amendedEffectivePrice, baseSharePrice * (effectiveCap / pricedRoundValuation));
    }
    if (effectiveDiscount > 0) {
      amendedEffectivePrice = Math.min(amendedEffectivePrice, baseSharePrice * (1 - effectiveDiscount / 100));
    }

    const originalShares = Math.round(existingInvestment / originalEffectivePrice);
    const amendedShares = Math.round(existingInvestment / amendedEffectivePrice);
    const additionalShares = Math.max(0, amendedShares - originalShares);

    return {
      mfnTriggered,
      triggers,
      originalEffectivePrice,
      amendedEffectivePrice,
      originalShares,
      amendedShares,
      additionalShares
    };
  }, [existingInvestment, hasValuationCap, existingCap, existingDiscount, existingProRata, subsequentCap, subsequentDiscount, subsequentProRata]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">SAFE MFN (Most Favored Nation) Amendment Calculator</h1>
            <p className="text-sm text-slate-400">
              Evaluate Y Combinator MFN SAFE agreements against subsequent financing instruments to test automatic amendment triggers and investor share appreciation.
            </p>
          </div>
        </div>

        {/* Banner */}
        <div className={`mt-4 p-4 rounded-xl border flex items-center justify-between text-sm ${
          comparison.mfnTriggered
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
        }`}>
          <div className="flex items-center space-x-2">
            {comparison.mfnTriggered ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            <span className="font-semibold">
              {comparison.mfnTriggered
                ? 'MFN Clause Triggered: Investor is eligible to elect superior terms.'
                : 'No Trigger: Subsequent round does not offer superior economic terms.'}
            </span>
          </div>
          <span className="font-mono text-xs">
            +{comparison.additionalShares.toLocaleString()} additional conversion shares
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Existing SAFE */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-white">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span>Existing MFN SAFE Terms</span>
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Investment Amount ($)</label>
            <input
              type="number"
              min="1000"
              step="10000"
              value={existingInvestment}
              onChange={(e) => setExistingInvestment(Math.max(1, Number(e.target.value)))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-xs cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={hasValuationCap}
                onChange={(e) => setHasValuationCap(e.target.checked)}
                className="rounded text-amber-500 focus:ring-0"
              />
              <span>Original SAFE Had a Valuation Cap</span>
            </label>

            {hasValuationCap && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Existing Valuation Cap ($)</label>
                <input
                  type="number"
                  min="100000"
                  step="500000"
                  value={existingCap}
                  onChange={(e) => setExistingCap(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Existing Discount Rate (%)</label>
            <input
              type="number"
              min="0"
              max="50"
              value={existingDiscount}
              onChange={(e) => setExistingDiscount(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <label className="flex items-center space-x-2 text-xs cursor-pointer text-slate-300 pt-2 border-t border-slate-800">
            <input
              type="checkbox"
              checked={existingProRata}
              onChange={(e) => setExistingProRata(e.target.checked)}
              className="rounded text-amber-500 focus:ring-0"
            />
            <span>Included Pro-Rata Rights Side Letter</span>
          </label>
        </div>

        {/* Subsequent Round */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-white">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <Scale className="w-4 h-4 text-cyan-400" />
            <span>Subsequent New Financing Terms</span>
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">New SAFE Valuation Cap ($)</label>
            <input
              type="number"
              min="100000"
              step="500000"
              value={subsequentCap}
              onChange={(e) => setSubsequentCap(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">New Discount Rate (%)</label>
            <input
              type="number"
              min="0"
              max="50"
              value={subsequentDiscount}
              onChange={(e) => setSubsequentDiscount(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <label className="flex items-center space-x-2 text-xs cursor-pointer text-slate-300 pt-2">
            <input
              type="checkbox"
              checked={subsequentProRata}
              onChange={(e) => setSubsequentProRata(e.target.checked)}
              className="rounded text-cyan-500 focus:ring-0"
            />
            <span>New Round Includes Pro-Rata Rights</span>
          </label>

          {/* Trigger List */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">Identified MFN Rights:</span>
            {comparison.triggers.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-amber-300">
                {comparison.triggers.map((t, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5">
                    <span className="text-amber-400 font-bold">&bull;</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400">None detected. Terms are identical or less favorable.</p>
            )}
          </div>
        </div>
      </div>

      {/* Equity Impact Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4">
        <h2 className="text-sm font-semibold text-slate-200">Series A Conversion Impact Comparison</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <span className="text-xs text-slate-400 block font-semibold">Pre-Amendment Conversion</span>
            <div className="text-xl font-bold font-mono text-slate-200">
              {comparison.originalShares.toLocaleString()} shares
            </div>
            <div className="text-xs text-slate-400">
              Effective conversion share price: ${comparison.originalEffectivePrice.toFixed(3)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
            <span className="text-xs text-amber-400 block font-semibold">Post-MFN Amendment Conversion</span>
            <div className="text-xl font-bold font-mono text-amber-300">
              {comparison.amendedShares.toLocaleString()} shares
            </div>
            <div className="text-xs text-slate-400">
              Effective conversion share price: ${comparison.amendedEffectivePrice.toFixed(3)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SafeMfnAmendmentCalculator;
