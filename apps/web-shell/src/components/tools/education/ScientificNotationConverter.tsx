"use client";

import { useState, useMemo } from "react";
import { Binary, Copy, Check, Sparkles, RefreshCw, Calculator } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SI_PREFIXES = [
  { exp: 12, name: "Tera (T)", factor: 1e12 },
  { exp: 9, name: "Giga (G)", factor: 1e9 },
  { exp: 6, name: "Mega (M)", factor: 1e6 },
  { exp: 3, name: "Kilo (k)", factor: 1e3 },
  { exp: 0, name: "Base (1)", factor: 1 },
  { exp: -3, name: "Milli (m)", factor: 1e-3 },
  { exp: -6, name: "Micro (µ)", factor: 1e-6 },
  { exp: -9, name: "Nano (n)", factor: 1e-9 },
  { exp: -12, name: "Pico (p)", factor: 1e-12 },
];

export function ScientificNotationConverter() {
  const [inputVal, setInputVal] = useState<string>("6.022e23");
  const [copied, setCopied] = useState<boolean>(false);

  const { standardDecimal, scientificNotation, engineeringNotation, significantDigits, nearestSi } = useMemo(() => {
    try {
      const num = parseFloat(inputVal);
      if (isNaN(num)) {
        return {
          standardDecimal: "Invalid Number",
          scientificNotation: "-",
          engineeringNotation: "-",
          significantDigits: 0,
          nearestSi: "-",
        };
      }

      // Scientific notation (e.g. 6.022 × 10^23)
      const sciStr = num.toExponential();
      const [coeff, expStr] = sciStr.split("e");
      const exp = parseInt(expStr);
      const sciFormatted = `${parseFloat(coeff).toFixed(4)} × 10^${exp}`;

      // Engineering notation (exponent multiple of 3)
      const engExp = Math.floor(exp / 3) * 3;
      const engCoeff = num / Math.pow(10, engExp);
      const engFormatted = `${engCoeff.toFixed(3)} × 10^${engExp}`;

      // SI Prefix match
      const matchedSi = SI_PREFIXES.find((p) => Math.abs(p.exp - engExp) <= 1) || SI_PREFIXES[4];
      const siFormatted = `${(num / matchedSi.factor).toFixed(3)} ${matchedSi.name}`;

      return {
        standardDecimal: num.toLocaleString(undefined, { maximumFractionDigits: 10 }),
        scientificNotation: sciFormatted,
        engineeringNotation: engFormatted,
        significantDigits: coeff.replace(".", "").replace(/^-/, "").length,
        nearestSi: siFormatted,
      };
    } catch {
      return {
        standardDecimal: "Error",
        scientificNotation: "-",
        engineeringNotation: "-",
        significantDigits: 0,
        nearestSi: "-",
      };
    }
  }, [inputVal]);

  const handleCopy = async () => {
    const summary = `Scientific Notation Conversion:\n• Input: ${inputVal}\n• Scientific: ${scientificNotation}\n• Engineering: ${engineeringNotation}\n• Decimal: ${standardDecimal}\n• SI Metric: ${nearestSi}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Field */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Enter Number, Exponential or Scientific String
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="e.g. 6.022e23, 0.000045, 300000000"
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
        <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground pt-1">
          <span>Presets:</span>
          <button onClick={() => setInputVal("6.022e23")} className="hover:underline text-blue-600">Avogadro (6.022e23)</button>
          <span>•</span>
          <button onClick={() => setInputVal("299792458")} className="hover:underline text-blue-600">Speed of Light (3e8)</button>
          <span>•</span>
          <button onClick={() => setInputVal("0.0000000000000000001602")} className="hover:underline text-blue-600">Electron Charge (1.6e-19)</button>
        </div>
      </div>

      {/* Conversion Cards */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-emerald-500" />
            Notation Breakdown &amp; Representations
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Report"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Scientific Notation (a × 10^b)
            </span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 truncate">
              {scientificNotation}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Normalized standard</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Engineering Notation (10^(3k))
            </span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 truncate">
              {engineeringNotation}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Exponent is multiple of 3</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Standard Decimal Format
            </span>
            <p className="text-xl font-bold text-foreground truncate">{standardDecimal}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Standard numeral</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              SI Metric Engineering Prefix
            </span>
            <p className="text-xl font-bold text-foreground truncate">{nearestSi}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Metric unit symbol</span>
          </div>
        </div>
      </div>
    </div>
  );
}
