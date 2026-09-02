"use client";

import { useState, useMemo } from "react";
import { Video, Copy, Check, Sparkles, Film, HardDrive } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const PRESETS = [
  { name: "Discord Free (25 MB)", sizeMb: 25 },
  { name: "Discord Nitro (500 MB)", sizeMb: 500 },
  { name: "Email / Gmail (25 MB)", sizeMb: 25 },
  { name: "WhatsApp (64 MB)", sizeMb: 64 },
  { name: "Web / Slack (100 MB)", sizeMb: 100 },
];

export function VideoBitrateCalculator() {
  const [minutes, setMinutes] = useState<number>(3);
  const [seconds, setSeconds] = useState<number>(30);
  const [targetSizeMb, setTargetSizeMb] = useState<number>(25);
  const [audioBitrateKbps, setAudioBitrateKbps] = useState<number>(128);
  const [copied, setCopied] = useState<boolean>(false);

  const { totalSeconds, videoBitrateKbps, videoBitrateMbps, isFitPossible } = useMemo(() => {
    const totalSec = minutes * 60 + seconds;
    if (totalSec <= 0 || targetSizeMb <= 0) {
      return { totalSeconds: 0, videoBitrateKbps: 0, videoBitrateMbps: 0, isFitPossible: true };
    }

    // Total bits allowed = targetSizeMb * 8 * 1024 * 1024
    // Total kbps = (targetSizeMb * 8 * 1024) / totalSec
    const totalBitrateKbps = (targetSizeMb * 8 * 1024) / totalSec;
    const vBitrate = totalBitrateKbps - audioBitrateKbps;

    return {
      totalSeconds: totalSec,
      videoBitrateKbps: Math.max(0, vBitrate),
      videoBitrateMbps: Math.max(0, vBitrate / 1000),
      isFitPossible: vBitrate > 50,
    };
  }, [minutes, seconds, targetSizeMb, audioBitrateKbps]);

  const handleCopy = async () => {
    const summary = `Video Encoding Bitrate Target (${minutes}m ${seconds}s video targeting ${targetSizeMb} MB)\n• Target File Size: ${targetSizeMb} MB\n• Recommended Video Bitrate: ${videoBitrateKbps.toFixed(0)} kbps (${videoBitrateMbps.toFixed(2)} Mbps)\n• Audio Bitrate: ${audioBitrateKbps} kbps (AAC / Opus)\n• FFmpeg CLI flag: -b:v ${videoBitrateKbps.toFixed(0)}k -b:a ${audioBitrateKbps}k`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Platform Presets */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => setTargetSizeMb(p.sizeMb)}
            className="px-3 py-1 bg-card border border-border text-foreground hover:bg-muted text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Input Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Video Duration
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-muted-foreground block">Minutes</span>
              <input
                type="number"
                min={0}
                value={minutes}
                onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 font-mono font-bold bg-background border border-border rounded-lg"
              />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">Seconds</span>
              <input
                type="number"
                min={0}
                max={59}
                value={seconds}
                onChange={(e) => setSeconds(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 font-mono font-bold bg-background border border-border rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Target Max File Size (MB)
          </label>
          <input
            type="number"
            min={1}
            value={targetSizeMb}
            onChange={(e) => setTargetSizeMb(Math.max(1, parseFloat(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Upload limit ceiling</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Audio Stream Bitrate (kbps)
          </label>
          <select
            value={audioBitrateKbps}
            onChange={(e) => setAudioBitrateKbps(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={96}>96 kbps (Voice / Dialogue)</option>
            <option value={128}>128 kbps (Standard Quality)</option>
            <option value={192}>192 kbps (High Fidelity)</option>
            <option value={320}>320 kbps (Studio Audio)</option>
          </select>
        </div>
      </div>

      {/* Bitrate Results */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Video className="w-4 h-4 text-emerald-500" />
            Recommended Video Encoding Bitrate
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Bitrate"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Target Video Bitrate</span>
            <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              {videoBitrateKbps.toFixed(0)} <span className="text-sm font-normal text-muted-foreground">kbps</span>
            </p>
            <span className="text-[10px] text-muted-foreground font-mono">
              ({videoBitrateMbps.toFixed(2)} Mbps)
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Audio Bitrate</span>
            <p className="text-3xl font-extrabold font-mono text-foreground">
              {audioBitrateKbps} <span className="text-sm font-normal text-muted-foreground">kbps</span>
            </p>
            <span className="text-[10px] text-muted-foreground">AAC / Opus stream allocation</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">FFmpeg Encoding Flag</span>
            <p className="text-sm font-mono font-bold text-blue-600 dark:text-blue-400 truncate">
              -b:v {videoBitrateKbps.toFixed(0)}k
            </p>
            <span className="text-[10px] text-muted-foreground">Pass to ffmpeg or HandBrake</span>
          </div>
        </div>

        {!isFitPossible && (
          <p className="text-xs text-rose-600 font-semibold">
            Warning: The video is too long ({totalSeconds}s) to fit under {targetSizeMb} MB with acceptable quality. Consider increasing the target size or trimming duration.
          </p>
        )}
      </div>
    </div>
  );
}
