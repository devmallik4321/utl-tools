"use client";

import { useState, useMemo } from "react";
import { Clock, DollarSign, Calendar, TrendingUp, Copy, Check, Sparkles, Briefcase } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function OvertimeCalculator() {
  const [hourlyWage, setHourlyWage] = useState<number>(28);
  const [regularHours, setRegularHours] = useState<number>(40);
  const [overtimeHours, setOvertimeHours] = useState<number>(8); // 1.5x
  const [doubleTimeHours, setDoubleTimeHours] = useState<number>(2); // 2.0x
  const [copied, setCopied] = useState<boolean>(false);

  const { regularPay, overtimePay, doubleTimePay, totalGrossPay, totalHours, effectiveRate } = useMemo(() => {
    const reg = regularHours * hourlyWage;
    const ot = overtimeHours * hourlyWage * 1.5;
    const dt = doubleTimeHours * hourlyWage * 2.0;

    const totalGross = reg + ot + dt;
    const totalHrs = regularHours + overtimeHours + doubleTimeHours;
    const eff = totalHrs > 0 ? totalGross / totalHrs : hourlyWage;

    return {
      regularPay: reg,
      overtimePay: ot,
      doubleTimePay: dt,
      totalGrossPay: totalGross,
      totalHours: totalHrs,
      effectiveRate: eff,
    };
  }, [hourlyWage, regularHours, overtimeHours, doubleTimeHours]);

  const handleCopy = async () => {
    const summary = `Hourly Paycheck & Overtime Breakdown (${totalHours} Total Hours @ $${hourlyWage}/hr)\n• Regular Pay (${regularHours} hrs): $${regularPay.toFixed(2)}\n• Overtime 1.5x (${overtimeHours} hrs @ $${(hourlyWage * 1.5).toFixed(2)}/hr): $${overtimePay.toFixed(2)}\n• Double Time 2.0x (${doubleTimeHours} hrs @ $${(hourlyWage * 2.0).toFixed(2)}/hr): $${doubleTimePay.toFixed(2)}\n• Total Gross Paycheck: $${totalGrossPay.toFixed(2)} (Effective Rate: $${effectiveRate.toFixed(2)}/hr)`;
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
            Base Hourly Wage ($/hr)
          </label>
          <input
            type="number"
            min={1}
            step="0.5"
            value={hourlyWage}
            onChange={(e) => setHourlyWage(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Regular Hours (1.0x)
          </label>
          <input
            type="number"
            min={0}
            value={regularHours}
            onChange={(e) => setRegularHours(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Standard 40-hr threshold</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Overtime Hours (1.5x)
          </label>
          <input
            type="number"
            min={0}
            value={overtimeHours}
            onChange={(e) => setOvertimeHours(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-blue-600 dark:text-blue-400"
          />
          <span className="text-[10px] text-muted-foreground">Time and a half (${(hourlyWage * 1.5).toFixed(2)}/hr)</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Double Time (2.0x)
          </label>
          <input
            type="number"
            min={0}
            value={doubleTimeHours}
            onChange={(e) => setDoubleTimeHours(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
          <span className="text-[10px] text-muted-foreground">Holiday / Sunday (${(hourlyWage * 2).toFixed(2)}/hr)</span>
        </div>
      </div>

      {/* Paycheck Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-emerald-500" />
            Gross Paycheck Earnings Breakdown
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Paycheck"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Total Gross Pay</span>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              ${totalGrossPay.toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground font-sans">{totalHours} total hours worked</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Regular Pay (1.0x)</span>
            <p className="text-2xl font-bold text-foreground">${regularPay.toFixed(2)}</p>
            <span className="text-[10px] text-muted-foreground font-sans">
              {regularHours} hrs @ ${hourlyWage}/hr
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Overtime (1.5x)</span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${overtimePay.toFixed(2)}</p>
            <span className="text-[10px] text-muted-foreground font-sans">
              {overtimeHours} hrs @ ${(hourlyWage * 1.5).toFixed(2)}/hr
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Double Time (2.0x)</span>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">${doubleTimePay.toFixed(2)}</p>
            <span className="text-[10px] text-muted-foreground font-sans">
              {doubleTimeHours} hrs @ ${(hourlyWage * 2).toFixed(2)}/hr
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
