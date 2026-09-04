'use client';

import React, { useState, useId } from 'react';
import {
  DollarSign,
  ShieldCheck,
  Percent,
  Calendar,
  AlertTriangle,
  Copy,
  Check,
  RotateCcw,
  Info,
  Scale
} from 'lucide-react';

interface EstatePreset {
  name: string;
  firstDeathYear: number;
  firstSpouseEstate: number;
  secondSpouseEstate: number;
  filedForm706: boolean;
  stateEstateRatePct: number;
}

const PRESETS: EstatePreset[] = [
  {
    name: '2026 TCJA Sunset Exposure ($22M Combined)',
    firstDeathYear: 2024,
    firstSpouseEstate: 3000000,
    secondSpouseEstate: 19000000,
    filedForm706: true,
    stateEstateRatePct: 0,
  },
  {
    name: 'High-Wealth Portability Protection',
    firstDeathYear: 2025,
    firstSpouseEstate: 5000000,
    secondSpouseEstate: 25000000,
    filedForm706: true,
    stateEstateRatePct: 16,
  },
  {
    name: 'Missed Form 706 Election Risk',
    firstDeathYear: 2023,
    firstSpouseEstate: 2000000,
    secondSpouseEstate: 16000000,
    filedForm706: false,
    stateEstateRatePct: 0,
  },
];

