"use client";

import { useState, useEffect } from "react";
import { Users, DollarSign, Play, Pause, RotateCcw, Copy, Check, Clock, AlertTriangle } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function MeetingCostCalculator() {
  const [attendeeCount, setAttendeeCount] = useState<number>(6);
  const [avgSalary, setAvgSalary] = useState<number>(85000); // $85,000 / year
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [isLiveRunning, setIsLiveRunning] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  // Derive hourly and per-second rates (2080 working hours/yr)
  const avgHourlyRate = avgSalary / 2080;
  const costPerSecond = (attendeeCount * avgHourlyRate) / 3600;
  const costPerMinute = costPerSecond * 60;

  // Planned meeting cost
  const plannedCost = costPerMinute * durationMinutes;

  // Live timer cost
  const liveCost = elapsedSeconds * costPerSecond;

  useEffect(() => {
    let interval: any = null;
    if (isLiveRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLiveRunning]);

  const resetLiveTimer = () => {
    setIsLiveRunning(false);
    setElapsedSeconds(0);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleCopy = async () => {
    const summary = `Meeting Cost Calculation\n• Attendees: ${attendeeCount} people (Avg Salary: $${avgSalary.toLocaleString()}/yr, ~$${avgHourlyRate.toFixed(2)}/hr)\n• Cost per Minute: $${costPerMinute.toFixed(2)}/min\n• Planned Cost (${durationMinutes} mins): $${plannedCost.toFixed(2)}\n• Actual Live Duration (${formatTime(elapsedSeconds)}): $${liveCost.toFixed(2)}`;
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
            Number of Attendees
          </label>
          <input
            type="number"
            min={1}
            value={attendeeCount}
            onChange={(e) => setAttendeeCount(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground">People in the room or Zoom call</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Average Annual Salary ($)
          </label>
          <input
            type="number"
            min={1}
            value={avgSalary}
            onChange={(e) => setAvgSalary(Math.max(1, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground font-mono">~${avgHourlyRate.toFixed(2)}/hr per person</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Scheduled Duration (Mins)
          </label>
          <input
            type="number"
            min={1}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
          />
          <span className="text-[11px] text-muted-foreground font-mono">${costPerMinute.toFixed(2)} / minute burned</span>
        </div>
      </div>

      {/* Planned Cost Card */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            Scheduled Meeting Cost
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
            <span className="text-xs font-semibold text-muted-foreground uppercase">Scheduled Total Cost</span>
            <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              ${plannedCost.toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">For {durationMinutes} min meeting</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Burn Rate / Minute</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              ${costPerMinute.toFixed(2)}<span className="text-xs font-normal text-muted-foreground">/min</span>
            </p>
            <span className="text-[10px] text-muted-foreground">Combined team salary burn</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Burn Rate / Hour</span>
            <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              ${(costPerMinute * 60).toFixed(2)}<span className="text-xs font-normal text-muted-foreground">/hr</span>
            </p>
            <span className="text-[10px] text-muted-foreground">For all {attendeeCount} participants</span>
          </div>
        </div>
      </div>

      {/* Live Meeting Ticker */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-purple-500" />
              Live Meeting Salary Ticker
            </span>
            <p className="text-xs text-muted-foreground mt-0.5">Run this during your meeting to track actual company dollars spent in real time.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLiveRunning(!isLiveRunning)}
              className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-xs ${
                isLiveRunning
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {isLiveRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isLiveRunning ? "Pause" : "Start Meeting"}</span>
            </button>
            <button
              type="button"
              onClick={resetLiveTimer}
              className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg border border-border"
              title="Reset timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="p-6 bg-muted/40 rounded-xl border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-muted-foreground block">ELAPSED TIME</span>
            <p className="text-3xl sm:text-4xl font-extrabold font-mono text-foreground mt-0.5">{formatTime(elapsedSeconds)}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-muted-foreground block">REAL-TIME COST BURNED</span>
            <p className="text-3xl sm:text-4xl font-extrabold font-mono text-rose-600 dark:text-rose-400 mt-0.5">
              ${liveCost.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
