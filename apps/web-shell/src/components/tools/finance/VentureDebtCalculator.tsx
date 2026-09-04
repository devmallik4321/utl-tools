'use client';

import React, { useState, useId } from 'react';
import {
  DollarSign,
  Percent,
  Calendar,
  ShieldCheck,
  TrendingUp,
  PieChart,
  Copy,
  Check,
  RotateCcw,
  Info,
  Scale
} from 'lucide-react';

interface VentureDebtPreset {
  name: string;
  principal: number;
  interestRate: number;
  loanTermMonths: number;
  ioMonths: number;
  warrantCoveragePct: number;
  companyValuation: number;
  closingFeePct: number;
  finalFeePct: number;
}

const PRESETS: VentureDebtPreset[] = [
  {
    name: 'Series A Growth Facility',
    principal: 3000000,
    interestRate: 11.5,
    loanTermMonths: 36,
    ioMonths: 12,
    warrantCoveragePct: 6.0,
    companyValuation: 35000000,
    closingFeePct: 1.0,
    finalFeePct: 2.5,
  },
  {
    name: 'Series B Runway Extension',
    principal: 8000000,
    interestRate: 10.0,
    loanTermMonths: 48,
    ioMonths: 18,
    warrantCoveragePct: 5.0,
    companyValuation: 90000000,
    closingFeePct: 0.75,
    finalFeePct: 2.0,
  },
  {
    name: 'Post-Seed Bridge Note',
    principal: 1000000,
    interestRate: 12.5,
    loanTermMonths: 24,
    ioMonths: 6,
    warrantCoveragePct: 8.0,
    companyValuation: 12000000,
    closingFeePct: 1.5,
    finalFeePct: 3.0,
  },
];

