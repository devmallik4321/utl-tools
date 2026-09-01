"use client";

import { useState } from "react";
import { DollarSign, Calendar, Clock, Copy, Check, Table } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function SalaryHourlyConverter() {
  const [amount, setAmount] = useState<number>(75000);
  const [period, setPeriod] = useState<"annual" | "hourly" | "monthly">("annual");
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(40);
  const [weeksPerYear, setWeeksPerYear] = useState<number>(52);
  const [copied, setCopied] = useState<boolean>(false);

  // Normalize to annual salary
  let annualSalary = 0;
  if (period === "annual") {
    annualSalary = amount;
  } else if (period === "hourly") {
    annualSalary = amount * hoursPerWeek * weeksPerYear;
  } else if (period === "monthly") {
    annualSalary = amount * 12;
  }

  // Derive all periods
  const totalHours = hoursPerWeek * weeksPerYear;
  const hourly = totalHours > 0 ? annualSalary / totalHours : 0;
  const daily = hourly * (hoursPerWeek / 5);
  const weekly = annualSalary / weeksPerYear;
  const biweekly = weekly * 2;
  const monthly = annualSalary / 12;

  const handleCopy = async () => {
    const summary = `Salary & Wage Breakdown\n• Annual Salary: $${annualSalary.toLocaleString()}\n• Monthly Pay: $${monthly.toFixed(2)}\n• Bi-Weekly (Every 2 wks): $${biweekly.toFixed(2)}\n• Weekly Pay: $${weekly.toFixed(2)}\n• Daily Rate: $${daily.toFixed(2)}\n• Hourly Wage: $${hourly.toFixed(2)}/hr (${hoursPerWeek} hrs/wk, ${weeksPerYear} wks/yr)`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Input Amount ($)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Pay Frequency Type
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
          >
            <option value="annual">Per Year (Annual Salary)</option>
            <option value="hourly">Per Hour (Hourly Wage)</option>
            <option value="monthly">Per Month (Monthly Income)</option>
          </select>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Working Schedule
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Math.max(1, parseFloat(e.target.value) || 1))}
              className="w-1/2 px-2.5 py-2 text-xs font-mono bg-background border border-border rounded-lg"
              title="Hours per week"
            />
            <input
              type="number"
              value={weeksPerYear}
              onChange={(e) => setWeeksPerYear(Math.min(52, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-1/2 px-2.5 py-2 text-xs font-mono bg-background border border-border rounded-lg"
              title="Paid weeks per year"
            />
          </div>
          <span className="text-[10px] text-muted-foreground">{hoursPerWeek} hrs/wk • {weeksPerYear} wks/yr ({totalHours.toLocaleString()} total hrs)</span>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            Equivalent Compensation Matrix
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Table"}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Hourly Wage</span>
            <p className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              ${hourly.toFixed(2)}<span className="text-xs font-normal text-muted-foreground">/hr</span>
            </p>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Daily Earnings</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              ${daily.toFixed(2)}<span className="text-xs font-normal text-muted-foreground">/day</span>
            </p>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Weekly Paycheck</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              ${weekly.toFixed(2)}<span className="text-xs font-normal text-muted-foreground">/wk</span>
            </p>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Bi-Weekly (2 Weeks)</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              ${biweekly.toFixed(2)}
            </p>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Monthly Salary</span>
            <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              ${monthly.toFixed(2)}<span className="text-xs font-normal text-muted-foreground">/mo</span>
            </p>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Annual Gross</span>
            <p className="text-2xl font-extrabold font-mono text-foreground">
              ${annualSalary.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
