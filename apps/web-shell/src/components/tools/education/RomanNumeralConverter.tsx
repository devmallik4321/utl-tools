"use client";

import { useState, useMemo } from "react";
import { Hash, Copy, Check, Sparkles, ArrowRightLeft } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const ROMAN_SYMBOLS: { val: number; sym: string }[] = [
  { val: 1000, sym: "M" },
  { val: 900, sym: "CM" },
  { val: 500, sym: "D" },
  { val: 400, sym: "CD" },
  { val: 100, sym: "C" },
  { val: 90, sym: "XC" },
  { val: 50, sym: "L" },
  { val: 40, sym: "XL" },
  { val: 10, sym: "X" },
  { val: 9, sym: "IX" },
  { val: 5, sym: "V" },
  { val: 4, sym: "IV" },
  { val: 1, sym: "I" },
];

const ROMAN_VALS: Record<string, number> = {
  I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000,
};

export function RomanNumeralConverter() {
  const [input, setInput] = useState<string>("2026");
  const [mode, setMode] = useState<"numToRoman" | "romanToNum">("numToRoman");
  const [copied, setCopied] = useState<boolean>(false);

  const { result, steps } = useMemo(() => {
    if (!input.trim()) return { result: "", steps: [] };

    if (mode === "numToRoman") {
      let num = parseInt(input);
      if (isNaN(num) || num < 1 || num > 3999) {
        return { result: "Please enter a valid integer between 1 and 3,999", steps: [] };
      }

      let roman = "";
      const stepLines: string[] = [];
      let rem = num;

      for (const { val, sym } of ROMAN_SYMBOLS) {
        while (rem >= val) {
          roman += sym;
          rem -= val;
          stepLines.push(`Subtract ${val} (${sym}) ➔ Remainder: ${rem}`);
        }
      }

      return { result: roman, steps: stepLines };
    } else {
      const romanStr = input.toUpperCase().trim();
      let total = 0;
      const stepLines: string[] = [];

      for (let i = 0; i < romanStr.length; i++) {
        const curr = ROMAN_VALS[romanStr[i]] || 0;
        const next = ROMAN_VALS[romanStr[i + 1]] || 0;

        if (curr < next) {
          total += next - curr;
          stepLines.push(`${romanStr[i]}${romanStr[i + 1]} (${next} - ${curr} = ${next - curr})`);
          i++;
        } else {
          total += curr;
          stepLines.push(`${romanStr[i]} (+${curr})`);
        }
      }

      return { result: total.toString(), steps: stepLines };
    }
  }, [input, mode]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(result);
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
          onClick={() => {
            setMode("numToRoman");
            setInput("2026");
          }}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors ${
            mode === "numToRoman" ? "bg-card text-foreground shadow-xs border border-border" : "text-muted-foreground"
          }`}
        >
          Number ➔ Roman Numeral (2026 ➔ MMXXVI)
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("romanToNum");
            setInput("MMXXVI");
          }}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors ${
            mode === "romanToNum" ? "bg-card text-foreground shadow-xs border border-border" : "text-muted-foreground"
          }`}
        >
          Roman Numeral ➔ Number (MMXXVI ➔ 2026)
        </button>
      </div>

      {/* Input / Result Panes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Input */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            {mode === "numToRoman" ? "Enter Number (1–3,999)" : "Enter Roman Numeral"}
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "numToRoman" ? "e.g. 2026" : "e.g. MMXXVI"}
            className="w-full px-3 py-2 text-lg font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        {/* Output */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">
              {mode === "numToRoman" ? "Roman Numeral" : "Integer Value"}
            </span>
            <button
              onClick={handleCopy}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>
          <p className="text-2xl font-extrabold font-mono text-foreground pt-1 truncate">
            {result}
          </p>
        </div>
      </div>

      {/* Roman Reference Matrix */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Hash className="w-4 h-4 text-blue-500" />
          Standard Roman Numeral Key Symbols
        </h4>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-xs font-mono text-center">
          {[
            { sym: "I", val: 1 },
            { sym: "V", val: 5 },
            { sym: "X", val: 10 },
            { sym: "L", val: 50 },
            { sym: "C", val: 100 },
            { sym: "D", val: 500 },
            { sym: "M", val: 1000 },
          ].map((r) => (
            <div key={r.sym} className="p-2 bg-card rounded-lg border border-border space-y-0.5">
              <span className="text-base font-bold text-blue-600 dark:text-blue-400 block">{r.sym}</span>
              <span className="text-[11px] text-muted-foreground block">{r.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
