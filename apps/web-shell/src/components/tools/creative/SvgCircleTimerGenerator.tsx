"use client";

import { useState, useMemo, useEffect } from "react";
import { Clock, Play, Pause, RotateCcw, Copy, Check, Sparkles, Sliders, Eye } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function SvgCircleTimerGenerator() {
  const [size, setSize] = useState<number>(180);
  const [strokeWidth, setStrokeWidth] = useState<number>(10);
  const [totalSeconds, setTotalSeconds] = useState<number>(60);
  const [activeColor, setActiveColor] = useState<string>("#10b981");
  const [trackColor, setTrackColor] = useState<string>("#334155");
  const [segmentedTicks, setSegmentedTicks] = useState<boolean>(false);
  const [numTicks, setNumTicks] = useState<number>(60);

  // Interactive Live Countdown State
  const [remaining, setRemaining] = useState<number>(60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copiedSvg, setCopiedSvg] = useState<boolean>(false);
  const [copiedReact, setCopiedReact] = useState<boolean>(false);

  useEffect(() => {
    setRemaining(totalSeconds);
    setIsRunning(false);
  }, [totalSeconds]);

  useEffect(() => {
    let timer: any = null;
    if (isRunning && remaining > 0) {
      timer = setInterval(() => {
        setRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
    } else if (remaining === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, remaining]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = totalSeconds > 0 ? remaining / totalSeconds : 0;
  const strokeDashoffset = circumference * (1 - progressRatio);

  const dashArray = useMemo(() => {
    if (!segmentedTicks) {
      return `${circumference.toFixed(2)} ${circumference.toFixed(2)}`;
    }
    // Segmented ticks
    const tickLen = circumference / numTicks;
    return `${(tickLen * 0.4).toFixed(2)} ${(tickLen * 0.6).toFixed(2)}`;
  }, [segmentedTicks, circumference, numTicks]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const rawSvgSnippet = useMemo(() => {
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <circle
    cx="${size / 2}"
    cy="${size / 2}"
    r="${radius.toFixed(1)}"
    fill="none"
    stroke="${trackColor}"
    stroke-width="${strokeWidth}"
  />
  <circle
    cx="${size / 2}"
    cy="${size / 2}"
    r="${radius.toFixed(1)}"
    fill="none"
    stroke="${activeColor}"
    stroke-width="${strokeWidth}"
    stroke-dasharray="${dashArray}"
    stroke-dashoffset="${strokeDashoffset.toFixed(2)}"
    stroke-linecap="round"
    transform="rotate(-90 ${size / 2} ${size / 2})"
    style="transition: stroke-dashoffset 1s linear;"
  />
  <text
    x="50%"
    y="50%"
    dominant-baseline="central"
    text-anchor="middle"
    fill="#ffffff"
    font-size="${Math.round(size * 0.2)}px"
    font-family="monospace"
    font-weight="bold"
  >
    ${formatTime(remaining)}
  </text>
</svg>`;
  }, [size, radius, trackColor, strokeWidth, activeColor, dashArray, strokeDashoffset, remaining]);

  const reactHookSnippet = useMemo(() => {
    return `import { useState, useEffect } from "react";

export function CircularCountdownTimer({ durationSeconds = ${totalSeconds} }: { durationSeconds?: number }) {
  const [seconds, setSeconds] = useState(durationSeconds);
  const size = ${size};
  const strokeWidth = ${strokeWidth};
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - seconds / durationSeconds);

  useEffect(() => {
    if (seconds <= 0) return;
    const interval = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} viewBox={\`0 0 \${size} \${size}\`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="${trackColor}"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="${activeColor}"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={\`rotate(-90 \${size / 2} \${size / 2})\`}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <span className="absolute font-mono font-bold text-xl text-foreground">
        {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, "0")}
      </span>
    </div>
  );
}`;
  }, [totalSeconds, size, strokeWidth, trackColor, activeColor]);

  const handleCopySvg = async () => {
    const ok = await copyToClipboard(rawSvgSnippet);
    if (ok) {
      setCopiedSvg(true);
      setTimeout(() => setCopiedSvg(false), 2000);
    }
  };

  const handleCopyReact = async () => {
    const ok = await copyToClipboard(reactHookSnippet);
    if (ok) {
      setCopiedReact(true);
      setTimeout(() => setCopiedReact(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Interactive Timer Canvas */}
      <div className="p-6 bg-card border border-border rounded-2xl flex flex-col items-center justify-center gap-4">
        <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-primary" />
          Interactive SVG Circular Timer Render
        </span>

        {/* SVG Render */}
        <div className="relative inline-flex items-center justify-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={trackColor}
              strokeWidth={strokeWidth}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={activeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={dashArray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            <span
              className="font-mono font-black text-foreground"
              style={{ fontSize: `${Math.round(size * 0.18)}px` }}
            >
              {formatTime(remaining)}
            </span>
            <span className="text-[10px] uppercase font-bold text-muted-foreground">
              {remaining > 0 ? "Remaining" : "Complete"}
            </span>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
              isRunning
                ? "bg-amber-500 hover:bg-amber-600 text-black border-amber-600"
                : "bg-primary hover:bg-primary/90 text-primary-foreground border-primary"
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? "Pause" : "Start"}</span>
          </button>
          <button
            onClick={() => {
              setIsRunning(false);
              setRemaining(totalSeconds);
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground rounded-lg border border-border transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Timer Duration ({totalSeconds}s)
          </label>
          <input
            type="number"
            min={5}
            max={3600}
            step={5}
            value={totalSeconds}
            onChange={(e) => setTotalSeconds(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-sm font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Size ({size}px)
          </label>
          <input
            type="range"
            min={100}
            max={260}
            step={10}
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
            className="w-full accent-primary mt-2"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Stroke ({strokeWidth}px)
          </label>
          <input
            type="range"
            min={4}
            max={24}
            step={2}
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
            className="w-full accent-primary mt-2"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Progress Color
          </label>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="color"
              value={activeColor}
              onChange={(e) => setActiveColor(e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer bg-background"
            />
            <input
              type="text"
              value={activeColor}
              onChange={(e) => setActiveColor(e.target.value)}
              className="w-24 px-2 py-1 text-xs font-mono bg-background border border-border rounded text-foreground uppercase"
            />
          </div>
        </div>
      </div>

      {/* Code Export Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Raw SVG */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              SVG Markup
            </span>
            <button
              onClick={handleCopySvg}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground rounded border border-border transition-colors"
            >
              {copiedSvg ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedSvg ? "Copied" : "Copy SVG"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 border border-border/70 rounded-lg text-xs font-mono text-muted-foreground overflow-x-auto max-h-48">
            {rawSvgSnippet}
          </pre>
        </div>

        {/* React Component */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              React Component with Countdown Hook
            </span>
            <button
              onClick={handleCopyReact}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground rounded border border-border transition-colors"
            >
              {copiedReact ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedReact ? "Copied" : "Copy React"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 border border-border/70 rounded-lg text-xs font-mono text-muted-foreground overflow-x-auto max-h-48">
            {reactHookSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
}
