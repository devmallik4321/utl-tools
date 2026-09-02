"use client";

import { useState, useMemo } from "react";
import { DollarSign, ShieldAlert, TrendingDown, Copy, Check, Sparkles, Plus, Trash2, Zap } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface DebtItem {
  id: string;
  name: string;
  balance: number;
  rate: number;
  minPayment: number;
}

const DEFAULT_DEBTS: DebtItem[] = [
  { id: "1", name: "Credit Card A", balance: 2500, rate: 24.99, minPayment: 75 },
  { id: "2", name: "Medical Bill", balance: 900, rate: 0.0, minPayment: 50 },
  { id: "3", name: "Auto Loan", balance: 6500, rate: 6.5, minPayment: 180 },
  { id: "4", name: "Credit Card B", balance: 4200, rate: 19.5, minPayment: 110 },
];

export function DebtPayoffCalculator() {
  const [debts, setDebts] = useState<DebtItem[]>(DEFAULT_DEBTS);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(650);
  const [copied, setCopied] = useState<boolean>(false);

  const totalMinPayment = useMemo(() => {
    return debts.reduce((sum, d) => sum + d.minPayment, 0);
  }, [debts]);

  const { avalancheMonths, avalancheInterest, snowballMonths, snowballInterest, interestSaved } = useMemo(() => {
    const budget = Math.max(monthlyBudget, totalMinPayment);

    // Simulate Payoff
    const simulate = (strategy: "avalanche" | "snowball") => {
      let activeDebts = debts.map((d) => ({ ...d }));
      let totalMonths = 0;
      let totalInterest = 0;

      while (activeDebts.some((d) => d.balance > 0) && totalMonths < 360) {
        totalMonths++;

        // Add monthly interest
        for (const d of activeDebts) {
          if (d.balance > 0) {
            const monthlyRate = d.rate / 100 / 12;
            const interest = d.balance * monthlyRate;
            totalInterest += interest;
            d.balance += interest;
          }
        }

        // Pay minimums
        let availableExtra = budget;
        for (const d of activeDebts) {
          if (d.balance > 0) {
            const pay = Math.min(d.balance, d.minPayment);
            d.balance -= pay;
            availableExtra -= pay;
          }
        }

        // Sort for rollover extra payment
        if (strategy === "avalanche") {
          activeDebts.sort((a, b) => b.rate - a.rate); // Highest interest first
        } else {
          activeDebts.sort((a, b) => a.balance - b.balance); // Lowest balance first
        }

        // Apply extra payment
        for (const d of activeDebts) {
          if (d.balance > 0 && availableExtra > 0) {
            const extra = Math.min(d.balance, availableExtra);
            d.balance -= extra;
            availableExtra -= extra;
          }
        }
      }

      return { months: totalMonths, interest: totalInterest };
    };

    const av = simulate("avalanche");
    const sb = simulate("snowball");

    return {
      avalancheMonths: av.months,
      avalancheInterest: av.interest,
      snowballMonths: sb.months,
      snowballInterest: sb.interest,
      interestSaved: Math.max(0, sb.interest - av.interest),
    };
  }, [debts, monthlyBudget, totalMinPayment]);

  const addDebt = () => {
    const newId = (debts.length + 1).toString();
    setDebts([...debts, { id: newId, name: `Debt ${newId}`, balance: 1000, rate: 15.0, minPayment: 40 }]);
  };

  const removeDebt = (id: string) => {
    setDebts(debts.filter((d) => d.id !== id));
  };

  const updateDebt = (id: string, field: keyof DebtItem, val: any) => {
    setDebts(debts.map((d) => (d.id === id ? { ...d, [field]: val } : d)));
  };

  const handleCopy = async () => {
    const summary = `Debt Payoff Strategy Comparison ($${monthlyBudget}/mo Budget)\n• Debt Avalanche (Highest APR First): ${avalancheMonths} Months | $${avalancheInterest.toFixed(0)} Interest\n• Debt Snowball (Lowest Balance First): ${snowballMonths} Months | $${snowballInterest.toFixed(0)} Interest\n• Avalanche Math Advantage: Saves $${interestSaved.toFixed(0)} in pure interest`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Monthly Budget Input */}
      <div className="p-4 bg-card border border-border rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Total Monthly Debt Budget ($)
          </label>
          <span className="text-[11px] text-muted-foreground">
            Combined minimums required: ${totalMinPayment.toFixed(0)}/mo
          </span>
        </div>
        <input
          type="number"
          min={totalMinPayment}
          value={monthlyBudget}
          onChange={(e) => setMonthlyBudget(Math.max(totalMinPayment, parseFloat(e.target.value) || 0))}
          className="w-full sm:w-48 px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* Debts Table */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Your Debts &amp; Loans</h4>
          <button
            onClick={addDebt}
            className="px-2.5 py-1 text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg inline-flex items-center gap-1 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Debt
          </button>
        </div>

        <div className="space-y-2">
          {debts.map((d) => (
            <div key={d.id} className="grid grid-cols-12 gap-2 items-center text-xs">
              <input
                type="text"
                value={d.name}
                onChange={(e) => updateDebt(d.id, "name", e.target.value)}
                className="col-span-4 px-2 py-1.5 font-medium bg-background border border-border rounded-lg"
              />
              <div className="col-span-3 relative">
                <input
                  type="number"
                  min={0}
                  value={d.balance}
                  onChange={(e) => updateDebt(d.id, "balance", Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="Balance"
                  className="w-full px-2 py-1.5 font-mono font-bold bg-background border border-border rounded-lg"
                />
              </div>
              <div className="col-span-2 relative">
                <input
                  type="number"
                  min={0}
                  step="0.1"
                  value={d.rate}
                  onChange={(e) => updateDebt(d.id, "rate", Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="APR %"
                  className="w-full px-2 py-1.5 font-mono bg-background border border-border rounded-lg text-rose-600 dark:text-rose-400"
                />
              </div>
              <div className="col-span-2 relative">
                <input
                  type="number"
                  min={0}
                  value={d.minPayment}
                  onChange={(e) => updateDebt(d.id, "minPayment", Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="Min Pay"
                  className="w-full px-2 py-1.5 font-mono bg-background border border-border rounded-lg"
                />
              </div>
              <button
                onClick={() => removeDebt(d.id)}
                className="col-span-1 p-1 text-muted-foreground hover:text-rose-600 flex justify-center"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-emerald-500" />
            Debt Avalanche vs Snowball Side-by-Side Comparison
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Report"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Avalanche */}
          <div className="p-4 bg-card rounded-xl border-2 border-emerald-500/30 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">
                Debt Avalanche (Highest APR First)
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded font-bold">
                Mathematically Optimal
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-sans">Debt-Free In</span>
                <p className="text-2xl font-extrabold text-foreground">{avalancheMonths} Months</p>
                <span className="text-[10px] text-muted-foreground font-sans">
                  ~{(avalancheMonths / 12).toFixed(1)} years
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-sans">Total Interest</span>
                <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  ${avalancheInterest.toFixed(0)}
                </p>
                <span className="text-[10px] text-muted-foreground font-sans">Lowest total cost</span>
              </div>
            </div>
          </div>

          {/* Snowball */}
          <div className="p-4 bg-card rounded-xl border border-border space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400">
                Debt Snowball (Lowest Balance First)
              </span>
              <span className="text-[10px] bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded font-bold">
                Psychological Wins
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-sans">Debt-Free In</span>
                <p className="text-2xl font-extrabold text-foreground">{snowballMonths} Months</p>
                <span className="text-[10px] text-muted-foreground font-sans">
                  ~{(snowballMonths / 12).toFixed(1)} years
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-sans">Total Interest</span>
                <p className="text-2xl font-extrabold text-foreground">${snowballInterest.toFixed(0)}</p>
                <span className="text-[10px] text-muted-foreground font-sans">Small extra interest cost</span>
              </div>
            </div>
          </div>
        </div>

        {/* Savings Takeaway */}
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
          <strong>Key Takeaway:</strong> The Avalanche method saves you{" "}
          <strong className="font-mono font-bold">${interestSaved.toFixed(0)}</strong> in interest fees. However, if you
          benefit from early psychological victories to stay motivated, the Snowball method knocks out small balances
          first with only a minor interest premium.
        </div>
      </div>
    </div>
  );
}
