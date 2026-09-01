"use client";

import { useState } from "react";
import { Zap, Cpu, HardDrive, ShieldCheck, Copy, Check, Sparkles } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface CpuOption {
  name: string;
  tdp: number;
}

interface GpuOption {
  name: string;
  tdp: number;
}

const CPUS: CpuOption[] = [
  { name: "Intel Core i9-14900K / 13900K (253W)", tdp: 253 },
  { name: "Intel Core i7-14700K / 13700K (200W)", tdp: 200 },
  { name: "Intel Core i5-14600K / 13600K (125W)", tdp: 125 },
  { name: "AMD Ryzen 9 7950X / 7900X (170W)", tdp: 170 },
  { name: "AMD Ryzen 7 7800X3D / 9800X3D (120W - Gaming Top)", tdp: 120 },
  { name: "AMD Ryzen 5 7600X / 7600 (105W)", tdp: 105 },
  { name: "Entry CPU / Office Core i3 / Ryzen 3 (65W)", tdp: 65 },
];

const GPUS: GpuOption[] = [
  { name: "NVIDIA RTX 4090 24GB (450W)", tdp: 450 },
  { name: "NVIDIA RTX 4080 Super / 4080 (320W)", tdp: 320 },
  { name: "NVIDIA RTX 4070 Ti Super / 4070 Ti (285W)", tdp: 285 },
  { name: "NVIDIA RTX 4070 Super / 4070 (220W)", tdp: 220 },
  { name: "NVIDIA RTX 4060 Ti / 4060 (160W)", tdp: 160 },
  { name: "AMD Radeon RX 7900 XTX 24GB (355W)", tdp: 355 },
  { name: "AMD Radeon RX 7800 XT 16GB (263W)", tdp: 263 },
  { name: "Integrated Graphics / Basic GPU (30W)", tdp: 30 },
];

export function PsuWattageCalculator() {
  const [cpuIdx, setCpuIdx] = useState<number>(4); // Default 7800X3D
  const [gpuIdx, setGpuIdx] = useState<number>(3); // Default RTX 4070 Super
  const [ramSticks, setRamSticks] = useState<number>(2);
  const [m2Drives, setM2Drives] = useState<number>(2);
  const [sataDrives, setSataDrives] = useState<number>(0);
  const [coolingType, setCoolingType] = useState<"air" | "aio">("aio");
  const [overclockHeadroom, setOverclockHeadroom] = useState<number>(25); // 25% safety headroom
  const [copied, setCopied] = useState<boolean>(false);

  const selectedCpu = CPUS[cpuIdx];
  const selectedGpu = GPUS[gpuIdx];

  // Wattage components
  const cpuWatts = selectedCpu.tdp;
  const gpuWatts = selectedGpu.tdp;
  const moboWatts = 50; // Motherboard chipset & I/O
  const ramWatts = ramSticks * 6;
  const storageWatts = m2Drives * 7 + sataDrives * 10;
  const coolingWatts = coolingType === "aio" ? 35 : 15;

  const totalRawWatts = cpuWatts + gpuWatts + moboWatts + ramWatts + storageWatts + coolingWatts;
  const recommendedWatts = Math.ceil((totalRawWatts * (1 + overclockHeadroom / 100)) / 50) * 50;

  // PSU Tier Recommendation
  const getPsuRecommendation = (watts: number) => {
    if (watts <= 550) return { size: "550W - 650W", rating: "80+ Bronze / Gold", note: "Budget Gaming & Productivity" };
    if (watts <= 750) return { size: "750W - 850W", rating: "80+ Gold", note: "Recommended Mid-to-High Gaming Rig" };
    if (watts <= 1000) return { size: "1000W", rating: "80+ Gold / Platinum (ATX 3.0)", note: "Enthusiast High-End Build (RTX 4090 / 4080)" };
    return { size: "1200W+", rating: "80+ Platinum / Titanium (ATX 3.0 PCIe 5.0)", note: "Dual GPU / Heavy Workstation" };
  };

  const psuRec = getPsuRecommendation(recommendedWatts);

  const handleCopy = async () => {
    const summary = `PC Power Supply (PSU) Calculation\n• CPU: ${selectedCpu.name}\n• GPU: ${selectedGpu.name}\n• Total Raw Peak Draw: ${totalRawWatts} Watts\n• Recommended PSU: ${recommendedWatts}W (${psuRec.size})\n• Recommended Efficiency: ${psuRec.rating} with ${overclockHeadroom}% safety buffer`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Component Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <span className="text-[11px] text-muted-foreground font-mono">CPU Peak Draw: {cpuWatts}W</span>
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
          <span className="text-[11px] text-muted-foreground font-mono">GPU Peak Draw: {gpuWatts}W</span>
        </div>
      </div>

      {/* Extra System Hardware */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-muted/20 border border-border rounded-xl">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">RAM Sticks</label>
          <select
            value={ramSticks}
            onChange={(e) => setRamSticks(parseInt(e.target.value))}
            className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg"
          >
            <option value={2}>2 Sticks (16GB/32GB)</option>
            <option value={4}>4 Sticks (64GB/128GB)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">M.2 NVMe SSDs</label>
          <select
            value={m2Drives}
            onChange={(e) => setM2Drives(parseInt(e.target.value))}
            className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg"
          >
            <option value={1}>1 Drive</option>
            <option value={2}>2 Drives</option>
            <option value={3}>3 Drives</option>
            <option value={4}>4 Drives</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">CPU Cooler</label>
          <select
            value={coolingType}
            onChange={(e) => setCoolingType(e.target.value as any)}
            className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg"
          >
            <option value="aio">Liquid AIO Cooler (240/360mm)</option>
            <option value="air">Air Tower Cooler</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-foreground">Safety Buffer</label>
          <select
            value={overclockHeadroom}
            onChange={(e) => setOverclockHeadroom(parseInt(e.target.value))}
            className="w-full px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg"
          >
            <option value={20}>+20% Standard Headroom</option>
            <option value={25}>+25% Recommended Buffer</option>
            <option value={35}>+35% Overclocking Headroom</option>
          </select>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Recommended Power Supply Specification
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy PSU Spec"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Recommended PSU Wattage</span>
            <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              {recommendedWatts}W
            </p>
            <span className="text-[10px] text-muted-foreground">{psuRec.size} Rated Power Supply</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Estimated Raw Peak Draw</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              {totalRawWatts}W
            </p>
            <span className="text-[10px] text-muted-foreground">CPU ({cpuWatts}W) + GPU ({gpuWatts}W) + System ({moboWatts + ramWatts + storageWatts + coolingWatts}W)</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Recommended Efficiency</span>
            <p className="text-xl font-bold text-foreground">
              {psuRec.rating}
            </p>
            <span className="text-[10px] text-muted-foreground">{psuRec.note}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
