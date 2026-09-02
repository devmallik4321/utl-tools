"use client";

import { useState, useMemo } from "react";
import { Network, Copy, Check, Sparkles, Globe, Terminal } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const IPV4_PRESETS = ["192.0.2.1", "8.8.8.8", "1.1.1.1", "127.0.0.1", "10.0.0.1"];

export function Ipv4ToIpv6Converter() {
  const [ipv4, setIpv4] = useState<string>("192.0.2.1");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const mappings = useMemo(() => {
    const parts = ipv4.trim().split(".").map(Number);
    if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
      return null;
    }

    const [a, b, c, d] = parts;

    // Convert octets to 4-digit hex segments (2 octets per segment)
    const hex1 = ((a << 8) | b).toString(16).padStart(4, "0");
    const hex2 = ((c << 8) | d).toString(16).padStart(4, "0");

    const ipv4MappedDotted = `::ffff:${a}.${b}.${c}.${d}`;
    const ipv4MappedHex = `::ffff:${hex1}:${hex2}`;
    const sixToFourPrefix = `2002:${hex1}:${hex2}::/48`;
    const sixToFourFull = `2002:${hex1}:${hex2}:0000:0000:0000:0000:0001`;
    const ipv4Compatible = `::${hex1}:${hex2}`;

    return {
      ipv4MappedDotted,
      ipv4MappedHex,
      sixToFourPrefix,
      sixToFourFull,
      ipv4Compatible,
    };
  }, [ipv4]);

  const handleCopy = async (key: string, val: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {IPV4_PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => setIpv4(p)}
            className={`px-3 py-1 font-mono text-xs font-semibold rounded-lg border transition-colors ${
              ipv4 === p
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* IPv4 Input */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2 max-w-sm">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          IPv4 Source Address
        </label>
        <input
          type="text"
          value={ipv4}
          onChange={(e) => setIpv4(e.target.value)}
          placeholder="192.0.2.1"
          className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
        />
      </div>

      {/* Mappings Grid */}
      {mappings ? (
        <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-emerald-500" />
            Standard IPv6 Transition &amp; Mapping Formats
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-4 bg-card rounded-xl border border-border space-y-2">
              <div className="flex justify-between items-center font-sans">
                <span className="font-bold text-foreground">IPv4-Mapped IPv6 (Dotted)</span>
                <span className="text-[10px] bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded font-bold">
                  RFC 4291
                </span>
              </div>
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400 break-all">
                {mappings.ipv4MappedDotted}
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => handleCopy("dotted", mappings.ipv4MappedDotted)}
                  className="hover:text-foreground text-blue-600"
                >
                  {copiedKey === "dotted" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border space-y-2">
              <div className="flex justify-between items-center font-sans">
                <span className="font-bold text-foreground">IPv4-Mapped IPv6 (Hex)</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded font-bold">
                  Standard Hex
                </span>
              </div>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 break-all">
                {mappings.ipv4MappedHex}
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => handleCopy("hex", mappings.ipv4MappedHex)}
                  className="hover:text-foreground text-blue-600"
                >
                  {copiedKey === "hex" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border space-y-2">
              <div className="flex justify-between items-center font-sans">
                <span className="font-bold text-foreground">6to4 Prefix (RFC 3056)</span>
                <span className="text-[10px] bg-purple-500/10 text-purple-600 px-1.5 py-0.5 rounded font-bold">
                  Tunneling /48
                </span>
              </div>
              <p className="text-sm font-bold text-purple-600 dark:text-purple-400 break-all">
                {mappings.sixToFourPrefix}
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => handleCopy("6to4", mappings.sixToFourPrefix)}
                  className="hover:text-foreground text-blue-600"
                >
                  {copiedKey === "6to4" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border space-y-2">
              <div className="flex justify-between items-center font-sans">
                <span className="font-bold text-foreground">IPv4-Compatible IPv6</span>
                <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-bold">
                  Legacy / Deprecated
                </span>
              </div>
              <p className="text-sm font-bold text-foreground break-all">{mappings.ipv4Compatible}</p>
              <div className="flex justify-end">
                <button
                  onClick={() => handleCopy("compat", mappings.ipv4Compatible)}
                  className="hover:text-foreground text-blue-600"
                >
                  {copiedKey === "compat" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-card border border-border rounded-xl text-xs text-rose-500">
          Please enter a valid IPv4 address (e.g. 192.0.2.1).
        </div>
      )}
    </div>
  );
}
