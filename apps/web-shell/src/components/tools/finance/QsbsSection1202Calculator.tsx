"use client";

import React, { useState, useMemo } from "react";
import { ShieldCheck, DollarSign, Calculator, AlertTriangle, Check, Copy, Info } from "lucide-react";

type AcquisitionEra = "AFTER_SEP_2010" | "FEB_2009_SEP_2010" | "BEFORE_FEB_2009";

export function QsbsSection1202Calculator() {
  const [era, setEra] = useState<AcquisitionEra>("AFTER_SEP_2010");
  const [basis, setBasis] = useState<number>(250000); // $250k initial investment / cost basis
  const [exitProceeds, setExitProceeds] = useState<number>(18000000); // $18M exit sale
  const [filingStatus, setFilingStatus] = useState<"SINGLE" | "MFS">("SINGLE"); // Single/MFJ vs Married Filing Separately
  const [stateConformity, setStateConformity] = useState<"CONFORMS" | "NON_CONFORMS">("CONFORMS"); // CA does not conform

  const [copied, setCopied] = useState(false);

  const results = useMemo(() => {
    const totalGain = Math.max(0, exitProceeds - basis);

    // Section 1202 Cap: Greater of $10M (or $5M if MFS) or 10x basis
    const dollarCap = filingStatus === "MFS" ? 5000000 : 10000000;
    const basisCap = basis * 10;
    const effectiveCap = Math.max(dollarCap, basisCap);

    // Eligible gain capped
    const eligibleGain = Math.min(totalGain, effectiveCap);
    const excessGain = Math.max(0, totalGain - effectiveCap);

    // Exclusion percentage & federal rate
    let exclusionPercent = 100;
    let amtPreferenceRate = 0;
    let baseTaxRate = 0.20; // standard LTCG 20%
    let niitRate = 0.038; // 3.8% NIIT

    if (era === "AFTER_SEP_2010") {
      exclusionPercent = 100;
      amtPreferenceRate = 0;
    } else if (era === "FEB_2009_SEP_2010") {
      exclusionPercent = 75;
      amtPreferenceRate = 0.07;
    } else {
      exclusionPercent = 50;
      amtPreferenceRate = 0.07;
      baseTaxRate = 0.28; // 28% special rate for 50% QSBS
    }

    const excludedGain = eligibleGain * (exclusionPercent / 100);
    const taxableEligibleGain = eligibleGain - excludedGain;
    const totalTaxableGain = taxableEligibleGain + excessGain;

    // Federal Tax Calculation
    // For 100% QSBS, excluded gain is completely exempt from regular tax, AMT, and 3.8% NIIT!
    // Non-excluded portion is taxed at standard LTCG 20% + 3.8% NIIT (or 28% for 50% era)
    const fedTaxOnTaxable = totalTaxableGain * (baseTaxRate + niitRate);

    // Standard tax without QSBS
    const standardFedTax = totalGain * (0.20 + 0.038);
    const federalTaxSavings = Math.max(0, standardFedTax - fedTaxOnTaxable);

    // Net proceeds after federal tax
    const netProceedsAfterFed = exitProceeds - fedTaxOnTaxable;

    return {
      totalGain,
      dollarCap,
      basisCap,
      effectiveCap,
      eligibleGain,
      excludedGain,
      totalTaxableGain,
      fedTaxOnTaxable,
      standardFedTax,
      federalTaxSavings,
      netProceedsAfterFed,
      exclusionPercent
    };
  }, [era, basis, exitProceeds, filingStatus]);

  const handleCopy = async () => {
    const text = [
      `=== IRC SECTION 1202 QSBS EXCLUSION ANALYSIS ===`,
      `Gross Exit Proceeds: $${exitProceeds.toLocaleString()}`,
      `Adjusted Cost Basis: $${basis.toLocaleString()}`,
      `Total Capital Gain: $${results.totalGain.toLocaleString()}`,
      `----------------------------------------------`,
      `Statutory Limitation Cap: $${results.effectiveCap.toLocaleString()} (Greater of $${results.dollarCap.toLocaleString()} or 10x basis $${results.basisCap.toLocaleString()})`,
      `Exclusion Tier: ${results.exclusionPercent}%`,
      `Excluded Capital Gain: $${results.excludedGain.toLocaleString()}`,
      `Remaining Taxable Gain: $${results.totalTaxableGain.toLocaleString()}`,
      `----------------------------------------------`,
      `Estimated Federal Tax: $${results.fedTaxOnTaxable.toLocaleString()}`,
      `Federal Tax Savings vs Ordinary LTCG: $${results.federalTaxSavings.toLocaleString()}`,
      `Net Cash to Taxpayer: $${results.netProceedsAfterFed.toLocaleString()}`,
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
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            IRC § 1202 Statutory Exemption
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Up to $10M / 10x Basis 100% Tax-Free
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          Qualified Small Business Stock (QSBS) Section 1202 Calculator
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Calculate federal capital gains exclusions, the greater-of-$10M-or-10x-basis limitation cap, alternative minimum tax (AMT) exemptions, and federal tax savings under IRC Section 1202.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Stock Acquisition Date & Statutory Tier</h3>

            <div className="space-y-2">
              {[
                {
                  id: "AFTER_SEP_2010",
                  title: "Acquired on or after September 28, 2010 (100% Exclusion)",
                  desc: "0% Federal Capital Gain, 0% AMT Preference, 0% NIIT (Permanent under PATH Act)"
                },
                {
                  id: "FEB_2009_SEP_2010",
                  title: "Acquired Feb 18, 2009 – Sept 27, 2010 (75% Exclusion)",
                  desc: "75% Exclusion, 7% AMT preference on excluded gain"
                },
                {
                  id: "BEFORE_FEB_2009",
                  title: "Acquired on or before Feb 17, 2009 (50% Exclusion)",
                  desc: "50% Exclusion, taxed at 28% capital gain rate + 7% AMT preference"
                }
              ].map((tier) => (
                <div
                  key={tier.id}
                  onClick={() => setEra(tier.id as AcquisitionEra)}
                  className={`p-3 rounded-lg border cursor-pointer transition ${
                    era === tier.id
                      ? "bg-emerald-950/40 border-emerald-500 text-emerald-300"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="text-xs font-semibold text-white">{tier.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{tier.desc}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Adjusted Cost Basis ($)</label>
                <input
                  type="number"
                  value={basis}
                  onChange={(e) => setBasis(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Exit Proceeds / Gross Sale ($)</label>
                <input
                  type="number"
                  value={exitProceeds}
                  onChange={(e) => setExitProceeds(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-emerald-400 font-mono focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Filing Status</label>
                <select
                  value={filingStatus}
                  onChange={(e) => setFilingStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none"
                >
                  <option value="SINGLE">Single / Married Filing Jointly ($10M Cap)</option>
                  <option value="MFS">Married Filing Separately ($5M Cap)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">State Conformity</label>
                <select
                  value={stateConformity}
                  onChange={(e) => setStateConformity(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none"
                >
                  <option value="CONFORMS">Conforming State (e.g. NY, TX, FL, WA)</option>
                  <option value="NON_CONFORMS">Non-Conforming (e.g. California)</option>
                </select>
              </div>
            </div>
          </div>

          {stateConformity === "NON_CONFORMS" && (
            <div className="bg-amber-950/40 border border-amber-800/50 p-3.5 rounded-xl text-xs text-amber-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">State Tax Warning (California Non-Conformity):</span>
                <p className="text-slate-400 mt-0.5">
                  California does NOT conform to IRC Section 1202. Full capital gains will be subject to ordinary California personal income tax rates (up to 13.3% or 14.4%), even when 100% exempt from federal tax.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Output Dashboard (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" /> Tax Exemption Summary
              </h4>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded border border-slate-700 flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy Audit"}
              </button>
            </div>

            {/* Federal Tax Savings Highlight */}
            <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-800/60">
              <div className="text-[11px] text-emerald-300 font-medium">Estimated Federal Tax Savings</div>
              <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
                ${results.federalTaxSavings.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Compared to standard 23.8% (20% LTCG + 3.8% NIIT) federal tax
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Total Realized Gain:</span>
                <span className="font-mono text-slate-200">${results.totalGain.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Statutory Limitation Cap:</span>
                <span className="font-mono text-indigo-400 font-bold">${results.effectiveCap.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">100% Excluded Gain:</span>
                <span className="font-mono text-emerald-400 font-bold">${results.excludedGain.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Remaining Taxable Gain:</span>
                <span className="font-mono text-rose-400">${results.totalTaxableGain.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Federal Tax Due:</span>
                <span className="font-mono text-rose-300">${results.fedTaxOnTaxable.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 font-bold">
                <span className="text-slate-200">Net Cash After Fed Tax:</span>
                <span className="font-mono text-emerald-400 text-sm">${results.netProceedsAfterFed.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QsbsSection1202Calculator;