export function EstateTaxPortabilityExemptionCalculator() {
  const firstEstateId = useId();
  const secondEstateId = useId();
  const yearId = useId();
  const stateRateId = useId();

  const [firstDeathYear, setFirstDeathYear] = useState<number>(2024);
  const [firstSpouseEstate, setFirstSpouseEstate] = useState<number>(3000000);
  const [secondSpouseEstate, setSecondSpouseEstate] = useState<number>(19000000);
  const [filedForm706, setFiledForm706] = useState<boolean>(true);
  const [stateEstateRatePct, setStateEstateRatePct] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  // BEA (Basic Exclusion Amount) by year
  const getBea = (year: number) => {
    if (year <= 2023) return 12920000;
    if (year === 2024) return 13610000;
    if (year === 2025) return 13990000;
    // 2026+ TCJA Sunset projected BEA
    return 7000000;
  };

  const firstBea = getBea(firstDeathYear);
  const secondBea = 7000000; // Surviving spouse dying after 2026 sunset

  // DSUE Calculation
  const calculatedDsue = filedForm706 ? Math.max(0, firstBea - firstSpouseEstate) : 0;

  // Total Available Exclusion for Surviving Spouse
  const totalSurvivingExclusion = secondBea + calculatedDsue;

  // Taxable Estate excess over exclusion
  const taxableExcessFed = Math.max(0, secondSpouseEstate - totalSurvivingExclusion);
  const federalTaxDue = taxableExcessFed * 0.40; // 40% federal top rate

  // Counterfactual without portability
  const taxableExcessWithoutDsue = Math.max(0, secondSpouseEstate - secondBea);
  const federalTaxWithoutDsue = taxableExcessWithoutDsue * 0.40;
  const portabilityTaxSavings = Math.max(0, federalTaxWithoutDsue - federalTaxDue);

  // State Estate Tax
  const stateTaxDue = Math.max(0, secondSpouseEstate - 1000000) * (stateEstateRatePct / 100);

  const totalTaxes = federalTaxDue + stateTaxDue;
  const netInheritedWealth = secondSpouseEstate - totalTaxes;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const applyPreset = (p: EstatePreset) => {
    setFirstDeathYear(p.firstDeathYear);
    setFirstSpouseEstate(p.firstSpouseEstate);
    setSecondSpouseEstate(p.secondSpouseEstate);
    setFiledForm706(p.filedForm706);
    setStateEstateRatePct(p.stateEstateRatePct);
  };

  const handleCopy = () => {
    const text = [
      `Federal Estate Tax & DSUE Portability Analysis`,
      `-----------------------------------------------`,
      `First Spouse Death Year:      ${firstDeathYear} (Exclusion: ${formatCurrency(firstBea)})`,
      `First Spouse Taxable Estate:  ${formatCurrency(firstSpouseEstate)}`,
      `Form 706 Portability Filed:   ${filedForm706 ? 'YES' : 'NO'}`,
      `DSUE Transferred to Survivor: ${formatCurrency(calculatedDsue)}`,
      `Surviving Spouse Post-2026 BEA: ${formatCurrency(secondBea)}`,
      `Total Surviving Exclusion:    ${formatCurrency(totalSurvivingExclusion)}`,
      `-----------------------------------------------`,
      `Surviving Spouse Estate:      ${formatCurrency(secondSpouseEstate)}`,
      `Federal Estate Tax Due (40%): ${formatCurrency(federalTaxDue)}`,
      `Portability Tax Savings:      ${formatCurrency(portabilityTaxSavings)}`,
      `Net Inherited Wealth:         ${formatCurrency(netInheritedWealth)}`,
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
          <span className="text-xs font-medium text-slate-400">Transferred DSUE Exemption</span>
          <div className="mt-1 text-2xl font-bold text-emerald-400 tracking-tight">{formatCurrency(calculatedDsue)}</div>
          <div className="mt-1 text-xs text-slate-400">Portable from first spouse</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Total Surviving Exclusion</span>
          <div className="mt-1 text-2xl font-bold text-white tracking-tight">{formatCurrency(totalSurvivingExclusion)}</div>
          <div className="mt-1 text-xs text-slate-400">Survivor BEA + DSUE</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Portability Tax Savings</span>
          <div className="mt-1 text-2xl font-bold text-sky-400 tracking-tight">{formatCurrency(portabilityTaxSavings)}</div>
          <div className="mt-1 text-xs text-slate-400">At 40% federal bracket</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Federal Estate Tax Due</span>
          <div className={`mt-1 text-2xl font-bold tracking-tight ${federalTaxDue === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(federalTaxDue)}
          </div>
          <div className="mt-1 text-xs text-slate-400">{federalTaxDue === 0 ? '100% Tax Sheltered' : '40% on excess over cap'}</div>
        </div>
      </div>

      {/* Inputs + Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs Panel */}
        <div className="lg:col-span-5 space-y-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Estate Values & Timing
          </h3>

          <div>
            <label htmlFor={yearId} className="block text-xs font-medium text-slate-400 mb-1">
              First Spouse Death Year
            </label>
            <select
              id={yearId}
              value={firstDeathYear}
              onChange={(e) => setFirstDeathYear(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value="2024">2024 ($13.61M Individual BEA)</option>
              <option value="2025">2025 ($13.99M Individual BEA)</option>
              <option value="2023">2023 ($12.92M Individual BEA)</option>
              <option value="2026">2026+ Post-Sunset (~$7.0M BEA)</option>
            </select>
          </div>

          <div>
            <label htmlFor={firstEstateId} className="block text-xs font-medium text-slate-400 mb-1">
              First Deceased Spouse&apos;s Taxable Estate ($)
            </label>
            <input
              id={firstEstateId}
              type="number"
              step="500000"
              value={firstSpouseEstate}
              onChange={(e) => setFirstSpouseEstate(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label htmlFor={secondEstateId} className="block text-xs font-medium text-slate-400 mb-1">
              Surviving Spouse&apos;s Projected Estate at Death ($)
            </label>
            <input
              id={secondEstateId}
              type="number"
              step="1000000"
              value={secondSpouseEstate}
              onChange={(e) => setSecondSpouseEstate(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-300">Timely Form 706 Portability Election Filed?</span>
            <button
              type="button"
              onClick={() => setFiledForm706(!filedForm706)}
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                filedForm706 ? 'bg-emerald-600' : 'bg-slate-800'
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  filedForm706 ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Right Table Panel */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Exemption Component</th>
                  <th className="px-4 py-3 text-right">Statutory Basis</th>
                  <th className="px-4 py-3 text-right">Amount ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/50 font-mono">
                <tr>
                  <td className="px-4 py-2.5 font-sans font-medium text-slate-200">First Spouse BEA Available</td>
                  <td className="px-4 py-2.5 text-right font-sans text-slate-400">Year {firstDeathYear} Tax Table</td>
                  <td className="px-4 py-2.5 text-right">{formatCurrency(firstBea)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-sans font-medium text-slate-200">First Spouse Taxable Estate Used</td>
                  <td className="px-4 py-2.5 text-right font-sans text-slate-400">Taxable Transfers at First Death</td>
                  <td className="px-4 py-2.5 text-right text-amber-400">{formatCurrency(firstSpouseEstate)}</td>
                </tr>
                <tr className="text-emerald-400">
                  <td className="px-4 py-2.5 font-sans font-medium">Deceased Spousal Unused Exemption (DSUE)</td>
                  <td className="px-4 py-2.5 text-right font-sans">{filedForm706 ? 'Form 706 Active' : 'Not Filed ($0)'}</td>
                  <td className="px-4 py-2.5 text-right font-bold">{formatCurrency(calculatedDsue)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-sans font-medium text-slate-200">Surviving Spouse Post-Sunset BEA</td>
                  <td className="px-4 py-2.5 text-right font-sans text-slate-400">Projected 2026 Sunset Level</td>
                  <td className="px-4 py-2.5 text-right">{formatCurrency(secondBea)}</td>
                </tr>
                <tr className="bg-slate-800/40 text-white font-bold">
                  <td className="px-4 py-3 font-sans">Total Surviving Spouse Federal Shield</td>
                  <td className="px-4 py-3 text-right font-sans text-slate-300">Surviving BEA + DSUE</td>
                  <td className="px-4 py-3 text-right text-emerald-400">{formatCurrency(totalSurvivingExclusion)}</td>
                </tr>
                <tr className="text-rose-400">
                  <td className="px-4 py-2.5 font-sans font-medium">Federal Estate Tax Liability (40%)</td>
                  <td className="px-4 py-2.5 text-right font-sans text-slate-400">40% on Taxable Excess</td>
                  <td className="px-4 py-2.5 text-right">{formatCurrency(federalTaxDue)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Guide Notes */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2 text-xs text-slate-400">
        <h4 className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-4 h-4 text-sky-400" />
          The 2026 TCJA Sunset & Critical Need for Form 706 Portability
        </h4>
        <p>
          Under the 2017 Tax Cuts and Jobs Act, the federal basic exclusion amount was temporarily doubled to over $13.6M per individual. On December 31, 2025, this provision is scheduled to sunset, cutting the individual exemption roughly in half (~$7M). Electing DSUE portability on a timely filed Form 706 locks in the deceased spouse&apos;s higher pre-sunset unused exclusion permanently for the surviving spouse.
        </p>
      </div>
    </div>
  );
}

export default EstateTaxPortabilityExemptionCalculator;
