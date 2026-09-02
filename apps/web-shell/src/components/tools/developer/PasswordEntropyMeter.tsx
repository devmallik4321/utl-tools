"use client";

import { useState, useMemo } from "react";
import { KeyRound, Eye, EyeOff, ShieldCheck, ShieldAlert, Copy, Check, Sparkles } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function PasswordEntropyMeter() {
  const [password, setPassword] = useState<string>("Correct-Horse-Battery-Staple-2026!");
  const [showPassword, setShowPassword] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const { length, poolSize, entropyBits, crackTime, strengthTier, tierColor } = useMemo(() => {
    if (!password) {
      return { length: 0, poolSize: 0, entropyBits: 0, crackTime: "Instant", strengthTier: "Empty", tierColor: "text-muted-foreground" };
    }

    let pool = 0;
    if (/[a-z]/.test(password)) pool += 26;
    if (/[A-Z]/.test(password)) pool += 26;
    if (/[0-9]/.test(password)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(password)) pool += 33; // Standard ASCII symbols

    const len = password.length;
    const bits = pool > 0 ? len * (Math.log2(pool)) : 0;

    // Brute force speed: 100 billion (10^11) guesses/sec
    const guessesPerSec = 1e11;
    const combinations = Math.pow(pool, len);
    const seconds = combinations / (2 * guessesPerSec);

    let timeStr = "Instant";
    if (seconds > 31536000 * 1e9) timeStr = `${(seconds / (31536000 * 1e9)).toFixed(0)} Billion Years`;
    else if (seconds > 31536000 * 1e6) timeStr = `${(seconds / (31536000 * 1e6)).toFixed(0)} Million Years`;
    else if (seconds > 31536000) timeStr = `${(seconds / 31536000).toFixed(0)} Years`;
    else if (seconds > 86400) timeStr = `${(seconds / 86400).toFixed(0)} Days`;
    else if (seconds > 3600) timeStr = `${(seconds / 3600).toFixed(0)} Hours`;
    else if (seconds > 60) timeStr = `${(seconds / 60).toFixed(0)} Minutes`;
    else if (seconds > 1) timeStr = `${seconds.toFixed(0)} Seconds`;

    let tier = "Very Weak";
    let color = "text-rose-600 dark:text-rose-400";

    if (bits >= 100) {
      tier = "Cryptographically Bulletproof";
      color = "text-emerald-500 dark:text-emerald-400";
    } else if (bits >= 65) {
      tier = "Very Strong";
      color = "text-emerald-600 dark:text-emerald-400";
    } else if (bits >= 45) {
      tier = "Moderate / Adequate";
      color = "text-blue-600 dark:text-blue-400";
    } else if (bits >= 30) {
      tier = "Weak";
      color = "text-amber-600 dark:text-amber-400";
    }

    return {
      length: len,
      poolSize: pool,
      entropyBits: bits,
      crackTime: timeStr,
      strengthTier: tier,
      tierColor: color,
    };
  }, [password]);

  const handleCopy = async () => {
    const summary = `Password Entropy Audit\n• Length: ${length} characters\n• Character Pool: ${poolSize} possible glyphs\n• Shannon Entropy: ${entropyBits.toFixed(1)} bits\n• Strength Rating: ${strengthTier}\n• Est. GPU Crack Time: ${crackTime}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Password Input */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <label className="font-semibold uppercase text-foreground">Password to Evaluate</label>
          <span className="font-mono">Evaluated in memory only</span>
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-3 pr-10 py-2 text-sm font-mono bg-background border border-border rounded-lg text-foreground"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-emerald-500" />
            Shannon Entropy &amp; Brute-Force Resistance
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Report"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Entropy</span>
            <p className="text-2xl font-extrabold text-foreground">{entropyBits.toFixed(1)} Bits</p>
            <span className="text-[10px] text-muted-foreground font-sans">E = L × log₂(R)</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">Security Rating</span>
            <p className={`text-base font-bold ${tierColor}`}>{strengthTier}</p>
            <span className="text-[10px] text-muted-foreground font-sans">{length} chars, pool of {poolSize}</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1 col-span-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">GPU Brute Force Time</span>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{crackTime}</p>
            <span className="text-[10px] text-muted-foreground font-sans">At 100 Billion attempts/sec</span>
          </div>
        </div>
      </div>
    </div>
  );
}
