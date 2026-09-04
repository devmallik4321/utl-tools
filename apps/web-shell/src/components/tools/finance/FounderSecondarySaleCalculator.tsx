"use client";

import React, { useState, useMemo } from "react";
import { DollarSign, PieChart, TrendingUp, ShieldCheck, Copy, Check, Info, AlertTriangle } from "lucide-react";

interface Preset {
  name: string;
  valuation: number;
  totalShares: number;
  founderShares: number;
  secondaryAmount: number;
  discountPercent: number;
  taxRate: number;
}

const PRESETS: Preset[] = [
  {
    name: "Series B Growth ($2M Founder Liquidity)",
    valuation: 80000000, // $80M
    totalShares: 10000000,
    founderShares: 3500000, // 35%
    secondaryAmount: 2000000, // $2M
    discountPercent: 10,
    taxRate: 23.8
  },
  {
    name: "Series C Expansion ($5M Secondary at Par)",
    valuation: 250000000, // $250M
    totalShares: 15000000,
    founderShares: 3000000, // 20%
    secondaryAmount: 5000000, // $5M
    discountPercent: 0,
    taxRate: 20.0
  },
  {
    name: "Downside / Modest Liquidity (20% Discount)",
    valuation: 35000000, // $35M
    totalShares: 8000000,
    founderShares: 2400000, // 30%
    secondaryAmount: 1000000, // $1M
    discountPercent: 20,
    taxRate: 28.0
  }
];

