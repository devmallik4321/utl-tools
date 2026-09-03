"use client";

import { useState, useMemo } from "react";
import { Trees, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, MapPin } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const LAND_TYPES = [
  { name: "Raw Undeveloped Land", minDown: 35, desc: "No utilities, roads, or improvements" },
  { name: "Unimproved Lot", minDown: 25, desc: "Road access, no water/sewer/power" },
  { name: "Improved / Build-Ready Lot", minDown: 20, desc: "Full utilities, water, and road paved" },
];

export function LandLoanCalculator() {
  const [purchasePrice, setPurchasePrice] = useState<number>(150000);
  const [downPaymentPct, setDownPaymentPct] = useState<number>(30);
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [loanTermYears, setLoanTermYears] = useState<number>(15);
  const [annualPropertyTax, setAnnualPropertyTax] = useState<number>(1400);
  const [copied, setCopied] = useState<boolean>(false);

  const { downPaymentAmount, loanPrincipal, monthlyPI, monthlyTotal, totalInterestPaid } = useMemo(() => {
    const down = purchasePrice * (downPaymentPct / 100);
    const principal = Math.max(0, purchasePrice - down);

    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = loanTermYears * 12;

    let pi = 0;
    if (monthlyRate > 0 && totalMonths > 0) {
      pi = (principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }

    const monthlyTax = annualPropertyTax / 12;
    const totalM = pi + monthlyTax;
    const totalInt = pi * totalMonths - principal;

    return {
      downPaymentAmount: Math.round(down),
      loanPrincipal: Math.round(principal),
      monthlyPI: Math.round(pi),
      monthlyTotal: Math.round(totalM),
      totalInterestPaid: Math.max(0, Math.round(totalInt)),
    };
  }, [purchasePrice, downPaymentPct, interestRate, loanTermYears, annualPropertyTax]);

  const handleCopy = async () => {
    const summary = `Land Loan Financing Summary ($${purchasePrice.toLocaleString()} Purchase Price):\n• Down Payment (${downPaymentPct}%): $${downPaymentAmount.toLocaleString()}\n• Loan Principal: $${loanPrincipal.toLocaleString()}\n• Monthly P&I Payment: $${monthlyPI.toLocaleString()}/mo\n• Total Monthly Cost (with Property Tax): $${monthlyTotal.toLocaleString()}/mo\n• Total Lifetime Interest (${loanTermYears} yrs @ ${interestRate}%): $${totalInterestPaid.toLocaleString()}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Land Type Presets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {LAND_TYPES.map((lt) => (
          <button
            key={lt.name}
            onClick={() => setDownPaymentPct(lt.minDown)}
            className="p-3 text-left rounded-xl border border-border bg-card hover:bg-muted transition-colors space-y-1"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-foreground">{lt.name}</span>
              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {lt.minDown}% Min Down
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">{lt.desc}</p>
          </button>
        ))}
      </div>

      {/* Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Purchase Price ($)
          </label>
          <input
            type="number"
            min={5000}
            step={5000}
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(Math.max(1000, parseFloat(e.target.value) || 1000))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Down Payment (%)
          </label>
          <input
            type="number"
            min={10}
            max={70}
            step={5}
            value={downPaymentPct}
            onChange={(e) => setDownPaymentPct(Math.max(5, parseFloat(e.target.value) || 5))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
          <span className="text-[10px] text-muted-foreground font-mono">
            =${downPaymentAmount.toLocaleString()} down
          </span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Interest Rate (% APR)
          </label>
          <input
            type="number"
            min={2.0}
            step={0.25}
            value={interestRate}
            onChange={(e) => setInterestRate(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Loan Term
          </label>
          <select
            value={loanTermYears}
            onChange={(e) => setLoanTermYears(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={5}>5 Years (Balloon or Short Term)</option>
            <option value={10}>10 Years</option>
            <option value={15}>15 Years (Standard Land Loan)</option>
            <option value={20}>20 Years</option>
          </select>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Trees className="w-4 h-4 text-emerald-500" />
            Land Loan Monthly Obligations &amp; Financing Cost
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Loan Summary"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Down Payment</span>
            <p className="text-2xl font-bold text-foreground">${downPaymentAmount.toLocaleString()}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Cash required at closing</span>
          </div>

          <div className="p-4 bg-card rounded-xl border-2 border-emerald-500/40 space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase font-sans">
              Monthly Payment
            </span>
            <p className="text-3xl font-extrabold text-foreground">${monthlyTotal.toLocaleString()}/mo</p>
            <span className="text-[10px] text-muted-foreground font-sans">
              P&amp;I (${monthlyPI}) + Tax (${Math.round(annualPropertyTax / 12)})
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Loan Amount</span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${loanPrincipal.toLocaleString()}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Bank financed principal</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Total Interest</span>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              ${totalInterestPaid.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Over {loanTermYears} years</span>
          </div>
        </div>
      </div>
    </div>
  );
}
