"use client";

import { useState } from "react";
import { Binary, Copy, Check, Sparkles, Hash, Layers } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function BaseConverter() {
  const [decVal, setDecVal] = useState<number>(255);
  const [copied, setCopied] = useState<string | null>(null);

  // Derive all representations from integer decVal
  const hexStr = Number.isFinite(decVal) ? decVal.toString(16).toUpperCase() : "0";
  const decStr = Number.isFinite(decVal) ? decVal.toString(10) : "0";
  const octStr = Number.isFinite(decVal) ? decVal.toString(8) : "0";
  const rawBin = Number.isFinite(decVal) ? decVal.toString(2) : "0";

  // Format binary with 4-bit nibble spaces (e.g. 1111 1111)
  const padLength = Math.max(8, Math.ceil(rawBin.length / 4) * 4);
  const paddedBin = rawBin.padStart(padLength, "0");
  const formattedBin = paddedBin.match(/.{1,4}/g)?.join(" ") || rawBin;

  // ASCII character if printable (32 to 126)
  const asciiChar = decVal >= 32 && decVal <= 126 ? String.fromCharCode(decVal) : null;

  const handleCopy = async (key: string, val: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleHexChange = (str: string) => {
    const clean = str.replace(/[^0-9a-fA-F]/g, "");
    if (!clean) setDecVal(0);
    else {
      const parsed = parseInt(clean, 16);
      if (!isNaN(parsed)) setDecVal(parsed);
    }
  };

  const handleDecChange = (str: string) => {
    const clean = str.replace(/[^0-9]/g, "");
    if (!clean) setDecVal(0);
    else {
      const parsed = parseInt(clean, 10);
      if (!isNaN(parsed)) setDecVal(parsed);
    }
  };

  const handleBinChange = (str: string) => {
    const clean = str.replace(/[^01]/g, "");
    if (!clean) setDecVal(0);
    else {
      const parsed = parseInt(clean, 2);
      if (!isNaN(parsed)) setDecVal(parsed);
    }
  };

  const handleOctChange = (str: string) => {
    const clean = str.replace(/[^0-7]/g, "");
    if (!clean) setDecVal(0);
    else {
      const parsed = parseInt(clean, 8);
      if (!isNaN(parsed)) setDecVal(parsed);
    }
  };

  return (
    <div className="space-y-6">
      {/* 4-Way Conversion Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Decimal (Base 10) */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Decimal (Base 10)
            </label>
            <button
              onClick={() => handleCopy("dec", decStr)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copied === "dec" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>Copy</span>
            </button>
          </div>
          <input
            type="text"
            value={decStr}
            onChange={(e) => handleDecChange(e.target.value)}
            className="w-full px-3 py-2.5 text-lg font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Standard base-10 numerical digits (0–9)</span>
        </div>

        {/* Hexadecimal (Base 16) */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Hexadecimal (Base 16)
            </label>
            <button
              onClick={() => handleCopy("hex", `0x${hexStr}`)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copied === "hex" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>Copy 0x</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-muted-foreground font-bold">0x</span>
            <input
              type="text"
              value={hexStr}
              onChange={(e) => handleHexChange(e.target.value)}
              className="w-full px-3 py-2.5 text-lg font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400 uppercase"
            />
          </div>
          <span className="text-[10px] text-muted-foreground">Hex digits (0–9, A–F)</span>
        </div>

        {/* Binary (Base 2) */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Binary (Base 2)
            </label>
            <button
              onClick={() => handleCopy("bin", rawBin)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copied === "bin" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>Copy</span>
            </button>
          </div>
          <input
            type="text"
            value={rawBin}
            onChange={(e) => handleBinChange(e.target.value)}
            className="w-full px-3 py-2.5 text-base font-mono font-bold bg-background border border-border rounded-lg text-blue-600 dark:text-blue-400"
          />
          <span className="text-[10px] text-muted-foreground font-mono">Nibbles: {formattedBin}</span>
        </div>

        {/* Octal (Base 8) */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Octal (Base 8)
            </label>
            <button
              onClick={() => handleCopy("oct", octStr)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copied === "oct" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>Copy</span>
            </button>
          </div>
          <input
            type="text"
            value={octStr}
            onChange={(e) => handleOctChange(e.target.value)}
            className="w-full px-3 py-2.5 text-lg font-mono font-bold bg-background border border-border rounded-lg text-purple-600 dark:text-purple-400"
          />
          <span className="text-[10px] text-muted-foreground">Octal digits (0–7)</span>
        </div>
      </div>

      {/* Bit Breakdown & ASCII Info */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Binary className="w-4 h-4 text-blue-500" />
          Bitwise Breakdown &amp; Encoding
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 bg-card rounded-lg border border-border space-y-1">
            <span className="text-[10px] text-muted-foreground block font-sans">BIT LENGTH</span>
            <p className="text-lg font-bold text-foreground">{rawBin.length} Bits</p>
          </div>

          <div className="p-3 bg-card rounded-lg border border-border space-y-1">
            <span className="text-[10px] text-muted-foreground block font-sans">BYTES REQUIRED</span>
            <p className="text-lg font-bold text-foreground">{Math.ceil(rawBin.length / 8)} Byte(s)</p>
          </div>

          <div className="p-3 bg-card rounded-lg border border-border space-y-1">
            <span className="text-[10px] text-muted-foreground block font-sans">ASCII CHAR</span>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {asciiChar ? `'${asciiChar}'` : "Non-Printable"}
            </p>
          </div>

          <div className="p-3 bg-card rounded-lg border border-border space-y-1">
            <span className="text-[10px] text-muted-foreground block font-sans">TWO'S COMPLEMENT (8-BIT)</span>
            <p className="text-lg font-bold text-foreground">{(decVal & 0xff).toString(2).padStart(8, "0")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
