"use client";

import { useState } from "react";
import { Cpu, Zap, Monitor, CheckCircle, AlertTriangle, ShieldAlert, Copy, Check, Sparkles } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface HardwareTier {
  name: string;
  score: number; // Relative compute power benchmark index
}

const CPUS: HardwareTier[] = [
  { name: "AMD Ryzen 7 7800X3D / 9800X3D (Top Tier Gaming)", score: 100 },
  { name: "Intel Core i9-14900K / 13900K", score: 98 },
  { name: "AMD Ryzen 9 7950X / 7900X", score: 94 },
  { name: "Intel Core i7-14700K / 13700K", score: 92 },
  { name: "Intel Core i5-14600K / 13600K / AMD 7600X", score: 82 },
  { name: "AMD Ryzen 5 5600X / Intel Core i5-12400F", score: 62 },
  { name: "AMD Ryzen 5 3600 / Intel Core i7-8700K", score: 45 },
  { name: "Older 4-Core CPU (Core i7-7700K / i5-8400)", score: 30 },
];

const GPUS: HardwareTier[] = [
  { name: "NVIDIA GeForce RTX 4090 24GB", score: 100 },
  { name: "NVIDIA GeForce RTX 4080 Super / RX 7900 XTX", score: 82 },
  { name: "NVIDIA GeForce RTX 4070 Ti Super / RX 7900 XT", score: 72 },
  { name: "NVIDIA GeForce RTX 4070 Super / RX 7800 XT", score: 60 },
  { name: "NVIDIA GeForce RTX 4060 Ti / RX 6700 XT", score: 42 },
  { name: "NVIDIA GeForce RTX 4060 / RTX 3060", score: 32 },
  { name: "NVIDIA GeForce GTX 1660 Super / GTX 1070", score: 18 },
  { name: "Entry Integrated Graphics (Intel UHD / Radeon 680M)", score: 6 },
];

export function PcBottleneckCalculator() {
  const [cpuIdx, setCpuIdx] = useState<number>(0); // 7800X3D
  const [gpuIdx, setGpuIdx] = useState<number>(3); // RTX 4070 Super
  const [resolution, setResolution] = useState<"1080p" | "1440p" | "4k">("1440p");
  const [copied, setCopied] = useState<boolean>(false);

  const selectedCpu = CPUS[cpuIdx];
  const selectedGpu = GPUS[gpuIdx];

  // Resolution weight: 1080p is CPU-heavy (resolution weight 0.6 on GPU), 4K is GPU-heavy (resolution weight 1.5 on GPU)
  const resMultiplier = resolution === "1080p" ? 0.7 : resolution === "1440p" ? 1.0 : 1.45;
  const effectiveGpuDemand = selectedGpu.score * resMultiplier;

  // Bottleneck calculation
  const diff = effectiveGpuDemand - selectedCpu.score;
  let bottleneckPct = Math.min(65, Math.abs(Math.round(diff * 0.6)));
  let isCpuBottleneck = diff > 8;
  let isGpuBottleneck = diff < -12;
  let isBalanced = !isCpuBottleneck && !isGpuBottleneck;

  const getStatusInfo = () => {
    if (isBalanced) {
      return {
        status: "Well Balanced Pair",
        color: "text-emerald-600 dark:text-emerald-400",
        badgeBg: "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300",
        icon: CheckCircle,
        advice: `Your ${selectedCpu.name} and ${selectedGpu.name} are well-matched at ${resolution.toUpperCase()}. Both components will operate near full efficiency with minimal frame pacing stutter.`,
      };
    }
    if (isCpuBottleneck) {
      return {
        status: "CPU Bottleneck Detected",
        color: "text-amber-600 dark:text-amber-400",
        badgeBg: "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300",
        icon: AlertTriangle,
        advice: `At ${resolution.toUpperCase()}, your graphics card (${selectedGpu.name}) is capable of pushing more frames than the CPU can feed it. Playing at a higher resolution (e.g. 1440p or 4K) or upgrading the CPU will maximize your GPU investment.`,
      };
    }
    return {
      status: "GPU Bottleneck (Normal for 4K / Max Settings)",
      color: "text-blue-600 dark:text-blue-400",
      badgeBg: "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300",
      icon: CheckCircle,
      advice: `At ${resolution.toUpperCase()}, your graphics card will be utilized at 99-100%, which is the ideal scenario for AAA cinematic gaming. Your CPU has plenty of headroom.`,
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  const handleCopy = async () => {
    const summary = `PC Bottleneck Analysis\n• CPU: ${selectedCpu.name}\n• GPU: ${selectedGpu.name}\n• Resolution: ${resolution.toUpperCase()}\n• Result: ${statusInfo.status} (~${bottleneckPct}%)\n• Assessment: ${statusInfo.advice}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Component Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CPU Selector */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-blue-500" />
            1. Processor (CPU)
          </label>
          <select
            value={cpuIdx}
            onChange={(e) => setCpuIdx(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg"
          >
            {CPUS.map((c, i) => (
              <option key={i} value={i}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* GPU Selector */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            2. Graphics Card (GPU)
          </label>
          <select
            value={gpuIdx}
            onChange={(e) => setGpuIdx(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg"
          >
            {GPUS.map((g, i) => (
              <option key={i} value={i}>{g.name}</option>
            ))}
          </select>
        </div>

        {/* Resolution Selector */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Monitor className="w-4 h-4 text-purple-500" />
            3. Gaming Resolution
          </label>
          <select
            value={resolution}
            onChange={(e) => setResolution(e.target.value as any)}
            className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg font-bold"
          >
            <option value="1080p">1080p Full HD (CPU Sensitive)</option>
            <option value="1440p">1440p Quad HD (Balanced Sweetspot)</option>
            <option value="4k">4K Ultra HD (GPU Bound)</option>
          </select>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
            Bottleneck Assessment ({resolution.toUpperCase()})
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Report"}</span>
          </button>
        </div>

        {/* Main Status Callout */}
        <div className="p-5 bg-card rounded-xl border border-border space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase">Estimated Bottleneck</span>
              <p className={`text-2xl sm:text-3xl font-extrabold ${statusInfo.color}`}>
                {statusInfo.status}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono self-start sm:self-center ${statusInfo.badgeBg}`}>
              ~{bottleneckPct}% Discrepancy
            </span>
          </div>
          <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed border-t border-border pt-3">
            {statusInfo.advice}
          </p>
        </div>

        {/* Resolution Dynamics Explainer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className={`p-3 rounded-lg border ${resolution === "1080p" ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30" : "border-border bg-card"}`}>
            <span className="font-bold text-foreground block">1080p Resolution</span>
            <p className="text-[11px] text-muted-foreground mt-1">High FPS target places higher demand on single-core CPU draw calls.</p>
          </div>
          <div className={`p-3 rounded-lg border ${resolution === "1440p" ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30" : "border-border bg-card"}`}>
            <span className="font-bold text-foreground block">1440p Resolution</span>
            <p className="text-[11px] text-muted-foreground mt-1">Optimal modern gaming sweet spot balancing CPU and GPU load.</p>
          </div>
          <div className={`p-3 rounded-lg border ${resolution === "4k" ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30" : "border-border bg-card"}`}>
            <span className="font-bold text-foreground block">4K Resolution</span>
            <p className="text-[11px] text-muted-foreground mt-1">Nearly 100% GPU-bound due to rendering 8.3 million pixels per frame.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
