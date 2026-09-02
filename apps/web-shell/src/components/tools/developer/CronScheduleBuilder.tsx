"use client";

import { useState, useMemo } from "react";
import { Clock, Copy, Check, Sparkles, Calendar, Terminal } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

type FreqType = "minutes" | "hourly" | "daily" | "weekly" | "monthly";

export function CronScheduleBuilder() {
  const [freq, setFreq] = useState<FreqType>("daily");
  const [minuteInterval, setMinuteInterval] = useState<number>(15);
  const [hourOfDay, setHourOfDay] = useState<number>(9);
  const [minuteOfHour, setMinuteOfHour] = useState<number>(0);
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // Monday
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);

  const { expression, humanReadable } = useMemo(() => {
    let exp = "* * * * *";
    let desc = "";

    if (freq === "minutes") {
      exp = `*/${minuteInterval} * * * *`;
      desc = `Every ${minuteInterval} minutes`;
    } else if (freq === "hourly") {
      exp = `${minuteOfHour} * * * *`;
      desc = `Every hour at minute ${minuteOfHour}`;
    } else if (freq === "daily") {
      exp = `${minuteOfHour} ${hourOfDay} * * *`;
      const timeStr = `${hourOfDay.toString().padStart(2, "0")}:${minuteOfHour.toString().padStart(2, "0")}`;
      desc = `Every day at ${timeStr} UTC`;
    } else if (freq === "weekly") {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      exp = `${minuteOfHour} ${hourOfDay} * * ${dayOfWeek}`;
      const timeStr = `${hourOfDay.toString().padStart(2, "0")}:${minuteOfHour.toString().padStart(2, "0")}`;
      desc = `Every week on ${days[dayOfWeek]} at ${timeStr} UTC`;
    } else if (freq === "monthly") {
      exp = `${minuteOfHour} ${hourOfDay} ${dayOfMonth} * *`;
      const timeStr = `${hourOfDay.toString().padStart(2, "0")}:${minuteOfHour.toString().padStart(2, "0")}`;
      desc = `On day ${dayOfMonth} of every month at ${timeStr} UTC`;
    }

    return { expression: exp, humanReadable: desc };
  }, [freq, minuteInterval, hourOfDay, minuteOfHour, dayOfWeek, dayOfMonth]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(expression);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Frequency Tabs */}
      <div className="flex flex-wrap gap-2">
        {(["minutes", "hourly", "daily", "weekly", "monthly"] as FreqType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFreq(f)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-colors capitalize ${
              freq === f
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Interval Form Inputs */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-4">
        {freq === "minutes" && (
          <div className="space-y-2 max-w-xs">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              Every X Minutes
            </label>
            <select
              value={minuteInterval}
              onChange={(e) => setMinuteInterval(parseInt(e.target.value))}
              className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
            >
              <option value={2}>Every 2 minutes</option>
              <option value={5}>Every 5 minutes</option>
              <option value={10}>Every 10 minutes</option>
              <option value={15}>Every 15 minutes</option>
              <option value={20}>Every 20 minutes</option>
              <option value={30}>Every 30 minutes</option>
            </select>
          </div>
        )}

        {freq === "hourly" && (
          <div className="space-y-2 max-w-xs">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              At Minute of Hour
            </label>
            <input
              type="number"
              min={0}
              max={59}
              value={minuteOfHour}
              onChange={(e) => setMinuteOfHour(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
            />
          </div>
        )}

        {(freq === "daily" || freq === "weekly" || freq === "monthly") && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                Time (Hour &amp; Minute UTC)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={0}
                  max={23}
                  value={hourOfDay}
                  onChange={(e) => setHourOfDay(Math.min(23, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full px-2 py-1.5 font-mono font-bold bg-background border border-border rounded-lg"
                  placeholder="HH"
                />
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={minuteOfHour}
                  onChange={(e) => setMinuteOfHour(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full px-2 py-1.5 font-mono font-bold bg-background border border-border rounded-lg"
                  placeholder="MM"
                />
              </div>
            </div>

            {freq === "weekly" && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                  Day of Week
                </label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
                >
                  <option value={1}>Monday</option>
                  <option value={2}>Tuesday</option>
                  <option value={3}>Wednesday</option>
                  <option value={4}>Thursday</option>
                  <option value={5}>Friday</option>
                  <option value={6}>Saturday</option>
                  <option value={0}>Sunday</option>
                </select>
              </div>
            )}

            {freq === "monthly" && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                  Day of Month
                </label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(Math.min(31, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Generated Cron Output */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-500" />
            Standard 5-Part Crontab Syntax
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Expression"}</span>
          </button>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono">
          <div>
            <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 tracking-wider">
              {expression}
            </span>
            <span className="text-xs text-muted-foreground font-sans block pt-1">{humanReadable}</span>
          </div>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded font-bold font-sans">
            Standard POSIX Cron
          </span>
        </div>
      </div>
    </div>
  );
}
