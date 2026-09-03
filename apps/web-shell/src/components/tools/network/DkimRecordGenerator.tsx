"use client";

import { useState, useMemo } from "react";
import { KeyRound, Copy, Check, Sparkles, Terminal, ShieldCheck, FileCode } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_PUBLIC_KEY =
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAy0eYw8lJ4X2v4fR7N5c6L8w1m2o3p4q5r6s7t8u9v0w1x2y3z4A5B6C7D8E9F0G1H2I3J4K5L6M7N8O9P0Q1R2S3T4U5V6W7X8Y9Z0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U7V8W9X0Y1Z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z0a1b2c3d4e5f6";

export function DkimRecordGenerator() {
  const [selector, setSelector] = useState<string>("default");
  const [domain, setDomain] = useState<string>("example.com");
  const [keyType, setKeyType] = useState<string>("rsa"); // rsa or ed25519
  const [publicKey, setPublicKey] = useState<string>(SAMPLE_PUBLIC_KEY);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { recordName, fullTxtValue, chunkedBindValue, digCommand, isLongKey } = useMemo(() => {
    const s = selector.trim() || "default";
    const d = domain.trim() || "example.com";
    const cleanKey = publicKey.replace(/\s+/g, "").replace(/-----BEGIN PUBLIC KEY-----/g, "").replace(/-----END PUBLIC KEY-----/g, "");

    const recName = `${s}._domainkey.${d}`;
    const txtVal = `v=DKIM1; k=${keyType}; p=${cleanKey}`;

    // Split into 255-character chunks for BIND DNS standard compliance
    const chunkSize = 200;
    const chunks: string[] = [];
    for (let i = 0; i < txtVal.length; i += chunkSize) {
      chunks.push(`"${txtVal.substring(i, i + chunkSize)}"`);
    }

    const bindFormatted = `${recName}.  3600  IN  TXT  (\n  ${chunks.join("\n  ")}\n)`;
    const dig = `dig TXT ${recName} +short`;

    return {
      recordName: recName,
      fullTxtValue: txtVal,
      chunkedBindValue: bindFormatted,
      digCommand: dig,
      isLongKey: txtVal.length > 255,
    };
  }, [selector, domain, keyType, publicKey]);

  const handleCopy = async (key: string, val: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            DKIM Selector (`s=`)
          </label>
          <input
            type="text"
            value={selector}
            onChange={(e) => setSelector(e.target.value)}
            placeholder="default, s1, google"
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">E.g. google, k1, dkim</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Domain Name
          </label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Your sending root domain</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Key Algorithm (`k=`)
          </label>
          <select
            value={keyType}
            onChange={(e) => setKeyType(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value="rsa">RSA (2048-bit / 1024-bit) - Standard</option>
            <option value="ed25519">Ed25519 (Modern Curve25519)</option>
          </select>
          <span className="text-[10px] text-muted-foreground">Industry standard is RSA 2048</span>
        </div>
      </div>

      {/* Public Key Paste */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <label className="font-semibold uppercase text-foreground">Base64 Public Key (`p=`)</label>
          <span className="font-mono">{publicKey.length} characters</span>
        </div>
        <textarea
          value={publicKey}
          onChange={(e) => setPublicKey(e.target.value)}
          rows={3}
          placeholder="Paste raw base64 public key..."
          className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Outputs */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-emerald-500" />
            Generated DKIM DNS TXT Record
          </h4>
        </div>

        {/* DNS Hostname */}
        <div className="p-3 bg-card border border-border rounded-xl space-y-1 font-mono text-xs">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-muted-foreground">DNS Record Host / Name:</span>
            <button
              onClick={() => handleCopy("name", recordName)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "name" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "name" ? "Copied!" : "Copy Name"}</span>
            </button>
          </div>
          <p className="text-sm font-bold text-foreground select-all">{recordName}</p>
        </div>

        {/* Raw TXT Value */}
        <div className="p-3 bg-card border border-border rounded-xl space-y-1 font-mono text-xs">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-muted-foreground">TXT Record Value (Cloudflare / Route 53):</span>
            <button
              onClick={() => handleCopy("val", fullTxtValue)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "val" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "val" ? "Copied!" : "Copy TXT"}</span>
            </button>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 break-all select-all">{fullTxtValue}</p>
        </div>

        {/* BIND 255-char Split Format if long */}
        {isLongKey && (
          <div className="p-3 bg-card border border-border rounded-xl space-y-1 font-mono text-xs">
            <div className="flex justify-between items-center font-sans">
              <span className="font-bold text-muted-foreground">BIND Zone File (RFC 4408 255-Char Chunked):</span>
              <button
                onClick={() => handleCopy("bind", chunkedBindValue)}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
              >
                {copiedKey === "bind" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === "bind" ? "Copied!" : "Copy BIND"}</span>
              </button>
            </div>
            <pre className="text-[11px] text-blue-600 dark:text-blue-400 overflow-x-auto select-all">
              {chunkedBindValue}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
