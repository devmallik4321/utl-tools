"use client";

import { useState } from "react";
import { Zap, DollarSign, Clock, Copy, Check, Sparkles, Server } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface AppliancePreset {
  name: string;
  watts: number;
  hours: number;
  category: string;
}

const PRESETS: AppliancePreset[] = [
  { name: "Gaming PC (Full Load)", watts: 450, hours: 4, category: "PC / Gaming" },
  { name: "Home Server / NAS (24/7)", watts: 60, hours: 24, category: "PC / Server" },
  { name: "Work Laptop & Monitor", watts: 85, hours: 8, category: "Office" },
  { name: "Central / Split AC Unit", watts: 1500, hours: 8, category: "Appliances" },
  { name: "Refrigerator (Average Duty)", watts: 150, hours: 24, category: "Appliances" },
  { name: "Electric Space Heater", watts: 1500, hours: 5, category: "Appliances" },
  { name: "Standby Devices / Vampire Draw", watts: 25, hours: 24, category: "Standby" },
];

export function ElectricityCostCalculator() {
  const [watts, setWatts] = useState<number>(450);
  const [hoursPerDay, setHoursPerDay] = useState<number>(4);
  const [daysPerMonth, setDaysPerMonth] = useState<number>(30);
  const [kwhRate, setKwhRate] = useState<number>(0.15); // $0.15 per kWh default user-entered rate
  const [copied, setCopied] = useState<boolean>(false);

  // Calculations
  // Daily kWh = (Watts * Hours) / 1000
  const dailyKwh = (watts * hoursPerDay) / 1000;
  const monthlyKwh = dailyKwh * daysPerMonth;
  const annualKwh = dailyKwh * 365;

  const dailyCost = dailyKwh * kwhRate;
  const monthlyCost = monthlyKwh * kwhRate;
  const annualCost = annualKwh * kwhRate;

  const applyPreset = (preset: AppliancePreset) => {
    setWatts(preset.watts);
    setHoursPerDay(preset.hours);
  };

  const handleCopy = async () => {
    const summary = `Electricity Cost Estimate\n• Appliance Power: ${watts} Watts (${hoursPerDay} hrs/day, ${daysPerMonth} days/mo)\n• Electricity Rate: $${kwhRate.toFixed(3)}/kWh\n• Monthly Power Usage: ${monthlyKwh.toFixed(1)} kWh\n• Daily Cost: $${dailyCost.toFixed(2)}\n• Monthly Cost: $${monthlyCost.toFixed(2)}\n• Annual Cost: $${annualCost.toFixed(2)}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Common Device &amp; Appliance Presets:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(p)}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                watts === p.watts && hoursPerDay === p.hours
                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 text-foreground font-bold"
                  : "border-border bg-background hover:bg-muted/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">{p.category}</span>
              <p className="text-xs font-bold truncate mt-0.5 text-foreground">{p.name}</p>
              <span className="text-[10px] font-mono text-muted-foreground block mt-1">
                {p.watts}W • {p.hours}h/day
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Wattage */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Appliance Wattage (Watts)
          </label>
          <input
            type="number"
            min={1}
            value={watts}
            onChange={(e) => setWatts(Math.max(1, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
        </div>

        {/* Hours / Day */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Daily Usage (Hours/Day)
          </label>
          <input
            type="number"
            min={0.1}
            max={24}
            step="0.5"
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(Math.min(24, Math.max(0.1, parseFloat(e.target.value) || 0)))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
        </div>

        {/* Electricity Rate */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Electricity Rate ($ / kWh)
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={kwhRate}
            onChange={(e) => setKwhRate(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg font-bold"
          />
          <span className="text-[10px] text-muted-foreground">Enter rate from your utility bill</span>
        </div>

        {/* Days / Month */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Operating Days / Month
          </label>
          <input
            type="number"
            min={1}
            max={31}
            value={daysPerMonth}
            onChange={(e) => setDaysPerMonth(Math.min(31, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            Estimated Electricity Cost Breakdown
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Cost Report"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Monthly Electric Cost</span>
            <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              ${monthlyCost.toFixed(2)}<span className="text-xs font-normal text-muted-foreground">/mo</span>
            </p>
            <span className="text-[10px] text-muted-foreground">Based on {monthlyKwh.toFixed(1)} kWh / month</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Annual Running Cost</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              ${annualCost.toFixed(2)}<span className="text-xs font-normal text-muted-foreground">/yr</span>
            </p>
            <span className="text-[10px] text-muted-foreground">Total cost across 365 operating days</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Daily Power Draw</span>
            <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              ${dailyCost.toFixed(2)}<span className="text-xs font-normal text-muted-foreground">/day</span>
            </p>
            <span className="text-[10px] text-muted-foreground">{dailyKwh.toFixed(2)} kWh consumed per day</span>
          </div>
        </div>
      </div>
    </div>
  );
}
