"use client";

import { useState } from "react";
import { HardDrive, HelpCircle, Copy, Check, Sparkles, Folder } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function StorageConverter() {
  const [advertisedSize, setAdvertisedSize] = useState<number>(1);
  const [unit, setUnit] = useState<"GB" | "TB">("TB");
  const [fsType, setFsType] = useState<"ntfs" | "apfs" | "ext4" | "none">("ntfs");
  const [copied, setCopied] = useState<boolean>(false);

  // 1. Convert to Decimal Bytes (Manufacturer standard: 1 TB = 10^12 bytes, 1 GB = 10^9 bytes)
  const decimalBytes = unit === "TB" ? advertisedSize * 1_000_000_000_000 : advertisedSize * 1_000_000_000;

  // 2. Convert to Binary OS Units (Windows / OS standard: 1 GiB = 1024^3 bytes, 1 TiB = 1024^4 bytes)
  const gib = decimalBytes / (1024 * 1024 * 1024);
  const tib = decimalBytes / (1024 * 1024 * 1024 * 1024);

  // 3. File System Overhead
  let fsOverheadPct = 0;
  if (fsType === "ntfs") fsOverheadPct = 0.5; // ~0.5% MFT
  if (fsType === "apfs") fsOverheadPct = 0.3;
  if (fsType === "ext4") fsOverheadPct = 1.5;

  const usableGib = gib * (1 - fsOverheadPct / 100);
  const usableTib = tib * (1 - fsOverheadPct / 100);

  // 4. Capacity Estimators
  const rawPhotos48mp = Math.floor((usableGib * 1024) / 75); // ~75 MB per RAW photo
  const flacSongs = Math.floor((usableGib * 1024) / 35); // ~35 MB per song
  const fullHdMovies = Math.floor(usableGib / 4.5); // ~4.5 GB per 1080p movie
  const fourKMovies = Math.floor(usableGib / 25); // ~25 GB per 4K movie

  const handleCopy = async () => {
    const summary = `Usable Storage Calculation\n• Advertised Drive Size: ${advertisedSize} ${unit} (${decimalBytes.toLocaleString()} bytes)\n• Real Usable Windows Capacity: ${usableGib >= 1024 ? `${usableTib.toFixed(2)} TiB` : `${usableGib.toFixed(2)} GB`}\n• Missing Capacity Explained: ~${(100 - (usableGib / (unit === "TB" ? advertisedSize * 1024 : advertisedSize)) * 100).toFixed(1)}% difference due to Decimal (1000) vs Binary (1024) OS calculation.`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Presets */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Common Commercial Drive Sizes:
        </span>
        <div className="flex flex-wrap gap-2">
          {[
            { s: 256, u: "GB" },
            { s: 512, u: "GB" },
            { s: 1, u: "TB" },
            { s: 2, u: "TB" },
            { s: 4, u: "TB" },
            { s: 8, u: "TB" },
          ].map((p, i) => (
            <button
              key={i}
              onClick={() => { setAdvertisedSize(p.s); setUnit(p.u as any); }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                advertisedSize === p.s && unit === p.u
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent shadow-xs"
                  : "bg-background border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.s} {p.u}
            </button>
          ))}
        </div>
      </div>

      {/* Input Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Advertised Drive Capacity
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              value={advertisedSize}
              onChange={(e) => setAdvertisedSize(Math.max(1, parseFloat(e.target.value) || 1))}
              className="flex-1 px-3 py-2 text-base font-mono bg-background border border-border rounded-lg"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as any)}
              className="w-24 px-3 py-2 text-sm bg-background border border-border rounded-lg font-bold"
            >
              <option value="GB">GB</option>
              <option value="TB">TB</option>
            </select>
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            File System Format Overhead
          </label>
          <select
            value={fsType}
            onChange={(e) => setFsType(e.target.value as any)}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
          >
            <option value="ntfs">Windows NTFS (~0.5% system tables)</option>
            <option value="apfs">macOS APFS (~0.3% container)</option>
            <option value="ext4">Linux ext4 (~1.5% inode tables)</option>
            <option value="none">Raw Binary (No file system overhead)</option>
          </select>
        </div>
      </div>

      {/* Result Cards */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <HardDrive className="w-4 h-4 text-blue-500" />
            Actual Usable Operating System Storage
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
            <span className="text-xs font-semibold text-muted-foreground uppercase">Windows Reported Space</span>
            <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              {usableGib >= 1000 ? `${usableTib.toFixed(2)} TiB` : `${usableGib.toFixed(2)} GB`}
            </p>
            <span className="text-[10px] text-muted-foreground">What Windows Explorer actually displays</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Advertised Decimal Bytes</span>
            <p className="text-2xl font-bold font-mono text-foreground">
              {advertisedSize} {unit}
            </p>
            <span className="text-[10px] text-muted-foreground">{decimalBytes.toLocaleString()} bytes</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Binary Conversion Ratio</span>
            <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              93.13%
            </p>
            <span className="text-[10px] text-muted-foreground">1,000^4 vs 1,024^4 base-2 ratio</span>
          </div>
        </div>

        {/* What fits in this drive */}
        <div className="space-y-2 pt-2 border-t border-border">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Estimated Practical Storage Capacity:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2.5 bg-card rounded-lg border border-border">
              <span className="text-[10px] text-muted-foreground block">4K MOVIES (25GB)</span>
              <span className="text-sm font-bold text-foreground">~{fourKMovies.toLocaleString()}</span>
            </div>
            <div className="p-2.5 bg-card rounded-lg border border-border">
              <span className="text-[10px] text-muted-foreground block">1080P MOVIES (4.5GB)</span>
              <span className="text-sm font-bold text-foreground">~{fullHdMovies.toLocaleString()}</span>
            </div>
            <div className="p-2.5 bg-card rounded-lg border border-border">
              <span className="text-[10px] text-muted-foreground block">RAW PHOTOS (75MB)</span>
              <span className="text-sm font-bold text-foreground">~{rawPhotos48mp.toLocaleString()}</span>
            </div>
            <div className="p-2.5 bg-card rounded-lg border border-border">
              <span className="text-[10px] text-muted-foreground block">FLAC AUDIO (35MB)</span>
              <span className="text-sm font-bold text-foreground">~{flacSongs.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
