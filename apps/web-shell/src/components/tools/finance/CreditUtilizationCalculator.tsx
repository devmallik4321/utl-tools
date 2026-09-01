"use client";

import { useState, useMemo } from "react";
import { CreditCard, DollarSign, TrendingDown, Copy, Check, Sparkles, Plus, Trash2 } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface CardEntry {
  id: string;
  name: string;
  balance: number;
  limit: number;
}

const DEFAULT_CARDS: CardEntry[] = [
  { id: "1", name: "Primary Rewards Card", balance: 2400, limit: 8000 },
  { id: "2", name: "Cash Back Card", balance: 1100, limit: 5000 },
  { id: "3", name: "Travel Card", balance: 450, limit: 10000 },
];

export function CreditUtilizationCalculator() {
  const [cards, setCards] = useState<CardEntry[]>(DEFAULT_CARDS);
  const [copied, setCopied] = useState<boolean>(false);

  const { totalBalance, totalLimit, overallRatio, target30Diff, target10Diff } = useMemo(() => {
    const totalBal = cards.reduce((sum, c) => sum + (c.balance || 0), 0);
    const totalLim = cards.reduce((sum, c) => sum + (c.limit || 0), 0);
    const ratio = totalLim > 0 ? (totalBal / totalLim) * 100 : 0;

    const target30Bal = totalLim * 0.3;
    const target10Bal = totalLim * 0.1;

    const diff30 = Math.max(0, totalBal - target30Bal);
    const diff10 = Math.max(0, totalBal - target10Bal);

    return {
      totalBalance: totalBal,
      totalLimit: totalLim,
      overallRatio: ratio,
      target30Diff: diff30,
      target10Diff: diff10,
    };
  }, [cards]);

  const addCard = () => {
    setCards([
      ...cards,
      { id: Date.now().toString(), name: `Credit Card #${cards.length + 1}`, balance: 500, limit: 3000 },
    ]);
  };

  const removeCard = (id: string) => {
    if (cards.length <= 1) return;
    setCards(cards.filter((c) => c.id !== id));
  };

  const updateCard = (id: string, field: keyof CardEntry, val: any) => {
    setCards(cards.map((c) => (c.id === id ? { ...c, [field]: val } : c)));
  };

  const getTier = (r: number) => {
    if (r < 10) return { label: "Optimal (<10%)", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500" };
    if (r < 30) return { label: "Good (10–29%)", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500" };
    if (r < 50) return { label: "Fair (30–49%)", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500" };
    return { label: "High Risk (≥50%)", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500" };
  };

  const tier = getTier(overallRatio);

  const handleCopy = async () => {
    const lines = cards.map(
      (c) =>
        `• ${c.name}: $${c.balance.toLocaleString()} / $${c.limit.toLocaleString()} (${c.limit > 0 ? ((c.balance / c.limit) * 100).toFixed(1) : 0}%)`
    );
    const summary = `Credit Utilization Analysis\n• Overall Utilization: ${overallRatio.toFixed(1)}% (${tier.label})\n• Total Balance: $${totalBalance.toLocaleString()} / Total Limit: $${totalLimit.toLocaleString()}\n• Paydown to <30%: $${target30Diff.toFixed(0)}\n• Paydown to <10% (Optimal): $${target10Diff.toFixed(0)}\n\nCard Breakdown:\n${lines.join("\n")}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards List Inputs */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider">
            Your Credit Cards ({cards.length})
          </span>
          <button
            onClick={addCard}
            className="px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg inline-flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Card</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {cards.map((card) => {
            const cardRatio = card.limit > 0 ? (card.balance / card.limit) * 100 : 0;
            return (
              <div
                key={card.id}
                className="p-3 bg-muted/20 border border-border rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs"
              >
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    value={card.name}
                    onChange={(e) => setCards(cards.map((c) => (c.id === card.id ? { ...c, name: e.target.value } : c)))}
                    placeholder="Card Name"
                    className="w-full px-2.5 py-1.5 font-semibold bg-background border border-border rounded-lg"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="text-[10px] text-muted-foreground block sm:hidden">Balance ($)</label>
                  <input
                    type="number"
                    min={0}
                    value={card.balance}
                    onChange={(e) =>
                      setCards(cards.map((c) => (c.id === card.id ? { ...c, balance: Math.max(0, parseFloat(e.target.value) || 0) } : c)))
                    }
                    placeholder="Balance ($)"
                    className="w-full px-2 py-1.5 font-mono bg-background border border-border rounded-lg"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="text-[10px] text-muted-foreground block sm:hidden">Limit ($)</label>
                  <input
                    type="number"
                    min={1}
                    value={card.limit}
                    onChange={(e) =>
                      setCards(cards.map((c) => (c.id === card.id ? { ...c, limit: Math.max(1, parseFloat(e.target.value) || 1) } : c)))
                    }
                    placeholder="Limit ($)"
                    className="w-full px-2 py-1.5 font-mono bg-background border border-border rounded-lg"
                  />
                </div>

                <div className="sm:col-span-1 text-center font-mono font-bold text-[11px] text-muted-foreground">
                  {cardRatio.toFixed(0)}%
                </div>

                <div className="sm:col-span-1 flex justify-center">
                  <button
                    onClick={() => removeCard(card.id)}
                    disabled={cards.length <= 1}
                    className="text-muted-foreground hover:text-rose-500 disabled:opacity-30 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Utilization Summary */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-emerald-500" />
            Credit Utilization &amp; Score Health Tier
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Report"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Overall Utilization</span>
            <p className={`text-3xl font-extrabold font-mono ${tier.color}`}>
              {overallRatio.toFixed(1)}%
            </p>
            <span className="text-[10px] font-bold block">{tier.label}</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Balances</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              ${totalBalance.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground">Across {cards.length} cards</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Payoff for &lt;30%</span>
            <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              ${target30Diff.toFixed(0)}
            </p>
            <span className="text-[10px] text-muted-foreground">Standard good threshold</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Payoff for &lt;10%</span>
            <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              ${target10Diff.toFixed(0)}
            </p>
            <span className="text-[10px] text-muted-foreground">Optimal 800+ credit score tier</span>
          </div>
        </div>
      </div>
    </div>
  );
}
