"use client";

import { useState, useMemo } from "react";
import { Car, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, Scale } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function LeaseVsBuyCalculator() {
  const [vehiclePrice, setVehiclePrice] = useState<number>(38000);

  // Buy Options
  const [buyDownPayment, setBuyDownPayment] = useState<number>(5000);
  const [loanTermMonths, setLoanTermMonths] = useState<number>(60);
  const [loanRate, setLoanRate] = useState<number>(6.5);
  const [estimatedFutureValue, setEstimatedFutureValue] = useState<number>(16000);

  // Lease Options
  const [leaseDownPayment, setLeaseDownPayment] = useState<number>(3000);
  const [leaseTermMonths, setLeaseTermMonths] = useState<number>(36);
  const [monthlyLeasePayment, setMonthlyLeasePayment] = useState<number>(420);
  const [leaseFees, setLeaseFees] = useState<number>(950);

  const [copied, setCopied] = useState<boolean>(false);

  const { buyMonthlyPayment, totalBuyPayments, netBuyCost, totalLeaseCost, netLeasePerYear, netBuyPerYear, winner } =
    useMemo(() => {
      // Loan math
      const loanAmount = Math.max(0, vehiclePrice - buyDownPayment);
      const monthlyRate = loanRate / 100 / 12;
      let buyMonthly = 0;
      if (monthlyRate > 0 && loanAmount > 0) {
        buyMonthly =
          (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths))) /
          (Math.pow(1 + monthlyRate, loanTermMonths) - 1);
      } else if (loanAmount > 0) {
        buyMonthly = loanAmount / loanTermMonths;
      }

      const totalBuyOutlay = buyDownPayment + buyMonthly * loanTermMonths;
      const netBuy = totalBuyOutlay - estimatedFutureValue; // Net cost after equity recovery
      const buyAnnual = loanTermMonths > 0 ? (netBuy / (loanTermMonths / 12)) : 0;

      // Lease math
      const totalLease = leaseDownPayment + monthlyLeasePayment * leaseTermMonths + leaseFees;
      const leaseAnnual = leaseTermMonths > 0 ? (totalLease / (leaseTermMonths / 12)) : 0;

      const isBuyBetter = buyAnnual < leaseAnnual;

      return {
        buyMonthlyPayment: buyMonthly,
        totalBuyPayments: totalBuyOutlay,
        netBuyCost: netBuy,
        totalLeaseCost: totalLease,
        netBuyPerYear: buyAnnual,
        netLeasePerYear: leaseAnnual,
        winner: isBuyBetter ? "buy" : "lease",
      };
    }, [
      vehiclePrice,
      buyDownPayment,
      loanTermMonths,
      loanRate,
      estimatedFutureValue,
      leaseDownPayment,
      leaseTermMonths,
      monthlyLeasePayment,
      leaseFees,
    ]);

  const handleCopy = async () => {
    const summary = `Car Lease vs Buy Cost Comparison ($${vehiclePrice.toLocaleString()} MSRP)\n• BUY Scenario (${loanTermMonths}mo @ ${loanRate}%): $${buyMonthlyPayment.toFixed(2)}/mo ($${netBuyPerYear.toFixed(0)}/yr net cost after $${estimatedFutureValue.toLocaleString()} residual equity)\n• LEASE Scenario (${leaseTermMonths}mo): $${monthlyLeasePayment}/mo ($${netLeasePerYear.toFixed(0)}/yr net cost)\n• Financially Optimal Choice: ${winner === "buy" ? "BUYING" : "LEASING"} saves ~$${Math.abs(netBuyPerYear - netLeasePerYear).toFixed(0)} per year.`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Vehicle Price */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Vehicle Negotiated Price / MSRP ($)
        </label>
        <input
          type="number"
          min={1000}
          value={vehiclePrice}
          onChange={(e) => setVehiclePrice(Math.max(0, parseFloat(e.target.value) || 0))}
          className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
        />
      </div>

      {/* Side-by-Side Comparison Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Buy Scenario */}
        <div className="p-4 bg-card border-2 border-blue-500/20 rounded-xl space-y-3">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
            Option A: Purchase with Auto Loan
          </span>
          <div className="space-y-2 text-xs">
            <div>
              <label className="text-muted-foreground block">Down Payment ($)</label>
              <input
                type="number"
                min={0}
                value={buyDownPayment}
                onChange={(e) => setBuyDownPayment(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 font-mono bg-background border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="text-muted-foreground block">Loan Term (Months)</label>
              <select
                value={loanTermMonths}
                onChange={(e) => setLoanTermMonths(parseInt(e.target.value))}
                className="w-full px-2.5 py-1.5 font-mono font-bold bg-background border border-border rounded-lg"
              >
                <option value={36}>36 Months (3 Yrs)</option>
                <option value={48}>48 Months (4 Yrs)</option>
                <option value={60}>60 Months (5 Yrs)</option>
                <option value={72}>72 Months (6 Yrs)</option>
              </select>
            </div>
            <div>
              <label className="text-muted-foreground block">Interest Rate (% APR)</label>
              <input
                type="number"
                min={0}
                step="0.25"
                value={loanRate}
                onChange={(e) => setLoanRate(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 font-mono bg-background border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="text-muted-foreground block">Estimated Resale Value at End of Term ($)</label>
              <input
                type="number"
                min={0}
                value={estimatedFutureValue}
                onChange={(e) => setEstimatedFutureValue(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 font-mono bg-background border border-border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Lease Scenario */}
        <div className="p-4 bg-card border-2 border-purple-500/20 rounded-xl space-y-3">
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
            Option B: 3-Year Car Lease
          </span>
          <div className="space-y-2 text-xs">
            <div>
              <label className="text-muted-foreground block">Cash Due at Signing ($)</label>
              <input
                type="number"
                min={0}
                value={leaseDownPayment}
                onChange={(e) => setLeaseDownPayment(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 font-mono bg-background border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="text-muted-foreground block">Lease Term (Months)</label>
              <select
                value={leaseTermMonths}
                onChange={(e) => setLeaseTermMonths(parseInt(e.target.value))}
                className="w-full px-2.5 py-1.5 font-mono font-bold bg-background border border-border rounded-lg"
              >
                <option value={24}>24 Months (2 Yrs)</option>
                <option value={36}>36 Months (3 Yrs)</option>
                <option value={48}>48 Months (4 Yrs)</option>
              </select>
            </div>
            <div>
              <label className="text-muted-foreground block">Monthly Lease Payment ($)</label>
              <input
                type="number"
                min={0}
                value={monthlyLeasePayment}
                onChange={(e) => setMonthlyLeasePayment(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 font-mono bg-background border border-border rounded-lg"
              />
            </div>
            <div>
              <label className="text-muted-foreground block">Acquisition &amp; Disposition Fees ($)</label>
              <input
                type="number"
                min={0}
                value={leaseFees}
                onChange={(e) => setLeaseFees(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 font-mono bg-background border border-border rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Results Card */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-emerald-500" />
            Financial Breakdown &amp; Recommendation
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Report"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Buy: Net Annual Cost</span>
            <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              ${netBuyPerYear.toFixed(0)} <span className="text-xs font-normal text-muted-foreground">/ yr</span>
            </p>
            <span className="text-[10px] text-muted-foreground">
              ${buyMonthlyPayment.toFixed(2)}/mo minus equity
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Lease: Net Annual Cost</span>
            <p className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">
              ${netLeasePerYear.toFixed(0)} <span className="text-xs font-normal text-muted-foreground">/ yr</span>
            </p>
            <span className="text-[10px] text-muted-foreground">
              ${monthlyLeasePayment}/mo with zero equity
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border-2 border-emerald-500/40 space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase font-bold">
              Recommendation
            </span>
            <p className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 uppercase">
              {winner === "buy" ? "Buy & Keep" : "Lease"}
            </p>
            <span className="text-[10px] text-muted-foreground">
              Saves ~${Math.abs(netBuyPerYear - netLeasePerYear).toFixed(0)} / yr
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
