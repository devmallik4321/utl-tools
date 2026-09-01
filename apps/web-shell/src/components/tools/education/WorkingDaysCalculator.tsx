"use client";

import { useState } from "react";
import { Calendar, Briefcase, Clock, PlusCircle, ArrowRight, Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

type CalcMode = "between_dates" | "add_business_days";

export function WorkingDaysCalculator() {
  const todayStr = new Date().toISOString().split("T")[0];
  const nextMonthStr = new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];

  const [mode, setMode] = useState<CalcMode>("between_dates");
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(nextMonthStr);
  const [daysToAdd, setDaysToAdd] = useState<number>(15);
  const [direction, setDirection] = useState<"add" | "subtract">("add");
  const [includeEndDate, setIncludeEndDate] = useState<boolean>(true);
  const [weekendType, setWeekendType] = useState<"sat_sun" | "fri_sat" | "sun_only">("sat_sun");
  const [copied, setCopied] = useState<boolean>(false);

  // Helper to check if a day is weekend
  const isWeekend = (d: Date): boolean => {
    const day = d.getDay(); // 0 = Sun, 6 = Sat, 5 = Fri
    if (weekendType === "sat_sun") return day === 0 || day === 6;
    if (weekendType === "fri_sat") return day === 5 || day === 6;
    if (weekendType === "sun_only") return day === 0;
    return false;
  };

  // Calculation 1: Days Between Dates
  const calculateBetween = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { totalDays: 0, workingDays: 0, weekendDays: 0 };
    }

    const isReverse = end < start;
    const from = isReverse ? end : start;
    const to = isReverse ? start : end;

    let totalDays = 0;
    let workingDays = 0;
    let weekendDays = 0;

    const curr = new Date(from);
    while (curr <= to) {
      if (!includeEndDate && curr.getTime() === to.getTime()) {
        break;
      }
      totalDays++;
      if (isWeekend(curr)) {
        weekendDays++;
      } else {
        workingDays++;
      }
      curr.setDate(curr.getDate() + 1);
    }

    return { totalDays, workingDays, weekendDays, isReverse };
  };

  // Calculation 2: Add / Subtract Business Days
  const calculateTargetDate = () => {
    const start = new Date(startDate);
    if (isNaN(start.getTime())) return null;

    let remaining = daysToAdd;
    const curr = new Date(start);
    let totalCalendarDays = 0;

    while (remaining > 0) {
      curr.setDate(curr.getDate() + (direction === "add" ? 1 : -1));
      totalCalendarDays++;
      if (!isWeekend(curr)) {
        remaining--;
      }
    }

    return {
      targetDate: curr.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      targetIso: curr.toISOString().split("T")[0],
      totalCalendarDays,
    };
  };

  const betweenStats = calculateBetween();
  const targetStats = calculateTargetDate();

  const handleCopy = async () => {
    let summary = "";
    if (mode === "between_dates") {
      summary = `Working Days Calculation (${startDate} to ${endDate})\n• Working Days: ${betweenStats.workingDays} days\n• Weekend Days: ${betweenStats.weekendDays} days\n• Total Calendar Days: ${betweenStats.totalDays} days`;
    } else if (targetStats) {
      summary = `Business Days Calculation\n• Start Date: ${startDate}\n• ${direction === "add" ? "Added" : "Subtracted"}: ${daysToAdd} Business Days\n• Resulting Date: ${targetStats.targetDate} (${targetStats.totalCalendarDays} total calendar days)`;
    }
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex gap-2 p-1 bg-muted/50 rounded-xl border border-border">
        <button
          onClick={() => setMode("between_dates")}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            mode === "between_dates" ? "bg-card text-foreground shadow-xs border border-border" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Count Working Days Between Dates</span>
        </button>
        <button
          onClick={() => setMode("add_business_days")}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            mode === "add_business_days" ? "bg-card text-foreground shadow-xs border border-border" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add / Subtract Business Days</span>
        </button>
      </div>

      {/* Weekend Type Configuration */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-muted/20 border border-border rounded-xl text-xs">
        <span className="font-medium text-foreground">Standard Weekend Pattern:</span>
        <div className="flex gap-1.5">
          {[
            { id: "sat_sun", label: "Saturday & Sunday" },
            { id: "fri_sat", label: "Friday & Saturday (Middle East)" },
            { id: "sun_only", label: "Sunday Only (6-Day Workweek)" },
          ].map((w) => (
            <button
              key={w.id}
              onClick={() => setWeekendType(w.id as any)}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                weekendType === w.id ? "bg-card font-bold text-foreground border border-border shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {/* MODE 1: BETWEEN DATES */}
      {mode === "between_dates" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-card border border-border rounded-xl space-y-2">
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
              />
            </div>

            <div className="p-4 bg-card border border-border rounded-xl space-y-2">
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeEndDate}
              onChange={(e) => setIncludeEndDate(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Include end date in calculation (Inclusive)</span>
          </label>

          {/* Results Grid */}
          <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-emerald-500" />
                Working Days Calculation
              </h4>
              <button
                onClick={handleCopy}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Result"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-card rounded-xl border border-border space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Working Days</span>
                <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                  {betweenStats.workingDays}
                </p>
                <span className="text-[10px] text-muted-foreground">Mon–Fri business days</span>
              </div>

              <div className="p-4 bg-card rounded-xl border border-border space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Weekend Days</span>
                <p className="text-2xl font-bold font-mono text-muted-foreground">
                  {betweenStats.weekendDays}
                </p>
                <span className="text-[10px] text-muted-foreground">Non-working weekend days</span>
              </div>

              <div className="p-4 bg-card rounded-xl border border-border space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Total Calendar Days</span>
                <p className="text-2xl font-bold font-mono text-foreground">
                  {betweenStats.totalDays}
                </p>
                <span className="text-[10px] text-muted-foreground">
                  {(betweenStats.totalDays / 7).toFixed(1)} calendar weeks
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: ADD / SUBTRACT BUSINESS DAYS */}
      {mode === "add_business_days" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-card border border-border rounded-xl space-y-2">
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
              />
            </div>

            <div className="p-4 bg-card border border-border rounded-xl space-y-2">
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                Operation
              </label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
              >
                <option value="add">+ Add Business Days (Future Deadline)</option>
                <option value="subtract">- Subtract Business Days (Past Date)</option>
              </select>
            </div>

            <div className="p-4 bg-card border border-border rounded-xl space-y-2">
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
                Number of Business Days
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={daysToAdd}
                onChange={(e) => setDaysToAdd(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 text-sm font-mono bg-background border border-border rounded-lg"
              />
            </div>
          </div>

          {targetStats && (
            <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  Calculated Target Date:
                </span>
                <button
                  onClick={handleCopy}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>

              <div className="p-4 bg-card rounded-xl border border-border space-y-1">
                <p className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  {targetStats.targetDate}
                </p>
                <p className="text-xs text-muted-foreground">
                  {direction === "add" ? "+" : "-"}{daysToAdd} working days requires {targetStats.totalCalendarDays} total calendar days.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
