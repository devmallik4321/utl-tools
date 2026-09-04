"use client";

import React, { useState, useMemo } from "react";
import { DollarSign, Calendar, TrendingUp, ShieldCheck, Copy, Check, Info } from "lucide-react";

type BillingFrequency = "ANNUAL_UPFRONT" | "FULL_UPFRONT" | "QUARTERLY" | "SEMI_ANNUAL";

interface Preset {
  name: string;
  tcv: number;
  termYears: number;
  billing: BillingFrequency;
}

const PRESETS: Preset[] = [
  {
    name: "3-Year Enterprise Deal (Annual Upfront)",
    tcv: 180000,
    termYears: 3,
    billing: "ANNUAL_UPFRONT"
  },
  {
    name: "2-Year Contract (Full Multi-Year Prepay)",
    tcv: 120000,
    termYears: 2,
    billing: "FULL_UPFRONT"
  },
  {
    name: "1-Year Mid-Market (Quarterly Invoicing)",
    tcv: 48000,
    termYears: 1,
    billing: "QUARTERLY"
  }
];

export function SaasDeferredRevenueWaterfallCalculator() {
  const [tcv, setTcv] = useState<number>(180000); // $180k TCV
  const [termYears, setTermYears] = useState<number>(3); // 3-year deal
  const [billing, setBilling] = useState<BillingFrequency>("ANNUAL_UPFRONT");

  const [copied, setCopied] = useState(false);

  const loadPreset = (p: Preset) => {
    setTcv(p.tcv);
    setTermYears(p.termYears);
    setBilling(p.billing);
  };

  const results = useMemo(() => {
    const totalMonths = termYears * 12;
    const acv = termYears > 0 ? tcv / termYears : 0;
    const monthlyRecognized = totalMonths > 0 ? tcv / totalMonths : 0;

    // Build month-by-month waterfall (up to 36 months preview)
    const previewMonths = Math.min(36, totalMonths);
    const months = [];
    let cumulativeCash = 0;
    let cumulativeRecognized = 0;
    let deferredRevenue = 0;

    for (let m = 1; m <= previewMonths; m++) {
      let cashInflow = 0;

      if (billing === "FULL_UPFRONT") {
        if (m === 1) cashInflow = tcv;
      } else if (billing === "ANNUAL_UPFRONT") {
        if (m === 1 || m === 13 || m === 25 || m === 37 || m === 49) {
          cashInflow = acv;
        }
      } else if (billing === "SEMI_ANNUAL") {
        if ((m - 1) % 6 === 0) {
          cashInflow = acv / 2;
        }
      } else if (billing === "QUARTERLY") {
        if ((m - 1) % 3 === 0) {
          cashInflow = acv / 4;
        }
      }

      cumulativeCash += cashInflow;
      cumulativeRecognized += monthlyRecognized;
      deferredRevenue = Math.max(0, cumulativeCash - cumulativeRecognized);

      months.push({
        month: m,
        cashInflow: Math.round(cashInflow),
        recognized: Math.round(monthlyRecognized),
        deferredRevenue: Math.round(deferredRevenue)
      });
    }

    return {
      tcv: Math.round(tcv),
      acv: Math.round(acv),
      monthlyRecognized: Math.round(monthlyRecognized),
      totalMonths,
      months
    };
  }, [tcv, termYears, billing]);

  const handleCopy = async () => {
    const text = [
      `=== SAAS ASC 606 DEFERRED REVENUE & ACV/TCV WATERFALL ===`,
      `Total Contract Value (TCV): $${results.tcv.toLocaleString()}`,
      `Contract Term: ${termYears} Years (${results.totalMonths} months)`,
      `Annual Contract Value (ACV): $${results.acv.toLocaleString()}/yr`,
      `Monthly Recognized Revenue (GAAP): $${results.monthlyRecognized.toLocaleString()}/mo`,
      `Billing Cadence: ${billing}`,
      `-------------------------------------------------------`,
      `Key Milestone Deferred Revenue Balances:`,
      `- Month 1 Ending Deferred: $${results.months[0]?.deferredRevenue.toLocaleString()}`,
      `- Month 12 Ending Deferred: $${results.months[11]?.deferredRevenue.toLocaleString() || "0"}`,
      results.months[23] ? `- Month 24 Ending Deferred: $${results.months[23].deferredRevenue.toLocaleString()}` : "",
      `=======================================================`
    ].filter(Boolean).join("\n");

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
                ASC 606 GAAP Revenue Recognition
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                ACV vs. TCV Waterfall
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
              SaaS ACV vs. TCV & Deferred Revenue Waterfall Calculator
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Model multi-year SaaS contracts under ASC 606. Distinguish Annual Contract Value (ACV) from Total Contract Value (TCV), simulate upfront cash collections, and track monthly deferred revenue amortizations.
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
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Contract Terms & Billing Schedule</h3>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Total Contract Value ($ TCV)</label>
              <input
                type="number"
                value={tcv}
                onChange={(e) => setTcv(Math.max(1000, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-emerald-400 font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Contract Duration (Years)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={termYears}
                onChange={(e) => setTermYears(Math.max(1, Math.min(5, Number(e.target.value))))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Invoicing / Billing Cadence</label>
              <select
                value={billing}
                onChange={(e) => setBilling(e.target.value as BillingFrequency)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option value="ANNUAL_UPFRONT">Annual Upfront (Industry Standard)</option>
                <option value="FULL_UPFRONT">Full Multi-Year Upfront (Max Cash)</option>
                <option value="SEMI_ANNUAL">Semi-Annual Invoicing</option>
                <option value="QUARTERLY">Quarterly Invoicing</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Dashboard & Waterfall Table (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Metrics summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400">Annual Contract Value (ACV)</div>
              <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
                ${results.acv.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ yr</span>
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400">GAAP Monthly Recognized (ASC 606)</div>
              <div className="text-2xl font-black font-mono text-indigo-400 mt-0.5">
                ${results.monthlyRecognized.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ mo</span>
              </div>
            </div>
          </div>

          {/* Waterfall Schedule */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Monthly Waterfall Amortization (First 12 Months)
              </h4>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded border border-slate-700 flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy Waterfall"}
              </button>
            </div>

            <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden text-xs">
              <div className="grid grid-cols-4 p-2.5 bg-slate-900/80 text-[10px] uppercase font-semibold text-slate-400">
                <div>Month</div>
                <div>Cash Billed</div>
                <div>Recognized</div>
                <div className="text-right">Deferred Balance</div>
              </div>
              <div className="max-h-[260px] overflow-y-auto divide-y divide-slate-800/60 font-mono text-[11px]">
                {results.months.slice(0, 12).map((row) => (
                  <div key={row.month} className="grid grid-cols-4 p-2 items-center">
                    <div className="text-slate-400">Month {row.month}</div>
                    <div className={row.cashInflow > 0 ? "text-emerald-400 font-bold" : "text-slate-600"}>
                      ${row.cashInflow.toLocaleString()}
                    </div>
                    <div className="text-indigo-300">${row.recognized.toLocaleString()}</div>
                    <div className="text-right text-slate-200">${row.deferredRevenue.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SaasDeferredRevenueWaterfallCalculator;
