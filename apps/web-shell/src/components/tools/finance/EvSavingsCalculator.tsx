"use client";

import { useState, useMemo } from "react";
import { Zap, Fuel, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, BatteryCharging } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function EvSavingsCalculator() {
  const [annualMiles, setAnnualMiles] = useState<number>(13500);
  const [gasMpg, setGasMpg] = useState<number>(28);
  const [gasPricePerGallon, setGasPricePerGallon] = useState<number>(3.65);
  const [evEfficiencyMiPerKwh, setEvEfficiencyMiPerKwh] = useState<number>(3.4); // e.g. Tesla Model 3 / Model Y
  const [electricCostPerKwh, setElectricCostPerKwh] = useState<number>(0.16);
  const [annualMaintDiff, setAnnualMaintDiff] = useState<number>(450); // Oil changes, brakes savings
  const [copied, setCopied] = useState<boolean>(false);

  const { gasAnnualCost, evAnnualCost, annualSavings, fiveYearSavings, costPerMileGas, costPerMileEv } = useMemo(() => {
    const gallonsNeeded = gasMpg > 0 ? annualMiles / gasMpg : 0;
    const gasCost = gallonsNeeded * gasPricePerGallon;

    const kwhNeeded = evEfficiencyMiPerKwh > 0 ? annualMiles / evEfficiencyMiPerKwh : 0;
    const evCost = kwhNeeded * electricCostPerKwh;

    const fuelSaved = gasCost - evCost;
    const totalAnnualSaved = fuelSaved + annualMaintDiff;
    const fiveYear = totalAnnualSaved * 5;

    const cpmGas = annualMiles > 0 ? gasCost / annualMiles : 0;
    const cpmEv = annualMiles > 0 ? evCost / annualMiles : 0;

    return {
      gasAnnualCost: Math.round(gasCost),
      evAnnualCost: Math.round(evCost),
      annualSavings: Math.round(totalAnnualSaved),
      fiveYearSavings: Math.round(fiveYear),
      costPerMileGas: (cpmGas * 100).toFixed(1),
      costPerMileEv: (cpmEv * 100).toFixed(1),
    };
  }, [annualMiles, gasMpg, gasPricePerGallon, evEfficiencyMiPerKwh, electricCostPerKwh, annualMaintDiff]);

  const handleCopy = async () => {
    const summary = `Electric Vehicle (EV) Savings Analysis (${annualMiles.toLocaleString()} miles/year):\n• Annual Gas Cost (${gasMpg} MPG @ $${gasPricePerGallon}/gal): $${gasAnnualCost.toLocaleString()}/yr\n• Annual EV Electric Cost (${evEfficiencyMiPerKwh} mi/kWh @ $${electricCostPerKwh}/kWh): $${evAnnualCost.toLocaleString()}/yr\n• Total Annual Savings (Fuel + Maintenance): $${annualSavings.toLocaleString()}/year\n• 5-Year Cumulative Savings: $${fiveYearSavings.toLocaleString()}\n• Cost Per Mile: ${costPerMileGas}¢ (Gas) vs ${costPerMileEv}¢ (EV)`;
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
            Annual Miles Driven
          </label>
          <input
            type="number"
            min={1000}
            step={1000}
            value={annualMiles}
            onChange={(e) => setAnnualMiles(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">US average: ~13,500 mi/yr</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Gas Vehicle (MPG &amp; Price)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="number"
                min={10}
                max={70}
                value={gasMpg}
                onChange={(e) => setGasMpg(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-full px-2 py-1.5 font-mono font-bold bg-background border border-border rounded-lg"
              />
              <span className="text-[10px] text-muted-foreground">MPG</span>
            </div>
            <div>
              <input
                type="number"
                min={1}
                step={0.05}
                value={gasPricePerGallon}
                onChange={(e) => setGasPricePerGallon(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-2 py-1.5 font-mono font-bold bg-background border border-border rounded-lg"
              />
              <span className="text-[10px] text-muted-foreground">$/Gallon</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            EV (Mi/kWh &amp; Electric Rate)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="number"
                min={1}
                max={6}
                step={0.1}
                value={evEfficiencyMiPerKwh}
                onChange={(e) => setEvEfficiencyMiPerKwh(Math.max(0.1, parseFloat(e.target.value) || 1))}
                className="w-full px-2 py-1.5 font-mono font-bold bg-background border border-border rounded-lg"
              />
              <span className="text-[10px] text-muted-foreground">Miles / kWh</span>
            </div>
            <div>
              <input
                type="number"
                min={0.05}
                max={1.0}
                step={0.01}
                value={electricCostPerKwh}
                onChange={(e) => setElectricCostPerKwh(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-2 py-1.5 font-mono font-bold bg-background border border-border rounded-lg"
              />
              <span className="text-[10px] text-muted-foreground">$/kWh</span>
            </div>
          </div>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <BatteryCharging className="w-4 h-4 text-emerald-500" />
            Annual &amp; 5-Year Financial Savings
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
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Annual Savings</span>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              ${annualSavings.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Fuel + routine maintenance</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">5-Year Cumulative</span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ${fiveYearSavings.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Total cash retained in pocket</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Gas Cost Per Year</span>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              ${gasAnnualCost.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">{costPerMileGas}¢ / mile</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">EV Cost Per Year</span>
            <p className="text-2xl font-bold text-foreground">${evAnnualCost.toLocaleString()}</p>
            <span className="text-[10px] text-muted-foreground font-sans">{costPerMileEv}¢ / mile</span>
          </div>
        </div>
      </div>
    </div>
  );
}
