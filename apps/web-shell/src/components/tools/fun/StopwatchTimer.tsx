"use client";

import { useState, useEffect, useRef } from "react";
import { Timer, Play, Pause, RotateCcw, Flag, Bell, Plus, Volume2 } from "lucide-react";

export function StopwatchTimer() {
  const [mode, setMode] = useState<"stopwatch" | "countdown">("stopwatch");

  // Stopwatch state
  const [swTime, setSwTime] = useState<number>(0);
  const [swRunning, setSwRunning] = useState<boolean>(false);
  const [laps, setLaps] = useState<number[]>([]);

  // Countdown state
  const [cdInitialMinutes, setCdInitialMinutes] = useState<number>(5);
  const [cdRemaining, setCdRemaining] = useState<number>(300000); // ms
  const [cdRunning, setCdRunning] = useState<boolean>(false);
  const [cdFinished, setCdFinished] = useState<boolean>(false);

  const swIntervalRef = useRef<any>(null);
  const cdIntervalRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play Web Audio beep
  const playBeep = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {}
  };

  // Stopwatch ticking
  useEffect(() => {
    if (swRunning) {
      const startTime = Date.now() - swTime;
      swIntervalRef.current = setInterval(() => {
        setSwTime(Date.now() - startTime);
      }, 10);
    } else {
      clearInterval(swIntervalRef.current);
    }
    return () => clearInterval(swIntervalRef.current);
  }, [swRunning]);

  // Countdown ticking
  useEffect(() => {
    if (cdRunning) {
      const targetTime = Date.now() + cdRemaining;
      cdIntervalRef.current = setInterval(() => {
        const left = targetTime - Date.now();
        if (left <= 0) {
          clearInterval(cdIntervalRef.current);
          setCdRemaining(0);
          setCdRunning(false);
          setCdFinished(true);
          playBeep();
        } else {
          setCdRemaining(left);
        }
      }, 100);
    } else {
      clearInterval(cdIntervalRef.current);
    }
    return () => clearInterval(cdIntervalRef.current);
  }, [cdRunning]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);

    return {
      m: String(minutes).padStart(2, "0"),
      s: String(seconds).padStart(2, "0"),
      ms: String(milliseconds).padStart(2, "0"),
    };
  };

  const handleLap = () => {
    if (swRunning) {
      setLaps([swTime, ...laps]);
    }
  };

  const resetStopwatch = () => {
    setSwRunning(false);
    setSwTime(0);
    setLaps([]);
  };

  const startCountdownMinutes = (mins: number) => {
    setCdInitialMinutes(mins);
    setCdRemaining(mins * 60 * 1000);
    setCdFinished(false);
    setCdRunning(true);
  };

  const resetCountdown = () => {
    setCdRunning(false);
    setCdRemaining(cdInitialMinutes * 60 * 1000);
    setCdFinished(false);
  };

  const swFormatted = formatTime(swTime);
  const cdFormatted = formatTime(cdRemaining);

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="flex justify-center">
        <div className="flex gap-1.5 p-1 bg-muted rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode("stopwatch")}
            className={`px-5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              mode === "stopwatch"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Timer className="w-3.5 h-3.5" /> Stopwatch (Lap Precision)
          </button>
          <button
            type="button"
            onClick={() => setMode("countdown")}
            className={`px-5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              mode === "countdown"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bell className="w-3.5 h-3.5" /> Countdown Alarm
          </button>
        </div>
      </div>

      {mode === "stopwatch" ? (
        <div className="p-8 sm:p-12 bg-card border border-border rounded-2xl text-center space-y-6 shadow-sm">
          {/* Big Time Canvas */}
          <div className="font-mono select-none flex items-baseline justify-center gap-2">
            <span className="text-6xl sm:text-8xl font-black text-foreground">
              {swFormatted.m}:{swFormatted.s}
            </span>
            <span className="text-3xl sm:text-5xl font-bold text-blue-600 dark:text-blue-400">
              .{swFormatted.ms}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setSwRunning(!swRunning)}
              className={`px-8 py-3.5 font-bold text-sm rounded-xl transition-opacity flex items-center gap-2 shadow-sm ${
                swRunning
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90"
              }`}
            >
              {swRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{swRunning ? "Pause" : "Start Stopwatch"}</span>
            </button>

            <button
              type="button"
              onClick={handleLap}
              disabled={!swRunning}
              className="px-6 py-3.5 bg-muted hover:bg-muted/80 text-foreground font-semibold text-sm rounded-xl border border-border transition-colors flex items-center gap-2 disabled:opacity-40"
            >
              <Flag className="w-4 h-4" />
              <span>Record Lap</span>
            </button>

            <button
              type="button"
              onClick={resetStopwatch}
              className="px-6 py-3.5 bg-muted hover:bg-muted/80 text-foreground font-semibold text-sm rounded-xl border border-border transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>

          {/* Lap History */}
          {laps.length > 0 && (
            <div className="pt-6 border-t border-border max-w-md mx-auto space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block text-left">
                Recorded Laps ({laps.length})
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {laps.map((lapMs, idx) => {
                  const f = formatTime(lapMs);
                  return (
                    <div
                      key={idx}
                      className="p-2.5 bg-muted/40 rounded-lg flex items-center justify-between text-xs font-mono"
                    >
                      <span className="font-semibold text-muted-foreground">Lap #{laps.length - idx}</span>
                      <span className="font-bold text-foreground">{f.m}:{f.s}.{f.ms}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 sm:p-12 bg-card border border-border rounded-2xl text-center space-y-6 shadow-sm">
          {/* Presets */}
          <div className="flex flex-wrap justify-center gap-2">
            {[1, 3, 5, 10, 15, 25, 30, 45, 60].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => startCountdownMinutes(mins)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                  cdInitialMinutes === mins && !cdFinished
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent"
                    : "bg-muted text-muted-foreground hover:text-foreground border-border"
                }`}
              >
                {mins} min
              </button>
            ))}
          </div>

          {/* Big Time Canvas */}
          <div className="font-mono select-none">
            <span className={`text-6xl sm:text-8xl font-black ${cdFinished ? "text-rose-600 animate-pulse" : "text-foreground"}`}>
              {cdFormatted.m}:{cdFormatted.s}
            </span>
          </div>

          {cdFinished && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-300 font-bold text-sm animate-bounce">
              ⏰ Time is up! Countdown completed.
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setCdFinished(false);
                setCdRunning(!cdRunning);
              }}
              className={`px-8 py-3.5 font-bold text-sm rounded-xl transition-opacity flex items-center gap-2 shadow-sm ${
                cdRunning
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90"
              }`}
            >
              {cdRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{cdRunning ? "Pause Timer" : "Start Timer"}</span>
            </button>

            <button
              type="button"
              onClick={resetCountdown}
              className="px-6 py-3.5 bg-muted hover:bg-muted/80 text-foreground font-semibold text-sm rounded-xl border border-border transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
