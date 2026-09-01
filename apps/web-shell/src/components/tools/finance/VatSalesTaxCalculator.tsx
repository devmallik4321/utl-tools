"use client";

import { useState } from "react";
import { Receipt, DollarSign, Percent, ArrowUpDown, Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const TAX_PRESETS = [
  { name: "5% (UAE / GCC)", rate: 5 },
  { name: "8.25% (US Avg)", rate: 8.25 },
  { name: "10% (Australia)", rate: 10 },
  { name: "19% (Germany)", rate: 19 },
  { name: "20% (UK / France)", rate: 20 },
  { name: "21% (Netherlands / Spain)", rate: 21 },
];

export function VatSalesTaxCalculator() {
  const [operation, setOperation] = useState<"add" | "remove">("add");
  const [amount, setAmount] = useState<string>("100");
  const [taxRate, setTaxRate] = useState<string>("20");
  const [copied, setCopied] = useState<boolean>(false);

  const numAmount = parseFloat(amount) || 0;
  const numRate = parseFloat(taxRate) || 0;

  let net = 0;
  let tax = 0;
  let gross = 0;

  if (operation === "add") {
    net = numAmount;
    tax = (numAmount * numRate) / 100;
    gross = net + tax;
  } else {
    // Reverse / Remove VAT: Net = Gross / (1 + Rate/100)
    gross = numAmount;
    net = gross / (1 + numRate / 100);
    tax = gross - net;
  }

  const handleCopy = async () => {
    const summary = `VAT / Sales Tax Calculation (${operation === "add" ? "Adding Tax" : "Removing / Reverse Tax"})\n• Tax Rate: ${numRate}%\n• Net Price (Excl. Tax): $${net.toFixed(2)}\n• Tax Amount: $${tax.toFixed(2)}\n• Gross Price (Incl. Tax): $${gross.toFixed(2)}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Operation Switcher */}
      <div className="flex gap-2 p-1 bg-muted/50 rounded-xl border border-border">
        <button
          onClick={() => setOperation("add")}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            operation === "add" ? "bg-card text-foreground shadow-xs border border-border" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Receipt className="w-3.5 h-3.5 text-blue-500" />
          <span>Add Tax / VAT (Net → Gross)</span>
        </button>
        <button
          onClick={() => setOperation("remove")}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            operation === "remove" ? "bg-card text-foreground shadow-xs border border-border" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-emerald-500" />
          <span>Remove / Reverse VAT (Gross → Net)</span>
        </button>
      </div>

      {/* Common Presets */}
      <div className="p-3 bg-muted/20 border border-border rounded-xl space-y-1.5">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
          Standard Country Tax Rates:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {TAX_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => setTaxRate(p.rate.toString())}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                taxRate === p.rate.toString() ? "bg-card font-bold text-foreground border border-border shadow-xs" : "bg-background border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            {operation === "add" ? "Net Amount (Before Tax)" : "Gross Amount (Including Tax)"}
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2.5 text-base font-mono bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. 100"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Tax / VAT Rate (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            className="w-full px-3 py-2.5 text-base font-mono bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. 20"
          />
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            Tax Calculation Breakdown
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Summary"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Net Amount (Excl. Tax)</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              ${net.toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">Pre-tax base price</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">VAT / Tax Amount ({numRate}%)</span>
            <p className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              ${tax.toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">Calculated tax value</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Gross Amount (Total)</span>
            <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              ${gross.toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">Final customer payable</span>
          </div>
        </div>
      </div>
    </div>
  );
}
