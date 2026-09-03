"use client";

import { useState, useMemo } from "react";
import { Building, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, Receipt } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function TripleNetLeaseCalculator() {
  const [squareFootage, setSquareFootage] = useState<number>(3200);
  const [baseRentPerSqft, setBaseRentPerSqft] = useState<number>(26.0); // $/sqft/yr
  const [propertyTaxesPerSqft, setPropertyTaxesPerSqft] = useState<number>(4.25); // $/sqft/yr
  const [insurancePerSqft, setInsurancePerSqft] = useState<number>(1.35); // $/sqft/yr
  const [camPerSqft, setCamPerSqft] = useState<number>(3.9); // Common area maintenance $/sqft/yr
  const [copied, setCopied] = useState<boolean>(false);

  const {
    totalNnnPerSqft,
    grossRatePerSqft,
    monthlyBaseRent,
    monthlyNnnExpenses,
    totalMonthlyPayment,
    totalAnnualOutflow,
    nnnPercentageOfTotal,
  } = useMemo(() => {
    const nnnRate = propertyTaxesPerSqft + insurancePerSqft + camPerSqft;
    const grossRate = baseRentPerSqft + nnnRate;

    const annualBase = squareFootage * baseRentPerSqft;
    const annualNnn = squareFootage * nnnRate;
    const annualTotal = annualBase + annualNnn;

    const mBase = annualBase / 12;
    const mNnn = annualNnn / 12;
    const mTotal = annualTotal / 12;

    const nnnPct = grossRate > 0 ? (nnnRate / grossRate) * 100 : 0;

    return {
      totalNnnPerSqft: nnnRate.toFixed(2),
      grossRatePerSqft: grossRate.toFixed(2),
      monthlyBaseRent: Math.round(mBase),
      monthlyNnnExpenses: Math.round(mNnn),
      totalMonthlyPayment: Math.round(mTotal),
      totalAnnualOutflow: Math.round(annualTotal),
      nnnPercentageOfTotal: nnnPct.toFixed(1),
    };
  }, [squareFootage, baseRentPerSqft, propertyTaxesPerSqft, insurancePerSqft, camPerSqft]);

  const handleCopy = async () => {
    const summary = `Commercial Triple Net (NNN) Lease Analysis (${squareFootage.toLocaleString()} sqft @ $${baseRentPerSqft}/sqft Base):\n• Total Monthly Rent + NNN: $${totalMonthlyPayment.toLocaleString()}/mo ($${totalAnnualOutflow.toLocaleString()}/year)\n• Monthly Base Rent: $${monthlyBaseRent.toLocaleString()}/mo ($${baseRentPerSqft}/sqft/yr)\n• Monthly NNN Pass-Through: $${monthlyNnnExpenses.toLocaleString()}/mo ($${totalNnnPerSqft}/sqft/yr)\n• Breakdown:\n  - Property Taxes: $${(propertyTaxesPerSqft * squareFootage / 12).toFixed(0)}/mo\n  - Property Insurance: $${(insurancePerSqft * squareFootage / 12).toFixed(0)}/mo\n  - CAM Maintenance: $${(camPerSqft * squareFootage / 12).toFixed(0)}/mo\n• All-In Gross Equivalent: $${grossRatePerSqft}/sqft/year`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Rented Space (Square Feet)
          </label>
          <input
            type="number"
            min={100}
            step={100}
            value={squareFootage}
            onChange={(e) => setSquareFootage(Math.max(10, parseInt(e.target.value) || 10))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Base Rent ($/sqft/year)
          </label>
          <input
            type="number"
            min={1}
            step={0.5}
            value={baseRentPerSqft}
            onChange={(e) => setBaseRentPerSqft(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Common Area Maint CAM ($/sqft/yr)
          </label>
          <input
            type="number"
            min={0}
            step={0.25}
            value={camPerSqft}
            onChange={(e) => setCamPerSqft(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* Second Row Taxes & Insurance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Property Taxes ($/sqft/year)
          </label>
          <input
            type="number"
            min={0}
            step={0.25}
            value={propertyTaxesPerSqft}
            onChange={(e) => setPropertyTaxesPerSqft(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Building Insurance ($/sqft/year)
          </label>
          <input
            type="number"
            min={0}
            step={0.25}
            value={insurancePerSqft}
            onChange={(e) => setInsurancePerSqft(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Building className="w-4 h-4 text-emerald-500" />
            Total Monthly Lease Obligation &amp; NNN Breakdown
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Lease Sheet"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border-2 border-emerald-500/40 space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase font-sans">
              Total Monthly Payment
            </span>
            <p className="text-3xl font-extrabold text-foreground">${totalMonthlyPayment.toLocaleString()}/mo</p>
            <span className="text-[10px] text-muted-foreground font-sans">Base + All NNN pass-throughs</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Base Rent Portion
            </span>
            <p className="text-2xl font-bold text-foreground">${monthlyBaseRent.toLocaleString()}/mo</p>
            <span className="text-[10px] text-muted-foreground font-sans">Guaranteed base rent</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              NNN Monthly Extra
            </span>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              ${monthlyNnnExpenses.toLocaleString()}/mo
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">
              {nnnPercentageOfTotal}% of total lease bill
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Gross Rate Equiv
            </span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${grossRatePerSqft}/sqft</p>
            <span className="text-[10px] text-muted-foreground font-sans">All-in annual cost per sqft</span>
          </div>
        </div>
      </div>
    </div>
  );
}
