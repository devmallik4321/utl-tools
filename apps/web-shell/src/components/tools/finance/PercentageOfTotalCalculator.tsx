"use client";

import { useState } from "react";
import { PieChart, Plus, Trash2, Copy, Check, Sparkles } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface ItemRow {
  id: string;
  label: string;
  value: number;
  color: string;
}

const DEFAULT_ROWS: ItemRow[] = [
  { id: "1", label: "Housing / Rent", value: 2200, color: "bg-blue-500" },
  { id: "2", label: "Groceries & Food", value: 850, color: "bg-emerald-500" },
  { id: "3", label: "Investments & Savings", value: 1400, color: "bg-purple-500" },
  { id: "4", label: "Transportation", value: 450, color: "bg-amber-500" },
  { id: "5", label: "Entertainment & Misc", value: 350, color: "bg-rose-500" },
];

const COLORS = ["bg-blue-500", "bg-emerald-500", "bg-purple-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500", "bg-indigo-500", "bg-teal-500"];

export function PercentageOfTotalCalculator() {
  const [rows, setRows] = useState<ItemRow[]>(DEFAULT_ROWS);
  const [copied, setCopied] = useState<boolean>(false);

  const totalSum = rows.reduce((sum, r) => sum + (r.value || 0), 0);

  const handleAddRow = () => {
    const newId = Date.now().toString();
    const color = COLORS[rows.length % COLORS.length];
    setRows([...rows, { id: newId, label: `Category ${rows.length + 1}`, value: 100, color }]);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((r) => r.id !== id));
  };

  const handleUpdate = (id: string, field: "label" | "value", val: any) => {
    setRows(
      rows.map((r) => {
        if (r.id === id) {
          return { ...r, [field]: field === "value" ? Math.max(0, parseFloat(val) || 0) : val };
        }
        return r;
      })
    );
  };

  const handleCopy = async () => {
    const lines = rows.map((r) => {
      const pct = totalSum > 0 ? ((r.value / totalSum) * 100).toFixed(1) : "0.0";
      return `• ${r.label}: $${r.value.toLocaleString()} (${pct}%)`;
    });
    const summary = `Percentage of Total Breakdown\nGrand Total: $${totalSum.toLocaleString()}\n\n${lines.join("\n")}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Visual Proportional Bar */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Visual Share of Total (100%)
          </span>
          <span className="text-xs font-mono font-bold text-foreground">
            Total: ${totalSum.toLocaleString()}
          </span>
        </div>

        <div className="w-full h-5 bg-muted rounded-full overflow-hidden flex">
          {rows.map((r) => {
            const pct = totalSum > 0 ? (r.value / totalSum) * 100 : 0;
            if (pct <= 0) return null;
            return (
              <div
                key={r.id}
                style={{ width: `${pct}%` }}
                className={`${r.color} h-full transition-all`}
                title={`${r.label}: ${pct.toFixed(1)}%`}
              />
            );
          })}
        </div>
      </div>

      {/* Row Items Table */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-blue-500" />
            Itemized Categories &amp; Percentage Share
          </h4>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddRow}
              className="px-3 py-1.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold rounded-lg hover:opacity-90 inline-flex items-center gap-1 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Row</span>
            </button>

            <button
              onClick={handleCopy}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Breakdown</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {rows.map((r) => {
            const pct = totalSum > 0 ? ((r.value / totalSum) * 100).toFixed(1) : "0.0";
            return (
              <div
                key={r.id}
                className="p-3 bg-card rounded-xl border border-border flex flex-wrap sm:flex-nowrap items-center gap-3 shadow-2xs"
              >
                <div className={`w-3 h-3 rounded-full ${r.color} shrink-0`} />

                <input
                  type="text"
                  value={r.label}
                  onChange={(e) => handleUpdate(r.id, "label", e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs font-semibold bg-background border border-border rounded-lg text-foreground min-w-[140px]"
                />

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs text-muted-foreground">$</span>
                  <input
                    type="number"
                    min={0}
                    value={r.value}
                    onChange={(e) => handleUpdate(r.id, "value", e.target.value)}
                    className="w-28 px-2.5 py-1.5 text-xs font-mono font-bold bg-background border border-border rounded-lg text-foreground"
                  />
                </div>

                <div className="w-20 text-right font-mono font-extrabold text-sm text-blue-600 dark:text-blue-400 shrink-0">
                  {pct}%
                </div>

                <button
                  onClick={() => handleRemoveRow(r.id)}
                  disabled={rows.length <= 1}
                  className="text-muted-foreground hover:text-rose-500 disabled:opacity-30 p-1 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
