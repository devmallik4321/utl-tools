"use client";

import { useState, useMemo } from "react";
import { Network, Copy, Check, Sparkles, Globe, Terminal, Server } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function ReverseDnsPtrGenerator() {
  const [ipInput, setIpInput] = useState<string>("192.0.2.45");
  const [hostname, setHostname] = useState<string>("mail.example.com");
  const [ttl, setTtl] = useState<number>(3600);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { ptrDomain, zoneRecord, digCommand, isValid, isIpv6 } = useMemo(() => {
    const trimmed = ipInput.trim();

    // Check if IPv4
    const v4Parts = trimmed.split(".");
    if (v4Parts.length === 4 && v4Parts.every((p) => !isNaN(Number(p)) && Number(p) >= 0 && Number(p) <= 255)) {
      const reversed = [...v4Parts].reverse().join(".");
      const arpa = `${reversed}.in-addr.arpa.`;
      const cleanHost = hostname.trim().endsWith(".") ? hostname.trim() : `${hostname.trim()}.`;
      const record = `${arpa}  ${ttl}  IN  PTR  ${cleanHost}`;
      const dig = `dig -x ${trimmed}`;
      return { ptrDomain: arpa, zoneRecord: record, digCommand: dig, isValid: true, isIpv6: false };
    }

    // Check if IPv6 (simplified expansion)
    if (trimmed.includes(":")) {
      try {
        // Expand ::
        let fullHex = trimmed;
        if (trimmed.includes("::")) {
          const [left, right] = trimmed.split("::");
          const leftParts = left ? left.split(":") : [];
          const rightParts = right ? right.split(":") : [];
          const missing = 8 - (leftParts.length + rightParts.length);
          const zeros = new Array(missing).fill("0000");
          const allParts = [...leftParts, ...zeros, ...rightParts];
          fullHex = allParts.map((p) => p.padStart(4, "0")).join("");
        } else {
          fullHex = trimmed.split(":").map((p) => p.padStart(4, "0")).join("");
        }

        if (fullHex.length === 32) {
          const reversedNibbles = fullHex.split("").reverse().join(".");
          const arpa = `${reversedNibbles}.ip6.arpa.`;
          const cleanHost = hostname.trim().endsWith(".") ? hostname.trim() : `${hostname.trim()}.`;
          const record = `${arpa}  ${ttl}  IN  PTR  ${cleanHost}`;
          const dig = `dig -x ${trimmed}`;
          return { ptrDomain: arpa, zoneRecord: record, digCommand: dig, isValid: true, isIpv6: true };
        }
      } catch (e) {
        // invalid
      }
    }

    return { ptrDomain: "", zoneRecord: "", digCommand: "", isValid: false, isIpv6: false };
  }, [ipInput, hostname, ttl]);

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
            Target IP Address (v4 or v6)
          </label>
          <input
            type="text"
            value={ipInput}
            onChange={(e) => setIpInput(e.target.value)}
            placeholder="192.0.2.45"
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            FQDN Pointer Target (Hostname)
          </label>
          <input
            type="text"
            value={hostname}
            onChange={(e) => setHostname(e.target.value)}
            placeholder="mail.example.com"
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            TTL (Seconds)
          </label>
          <input
            type="number"
            min={60}
            step={300}
            value={ttl}
            onChange={(e) => setTtl(Math.max(60, parseInt(e.target.value) || 3600))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* Output Grid */}
      {isValid ? (
        <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Server className="w-4 h-4 text-emerald-500" />
            Generated Reverse DNS Zone PTR Record
          </h4>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-4 bg-card rounded-xl border border-border space-y-2">
              <div className="flex justify-between items-center font-sans">
                <span className="font-bold text-foreground">BIND / Zone File PTR Record</span>
                <button
                  onClick={() => handleCopy("ptr", zoneRecord)}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  {copiedKey === "ptr" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "ptr" ? "Copied!" : "Copy Record"}</span>
                </button>
              </div>
              <pre className="p-3 bg-muted/50 rounded-lg text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
                {zoneRecord}
              </pre>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border space-y-2">
              <div className="flex justify-between items-center font-sans">
                <span className="font-bold text-foreground">Terminal Verification Command</span>
                <button
                  onClick={() => handleCopy("dig", digCommand)}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  {copiedKey === "dig" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "dig" ? "Copied!" : "Copy Command"}</span>
                </button>
              </div>
              <pre className="p-3 bg-muted/50 rounded-lg text-blue-600 dark:text-blue-400 overflow-x-auto select-all">
                {digCommand}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-card border border-border rounded-xl text-xs text-rose-500">
          Please enter a valid IPv4 (e.g. 192.0.2.45) or IPv6 address.
        </div>
      )}
    </div>
  );
}
