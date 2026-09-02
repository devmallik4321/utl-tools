"use client";

import { useState, useMemo } from "react";
import { Globe, Copy, Check, Sparkles, Network, Server } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function Ipv6SubnetCalculator() {
  const [ipv6Input, setIpv6Input] = useState<string>("2001:db8:85a3::8a2e:370:7334/64");
  const [copied, setCopied] = useState<boolean>(false);

  const { isValid, compressed, expanded, prefix, addressCountExp, addressType } = useMemo(() => {
    const parts = ipv6Input.trim().split("/");
    const addr = parts[0];
    const pfx = parts.length > 1 ? parseInt(parts[1]) : 64;

    if (pfx < 0 || pfx > 128) {
      return { isValid: false, compressed: "-", expanded: "-", prefix: 64, addressCountExp: "0", addressType: "-" };
    }

    // Expand IPv6 address to 8 full 4-character blocks
    let fullBlocks: string[] = [];
    if (addr.includes("::")) {
      const sides = addr.split("::");
      const left = sides[0] ? sides[0].split(":") : [];
      const right = sides[1] ? sides[1].split(":") : [];
      const missing = 8 - (left.length + right.length);
      const middle = Array(Math.max(0, missing)).fill("0000");

      fullBlocks = [...left, ...middle, ...right].map((b) => b.padStart(4, "0").toLowerCase());
    } else {
      fullBlocks = addr.split(":").map((b) => b.padStart(4, "0").toLowerCase());
    }

    if (fullBlocks.length !== 8 || fullBlocks.some((b) => !/^[0-9a-f]{4}$/.test(b))) {
      return { isValid: false, compressed: "-", expanded: "-", prefix: 64, addressCountExp: "0", addressType: "-" };
    }

    const expForm = fullBlocks.join(":");

    // Determine type
    let type = "Global Unicast (Public Internet)";
    if (expForm.startsWith("fe80")) type = "Link-Local Unicast (fe80::/10)";
    else if (expForm.startsWith("fc") || expForm.startsWith("fd")) type = "Unique Local Address (ULA - Private)";
    else if (expForm === "0000:0000:0000:0000:0000:0000:0000:0001") type = "Loopback (::1)";
    else if (expForm.startsWith("ff")) type = "Multicast (ff00::/8)";

    const hostBits = 128 - pfx;
    let countStr = `2^${hostBits}`;
    if (hostBits === 64) countStr = "18.4 Quintillion (2^64)";
    else if (hostBits === 80) countStr = "1.2 Septillion (2^80)";
    else if (hostBits === 0) countStr = "1 Single Host (/128)";

    return {
      isValid: true,
      compressed: addr,
      expanded: expForm,
      prefix: pfx,
      addressCountExp: countStr,
      addressType: type,
    };
  }, [ipv6Input]);

  const handleCopy = async () => {
    const summary = `IPv6 Subnet Details (${ipv6Input})\n• Expanded Form: ${expanded}\n• Prefix Length: /${prefix}\n• Address Scope / Type: ${addressType}\n• Total Addresses in Prefix: ${addressCountExp}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          IPv6 Address &amp; Prefix
        </label>
        <input
          type="text"
          value={ipv6Input}
          onChange={(e) => setIpv6Input(e.target.value)}
          placeholder="2001:db8::1/64"
          className="w-full px-3 py-2 text-sm font-mono font-bold bg-background border border-border rounded-lg text-foreground"
        />
        <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground pt-1">
          <span>Presets:</span>
          <button onClick={() => setIpv6Input("2001:db8:85a3::8a2e:370:7334/64")} className="hover:underline text-blue-600">Standard /64</button>
          <span>•</span>
          <button onClick={() => setIpv6Input("2001:db8::/48")} className="hover:underline text-blue-600">ISP Allocation /48</button>
          <span>•</span>
          <button onClick={() => setIpv6Input("fe80::1ff:fe00:3a60/10")} className="hover:underline text-blue-600">Link-Local /10</button>
          <span>•</span>
          <button onClick={() => setIpv6Input("::1/128")} className="hover:underline text-blue-600">Loopback /128</button>
        </div>
      </div>

      {/* Expanded IPv6 Details */}
      {isValid && (
        <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-500" />
              IPv6 Subnet Architecture &amp; Expansion
            </h4>
            <button
              onClick={handleCopy}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Details"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-card rounded-xl border border-border space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Address Scope</span>
              <p className="text-base font-bold text-foreground">{addressType}</p>
              <span className="text-[10px] text-muted-foreground">IANA IPv6 allocation</span>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Prefix Length</span>
              <p className="text-3xl font-extrabold font-mono text-blue-600 dark:text-blue-400">/{prefix}</p>
              <span className="text-[10px] text-muted-foreground">{128 - prefix} host bits remaining</span>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Subnet Address Capacity</span>
              <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">{addressCountExp}</p>
              <span className="text-[10px] text-muted-foreground">Addresses per /{prefix} network</span>
            </div>
          </div>

          {/* Expanded 8 Blocks */}
          <div className="p-4 bg-card rounded-xl border border-border space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase font-mono block">
              Full Uncompressed 128-Bit Hex Form
            </span>
            <pre className="p-3 bg-muted/40 border border-border rounded-lg font-mono text-xs text-foreground overflow-x-auto select-all">
              {expanded}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