export function VentureDebtCalculator() {
  const principalId = useId();
  const rateId = useId();
  const termId = useId();
  const ioId = useId();
  const warrantId = useId();
  const valId = useId();
  const closingFeeId = useId();
  const finalFeeId = useId();

  const [principal, setPrincipal] = useState<number>(3000000);
  const [interestRate, setInterestRate] = useState<number>(11.5);
  const [loanTermMonths, setLoanTermMonths] = useState<number>(36);
  const [ioMonths, setIoMonths] = useState<number>(12);
  const [warrantCoveragePct, setWarrantCoveragePct] = useState<number>(6.0);
  const [companyValuation, setCompanyValuation] = useState<number>(35000000);
  const [closingFeePct, setClosingFeePct] = useState<number>(1.0);
  const [finalFeePct, setFinalFeePct] = useState<number>(2.5);
  const [copied, setCopied] = useState<boolean>(false);

  // Financial Calculations
  const monthlyRate = interestRate / 100 / 12;
  const amortMonths = Math.max(1, loanTermMonths - ioMonths);

  // Phase 1: Interest Only Monthly Payment
  const monthlyPaymentIO = principal * monthlyRate;
  const totalInterestIO = monthlyPaymentIO * ioMonths;

  // Phase 2: Fully Amortizing Monthly Payment
  const monthlyPaymentAmort =
    monthlyRate > 0
      ? (principal * monthlyRate * Math.pow(1 + monthlyRate, amortMonths)) /
        (Math.pow(1 + monthlyRate, amortMonths) - 1)
      : principal / amortMonths;
  const totalAmortPaid = monthlyPaymentAmort * amortMonths;
  const totalInterestAmort = totalAmortPaid - principal;

  // Total Interest & Fees
  const totalInterestPaid = totalInterestIO + totalInterestAmort;
  const closingFee = principal * (closingFeePct / 100);
  const finalFee = principal * (finalFeePct / 100);

  // Warrant Coverage & Dilution
  const warrantValue = principal * (warrantCoveragePct / 100);
  const warrantDilutionPct = companyValuation > 0 ? (warrantValue / companyValuation) * 100 : 0;

  // Pure Equity Comparison: How much equity would be given up for $principal
  const pureEquityDilutionPct = companyValuation > 0 ? (principal / companyValuation) * 100 : 0;
  const equitySavedPct = Math.max(0, pureEquityDilutionPct - warrantDilutionPct);

  // Total Nominal Cost of Venture Debt
  const totalNominalCost = totalInterestPaid + closingFee + finalFee + warrantValue;
  const effectiveAprPct =
    loanTermMonths > 0
      ? ((totalInterestPaid + closingFee + finalFee + warrantValue) / principal / (loanTermMonths / 12)) * 100
      : interestRate;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const applyPreset = (p: VentureDebtPreset) => {
    setPrincipal(p.principal);
    setInterestRate(p.interestRate);
    setLoanTermMonths(p.loanTermMonths);
    setIoMonths(p.ioMonths);
    setWarrantCoveragePct(p.warrantCoveragePct);
    setCompanyValuation(p.companyValuation);
    setClosingFeePct(p.closingFeePct);
    setFinalFeePct(p.finalFeePct);
  };

  const handleCopy = () => {
    const text = [
      `Venture Debt & Warrant Coverage Analysis`,
      `-----------------------------------------`,
      `Facility Principal:        ${formatCurrency(principal)}`,
      `Interest Rate:             ${interestRate.toFixed(2)}%`,
      `Term / IO Period:          ${loanTermMonths} mo total (${ioMonths} mo IO + ${amortMonths} mo Amort)`,
      `Monthly Payment (IO):      ${formatCurrency(monthlyPaymentIO)}/mo`,
      `Monthly Payment (Amort):   ${formatCurrency(monthlyPaymentAmort)}/mo`,
      `Total Interest Paid:       ${formatCurrency(totalInterestPaid)}`,
      `Closing Fee (${closingFeePct}%):       ${formatCurrency(closingFee)}`,
      `Final Fee (${finalFeePct}%):         ${formatCurrency(finalFee)}`,
      `-----------------------------------------`,
      `Warrant Coverage (${warrantCoveragePct}%):  ${formatCurrency(warrantValue)}`,
      `Warrant Dilution:          ${warrantDilutionPct.toFixed(2)}% (vs ${pureEquityDilutionPct.toFixed(2)}% pure equity)`,
      `Equity Dilution Saved:     ${equitySavedPct.toFixed(2)}%`,
      `Effective Annual Cost:     ~${effectiveAprPct.toFixed(2)}% APR`,
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

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Monthly IO Payment</span>
          <div className="mt-1 text-2xl font-bold text-white tracking-tight">{formatCurrency(monthlyPaymentIO)}</div>
          <div className="mt-1 text-xs text-slate-400">Months 1 – {ioMonths} (Interest-Only)</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Amortizing Payment</span>
          <div className="mt-1 text-2xl font-bold text-sky-400 tracking-tight">{formatCurrency(monthlyPaymentAmort)}</div>
          <div className="mt-1 text-xs text-slate-400">Months {ioMonths + 1} – {loanTermMonths} ({amortMonths} mos)</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Warrant Dilution</span>
          <div className="mt-1 text-2xl font-bold text-emerald-400 tracking-tight">{warrantDilutionPct.toFixed(2)}%</div>
          <div className="mt-1 text-xs text-slate-400">Saves {equitySavedPct.toFixed(2)}% vs Pure Equity</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">Effective Blended APR</span>
          <div className="mt-1 text-2xl font-bold text-amber-400 tracking-tight">~{effectiveAprPct.toFixed(1)}%</div>
          <div className="mt-1 text-xs text-slate-400">Interest + Fees + Warrant Value</div>
        </div>
      </div>

      {/* Inputs & Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Inputs Panel */}
        <div className="lg:col-span-5 space-y-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Loan Facility Terms
          </h3>

          <div>
            <label htmlFor={principalId} className="block text-xs font-medium text-slate-400 mb-1">
              Loan Principal ($)
            </label>
            <input
              id={principalId}
              type="number"
              step="50000"
              value={principal}
              onChange={(e) => setPrincipal(Math.max(10000, Number(e.target.value) || 0))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={rateId} className="block text-xs font-medium text-slate-400 mb-1">
                Coupon Rate (%)
              </label>
              <input
                id={rateId}
                type="number"
                step="0.25"
                value={interestRate}
                onChange={(e) => setInterestRate(Math.max(0, Number(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label htmlFor={termId} className="block text-xs font-medium text-slate-400 mb-1">
                Term (Months)
              </label>
              <input
                id={termId}
                type="number"
                min="6"
                max="84"
                value={loanTermMonths}
                onChange={(e) => setLoanTermMonths(Math.max(6, Number(e.target.value) || 36))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={ioId} className="block text-xs font-medium text-slate-400 mb-1">
                Interest-Only Period (Mos)
              </label>
              <input
                id={ioId}
                type="number"
                min="0"
                max={loanTermMonths - 1}
                value={ioMonths}
                onChange={(e) => setIoMonths(Math.min(loanTermMonths - 1, Math.max(0, Number(e.target.value) || 0)))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label htmlFor={warrantId} className="block text-xs font-medium text-slate-400 mb-1">
                Warrant Coverage (%)
              </label>
              <input
                id={warrantId}
                type="number"
                step="0.5"
                min="0"
                max="50"
                value={warrantCoveragePct}
                onChange={(e) => setWarrantCoveragePct(Math.max(0, Number(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label htmlFor={valId} className="block text-xs font-medium text-slate-400 mb-1">
              Company Valuation ($ Post-Money Equity)
            </label>
            <input
              id={valId}
              type="number"
              step="1000000"
              value={companyValuation}
              onChange={(e) => setCompanyValuation(Math.max(100000, Number(e.target.value) || 0))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div>
              <label htmlFor={closingFeeId} className="block text-xs font-medium text-slate-400 mb-1">
                Upfront Fee (%)
              </label>
              <input
                id={closingFeeId}
                type="number"
                step="0.25"
                value={closingFeePct}
                onChange={(e) => setClosingFeePct(Math.max(0, Number(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label htmlFor={finalFeeId} className="block text-xs font-medium text-slate-400 mb-1">
                Final / Exit Fee (%)
              </label>
              <input
                id={finalFeeId}
                type="number"
                step="0.25"
                value={finalFeePct}
                onChange={(e) => setFinalFeePct(Math.max(0, Number(e.target.value) || 0))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Right Comparison & Cost Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          {/* Equity Dilution vs Pure Equity Bar */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              Dilution Comparison: Venture Debt vs Equity Round
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                  <span>Pure Equity Financing Dilution (for {formatCurrency(principal)})</span>
                  <span className="text-rose-400 font-mono">{pureEquityDilutionPct.toFixed(2)}%</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(100, pureEquityDilutionPct * 3)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                  <span>Venture Debt Warrant Coverage Dilution</span>
                  <span className="text-emerald-400 font-mono">{warrantDilutionPct.toFixed(2)}%</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, warrantDilutionPct * 3)}%` }} />
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-300 flex items-center justify-between">
              <span>Founder & Shareholder Equity Saved:</span>
              <span className="font-bold text-sm font-mono">+{equitySavedPct.toFixed(2)}% Equity Preserved</span>
            </div>
          </div>

          {/* Detailed Fee & Cash Outflow Table */}
          <div className="rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-xs text-left text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Cost Component</th>
                  <th className="px-4 py-3 text-right">Calculation</th>
                  <th className="px-4 py-3 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/50 font-mono">
                <tr>
                  <td className="px-4 py-2.5 font-sans font-medium text-slate-200">Interest Paid (IO Period)</td>
                  <td className="px-4 py-2.5 text-right text-slate-400 font-sans">{ioMonths} mos @ {formatCurrency(monthlyPaymentIO)}/mo</td>
                  <td className="px-4 py-2.5 text-right text-slate-200">{formatCurrency(totalInterestIO)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-sans font-medium text-slate-200">Interest Paid (Amortizing)</td>
                  <td className="px-4 py-2.5 text-right text-slate-400 font-sans">{amortMonths} mos @ {formatCurrency(monthlyPaymentAmort)}/mo</td>
                  <td className="px-4 py-2.5 text-right text-slate-200">{formatCurrency(totalInterestAmort)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-sans font-medium text-slate-200">Upfront Commitment Fee</td>
                  <td className="px-4 py-2.5 text-right text-slate-400 font-sans">{closingFeePct.toFixed(2)}% of Principal</td>
                  <td className="px-4 py-2.5 text-right text-slate-200">{formatCurrency(closingFee)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-sans font-medium text-slate-200">Final / Exit Fee</td>
                  <td className="px-4 py-2.5 text-right text-slate-400 font-sans">{finalFeePct.toFixed(2)}% of Principal</td>
                  <td className="px-4 py-2.5 text-right text-slate-200">{formatCurrency(finalFee)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-sans font-medium text-slate-200">Warrant Value (Equity Equivalent)</td>
                  <td className="px-4 py-2.5 text-right text-slate-400 font-sans">{warrantCoveragePct.toFixed(1)}% Warrant Coverage</td>
                  <td className="px-4 py-2.5 text-right text-emerald-400">{formatCurrency(warrantValue)}</td>
                </tr>
                <tr className="bg-slate-800/70 font-bold text-white text-xs">
                  <td className="px-4 py-3 font-sans">Total Financial & Dilutive Cost</td>
                  <td className="px-4 py-3 text-right font-sans text-slate-300">Interest + Fees + Warrants</td>
                  <td className="px-4 py-3 text-right text-amber-400">{formatCurrency(totalNominalCost)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Guide notes */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2 text-xs text-slate-400">
        <h4 className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-4 h-4 text-sky-400" />
          Venture Debt Fundamentals for Startup Founders
        </h4>
        <p>
          Venture debt is complementary non-convertible debt provided to VC-backed startups to extend runway between equity rounds without incurring substantial dilution. Lenders take a coupon yield (prime + spread) plus 4%–10% warrant coverage (call options to purchase preferred shares at the prior round strike price).
        </p>
      </div>
    </div>
  );
}

export default VentureDebtCalculator;

