"use client";

import { useState, useMemo } from "react";
import { Car, DollarSign, Clock, Calendar, TrendingUp, Copy, Check, Sparkles } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function CommuteCostCalculator() {
  const [roundTripMiles, setRoundTripMiles] = useState<number>(28);
  const [daysInOfficePerWeek, setDaysInOfficePerWeek] = useState<number>(4);
  const [carMpg, setCarMpg] = useState<number>(26);
  const [gasPrice, setGasPrice] = useState<number>(3.65);
  const [dailyTollsParking, setDailyTollsParking] = useState<number>(6);
  const [wearAndTearPerMile, setWearAndTearPerMile] = useState<number>(0.18); // IRS depreciation / maintenance estimate
  const [oneWayMinutes, setOneWayMinutes] = useState<number>(35);
  const [hourlyWage, setHourlyWage] = useState<number>(42);
  const [copied, setCopied] = useState<boolean>(false);

  const { dailyCost, monthlyCost, annualCost, annualHoursCommuting, annualTimeValue, wfhSavings } = useMemo(() => {
    const annualWorkDays = daysInOfficePerWeek * 50; // 50 working weeks

    // Daily fuel cost
    const dailyGallons = carMpg > 0 ? roundTripMiles / carMpg : 0;
    const dailyGas = dailyGallons * gasPrice;
    const dailyWear = roundTripMiles * wearAndTearPerMile;
    const dayTotal = dailyGas + dailyWear + dailyTollsParking;

    const monthTotal = dayTotal * (daysInOfficePerWeek * 4.33);
    const yrTotal = dayTotal * annualWorkDays;

    // Time calculations
    const dailyHours = (oneWayMinutes * 2) / 60;
    const yrHours = dailyHours * annualWorkDays;
    const yrTimeVal = yrHours * hourlyWage;

    // Savings if going remote 2 days/week
    const savingsPerDay = dayTotal;
    const twoDaysRemoteYearly = savingsPerDay * (2 * 50);

    return {
      dailyCost: dayTotal.toFixed(2),
      monthlyCost: Math.round(monthTotal),
      annualCost: Math.round(yrTotal),
      annualHoursCommuting: Math.round(yrHours),
      annualTimeValue: Math.round(yrTimeVal),
      wfhSavings: Math.round(twoDaysRemoteYearly),
    };
  }, [roundTripMiles, daysInOfficePerWeek, carMpg, gasPrice, dailyTollsParking, wearAndTearPerMile, oneWayMinutes, hourlyWage]);

  const handleCopy = async () => {
    const summary = `Work Commute Financial & Time Impact (${roundTripMiles} mi round-trip, ${daysInOfficePerWeek} days/wk):\n• Daily Direct Cost: $${dailyCost}/day\n• Annual Out-of-Pocket Cost: $${annualCost.toLocaleString()}/year\n• Annual Commute Time Lost: ${annualHoursCommuting} Hours/year (~$${annualTimeValue.toLocaleString()} time value)\n• Annual Savings from 2 WFH Days/wk: +$${wfhSavings.toLocaleString()}/year`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Round-Trip Miles
          </label>
          <input
            type="number"
            min={1}
            value={roundTripMiles}
            onChange={(e) => setRoundTripMiles(Math.max(1, parseFloat(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Days in Office / Week
          </label>
          <select
            value={daysInOfficePerWeek}
            onChange={(e) => setDaysInOfficePerWeek(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={1}>1 Day / Week (Hybrid)</option>
            <option value={2}>2 Days / Week (Hybrid)</option>
            <option value={3}>3 Days / Week (Hybrid)</option>
            <option value={4}>4 Days / Week</option>
            <option value={5}>5 Days / Week (Full Office)</option>
          </select>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Daily Tolls &amp; Parking ($)
          </label>
          <input
            type="number"
            min={0}
            step={1}
            value={dailyTollsParking}
            onChange={(e) => setDailyTollsParking(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            One-Way Commute (Mins)
          </label>
          <input
            type="number"
            min={5}
            step={5}
            value={oneWayMinutes}
            onChange={(e) => setOneWayMinutes(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Car className="w-4 h-4 text-emerald-500" />
            Commuting Out-of-Pocket &amp; Time Cost
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
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Daily Commute Cost</span>
            <p className="text-3xl font-extrabold text-foreground">${dailyCost}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Gas + tolls + wear &amp; tear</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Annual Out-of-Pocket</span>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">${annualCost.toLocaleString()}/yr</p>
            <span className="text-[10px] text-muted-foreground font-sans">Direct financial cost</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Commute Time Lost</span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{annualHoursCommuting} Hours</p>
            <span className="text-[10px] text-muted-foreground font-sans">Equivalent to ~{Math.round(annualHoursCommuting / 24)} days</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">2-Day WFH Savings</span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              +${wfhSavings.toLocaleString()}/yr
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">Hybrid work benefit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
