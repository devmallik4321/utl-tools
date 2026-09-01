"use client";

import { useState } from "react";
import { Wifi, Download, Clock, Copy, Check, ArrowRight, Gauge } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function BandwidthCalculator() {
  const [fileSize, setFileSize] = useState<number>(50);
  const [fileUnit, setFileUnit] = useState<"MB" | "GB" | "TB">("GB");
  const [speed, setSpeed] = useState<number>(100);
  const [speedUnit, setSpeedUnit] = useState<"Mbps" | "Gbps" | "MB/s">("Mbps");
  const [overheadPct, setOverheadPct] = useState<number>(10); // 10% TCP/IP protocol overhead
  const [copied, setCopied] = useState<boolean>(false);

  // Normalize File Size to MegaBytes (MB)
  let totalMegaBytes = fileSize;
  if (fileUnit === "GB") totalMegaBytes = fileSize * 1024;
  if (fileUnit === "TB") totalMegaBytes = fileSize * 1024 * 1024;

  // Normalize Speed to MegaBytes per second (MB/s)
  let effectiveMegaBytesPerSec = 0;
  if (speedUnit === "Mbps") {
    effectiveMegaBytesPerSec = (speed / 8) * (1 - overheadPct / 100);
  } else if (speedUnit === "Gbps") {
    effectiveMegaBytesPerSec = ((speed * 1000) / 8) * (1 - overheadPct / 100);
  } else {
    // MB/s direct
    effectiveMegaBytesPerSec = speed * (1 - overheadPct / 100);
  }

  // Time in seconds
  const totalSeconds = effectiveMegaBytesPerSec > 0 ? totalMegaBytes / effectiveMegaBytesPerSec : 0;

  const formatDuration = (secs: number) => {
    if (secs < 60) return `${Math.round(secs)} seconds`;
    const m = Math.floor(secs / 60);
    const s = Math.round(secs % 60);
    if (m < 60) return `${m} min ${s} sec`;
    const h = Math.floor(m / 60);
    const remM = m % 60;
    const d = Math.floor(h / 24);
    if (d > 0) return `${d} day(s), ${h % 24} hr ${remM} min`;
    return `${h} hr ${remM} min`;
  };

  const handleCopy = async () => {
    const summary = `Bandwidth & Transfer Time Estimate\n• File Size: ${fileSize} ${fileUnit} (${totalMegaBytes.toLocaleString()} MB)\n• Speed: ${speed} ${speedUnit} (Effective ~${effectiveMegaBytesPerSec.toFixed(2)} MB/s after ${overheadPct}% overhead)\n• Estimated Download Time: ${formatDuration(totalSeconds)}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* File Size */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            File / Dataset Size
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min={0.1}
              value={fileSize}
              onChange={(e) => setFileSize(Math.max(0.01, parseFloat(e.target.value) || 0))}
              className="flex-1 px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
            />
            <select
              value={fileUnit}
              onChange={(e) => setFileUnit(e.target.value as any)}
              className="w-24 px-3 py-2 text-sm font-bold bg-background border border-border rounded-lg"
            >
              <option value="MB">MB</option>
              <option value="GB">GB</option>
              <option value="TB">TB</option>
            </select>
          </div>
        </div>

        {/* Speed */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Internet Speed / Bandwidth
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              value={speed}
              onChange={(e) => setSpeed(Math.max(0.1, parseFloat(e.target.value) || 0))}
              className="flex-1 px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
            />
            <select
              value={speedUnit}
              onChange={(e) => setSpeedUnit(e.target.value as any)}
              className="w-28 px-2 py-2 text-sm font-bold bg-background border border-border rounded-lg"
            >
              <option value="Mbps">Mbps (Mb/s)</option>
              <option value="Gbps">Gbps (Gb/s)</option>
              <option value="MB/s">MB/s (MegaBytes)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-500" />
            Estimated Download / Transfer Duration
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Time"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Estimated Transfer Time</span>
            <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              {formatDuration(totalSeconds)}
            </p>
            <span className="text-[10px] text-muted-foreground">For {fileSize} {fileUnit} transfer</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Effective Transfer Speed</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              {effectiveMegaBytesPerSec.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">MB/s</span>
            </p>
            <span className="text-[10px] text-muted-foreground">Real-world bytes written per second</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Bits vs Bytes Conversion</span>
            <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              8 Bits = 1 Byte
            </p>
            <span className="text-[10px] text-muted-foreground">100 Mbps = 12.5 MB/s theoretical max</span>
          </div>
        </div>

        {/* Speed Comparison Matrix */}
        <div className="space-y-2 pt-2 border-t border-border">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Time Comparison Across Standard Connections:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            {[
              { name: "50 Mbps (Standard DSL/4G)", speedMbps: 50 },
              { name: "100 Mbps (Standard Fiber)", speedMbps: 100 },
              { name: "500 Mbps (Fast Broadband)", speedMbps: 500 },
              { name: "1 Gbps (Gigabit Fiber)", speedMbps: 1000 },
            ].map((conn, idx) => {
              const mbSec = (conn.speedMbps / 8) * 0.9;
              const s = totalMegaBytes / mbSec;
              return (
                <div key={idx} className="p-2.5 bg-card rounded-lg border border-border space-y-1">
                  <span className="text-[10px] text-muted-foreground block font-sans font-bold">{conn.name}</span>
                  <p className="text-foreground font-bold">{formatDuration(s)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
