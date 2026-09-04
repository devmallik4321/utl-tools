"use client";

import { useState, useMemo } from "react";
import { DollarSign, ShieldAlert, CheckCircle2, TrendingUp, Copy, Check, Info, FileText, AlertTriangle, ArrowRight } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function Section83bCalculator() {
  const [shares, setShares] = useState<number>(100000);
  const [purchasePrice, setPurchasePrice] = useState<number>(0.01);
  const [grantFmv, setGrantFmv] = useState<number>(0.01);
  const [projectedVestingFmv, setProjectedVestingFmv] = useState<number>(4.00);
  const [projectedExitPrice, setProjectedExitPrice] = useState<number>(25.00);
  const [ordinaryTaxRate, setOrdinaryTaxRate] = useState<number>(37);
  const [ltcgTaxRate, setLtcgTaxRate] = useState<number>(20);

  const [copied, setCopied] = useState<boolean>(false);

  const results = useMemo(() => {
    const totalCostBasisPaid = shares * purchasePrice;

    // Scenario A: WITH 83(b) Election
    // Tax at grant: Ordinary income on spread between grant FMV and purchase price
    const grantSpread = Math.max(0, grantFmv - purchasePrice);
    const taxAtGrantWith83b = grantSpread * shares * (ordinaryTaxRate / 100);

    // Tax during vesting: ZERO
    const taxDuringVestingWith83b = 0;

    // Tax at exit: LTCG on spread between exit price and grant FMV
    const exitSpreadWith83b = Math.max(0, projectedExitPrice - grantFmv);
    const taxAtExitWith83b = exitSpreadWith83b * shares * (ltcgTaxRate / 100);

    const totalTaxWith83b = taxAtGrantWith83b + taxDuringVestingWith83b + taxAtExitWith83b;
    const grossExitProceeds = shares * projectedExitPrice;
    const netProceedsWith83b = grossExitProceeds - totalCostBasisPaid - totalTaxWith83b;

    // Scenario B: WITHOUT 83(b) Election
    // Tax at grant: $0
    const taxAtGrantWithout83b = 0;

    // Tax during vesting: Ordinary income tax on spread between vesting FMV and purchase price
    const vestingSpread = Math.max(0, projectedVestingFmv - purchasePrice);
    const taxDuringVestingWithout83b = vestingSpread * shares * (ordinaryTaxRate / 100);

    // Tax at exit: Capital gains on spread between exit price and vesting FMV
    const exitSpreadWithout83b = Math.max(0, projectedExitPrice - projectedVestingFmv);
    const taxAtExitWithout83b = exitSpreadWithout83b * shares * (ltcgTaxRate / 100);

    const totalTaxWithout83b = taxAtGrantWithout83b + taxDuringVestingWithout83b + taxAtExitWithout83b;
    const netProceedsWithout83b = grossExitProceeds - totalCostBasisPaid - totalTaxWithout83b;

    // Comparison
    const totalSavings = totalTaxWithout83b - totalTaxWith83b;
    const phantomTaxAvoided = taxDuringVestingWithout83b;

    return {
      totalCostBasisPaid,
      grossExitProceeds,
      with83b: {
        taxAtGrant: taxAtGrantWith83b,
        taxDuringVesting: taxDuringVestingWith83b,
        taxAtExit: taxAtExitWith83b,
        totalTax: totalTaxWith83b,
        netProceeds: netProceedsWith83b,
        effectiveRate: grossExitProceeds > 0 ? (totalTaxWith83b / grossExitProceeds) * 100 : 0,
      },
      without83b: {
        taxAtGrant: taxAtGrantWithout83b,
        taxDuringVesting: taxDuringVestingWithout83b,
        taxAtExit: taxAtExitWithout83b,
        totalTax: totalTaxWithout83b,
        netProceeds: netProceedsWithout83b,
        effectiveRate: grossExitProceeds > 0 ? (totalTaxWithout83b / grossExitProceeds) * 100 : 0,
      },
      totalSavings,
      phantomTaxAvoided,
    };
  }, [shares, purchasePrice, grantFmv, projectedVestingFmv, projectedExitPrice, ordinaryTaxRate, ltcgTaxRate]);

  const handleCopy = async () => {
    const text = `IRS Section 83(b) Election Tax Savings Analysis:
• Total Shares: ${shares.toLocaleString()}
• Total Gross Exit Value: $${results.grossExitProceeds.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
--------------------------------------------------
WITH 83(b) ELECTION:
• Tax Paid at Grant: $${results.with83b.taxAtGrant.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
• Phantom Tax During Vesting: $0.00
• Long-Term Capital Gains Tax at Exit: $${results.with83b.taxAtExit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
• Total Tax Liability: $${results.with83b.totalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
• Net Take-Home Proceeds: $${results.with83b.netProceeds.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
--------------------------------------------------
WITHOUT 83(b) ELECTION:
• Tax Paid at Grant: $0.00
• Phantom Tax Paid at Vesting (Ordinary Income): $${results.without83b.taxDuringVesting.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
• Capital Gains Tax at Exit: $${results.without83b.taxAtExit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
• Total Tax Liability: $${results.without83b.totalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
• Net Take-Home Proceeds: $${results.without83b.netProceeds.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
--------------------------------------------------
NET TAX BENEFIT WITH 83(b):
• Total Estimated Tax Savings: $${results.totalSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
• Phantom Cash Tax Avoided During Vesting: $${results.phantomTaxAvoided.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
• Strict Filing Deadline: Exactly 30 days from grant/exercise date via USPS Certified Mail.`;

    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* 30-Day Warning Banner */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm text-foreground space-y-1">
          <p className="font-semibold text-amber-600 dark:text-amber-400">
            Strict 30-Day IRS Filing Window
          </p>
          <p className="text-muted-foreground">
            An 83(b) election must be filed with the IRS within <strong className="text-foreground">exactly 30 calendar days</strong> of the grant or stock exercise date. The IRS provides zero exceptions or extensions. Always send via USPS Certified Mail with Return Receipt Requested.
          </p>
        </div>
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Number of Shares / Options
          </label>
          <input
            type="number"
            step={5000}
            value={shares}
            onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Purchase / Strike Price ($)
          </label>
          <input
            type="number"
            step={0.001}
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[11px] text-muted-foreground block">
            Cost paid per share (often $0.0001 - $0.01 for founders)
          </span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Grant Date Fair Market Value ($)
          </label>
          <input
            type="number"
            step={0.01}
            value={grantFmv}
            onChange={(e) => setGrantFmv(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
          <span className="text-[11px] text-muted-foreground block">
            FMV (409A valuation) at initial grant / exercise
          </span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Avg Projected FMV at Vesting ($)
          </label>
          <input
            type="number"
            step={0.5}
            value={projectedVestingFmv}
            onChange={(e) => setProjectedVestingFmv(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[11px] text-muted-foreground block">
            Average 409A valuation across 4-year vesting
          </span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Projected Exit / Sale Price ($)
          </label>
          <input
            type="number"
            step={1}
            value={projectedExitPrice}
            onChange={(e) => setProjectedExitPrice(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-indigo-600 dark:text-indigo-400"
          />
          <span className="text-[11px] text-muted-foreground block">
            Anticipated IPO / M&amp;A acquisition price per share
          </span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-foreground uppercase tracking-wider block">
                Ordinary Tax %
              </label>
              <input
                type="number"
                step={1}
                value={ordinaryTaxRate}
                onChange={(e) => setOrdinaryTaxRate(Math.max(0, Math.min(60, parseFloat(e.target.value) || 0)))}
                className="w-full px-2 py-1.5 text-sm font-mono font-bold bg-background border border-border rounded-md text-foreground"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-foreground uppercase tracking-wider block">
                LTCG Tax %
              </label>
              <input
                type="number"
                step={1}
                value={ltcgTaxRate}
                onChange={(e) => setLtcgTaxRate(Math.max(0, Math.min(40, parseFloat(e.target.value) || 0)))}
                className="w-full px-2 py-1.5 text-sm font-mono font-bold bg-background border border-border rounded-md text-foreground"
              />
            </div>
          </div>
          <span className="text-[11px] text-muted-foreground block">
            Combined Fed + State tax brackets
          </span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
            Total Tax Savings with 83(b)
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-600 dark:text-emerald-400 mt-1">
            ${results.totalSavings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Additional cash kept in pocket post-exit
          </p>
        </div>

        <div className="p-5 bg-card border border-border rounded-2xl">
          <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
            Phantom Cash Tax Avoided
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-black text-foreground mt-1">
            ${results.phantomTaxAvoided.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Illiquid out-of-pocket tax eliminated during vesting
          </p>
        </div>

        <div className="p-5 bg-card border border-border rounded-2xl">
          <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
            Gross Liquidity Event Value
          </span>
          <div className="text-2xl sm:text-3xl font-mono font-black text-foreground mt-1">
            ${results.grossExitProceeds.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total exit valuation across all {shares.toLocaleString()} shares
          </p>
        </div>
      </div>

      {/* Side-by-Side Comparison Table */}
      <div className="p-5 bg-card border border-border rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Side-by-Side Financial Comparison
          </h3>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground rounded-lg border border-border transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied Analysis" : "Copy Breakdown"}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="pb-3 font-semibold">Tax Event / Metric</th>
                <th className="pb-3 font-semibold text-emerald-600 dark:text-emerald-400">
                  With 83(b) Election
                </th>
                <th className="pb-3 font-semibold text-rose-500">
                  Without 83(b) Election
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr>
                <td className="py-2.5 text-muted-foreground font-medium">1. Tax at Grant (Day 1)</td>
                <td className="py-2.5 font-mono font-bold text-foreground">
                  ${results.with83b.taxAtGrant.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 font-mono text-muted-foreground">$0.00</td>
              </tr>
              <tr>
                <td className="py-2.5 text-muted-foreground font-medium">
                  2. Phantom Tax During Vesting (Years 1-4)
                </td>
                <td className="py-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  $0.00 (Zero out-of-pocket)
                </td>
                <td className="py-2.5 font-mono font-bold text-rose-500">
                  ${results.without83b.taxDuringVesting.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 text-muted-foreground font-medium">
                  3. Long-Term Capital Gains Tax at Exit
                </td>
                <td className="py-2.5 font-mono font-bold text-foreground">
                  ${results.with83b.taxAtExit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 font-mono font-bold text-foreground">
                  ${results.without83b.taxAtExit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
              <tr className="bg-muted/30">
                <td className="py-2.5 font-bold text-foreground">Total Cumulative Tax Paid</td>
                <td className="py-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  ${results.with83b.totalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 font-mono font-bold text-rose-500">
                  ${results.without83b.totalTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
              <tr className="bg-primary/5">
                <td className="py-2.5 font-bold text-foreground">Net Cash Proceeds After Tax</td>
                <td className="py-2.5 font-mono font-black text-emerald-600 dark:text-emerald-400">
                  ${results.with83b.netProceeds.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-2.5 font-mono font-black text-foreground">
                  ${results.without83b.netProceeds.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 text-muted-foreground font-medium">Effective Tax Rate</td>
                <td className="py-2.5 font-mono font-semibold text-foreground">
                  {results.with83b.effectiveRate.toFixed(1)}%
                </td>
                <td className="py-2.5 font-mono font-semibold text-foreground">
                  {results.without83b.effectiveRate.toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 83(b) Filing Protocol & Checklist */}
      <div className="p-4 bg-muted/40 border border-border rounded-xl space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-primary" />
          IRS Section 83(b) Filing Protocol Checklist
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-muted-foreground">
          <div className="p-3 bg-card border border-border/70 rounded-lg space-y-1">
            <span className="font-bold text-foreground block">1. Sign &amp; Date Within 30 Days</span>
            <p>Execute the election letter within 30 calendar days of your stock purchase agreement or early option exercise date.</p>
          </div>
          <div className="p-3 bg-card border border-border/70 rounded-lg space-y-1">
            <span className="font-bold text-foreground block">2. USPS Certified Mail</span>
            <p>Send via USPS Certified Mail with Return Receipt Requested to the IRS Service Center where you file annual tax returns.</p>
          </div>
          <div className="p-3 bg-card border border-border/70 rounded-lg space-y-1">
            <span className="font-bold text-foreground block">3. Company &amp; Tax Records</span>
            <p>Deliver a signed copy to your employer company secretary and attach a copy to your annual Form 1040 tax return.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
