"use client";

import { useState, useMemo } from "react";
import { DollarSign, TrendingUp, Percent, Copy, Check, PieChart, ShieldCheck, AlertCircle, Award } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function ConvertibleNoteCalculator() {
  const [principal, setPrincipal] = useState<number>(500000);
  const [interestRate, setInterestRate] = useState<number>(6); // 6% annual
  const [months, setMonths] = useState<number>(18); // 18 months to qualified round
  const [valuationCap, setValuationCap] = useState<number>(6000000); // $6M cap
  const [discountRate, setDiscountRate] = useState<number>(20); // 20% discount
  const [seriesAPreMoney, setSeriesAPreMoney] = useState<number>(12000000); // $12M Series A Pre
  const [seriesANewMoney, setSeriesANewMoney] = useState<number>(3000000); // $3M Series A New Capital
  const [existingShares, setExistingShares] = useState<number>(10000000); // 10M common shares
  const [copied, setCopied] = useState<boolean>(false);

  const results = useMemo(() => {
    const accruedInterest = principal * (interestRate / 100) * (months / 12);
    const totalConversionAmount = principal + accruedInterest;

    // Series A base price per share
    const seriesABaseSharePrice = existingShares > 0 ? seriesAPreMoney / existingShares : 0;

    // Price from discount
    const discountPrice = seriesABaseSharePrice * (1 - discountRate / 100);

    // Price from valuation cap
    const capPrice = existingShares > 0 ? valuationCap / existingShares : 0;

    // The investor gets the lower price (more shares)
    const effectivePrice = Math.min(discountPrice, capPrice);
    const controllingMethod = capPrice < discountPrice ? "Valuation Cap" : "Discount Rate";

    const noteShares = effectivePrice > 0 ? Math.round(totalConversionAmount / effectivePrice) : 0;
    const seriesAShares = seriesABaseSharePrice > 0 ? Math.round(seriesANewMoney / seriesABaseSharePrice) : 0;

    const totalPostShares = existingShares + noteShares + seriesAShares;

    const founderPct = totalPostShares > 0 ? (existingShares / totalPostShares) * 100 : 0;
    const notePct = totalPostShares > 0 ? (noteShares / totalPostShares) * 100 : 0;
    const seriesAPct = totalPostShares > 0 ? (seriesAShares / totalPostShares) * 100 : 0;

    const postMoneyValuation = seriesAPreMoney + seriesANewMoney;

    return {
      accruedInterest,
      totalConversionAmount,
      seriesABaseSharePrice,
      discountPrice,
      capPrice,
      effectivePrice,
      controllingMethod,
      noteShares,
      seriesAShares,
      totalPostShares,
      founderPct,
      notePct,
      seriesAPct,
      postMoneyValuation,
    };
  }, [principal, interestRate, months, valuationCap, discountRate, seriesAPreMoney, seriesANewMoney, existingShares]);

  const handleCopy = async () => {
    const text = `Startup Convertible Note Seed Round Financing Analysis:
• Total Note Conversion Amount: $${results.totalConversionAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (Principal: $${principal.toLocaleString()} + Interest: $${results.accruedInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
• Effective Conversion Mechanism: ${results.controllingMethod}
  - Valuation Cap Price: $${results.capPrice.toFixed(4)}/share ($${valuationCap.toLocaleString()} Cap)
  - Discounted Price: $${results.discountPrice.toFixed(4)}/share (${discountRate}% Discount)
  - Series A Base Price: $${results.seriesABaseSharePrice.toFixed(4)}/share ($${seriesAPreMoney.toLocaleString()} Pre)
--------------------------------------------------
POST-SERIES A CAP TABLE OWNERSHIP:
• Founders & Existing Common: ${results.founderPct.toFixed(2)}% (${existingShares.toLocaleString()} shares)
• Convertible Note Seed Investors: ${results.notePct.toFixed(2)}% (${results.noteShares.toLocaleString()} shares)
• Series A Lead Investors: ${results.seriesAPct.toFixed(2)}% (${results.seriesAShares.toLocaleString()} shares)
• Total Diluted Post-Financing Shares: ${results.totalPostShares.toLocaleString()}
• Series A Post-Money Valuation: $${results.postMoneyValuation.toLocaleString()}`;

    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Note Principal ($)
          </label>
          <input
            type="number"
            step={50000}
            value={principal}
            onChange={(e) => setPrincipal(Math.max(1000, parseFloat(e.target.value) || 1000))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-foreground uppercase tracking-wider block">
                Interest %
              </label>
              <input
                type="number"
                step={0.5}
                value={interestRate}
                onChange={(e) => setInterestRate(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-2 py-1.5 text-sm font-mono font-bold bg-background border border-border rounded-md text-foreground"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-foreground uppercase tracking-wider block">
                Months
              </label>
              <input
                type="number"
                step={1}
                value={months}
                onChange={(e) => setMonths(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-2 py-1.5 text-sm font-mono font-bold bg-background border border-border rounded-md text-foreground"
              />
            </div>
          </div>
          <span className="text-[11px] text-muted-foreground block">
            Accrued: ${results.accruedInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Valuation Cap ($)
          </label>
          <input
            type="number"
            step={500000}
            value={valuationCap}
            onChange={(e) => setValuationCap(Math.max(10000, parseFloat(e.target.value) || 10000))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Discount Rate (%)
          </label>
          <input
            type="number"
            step={5}
            value={discountRate}
            onChange={(e) => setDiscountRate(Math.max(0, Math.min(90, parseFloat(e.target.value) || 0)))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Series A Pre-Money ($)
          </label>
          <input
            type="number"
            step={1000000}
            value={seriesAPreMoney}
            onChange={(e) => setSeriesAPreMoney(Math.max(10000, parseFloat(e.target.value) || 10000))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-indigo-600 dark:text-indigo-400"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Series A New Cash ($)
          </label>
          <input
            type="number"
            step={500000}
            value={seriesANewMoney}
            onChange={(e) => setSeriesANewMoney(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2 sm:col-span-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Pre-Financing Existing Shares
          </label>
          <input
            type="number"
            step={1000000}
            value={existingShares}
            onChange={(e) => setExistingShares(Math.max(1000, parseInt(e.target.value) || 1000))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* Controlling Mechanism Callout */}
      <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          <div className="text-xs sm:text-sm">
            <span className="text-muted-foreground">Governing Conversion Mechanism: </span>
            <strong className="text-foreground text-sm font-bold">{results.controllingMethod}</strong>
            <span className="text-muted-foreground ml-1">
              (Gives note holders lowest share price of <strong className="text-foreground">${results.effectivePrice.toFixed(4)}</strong> vs Series A base price of <strong className="text-foreground">${results.seriesABaseSharePrice.toFixed(4)}</strong>)
            </span>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground rounded-lg border border-border transition-colors shrink-0"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied" : "Copy Breakdown"}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-card border border-border rounded-2xl">
          <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
            Founders / Existing Common
          </span>
          <div className="text-3xl font-mono font-black text-foreground mt-1">
            {results.founderPct.toFixed(2)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {existingShares.toLocaleString()} shares
          </p>
        </div>

        <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
            Convertible Note Investors
          </span>
          <div className="text-3xl font-mono font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {results.notePct.toFixed(2)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            {results.noteShares.toLocaleString()} shares • ${(results.noteShares * results.seriesABaseSharePrice).toLocaleString(undefined, { maximumFractionDigits: 0 })} value
          </p>
        </div>

        <div className="p-5 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl">
          <span className="text-xs uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
            Series A Lead Investors
          </span>
          <div className="text-3xl font-mono font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {results.seriesAPct.toFixed(2)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            {results.seriesAShares.toLocaleString()} shares • ${seriesANewMoney.toLocaleString()} cash
          </p>
        </div>
      </div>

      {/* Visual Cap Table Distribution Bar */}
      <div className="p-5 bg-card border border-border rounded-2xl space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
          <PieChart className="w-4 h-4 text-primary" />
          Post-Financing Ownership Pro-Rata Split
        </h4>
        <div className="w-full h-7 bg-muted rounded-xl overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${results.founderPct}%` }}
            className="bg-zinc-600 dark:bg-zinc-400 h-full flex items-center justify-center text-[11px] font-bold text-white dark:text-black overflow-hidden px-1"
            title={`Founders: ${results.founderPct.toFixed(1)}%`}
          >
            {results.founderPct > 12 && `Common: ${results.founderPct.toFixed(1)}%`}
          </div>
          <div
            style={{ width: `${results.notePct}%` }}
            className="bg-emerald-500 h-full flex items-center justify-center text-[11px] font-bold text-white overflow-hidden px-1"
            title={`Note: ${results.notePct.toFixed(1)}%`}
          >
            {results.notePct > 8 && `Note: ${results.notePct.toFixed(1)}%`}
          </div>
          <div
            style={{ width: `${results.seriesAPct}%` }}
            className="bg-indigo-500 h-full flex items-center justify-center text-[11px] font-bold text-white overflow-hidden px-1"
            title={`Series A: ${results.seriesAPct.toFixed(1)}%`}
          >
            {results.seriesAPct > 8 && `Series A: ${results.seriesAPct.toFixed(1)}%`}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-zinc-600 dark:bg-zinc-400" />
            <span>Common / Founders ({results.founderPct.toFixed(1)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span>Note Seed Investors ({results.notePct.toFixed(1)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-indigo-500" />
            <span>Series A Investors ({results.seriesAPct.toFixed(1)}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
