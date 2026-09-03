"use client";

import { useState, useMemo } from "react";
import { Timer, Trophy, Copy, Check, Sparkles, Flame, Clock } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

type RaceEvent = "marathon" | "half" | "10k" | "5k";

const EVENTS: Record<RaceEvent, { name: string; miles: number; km: number }> = {
  marathon: { name: "Full Marathon", miles: 26.21875, km: 42.195 },
  half: { name: "Half Marathon", miles: 13.1094, km: 21.0975 },
  "10k": { name: "10K Run", miles: 6.21371, km: 10.0 },
  "5k": { name: "5K Run", miles: 3.10686, km: 5.0 },
};

export function MarathonPaceCalculator() {
  const [event, setEvent] = useState<RaceEvent>("marathon");
  const [goalHours, setGoalHours] = useState<number>(3);
  const [goalMinutes, setGoalMinutes] = useState<number>(45);
  const [goalSeconds, setGoalSeconds] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const {
    pacePerMileStr,
    pacePerKmStr,
    speedMph,
    splitsTable,
  } = useMemo(() => {
    const ev = EVENTS[event];
    const totalSeconds = goalHours * 3600 + goalMinutes * 60 + goalSeconds;

    if (totalSeconds <= 0) {
      return {
        pacePerMileStr: "0:00",
        pacePerKmStr: "0:00",
        speedMph: "0.0",
        splitsTable: [],
      };
    }

    // Average Pace per Mile
    const secPerMile = totalSeconds / ev.miles;
    const mileMins = Math.floor(secPerMile / 60);
    const mileSecs = Math.round(secPerMile % 60);
    const pMile = `${mileMins}:${mileSecs < 10 ? "0" : ""}${mileSecs}/mi`;

    // Average Pace per KM
    const secPerKm = totalSeconds / ev.km;
    const kmMins = Math.floor(secPerKm / 60);
    const kmSecs = Math.round(secPerKm % 60);
    const pKm = `${kmMins}:${kmSecs < 10 ? "0" : ""}${kmSecs}/km`;

    const mph = (ev.miles / (totalSeconds / 3600)).toFixed(1);

    // Splits milestone generator
    const formatTime = (secs: number) => {
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = Math.round(secs % 60);
      if (h > 0) {
        return `${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
      }
      return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    const splits: { label: string; distance: string; elapsed: string }[] = [];

    if (event === "marathon") {
      splits.push({ label: "5 Kilometer", distance: "3.1 mi", elapsed: formatTime(secPerKm * 5) });
      splits.push({ label: "10 Kilometer", distance: "6.2 mi", elapsed: formatTime(secPerKm * 10) });
      splits.push({ label: "Halfway (13.1 mi)", distance: "21.1 km", elapsed: formatTime(totalSeconds / 2) });
      splits.push({ label: "30 Kilometer", distance: "18.6 mi", elapsed: formatTime(secPerKm * 30) });
      splits.push({ label: "20 Mile Wall", distance: "32.2 km", elapsed: formatTime(secPerMile * 20) });
      splits.push({ label: "Finish Line", distance: "26.2 mi", elapsed: formatTime(totalSeconds) });
    } else if (event === "half") {
      splits.push({ label: "5 Kilometer", distance: "3.1 mi", elapsed: formatTime(secPerKm * 5) });
      splits.push({ label: "10 Kilometer", distance: "6.2 mi", elapsed: formatTime(secPerKm * 10) });
      splits.push({ label: "15 Kilometer", distance: "9.3 mi", elapsed: formatTime(secPerKm * 15) });
      splits.push({ label: "10 Mile Marker", distance: "16.1 km", elapsed: formatTime(secPerMile * 10) });
      splits.push({ label: "Finish Line", distance: "13.1 mi", elapsed: formatTime(totalSeconds) });
    } else {
      splits.push({ label: "1 Mile", distance: "1.6 km", elapsed: formatTime(secPerMile * 1) });
      splits.push({ label: "Halfway", distance: `${(ev.km / 2).toFixed(1)} km`, elapsed: formatTime(totalSeconds / 2) });
      splits.push({ label: "Finish Line", distance: `${ev.km} km`, elapsed: formatTime(totalSeconds) });
    }

    return {
      pacePerMileStr: pMile,
      pacePerKmStr: pKm,
      speedMph: mph,
      splitsTable: splits,
    };
  }, [event, goalHours, goalMinutes, goalSeconds]);

  const handleCopy = async () => {
    const summary = `${EVENTS[event].name} Target Pace Splits (${goalHours}h ${goalMinutes}m ${goalSeconds}s):\n• Pace per Mile: ${pacePerMileStr}\n• Pace per KM: ${pacePerKmStr}\n• Average Speed: ${speedMph} mph\n• Splits:\n` +
      splitsTable.map((s) => `  - ${s.label} (${s.distance}): ${s.elapsed}`).join("\n");
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Event Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(["marathon", "half", "10k", "5k"] as RaceEvent[]).map((ev) => (
          <button
            key={ev}
            onClick={() => setEvent(ev)}
            className={`px-3 py-2 text-xs font-bold rounded-xl border capitalize transition-colors ${
              event === ev ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            {EVENTS[ev].name}
          </button>
        ))}
      </div>

      {/* Target Time Inputs */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Target Finish Time (Hours : Minutes : Seconds)
        </label>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase">Hours</span>
            <input
              type="number"
              min={0}
              max={24}
              value={goalHours}
              onChange={(e) => setGoalHours(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
            />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase">Minutes</span>
            <input
              type="number"
              min={0}
              max={59}
              value={goalMinutes}
              onChange={(e) => setGoalMinutes(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
            />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase">Seconds</span>
            <input
              type="number"
              min={0}
              max={59}
              value={goalSeconds}
              onChange={(e) => setGoalSeconds(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Timer className="w-4 h-4 text-emerald-500" />
            Target Pacing &amp; Speed Breakdown
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Pace Sheet"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border-2 border-emerald-500/40 space-y-1">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase font-sans">
              Pace Per Mile
            </span>
            <p className="text-3xl font-extrabold text-foreground">{pacePerMileStr}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Min : Sec per imperial mile</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Pace Per Kilometer
            </span>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{pacePerKmStr}</p>
            <span className="text-[10px] text-muted-foreground font-sans">Min : Sec per metric kilometer</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
              Average Speed
            </span>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{speedMph} mph</p>
            <span className="text-[10px] text-muted-foreground font-sans">
              {(parseFloat(speedMph) * 1.60934).toFixed(1)} km/h
            </span>
          </div>
        </div>
      </div>

      {/* Splits Table */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <h5 className="text-xs font-bold text-foreground uppercase tracking-wider">
          Milestone Checkpoint Splits
        </h5>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 font-mono text-xs text-center">
          {splitsTable.map((s, i) => (
            <div key={i} className="p-2.5 bg-muted/40 rounded-xl space-y-0.5 border border-border/50">
              <span className="text-muted-foreground text-[10px] font-sans font-semibold block">{s.label}</span>
              <p className="text-base font-extrabold text-foreground">{s.elapsed}</p>
              <span className="text-[10px] text-muted-foreground font-sans block">{s.distance}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
