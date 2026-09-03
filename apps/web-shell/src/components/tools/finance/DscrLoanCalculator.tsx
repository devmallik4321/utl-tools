"use client";

import { useState, useMemo } from "react";
import { Building2, DollarSign, Calendar, Percent, Copy, Check, Sparkles, AlertCircle } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function DscrLoanCalculator() {
  const [purchasePrice, setPurchasePrice] = useState<number>(350000);
  const [downPaymentPct, setDownPaymentPct] = useState<number>(20); // 20% down
  const [interestRate, setInterestRate] = useState<number>(7.25);
  const [monthlyRent, setMonthlyRent] = useState<number>(2750);
  const [annualTaxes, setAnnualTaxes] = useState<number>(4200);
  const [annualInsurance, setAnnualInsurance] = useState<number>(1400);
  const [monthlyHoa, setMonthlyHoa] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const {
    loanAmount,
    monthlyPi,
    monthlyPitia,
    dscrRatio,
    netMonthlyCashFlow,
    qualificationStatus,
    maxLoanAtTargetDscr,
  } = useMemo(() => {
    const loan = purchasePrice * (1 - downPaymentPct / 100);
    const r = interestRate / 100 / 12;
    const n = 360; // 30-year fixed

    const pi =
      loan > 0 && r > 0 ? (loan * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1) : 0;

    const monthlyTax = annualTaxes / 12;
    const monthlyIns = annualInsurance / 12;
    const pitia = pi + monthlyTax + monthlyIns + monthlyHoa;

    const ratio = pitia > 0 ? monthlyRent / pitia : 0;
    const cashFlow = monthlyRent - pitia;

    let status = "Strong Approval";
    if (ratio >= 1.25) status = "Strong Approval (Prime Rates)";
    else if (ratio >= 1.0) status = "Acceptable (Standard Rates)";
    else status = "Deficit (<1.0x DSCR - Down Payment Increase Needed)";

    // Maximum loan allowed where MonthlyRent / PITIA >= 1.25
    // MaxPITIA = Rent / 1.25
    // MaxPI = MaxPITIA - (Taxes + Ins + HOA)
    const maxPitia = monthlyRent / 1.25;
    const maxPi = Math.max(0, maxPitia - (monthlyTax + monthlyIns + monthlyHoa));
    const maxLoan =
      r > 0 && maxPi > 0 ? (maxPi * (Math.pow(1 + r, n) - 1)) / (r * Math.pow(1 + r, n)) : 0;

    return {
      loanAmount: Math.round(loan),
      monthlyPi: Math.round(pi),
      monthlyPitia: Math.round(pitia),
      dscrRatio: ratio.toFixed(2),
      netMonthlyCashFlow: Math.round(cashFlow),
      qualificationStatus: status,
      maxLoanAtTargetDscr: Math.round(maxLoan),
    };
  }, [purchasePrice, downPaymentPct, interestRate, monthlyRent, annualTaxes, annualInsurance, monthlyHoa]);

  const handleCopy = async () => {
    const summary = `DSCR Rental Property Loan Qualification ($${purchasePrice.toLocaleString()} Purchase @ $${monthlyRent.toLocaleString()}/mo Rent):\n• DSCR Ratio: ${dscrRatio}x (${qualificationStatus})\n• Total Monthly PITIA Debt Service: $${monthlyPitia.toLocaleString()}/mo\n• Net Monthly Cash-Flow Buffer: $${netMonthlyCashFlow.toLocaleString()}/mo\n• Principal & Interest: $${monthlyPi.toLocaleString()}/mo (${interestRate}% on $${loanAmount.toLocaleString()} loan)\n• Max Allowable Loan for 1.25x DSCR: $${maxLoanAtTargetDscr.toLocaleString()}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Purchase Price ($)
          </label>
          <input
            type="number"
            min={50000}
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
          <select
            value={downPaymentPct}
            onChange={(e) => setDownPaymentPct(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={15}>15% Down (85% LTV)</option>
            <option value={20}>20% Down (80% LTV Standard)</option>
            <option value={25}>25% Down (75% LTV)</option>
            <option value={30}>30% Down (70% LTV)</option>
          </select>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Gross Monthly Rent ($)
          </label>
          <input
            type="number"
            min={100}
            step={50}
            value={monthlyRent}
            onChange={(e) => setMonthlyRent(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Interest Rate (% APR)
          </label>
          <input
            type="number"
            min={3}
            max={15}
            step={0.125}
            value={interestRate}
            onChange={(e) => setInterestRate(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* Property Carrying Costs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Annual Property Taxes ($)
          </label>
          <input
            type="number"
            min={0}
            step={100}
            value={annualTaxes}
            onChange={(e) => setAnnualTaxes(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Annual Hazard Insurance ($)
          </label>
          <input
            type="number"
            min={0}
            step={100}
            value={annualInsurance}
            onChange={(e) => setAnnualInsurance(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Monthly HOA / Condo Dues ($)
          </label>
          <input
            type="number"
            min={0}
            step={25}
            value={monthlyHoa}
            onChange={(e) => setMonthlyHoa(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-emerald-500" />
            DSCR Underwriting &amp; Cash Flow Assessment
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Underwriting"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border-2 border-emerald-500/40 space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase font-sans">
              DSCR Coverage Ratio
            </span>
            <p className="text-3xl font-extrabold text-foreground">{dscrRatio}x</p>
            <span className="text-[10px] text-muted-foreground font-sans">
              {parseFloat(dscrRatio) >= 1.25 ? "Exceeds 1.25x prime threshold" : "Under 1.25x threshold"}
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Total Monthly PITIA
            </span>
            <p className="text-2xl font-bold text-foreground">${monthlyPitia.toLocaleString()}/mo</p>
            <span className="text-[10px] text-muted-foreground font-sans">
              PI (${monthlyPi}) + Tax/Ins (${Math.round(annualTaxes/12 + annualInsurance/12)})
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Net Monthly Cash Flow
            </span>
            <p className={`text-2xl font-bold ${netMonthlyCashFlow >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {netMonthlyCashFlow >= 0 ? `+$${netMonthlyCashFlow.toLocaleString()}/mo` : `-$${Math.abs(netMonthlyCashFlow).toLocaleString()}/mo`}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Rental income minus debt</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Max Loan @ 1.25x DSCR
            </span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${maxLoanAtTargetDscr.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Maximum leverage allowed</span>
          </div>
        </div>

        <div className="p-3.5 bg-card rounded-xl border border-border text-xs text-muted-foreground">
          <strong className="text-foreground">Underwriting Status: </strong>
          {qualificationStatus}
        </div>
      </div>
    </div>
  );
}
