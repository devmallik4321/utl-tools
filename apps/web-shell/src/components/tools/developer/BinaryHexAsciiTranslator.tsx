"use client";

import { useState } from "react";
import { Binary, Copy, Check, Sparkles, RefreshCw } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function BinaryHexAsciiTranslator() {
  const [textVal, setTextVal] = useState<string>("Hello UTL.tools!");
  const [binaryVal, setBinaryVal] = useState<string>(
    "01001000 01100101 01101100 01101100 01101111 00100000 01010101 01010100 01001100 00101110 01110100 01101111 01101111 01101100 01110011 00100001"
  );
  const [hexVal, setHexVal] = useState<string>("48 65 6c 6c 6f 20 55 54 4c 2e 74 6f 6f 6c 73 21");
  const [decVal, setDecVal] = useState<string>("72 101 108 108 111 32 85 84 76 46 116 111 111 108 115 33");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const updateFromText = (txt: string) => {
    setTextVal(txt);
    const bytes: number[] = [];
    for (let i = 0; i < txt.length; i++) {
      bytes.push(txt.charCodeAt(i));
    }
    setBinaryVal(bytes.map((b) => b.toString(2).padStart(8, "0")).join(" "));
    setHexVal(bytes.map((b) => b.toString(16).padStart(2, "0")).join(" "));
    setDecVal(bytes.join(" "));
  };

  const updateFromBinary = (bin: string) => {
    setBinaryVal(bin);
    const clean = bin.replace(/[^01]/g, "");
    const bytes: number[] = [];
    for (let i = 0; i < clean.length; i += 8) {
      const chunk = clean.substr(i, 8);
      if (chunk.length === 8) {
        bytes.push(parseInt(chunk, 2));
      }
    }
    setTextVal(bytes.map((b) => String.fromCharCode(b)).join(""));
    setHexVal(bytes.map((b) => b.toString(16).padStart(2, "0")).join(" "));
    setDecVal(bytes.join(" "));
  };

  const updateFromHex = (hex: string) => {
    setHexVal(hex);
    const clean = hex.replace(/[^0-9a-fA-F]/g, "");
    const bytes: number[] = [];
    for (let i = 0; i < clean.length; i += 2) {
      const chunk = clean.substr(i, 2);
      if (chunk.length === 2) {
        bytes.push(parseInt(chunk, 16));
      }
    }
    setTextVal(bytes.map((b) => String.fromCharCode(b)).join(""));
    setBinaryVal(bytes.map((b) => b.toString(2).padStart(8, "0")).join(" "));
    setDecVal(bytes.join(" "));
  };

  const handleCopy = async (val: string, key: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 Multi-Format Synchronized Translation Panes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Plain Text */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-semibold uppercase text-foreground">ASCII Plain Text</label>
            <button
              onClick={() => handleCopy(textVal, "text")}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "text" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey === "text" ? "Copied!" : "Copy"}</span>
            </button>
          </div>
          <textarea
            value={textVal}
            onChange={(e) => updateFromText(e.target.value)}
            rows={4}
            placeholder="Type plaintext..."
            className="w-full px-3 py-2 text-sm font-mono bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        {/* Binary */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-semibold uppercase text-foreground">Binary Bitstream (8-bit)</label>
            <button
              onClick={() => handleCopy(binaryVal, "bin")}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "bin" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey === "bin" ? "Copied!" : "Copy"}</span>
            </button>
          </div>
          <textarea
            value={binaryVal}
            onChange={(e) => updateFromBinary(e.target.value)}
            rows={4}
            placeholder="01001000 01100101..."
            className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          />
        </div>

        {/* Hexadecimal */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-semibold uppercase text-foreground">Hexadecimal (Base 16)</label>
            <button
              onClick={() => handleCopy(hexVal, "hex")}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "hex" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey === "hex" ? "Copied!" : "Copy"}</span>
            </button>
          </div>
          <textarea
            value={hexVal}
            onChange={(e) => updateFromHex(e.target.value)}
            rows={4}
            placeholder="48 65 6c 6c 6f..."
            className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        {/* Decimal Bytes */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-semibold uppercase text-foreground">Decimal Byte Codes</label>
            <button
              onClick={() => handleCopy(decVal, "dec")}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "dec" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedKey === "dec" ? "Copied!" : "Copy"}</span>
            </button>
          </div>
          <textarea
            readOnly
            value={decVal}
            rows={4}
            className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground select-all"
          />
        </div>
      </div>
    </div>
  );
}
