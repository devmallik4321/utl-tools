"use client";

import { useState, useMemo } from "react";
import { Binary, Copy, Check, Sparkles, Hash, Network } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function IpBinaryConverter() {
  const [ipInput, setIpInput] = useState<string>("192.168.1.1");
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const converted = useMemo(() => {
    const trimmed = ipInput.trim();

    // Check if input is dotted-decimal IPv4
    const ipParts = trimmed.split(".");
    let num = 0;
    let isValid = false;

    if (ipParts.length === 4 && ipParts.every((p) => /^\d+$/.test(p) && parseInt(p) >= 0 && parseInt(p) <= 255)) {
      num =
        (parseInt(ipParts[0]) << 24) |
        (parseInt(ipParts[1]) << 16) |
        (parseInt(ipParts[2]) << 8) |
        parseInt(ipParts[3]);
      // Handle signed bit in JS bitwise operations
      num = num >>> 0;
      isValid = true;
    } else if (/^\d+$/.test(trimmed)) {
      // Input is raw integer
      const val = parseInt(trimmed, 10);
      if (val >= 0 && val <= 4294967295) {
        num = val;
        isValid = true;
      }
    }

    if (!isValid) {
      return { isValid: false, dotted: "", binary: "", hex: "", integer: "", octal: "" };
    }

    // Convert integer back to octets
    const o1 = (num >>> 24) & 255;
    const o2 = (num >>> 16) & 255;
    const o3 = (num >>> 8) & 255;
    const o4 = num & 255;

    const dotted = `${o1}.${o2}.${o3}.${o4}`;
    const binary = [o1, o2, o3, o4].map((o) => o.toString(2).padStart(8, "0")).join(".");
    const hex = "0x" + num.toString(16).toUpperCase().padStart(8, "0");
    const integer = num.toString(10);
    const octal = "0" + num.toString(8);

    return { isValid: true, dotted, binary, hex, integer, octal };
  }, [ipInput]);

  const handleCopy = async (text: string, label: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedLabel(label);
      setTimeout(() => setCopiedLabel(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          IPv4 Address or 32-bit Integer
        </label>
        <input
          type="text"
          value={ipInput}
          onChange={(e) => setIpInput(e.target.value)}
          placeholder="e.g. 192.168.1.1 or 3232235777"
          className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
        />
        <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground pt-1">
          <span>Presets:</span>
          <button onClick={() => setIpInput("192.168.1.1")} className="hover:underline text-blue-600">192.168.1.1</button>
          <span>•</span>
          <button onClick={() => setIpInput("10.0.0.1")} className="hover:underline text-blue-600">10.0.0.1</button>
          <span>•</span>
          <button onClick={() => setIpInput("8.8.8.8")} className="hover:underline text-blue-600">8.8.8.8 (Google)</button>
          <span>•</span>
          <button onClick={() => setIpInput("2130706433")} className="hover:underline text-blue-600">127.0.0.1 Integer</button>
        </div>
      </div>

      {/* Output Grid */}
      {converted.isValid ? (
        <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Binary className="w-4 h-4 text-emerald-500" />
            IP Address Representations
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 bg-card border border-border rounded-xl flex justify-between items-center">
              <div>
                <span className="text-[10px] text-muted-foreground font-sans uppercase block">Dotted Decimal</span>
                <span className="text-sm font-bold text-foreground">{converted.dotted}</span>
              </div>
              <button
                onClick={() => handleCopy(converted.dotted, "dotted")}
                className="p-1.5 text-muted-foreground hover:text-foreground"
              >
                {copiedLabel === "dotted" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-3 bg-card border border-border rounded-xl flex justify-between items-center">
              <div>
                <span className="text-[10px] text-muted-foreground font-sans uppercase block">Decimal Integer</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{converted.integer}</span>
              </div>
              <button
                onClick={() => handleCopy(converted.integer, "integer")}
                className="p-1.5 text-muted-foreground hover:text-foreground"
              >
                {copiedLabel === "integer" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-3 bg-card border border-border rounded-xl flex justify-between items-center">
              <div>
                <span className="text-[10px] text-muted-foreground font-sans uppercase block">Hexadecimal</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{converted.hex}</span>
              </div>
              <button
                onClick={() => handleCopy(converted.hex, "hex")}
                className="p-1.5 text-muted-foreground hover:text-foreground"
              >
                {copiedLabel === "hex" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-3 bg-card border border-border rounded-xl flex justify-between items-center">
              <div>
                <span className="text-[10px] text-muted-foreground font-sans uppercase block">Octal Representation</span>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{converted.octal}</span>
              </div>
              <button
                onClick={() => handleCopy(converted.octal, "octal")}
                className="p-1.5 text-muted-foreground hover:text-foreground"
              >
                {copiedLabel === "octal" ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 32-bit Binary Octets */}
          <div className="p-4 bg-card border border-border rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-muted-foreground font-sans uppercase">32-Bit Binary Stream</span>
              <button
                onClick={() => handleCopy(converted.binary, "binary")}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1 font-sans"
              >
                {copiedLabel === "binary" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLabel === "binary" ? "Copied!" : "Copy Binary"}</span>
              </button>
            </div>
            <p className="font-mono text-base font-extrabold text-foreground tracking-widest break-all">
              {converted.binary}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 border border-rose-500/20 bg-rose-50 dark:bg-rose-950/20 rounded-xl text-xs text-rose-600 dark:text-rose-400">
          Please enter a valid IPv4 address (0.0.0.0 to 255.255.255.255) or a 32-bit integer (0 to 4294967295).
        </div>
      )}
    </div>
  );
}
