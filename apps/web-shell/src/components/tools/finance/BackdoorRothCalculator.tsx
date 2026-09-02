"use client";

import { useState, useMemo } from "react";
import { ShieldCheck, DollarSign, AlertTriangle, TrendingUp, Copy, Check, Sparkles, HelpCircle } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function BackdoorRothCalculator() {
  const [conversionAmount, setConversionAmount] = useState<number>(7000); // 2024/2026 IRA limit
  const [existingPreTaxIra, setExistingPreTaxIra] = useState<number>(0); // Traditional, SEP, SIMPLE IRA balance
  const [taxBracket, setTaxBracket] = useState<number>(32);
  const [copied, setCopied] = useState<boolean>(false);

  const { taxFreeRatioPct, taxableAmount, taxFreeAmount, estimatedTaxBill, isCleanConversion } = useMemo(() => {
    const totalIraPool = existingPreTaxIra + conversionAmount;

    if (totalIraPool <= 0) {
      return { taxFreeRatioPct: 100, taxableAmount: 0, taxFreeAmount: 0, estimatedTaxBill: 0, isCleanConversion: true };
    }

    // Tax-free ratio based on after-tax basis (the non-deductible contribution)
    const ratio = conversionAmount / totalIraPool;
    const taxFree = conversionAmount * ratio;
    const taxable = conversionAmount - taxFree;
    const taxBill = taxable * (taxBracket / 100);

    return {
      taxFreeRatioPct: (ratio * 100).toFixed(1),
      taxableAmount: Math.round(taxable),
      taxFreeAmount: Math.round(taxFree),
      estimatedTaxBill: Math.round(taxBill),
      isCleanConversion: existingPreTaxIra === 0,
    };
  }, [conversionAmount, existingPreTaxIra, taxBracket]);

  const handleCopy = async () => {
    const summary = `Backdoor Roth IRA Pro-Rata Analysis ($${conversionAmount.toLocaleString()} Conversion):\n• Existing Pre-Tax Traditional IRA: $${existingPreTaxIra.toLocaleString()}\n• Tax-Free Portion: ${taxFreeRatioPct}% ($${taxFreeAmount.toLocaleString()})\n• Taxable Portion (Form 8606): $${taxableAmount.toLocaleString()}\n• Estimated Tax Owed: $${estimatedTaxBill.toLocaleString()} (at ${taxBracket}% bracket)\n• Status: ${isCleanConversion ? "Clean 100% Tax-Free Backdoor Conversion" : "Subject to IRS Pro-Rata Tax"}`;
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
            Annual Non-Deductible Deposit ($)
          </label>
          <input
            type="number"
            min={1000}
            step={500}
            value={conversionAmount}
            onChange={(e) => setConversionAmount(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Standard 2024/2026 limit: $7,000</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Existing Pre-Tax IRA Balance ($)
          </label>
          <input
            type="number"
            min={0}
            step={5000}
            value={existingPreTaxIra}
            onChange={(e) => setExistingPreTaxIra(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Total in Trad, SEP, or SIMPLE IRAs</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Current Tax Bracket (%)
          </label>
          <select
            value={taxBracket}
            onChange={(e) => setTaxBracket(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={24}>24% Federal Bracket</option>
            <option value={32}>32% Federal Bracket (High Earner)</option>
            <option value={35}>35% Federal Bracket</option>
            <option value={37}>37% Top Federal Bracket</option>
          </select>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            IRS Form 8606 Pro-Rata Conversion Analysis
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Report"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Tax-Free Ratio</span>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{taxFreeRatioPct}%</p>
            <span className="text-[10px] text-muted-foreground font-sans">Portion non-taxable</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Tax-Free Amount</span>
            <p className="text-2xl font-bold text-foreground">${taxFreeAmount.toLocaleString()}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Converts with $0 tax</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Taxable Portion</span>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">${taxableAmount.toLocaleString()}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Subject to ordinary income tax</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Estimated Tax Due</span>
            <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
              ${estimatedTaxBill.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">At {taxBracket}% marginal bracket</span>
          </div>
        </div>

        {/* Pro-Rata Strategy Advisory */}
        <div
          className={`p-4 rounded-xl border text-xs space-y-1 ${
            isCleanConversion
              ? "bg-emerald-500/10 border-emerald-500/30 text-foreground"
              : "bg-amber-500/10 border-amber-500/30 text-foreground"
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold">
            {isCleanConversion ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            )}
            <span>
              {isCleanConversion
                ? "Perfect Clean Backdoor Conversion: $0 Tax Bill"
                : "Pro-Rata Rule Warning: Pre-Tax IRA Balance Detected"}
            </span>
          </div>
          <p className="text-muted-foreground">
            {isCleanConversion
              ? "Because your existing pre-tax IRA balance is $0, 100% of your non-deductible contribution converts into your Roth IRA completely tax-free."
              : `To eliminate the $${estimatedTaxBill.toLocaleString()} tax bill, check if your current employer's 401(k) allows a 'reverse rollover'. Rolling your $${existingPreTaxIra.toLocaleString()} pre-tax IRA into your employer 401(k) leaves your IRA balance at $0 as of December 31st, making future backdoor Roth conversions 100% tax-free.`}
          </p>
        </div>
      </div>
    </div>
  );
}
