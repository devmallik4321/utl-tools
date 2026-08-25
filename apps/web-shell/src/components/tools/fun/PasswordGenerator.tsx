"use client";

import { useState, useEffect } from "react";
import { Copy, Check, RefreshCw, Shield, KeyRound, Lock, ShieldCheck, Clock } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const AMBIGUOUS = /[0OIl1|]/g;

export function PasswordGenerator() {
  const [length, setLength] = useState<number>(18);
  const [includeUpper, setIncludeUpper] = useState<boolean>(true);
  const [includeLower, setIncludeLower] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState<boolean>(true);
  const [password, setPassword] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const generatePassword = () => {
    let charset = "";
    if (includeUpper) charset += UPPERCASE;
    if (includeLower) charset += LOWERCASE;
    if (includeNumbers) charset += NUMBERS;
    if (includeSymbols) charset += SYMBOLS;

    if (excludeAmbiguous) {
      charset = charset.replace(AMBIGUOUS, "");
    }

    if (!charset) {
      setPassword("");
      return;
    }

    let result = "";
    const cryptoObj = typeof window !== "undefined" ? window.crypto : null;

    if (cryptoObj && cryptoObj.getRandomValues) {
      const values = new Uint32Array(length);
      cryptoObj.getRandomValues(values);
      for (let i = 0; i < length; i++) {
        result += charset[values[i] % charset.length];
      }
    } else {
      for (let i = 0; i < length; i++) {
        result += charset[Math.floor(Math.random() * charset.length)];
      }
    }

    setPassword(result);
  };

  useEffect(() => {
    generatePassword();
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols, excludeAmbiguous]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(password);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Calculate Entropy
  const getPoolSize = () => {
    let pool = 0;
    if (includeUpper) pool += 26;
    if (includeLower) pool += 26;
    if (includeNumbers) pool += 10;
    if (includeSymbols) pool += 26;
    return pool || 1;
  };
  const entropy = Math.round(length * Math.log2(getPoolSize()));

  const getStrengthData = () => {
    if (entropy < 45) {
      return {
        label: "Weak",
        color: "text-rose-500",
        bg: "bg-rose-500",
        percent: 25,
        crackTime: "Minutes to Hours",
        verdict: "Vulnerable to automated dictionary attacks.",
      };
    }
    if (entropy < 65) {
      return {
        label: "Moderate",
        color: "text-amber-500",
        bg: "bg-amber-500",
        percent: 50,
        crackTime: "Several Months",
        verdict: "Acceptable for non-critical accounts.",
      };
    }
    if (entropy < 90) {
      return {
        label: "Strong",
        color: "text-emerald-500",
        bg: "bg-emerald-500",
        percent: 80,
        crackTime: "Thousands of Years",
        verdict: "Exceeds standard enterprise requirements.",
      };
    }
    return {
      label: "Very Strong (Unhackable)",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-600",
      percent: 100,
      crackTime: "Trillions of Years",
      verdict: "Mathematically immune to brute-force supercomputers.",
    };
  };

  const strength = getStrengthData();

  return (
    <div className="space-y-6">
      {/* Generated Password Banner */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-blue-500" />
            Generated Secure Password
          </span>
          <span className={`text-xs font-bold ${strength.color}`}>
            {strength.label} (~{entropy} bits entropy)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={password}
            className="flex-1 px-4 py-3 text-base sm:text-lg font-mono font-bold bg-muted/40 border border-border rounded-xl focus:outline-none select-all text-foreground tracking-wide"
          />
          <button
            type="button"
            onClick={generatePassword}
            className="p-3 bg-muted hover:bg-muted/80 border border-border rounded-xl text-foreground transition-colors"
            title="Generate new password"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="px-5 py-3 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold text-sm rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </button>
        </div>

        {/* Strength Progress Bar */}
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${strength.bg}`}
            style={{ width: `${strength.percent}%` }}
          />
        </div>
      </div>

      {/* Configuration Sliders & Toggles */}
      <div className="p-6 bg-card border border-border rounded-xl space-y-5">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Password Length: <span className="text-sm font-bold font-mono text-blue-600 dark:text-blue-400">{length} characters</span>
            </label>
            <div className="flex gap-1.5">
              {[12, 16, 24, 32].map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLength(l)}
                  className={`px-2 py-0.5 text-xs rounded border ${
                    length === l ? "bg-blue-600 text-white border-blue-600" : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <input
            type="range"
            min={6}
            max={64}
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
          <label className="flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-xl cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeUpper}
              onChange={(e) => setIncludeUpper(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-foreground block">Uppercase Letters</span>
              <span className="text-xs text-muted-foreground font-mono">A-Z</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-xl cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeLower}
              onChange={(e) => setIncludeLower(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-foreground block">Lowercase Letters</span>
              <span className="text-xs text-muted-foreground font-mono">a-z</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-xl cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeNumbers}
              onChange={(e) => setIncludeNumbers(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-foreground block">Numbers</span>
              <span className="text-xs text-muted-foreground font-mono">0-9</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-muted/30 border border-border rounded-xl cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeSymbols}
              onChange={(e) => setIncludeSymbols(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-foreground block">Special Symbols</span>
              <span className="text-xs text-muted-foreground font-mono">!@#$%^&*</span>
            </div>
          </label>
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={excludeAmbiguous}
              onChange={(e) => setExcludeAmbiguous(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Exclude ambiguous characters (e.g. 0, O, 1, l, I) for easy reading</span>
          </label>
        </div>
      </div>

      {/* Security Analysis & Crack Time Table */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-card border border-border rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>Estimated Brute-Force Time</span>
          </div>
          <p className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            {strength.crackTime}
          </p>
          <span className="text-xs text-muted-foreground block leading-relaxed">
            At 100 billion guesses/second on modern GPU clusters. {strength.verdict}
          </span>
        </div>

        <div className="p-5 bg-card border border-border rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>NIST 800-63B Guidelines</span>
          </div>
          <span className="text-xs text-muted-foreground block leading-relaxed">
            NIST recommends <strong>length over arbitrary complexity rules</strong>. A 16+ character random password provides far higher mathematical security than an 8-character password with forced symbols.
          </span>
        </div>
      </div>
    </div>
  );
}
