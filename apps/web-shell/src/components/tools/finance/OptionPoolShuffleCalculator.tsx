'use client';

import React, { useState, useMemo } from 'react';
import { PieChart, DollarSign, Scale, ShieldAlert, CheckCircle2, ArrowRight, Info, AlertTriangle } from 'lucide-react';

export function OptionPoolShuffleCalculator() {
  const [headlinePreMoney, setHeadlinePreMoney] = useState<number>(10000000); // $10M
  const [investmentAmount, setInvestmentAmount] = useState<number>(3000000); // $3M
  const [targetPostMoneyPoolPct, setTargetPostMoneyPoolPct] = useState<number>(15); // 15% post-money pool
  const [existingUnallocatedPoolPct, setExistingUnallocatedPoolPct] = useState<number>(5); // 5% currently unallocated

  const results = useMemo(() => {
    // Post-money valuation = headline pre-money + investment
    const headlinePostMoney = headlinePreMoney + investmentAmount;
    const investorOwnershipPct = (investmentAmount / headlinePostMoney) * 100;

    // Option Pool required expansion:
    // If pool is created in PRE-MONEY (Standard VC term sheet "shuffle"):
    // All dilution comes 100% out of existing founders/shareholders, NOT the incoming investor.
    // Dollar value of unallocated pool at post-money:
    const requiredPoolDollars = headlinePostMoney * (targetPostMoneyPoolPct / 100);
    const existingPoolDollars = headlinePreMoney * (existingUnallocatedPoolPct / 100);
    const newPoolExpansionDollars = Math.max(0, requiredPoolDollars - existingPoolDollars);

    // Effective Pre-Money Valuation:
    // Effective Pre-Money = Headline Pre-Money - New Pool Expansion Dollars
    const effectivePreMoney = headlinePreMoney - newPoolExpansionDollars;
    const effectivePreMoneyDiscountPct = ((headlinePreMoney - effectivePreMoney) / headlinePreMoney) * 100;

    // Ownership percentages post-financing (Pre-Money Shuffle):
    const investorPct = investorOwnershipPct;
    const poolPct = targetPostMoneyPoolPct;
    const founderPct = Math.max(0, 100 - investorPct - poolPct);

    // If pool were created POST-MONEY (Fair / Founder-Friendly):
    // Investors would also be diluted by the pool expansion.
    const fairFounderPct = (100 - (investmentAmount / headlinePostMoney) * 100) * (1 - (targetPostMoneyPoolPct - existingUnallocatedPoolPct) / 100);
    const founderOwnershipLost = Math.max(0, fairFounderPct - founderPct);

    return {
      headlinePostMoney,
      investorOwnershipPct,
      requiredPoolDollars,
      newPoolExpansionDollars,
      effectivePreMoney,
      effectivePreMoneyDiscountPct,
      investorPct,
      poolPct,
      founderPct,
      fairFounderPct,
      founderOwnershipLost
    };
  }, [headlinePreMoney, investmentAmount, targetPostMoneyPoolPct, existingUnallocatedPoolPct]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Option Pool Shuffle & Effective Valuation Calculator</h1>
            <p className="text-sm text-slate-400">
              Unmask the true economic cost of pre-money unallocated employee option pool requirements in venture capital term sheets.
            </p>
          </div>
        </div>

        {/* Highlight Banner */}
        <div className="mt-4 p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 block">Effective Pre-Money Valuation</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-amber-400 font-mono">
                ${(results.effectivePreMoney / 1000000).toFixed(2)}M
              </span>
              <span className="text-xs text-rose-400 font-semibold">
                (-{results.effectivePreMoneyDiscountPct.toFixed(1)}% hidden discount)
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Founder Ownership Dilution</span>
            <span className="text-2xl font-bold text-slate-100 font-mono">
              {results.founderPct.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-white">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span>Financing & Pool Terms</span>
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Headline Pre-Money Valuation ($)</label>
            <input
              type="number"
              min="1000000"
              step="500000"
              value={headlinePreMoney}
              onChange={(e) => setHeadlinePreMoney(Math.max(1, Number(e.target.value)))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">New Investment Amount ($)</label>
            <input
              type="number"
              min="100000"
              step="250000"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(Math.max(1, Number(e.target.value)))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">Required Post-Money Option Pool</span>
              <span className="font-mono text-amber-400">{targetPostMoneyPoolPct}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              value={targetPostMoneyPoolPct}
              onChange={(e) => setTargetPostMoneyPoolPct(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">Existing Unallocated Pool (Pre-Round)</span>
              <span className="font-mono text-amber-400">{existingUnallocatedPoolPct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              value={existingUnallocatedPoolPct}
              onChange={(e) => setExistingUnallocatedPoolPct(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>
        </div>

        {/* Breakdown */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-6">
          <h2 className="text-base font-semibold text-slate-200">Cap Table Ownership Distribution</h2>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700 flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Existing Shareholders (Founders / Early Team)</span>
                <span className="text-[11px] text-slate-400">Absorbs 100% of the option pool creation</span>
              </div>
              <span className="text-xl font-bold font-mono text-amber-300">{results.founderPct.toFixed(1)}%</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700 flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-cyan-300 block">New Series A Lead Investor</span>
                <span className="text-[11px] text-slate-400">Fixed percentage, protected from pool dilution</span>
              </div>
              <span className="text-xl font-bold font-mono text-cyan-400">{results.investorPct.toFixed(1)}%</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700 flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-slate-300 block">Unallocated Option Pool</span>
                <span className="text-[11px] text-slate-400">Reserved for future executive and engineering hires</span>
              </div>
              <span className="text-xl font-bold font-mono text-white">{results.poolPct.toFixed(1)}%</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-400 space-y-2">
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 flex-shrink-0 text-amber-400 mt-0.5" />
              <span>
                <strong>Why It Matters:</strong> When a VC term sheet mandates a &quot;15% unallocated post-money option pool created prior to closing,&quot; the option pool comes exclusively out of the founders&apos; equity. The headline valuation of ${ (headlinePreMoney / 1000000).toFixed(1) }M is effectively discounted to ${ (results.effectivePreMoney / 1000000).toFixed(2) }M.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OptionPoolShuffleCalculator;
