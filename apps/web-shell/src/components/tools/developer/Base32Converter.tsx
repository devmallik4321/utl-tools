"use client";

import { useState, useMemo } from "react";
import { KeyRound, Copy, Check, Sparkles, ArrowRightLeft, ShieldCheck } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const RFC4648_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function Base32Converter() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [inputText, setInputText] = useState<string>("Hello UTL.tools!");
  const [includePadding, setIncludePadding] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const { outputText, isValid, errorMsg } = useMemo(() => {
    if (!inputText) return { outputText: "", isValid: true, errorMsg: "" };

    if (mode === "encode") {
      try {
        const bytes = new TextEncoder().encode(inputText);
        let bits = "";
        for (let i = 0; i < bytes.length; i++) {
          bits += bytes[i].toString(2).padStart(8, "0");
        }

        let encoded = "";
        for (let i = 0; i < bits.length; i += 5) {
          const chunk = bits.substring(i, i + 5).padEnd(5, "0");
          const idx = parseInt(chunk, 2);
          encoded += RFC4648_ALPHABET[idx];
        }

        if (includePadding) {
          while (encoded.length % 8 !== 0) {
            encoded += "=";
          }
        }

        return { outputText: encoded, isValid: true, errorMsg: "" };
      } catch (e: any) {
        return { outputText: "", isValid: false, errorMsg: e.message };
      }
    } else {
      // Decode
      try {
        const clean = inputText.trim().replace(/=+$/, "").toUpperCase();
        let bits = "";
        for (let i = 0; i < clean.length; i++) {
          const char = clean[i];
          const idx = RFC4648_ALPHABET.indexOf(char);
          if (idx === -1) {
            return { outputText: "", isValid: false, errorMsg: `Invalid Base32 character: '${char}'` };
          }
          bits += idx.toString(2).padStart(5, "0");
        }

        const bytes: number[] = [];
        for (let i = 0; i + 8 <= bits.length; i += 8) {
          bytes.push(parseInt(bits.substring(i, i + 8), 2));
        }

        const decoded = new TextDecoder().decode(new Uint8Array(bytes));
        return { outputText: decoded, isValid: true, errorMsg: "" };
      } catch (e: any) {
        return { outputText: "", isValid: false, errorMsg: e.message || "Failed to decode Base32" };
      }
    }
  }, [mode, inputText, includePadding]);

  const handleSwap = () => {
    setMode(mode === "encode" ? "decode" : "encode");
    if (outputText) setInputText(outputText);
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(outputText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-card border border-border rounded-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode("encode")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
              mode === "encode"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-muted text-foreground border-border hover:bg-muted/80"
            }`}
          >
            Encode Text to Base32
          </button>
          <button
            onClick={() => setMode("decode")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
              mode === "decode"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-muted text-foreground border-border hover:bg-muted/80"
            }`}
          >
            Decode Base32 to Text
          </button>
        </div>

        <button
          onClick={handleSwap}
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-semibold"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Swap Input / Output</span>
        </button>
      </div>

      {/* Input Textarea */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          {mode === "encode" ? "Plaintext Input" : "Base32 String Input (RFC 4648)"}
        </label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={4}
          placeholder={mode === "encode" ? "Enter text to encode..." : "Enter Base32 string (e.g. JBSWY3DPEHPK3PXP)..."}
          className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Output Card */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-emerald-500" />
            {mode === "encode" ? "Encoded Base32 Output" : "Decoded Plaintext Output"}
          </h4>
          <button
            onClick={handleCopy}
            disabled={!isValid || !outputText}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1 disabled:opacity-40"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Result"}</span>
          </button>
        </div>

        <pre
          className={`p-4 bg-card border border-border rounded-xl font-mono text-xs overflow-x-auto select-all break-all ${
            isValid ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {isValid ? outputText || "// Enter input above to view output." : `// Error: ${errorMsg}`}
        </pre>
      </div>
    </div>
  );
}
