"use client";

import { useState } from "react";
import { CreditCard, DollarSign, Calendar, Copy, Check, AlertTriangle, TrendingDown } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function CreditCardPayoffCalculator() {
  const [balance, setBalance] = useState<number>(6500);
  const [apr, setApr] = useState<number>(24.99); // 24.99% average credit card APR
  const [calcMode, setCalcMode] = useState<"fixedPayment" | "targetMonths">("fixedPayment");
  const [monthlyPayment, setMonthlyPayment] = useState<number>(250);
  const [targetMonths, setTargetMonths] = useState<number>(24);
  const [copied, setCopied] = useState<boolean>(false);

  const monthlyRate = apr / 100 / 12;

  // Mode A: Fixed Payment -> Calculate Months
  let calculatedMonths = 0;
  let totalInterest = 0;
  let isPaymentTooLow = false;

  if (calcMode === "fixedPayment") {
    const minInterestFirstMonth = balance * monthlyRate;
    if (monthlyPayment <= minInterestFirstMonth) {
      isPaymentTooLow = true;
    } else {
      let rem = balance;
      let m = 0;
      while (rem > 0 && m < 600) {
        m++;
        const interestCharge = rem * monthlyRate;
        totalInterest += interestCharge;
        rem = rem + interestCharge - monthlyPayment;
      }
      calculatedMonths = m;
    }
  } else {
    // Mode B: Target Months -> Calculate Required Payment
    // P = r * PV / (1 - (1+r)^-n)
    if (monthlyRate > 0 && targetMonths > 0) {
      const p = (monthlyRate * balance) / (1 - Math.pow(1 + monthlyRate, -targetMonths));
      const reqPayment = p;
      calculatedMonths = targetMonths;
      totalInterest = reqPayment * targetMonths - balance;
    }
  }

  // Minimum Payment comparison (e.g. 3% of balance or $25)
  const minPaymentFirstMonth = Math.max(25, balance * 0.03);

  const handleCopy = async () => {
    const summary = `Credit Card Debt Payoff Plan\n• Balance: $${balance.toLocaleString()} @ ${apr}% APR\n• Monthly Payment: $${calcMode === "fixedPayment" ? monthlyPayment.toFixed(2) : ((totalInterest + balance) / targetMonths).toFixed(2)}/mo\n• Payoff Time: ${calculatedMonths} Months (${(calculatedMonths / 12).toFixed(1)} Years)\n• Total Interest Paid: $${totalInterest.toFixed(2)}\n• Total Amount Paid: $${(balance + totalInterest).toFixed(2)}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex p-1 bg-muted/50 rounded-xl border border-border">
        <button
          type="button"
          onClick={() => setCalcMode("fixedPayment")}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors ${
            calcMode === "fixedPayment" ? "bg-card text-foreground shadow-xs border border-border" : "text-muted-foreground"
          }`}
        >
          Pay a Fixed Monthly Amount ($)
        </button>
        <button
          type="button"
          onClick={() => setCalcMode("targetMonths")}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors ${
            calcMode === "targetMonths" ? "bg-card text-foreground shadow-xs border border-border" : "text-muted-foreground"
          }`}
        >
          Pay Off Within Target Months
        </button>
      </div>

      {/* Input Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card Balance */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Current Card Balance ($)
          </label>
          <input
            type="number"
            min={1}
            value={balance}
            onChange={(e) => setBalance(Math.max(1, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">Total credit card debt</span>
        </div>

        {/* APR */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Interest Rate (% APR)
          </label>
          <input
            type="number"
            min={0}
            step="0.1"
            value={apr}
            onChange={(e) => setApr(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg font-bold"
          />
          <span className="text-[11px] text-muted-foreground">National average ~21%–28% APR</span>
        </div>

        {/* Dynamic Mode Input */}
        {calcMode === "fixedPayment" ? (
          <div className="p-4 bg-card border border-border rounded-xl space-y-2">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
              Monthly Payment ($/mo)
            </label>
            <input
              type="number"
              min={1}
              value={monthlyPayment}
              onChange={(e) => setMonthlyPayment(Math.max(1, parseFloat(e.target.value) || 0))}
              className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
            />
            <span className="text-[11px] text-muted-foreground">Min monthly interest: ${(balance * monthlyRate).toFixed(2)}</span>
          </div>
        ) : (
          <div className="p-4 bg-card border border-border rounded-xl space-y-2">
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
              Target Payoff (Months)
            </label>
            <input
              type="number"
              min={1}
              max={120}
              value={targetMonths}
              onChange={(e) => setTargetMonths(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
            />
            <span className="text-[11px] text-muted-foreground">{targetMonths} months ({(targetMonths / 12).toFixed(1)} years)</span>
          </div>
        )}
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-emerald-500" />
            Debt Payoff Strategy &amp; Timeline
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Payoff Plan"}</span>
          </button>
        </div>

        {isPaymentTooLow ? (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Monthly Payment is Lower Than Monthly Interest!</p>
              <p className="mt-1">
                At {apr}% APR, your balance accumulates ${(balance * monthlyRate).toFixed(2)} in interest every month. Your payment of ${monthlyPayment.toFixed(2)} will never pay off the principal. Increase your monthly payment to at least ${((balance * monthlyRate) + 20).toFixed(2)}.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-card rounded-xl border border-border space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Time to Debt-Free</span>
              <p className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                {calculatedMonths} <span className="text-xs font-normal text-muted-foreground">Months</span>
              </p>
              <span className="text-[10px] text-muted-foreground">~{(calculatedMonths / 12).toFixed(1)} Years</span>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">
                {calcMode === "fixedPayment" ? "Monthly Payment" : "Required Payment"}
              </span>
              <p className="text-2xl font-bold font-mono text-foreground">
                ${calcMode === "fixedPayment" ? monthlyPayment.toFixed(2) : ((balance + totalInterest) / targetMonths).toFixed(2)}<span className="text-xs font-normal text-muted-foreground">/mo</span>
              </p>
              <span className="text-[10px] text-muted-foreground">Fixed monthly commitment</span>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Total Interest Paid</span>
              <p className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
                ${totalInterest.toFixed(0)}
              </p>
              <span className="text-[10px] text-muted-foreground">Extra cost to credit card bank</span>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Total Payoff Cost</span>
              <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
                ${(balance + totalInterest).toFixed(0)}
              </p>
              <span className="text-[10px] text-muted-foreground">Original principal + interest</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
