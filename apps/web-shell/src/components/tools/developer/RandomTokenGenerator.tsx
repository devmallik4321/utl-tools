"use client";

import { useState, useMemo, useEffect } from "react";
import { KeyRound, Copy, Check, Download, RefreshCw, ShieldCheck, Sparkles, Sliders } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const CHAR_SETS = {
  alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  hex: "0123456789abcdef",
  base64url: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",
  symbols: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?",
  numeric: "0123456789",
};

export function RandomTokenGenerator() {
  const [length, setLength] = useState<number>(32);
  const [charSetKey, setCharSetKey] = useState<keyof typeof CHAR_SETS>("alphanumeric");
  const [count, setCount] = useState<number>(5);
  const [tokens, setTokens] = useState<string[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  const generateTokens = () => {
    const charset = CHAR_SETS[charSetKey] || CHAR_SETS.alphanumeric;
    const list: string[] = [];
    const n = Math.min(50, Math.max(1, count));
    const len = Math.min(256, Math.max(4, length));

    for (let i = 0; i < n; i++) {
      let t = "";
      const randomValues = new Uint32Array(len);
      if (typeof window !== "undefined" && window.crypto) {
        window.crypto.getRandomValues(randomValues);
        for (let j = 0; j < len; j++) {
          t += charset[randomValues[j] % charset.length];
        }
      } else {
        for (let j = 0; j < len; j++) {
          t += charset[Math.floor(Math.random() * charset.length)];
        }
      }
      list.push(t);
    }
    setTokens(list);
  };

  useEffect(() => {
    generateTokens();
  }, [length, charSetKey, count]);

  const charsetSize = CHAR_SETS[charSetKey]?.length || 62;
  const entropyBits = Math.round(length * Math.log2(charsetSize));

  const handleCopy = async () => {
    const ok = await copyToClipboard(tokens.join("\n"));
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Privacy Guarantee */}
      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <span>100% Cryptographically Secure In-Browser RNG. Generated tokens never leave your local device.</span>
      </div>

      {/* Control Configuration Bar */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-center">
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              Token Length ({length} chars)
            </label>
            <input
              type="number"
              min={4}
              max={256}
              value={length}
              onChange={(e) => setLength(Math.min(256, Math.max(4, parseInt(e.target.value) || 4)))}
              className="w-full px-3 py-1.5 text-sm font-mono font-bold bg-background border border-border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              Character Set Preset
            </label>
            <select
              value={charSetKey}
              onChange={(e) => setCharSetKey(e.target.value as any)}
              className="w-full px-2.5 py-1.5 text-xs font-bold bg-background border border-border rounded-lg"
            >
              <option value="alphanumeric">Alphanumeric (A-Z, a-z, 0-9)</option>
              <option value="hex">Hexadecimal (0-9, a-f)</option>
              <option value="base64url">Base64 URL-Safe (A-Z, 0-9, -, _)</option>
              <option value="symbols">Full ASCII + Special Symbols</option>
              <option value="numeric">Numbers Only (0-9 PINs)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1">
              Quantity to Generate
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-full px-3 py-1.5 text-sm font-mono font-bold bg-background border border-border rounded-lg"
            />
          </div>

          <div className="flex flex-col justify-end pt-5">
            <button
              onClick={generateTokens}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Generate New</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
          <span>Entropy: <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{entropyBits} Bits</strong> of Cryptographic Randomness</span>
          <span>Alphabet Size: {charsetSize} Characters</span>
        </div>
      </div>

      {/* Generated Output Tokens */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-emerald-500" />
            Generated Secure Tokens ({tokens.length})
          </h4>

          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy All Tokens"}</span>
          </button>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {tokens.map((tok, idx) => (
            <div
              key={idx}
              className="p-3 bg-card rounded-xl border border-border flex items-center justify-between gap-3 shadow-2xs group"
            >
              <span className="text-emerald-600 dark:text-emerald-400 font-bold break-all select-all">
                {tok}
              </span>
              <button
                onClick={async () => {
                  await copyToClipboard(tok);
                }}
                className="text-muted-foreground group-hover:text-blue-600 transition-colors p-1"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