export function FounderSecondarySaleCalculator() {
  const [valuation, setValuation] = useState<number>(80000000); // $80M
  const [totalShares, setTotalShares] = useState<number>(10000000);
  const [founderShares, setFounderShares] = useState<number>(3500000);
  const [secondaryAmount, setSecondaryAmount] = useState<number>(2000000); // $2M
  const [discountPercent, setDiscountPercent] = useState<number>(10); // 10%
  const [taxRate, setTaxRate] = useState<number>(23.8); // 20% fed + 3.8% NIIT

  const [copied, setCopied] = useState(false);

  const loadPreset = (p: Preset) => {
    setValuation(p.valuation);
    setTotalShares(p.totalShares);
    setFounderShares(p.founderShares);
    setSecondaryAmount(p.secondaryAmount);
    setDiscountPercent(p.discountPercent);
    setTaxRate(p.taxRate);
  };

  const results = useMemo(() => {
    const primarySharePrice = totalShares > 0 ? valuation / totalShares : 0;
    const secondarySharePrice = primarySharePrice * (1 - discountPercent / 100);

    const sharesToSell = secondarySharePrice > 0 ? Math.round(secondaryAmount / secondarySharePrice) : 0;
    const actualGrossProceeds = sharesToSell * secondarySharePrice;

    // Remaining shares and ownership
    const remainingFounderShares = Math.max(0, founderShares - sharesToSell);
    const initialOwnership = totalShares > 0 ? (founderShares / totalShares) * 100 : 0;
    const postSecondaryOwnership = totalShares > 0 ? (remainingFounderShares / totalShares) * 100 : 0;
    const percentSoldOfHolding = founderShares > 0 ? (sharesToSell / founderShares) * 100 : 0;

    // Taxes & Net Proceeds
    const taxLiability = actualGrossProceeds * (taxRate / 100);
    const netProceeds = actualGrossProceeds - taxLiability;

    return {
      primarySharePrice: Number(primarySharePrice.toFixed(2)),
      secondarySharePrice: Number(secondarySharePrice.toFixed(2)),
      sharesToSell,
      actualGrossProceeds: Math.round(actualGrossProceeds),
      remainingFounderShares,
      initialOwnership: Number(initialOwnership.toFixed(2)),
      postSecondaryOwnership: Number(postSecondaryOwnership.toFixed(2)),
      percentSoldOfHolding: Number(percentSoldOfHolding.toFixed(1)),
      taxLiability: Math.round(taxLiability),
      netProceeds: Math.round(netProceeds)
    };
  }, [valuation, totalShares, founderShares, secondaryAmount, discountPercent, taxRate]);

  const handleCopy = async () => {
    const text = [
      `=== FOUNDER SECONDARY SALE & DILUTION AUDIT ===`,
      `Company Valuation: $${valuation.toLocaleString()}`,
      `Primary Share Price: $${results.primarySharePrice}`,
      `Secondary Share Price (${discountPercent}% discount): $${results.secondarySharePrice}`,
      `----------------------------------------------`,
      `Founder Equity Impact:`,
      `- Initial Ownership: ${results.initialOwnership}% (${founderShares.toLocaleString()} shares)`,
      `- Shares Sold: ${results.sharesToSell.toLocaleString()} (${results.percentSoldOfHolding}% of holding)`,
      `- Post-Secondary Ownership: ${results.postSecondaryOwnership}% (${results.remainingFounderShares.toLocaleString()} shares)`,
      `----------------------------------------------`,
      `Financial Proceeds:`,
      `- Gross Secondary Payout: $${results.actualGrossProceeds.toLocaleString()}`,
      `- Estimated Tax (${taxRate}%): $${results.taxLiability.toLocaleString()}`,
      `- Net Cash to Founder: $${results.netProceeds.toLocaleString()}`,
      `==============================================`
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-200">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Founder Liquidity & Cap Table
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Secondary Discount Modeling
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-emerald-400" />
              Founder Secondary Sale & Equity Dilution Calculator
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Model founder partial cash-out liquidity in late-stage rounds. Calculate secondary share pricing discounts, cap table dilution, and net after-tax proceeds.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => loadPreset(p)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 rounded-lg border border-slate-700 transition"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Valuation & Cap Table Baseline</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Company Valuation ($)</label>
                <input
                  type="number"
                  value={valuation}
                  onChange={(e) => setValuation(Math.max(1000000, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-emerald-400 font-mono focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Total Fully-Diluted Shares</label>
                <input
                  type="number"
                  value={totalShares}
                  onChange={(e) => setTotalShares(Math.max(1000, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Founder Current Shares Owned</label>
              <input
                type="number"
                value={founderShares}
                onChange={(e) => setFounderShares(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-indigo-300 font-mono focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Secondary Transaction Terms</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Secondary Gross ($)</label>
                <input
                  type="number"
                  value={secondaryAmount}
                  onChange={(e) => setSecondaryAmount(Math.max(10000, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-emerald-400 font-mono focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Secondary Price Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Math.max(0, Math.min(50, Number(e.target.value))))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Estimated Capital Gains Tax Rate</span>
                <span className="font-mono text-rose-400">{taxRate}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="0.5"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Output Dashboard (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Liquidity Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" /> Founder Net Liquidity
              </h4>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded border border-slate-700 flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy Audit"}
              </button>
            </div>

            <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-800/60">
              <div className="text-[11px] text-emerald-300">Net Take-Home Cash</div>
              <div className="text-3xl font-black font-mono text-emerald-400 mt-0.5">
                ${results.netProceeds.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Gross: ${results.actualGrossProceeds.toLocaleString()} | Tax: ${results.taxLiability.toLocaleString()}
              </div>
            </div>

            {/* Ownership Change */}
            <div className="space-y-2.5 text-xs pt-1">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Primary Share Price:</span>
                <span className="font-mono text-slate-200">${results.primarySharePrice}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Secondary Share Price:</span>
                <span className="font-mono text-indigo-300">${results.secondarySharePrice}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Shares Transferred:</span>
                <span className="font-mono text-rose-400">{results.sharesToSell.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Ownership Dilution:</span>
                <span className="font-mono text-slate-200">
                  {results.initialOwnership}% → <span className="text-emerald-400 font-bold">{results.postSecondaryOwnership}%</span>
                </span>
              </div>
              <div className="flex justify-between py-1 font-bold">
                <span className="text-slate-200">Remaining Founder Equity:</span>
                <span className="font-mono text-indigo-400">{results.remainingFounderShares.toLocaleString()} shares</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FounderSecondarySaleCalculator;
