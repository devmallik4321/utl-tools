"use client";

import { useState, useMemo } from "react";
import { ShieldCheck, Copy, Check, Sparkles, Cpu, Clock, AlertTriangle } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function BcryptCostCalculator() {
  const [costFactor, setCostFactor] = useState<number>(12);
  const [copied, setCopied] = useState<boolean>(false);

  const { iterations, estimatedLatencyMs, hashesPerSec, owaspRating } = useMemo(() => {
    const iters = Math.pow(2, costFactor);
    // Baseline: cost factor 10 takes ~80-100ms on a standard server core
    const baseLatencyAt10 = 90; // ms
    const latency = baseLatencyAt10 * Math.pow(2, costFactor - 10);
    const hps = latency > 0 ? (1000 / latency).toFixed(1) : "0";

    let rating = "RECOMMENDED";
    let ratingColor = "text-emerald-600 dark:text-emerald-400";

    if (costFactor < 10) {
      rating = "INSECURE (Too fast, vulnerable to GPU brute-force)";
      ratingColor = "text-rose-600 dark:text-rose-400";
    } else if (costFactor === 10 || costFactor === 11) {
      rating = "MINIMUM ACCEPTABLE (Acceptable for high-throughput)";
      ratingColor = "text-amber-600 dark:text-amber-400";
    } else if (costFactor >= 12 && costFactor <= 14) {
      rating = "OWASP RECOMMENDED (Sweet spot for security & UX)";
      ratingColor = "text-emerald-600 dark:text-emerald-400";
    } else {
      rating = "EXCESSIVE (Risk of DoS / severe CPU bottleneck)";
      ratingColor = "text-purple-600 dark:text-purple-400";
    }

    return {
      iterations: iters,
      estimatedLatencyMs: latency,
      hashesPerSec: hps,
      owaspRating: rating,
      owaspColor: ratingColor,
    };
  }, [costFactor]);

  const handleCopy = async () => {
    const summary = `Bcrypt Work Factor Benchmark (Cost: ${costFactor})\n• Key Derivation Iterations: ${iterations.toLocaleString()} rounds (2^${costFactor})\n• Estimated Verification Latency: ~${estimatedLatencyMs.toFixed(0)} ms per hash\n• Single Core Hash Throughput: ~${hashesPerSec} hashes/sec\n• OWASP Recommendation: ${owaspRating}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Slider & Input */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <div className="flex justify-between items-center text-xs">
          <label className="font-semibold text-foreground uppercase tracking-wider">
            Bcrypt Cost Factor (Work Factor)
          </label>
          <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
            Cost {costFactor} (2^{costFactor})
          </span>
        </div>
        <input
          type="range"
          min={4}
          max={16}
          value={costFactor}
          onChange={(e) => setCostFactor(parseInt(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
          <span>4 (Fast / Insecure)</span>
          <span>10 (Minimum)</span>
          <span>12 (OWASP Default)</span>
          <span>16 (Extremely Heavy)</span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-emerald-500" />
            Cryptographic Work Factor &amp; Latency Analysis
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Benchmark"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Key Iteration Rounds</span>
            <p className="text-3xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
              {iterations.toLocaleString()}
            </p>
            <span className="text-[10px] text-muted-foreground">2^{costFactor} key expansion loops</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Est. Server Latency</span>
            <p className="text-3xl font-extrabold font-mono text-foreground">
              ~{estimatedLatencyMs.toFixed(0)} <span className="text-sm font-normal text-muted-foreground">ms</span>
            </p>
            <span className="text-[10px] text-muted-foreground">Per login password verification</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Max Hashes / Sec / Core</span>
            <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              {hashesPerSec}
            </p>
            <span className="text-[10px] text-muted-foreground">Single CPU core capacity</span>
          </div>
        </div>

        {/* OWASP Status */}
        <div className="p-4 bg-card rounded-xl border border-border space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase">Security Evaluation</span>
          <p className="text-sm font-bold text-foreground">{owaspRating}</p>
          <span className="text-[10px] text-muted-foreground block">
            OWASP currently recommends a minimum work factor of 10, with 12 being the optimal balance between brute-force protection and server response time.
          </span>
        </div>
      </div>
    </div>
  );
}
