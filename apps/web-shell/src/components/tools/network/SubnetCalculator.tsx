"use client";

import { useState, useMemo } from "react";
import { Network, Copy, Check, Sparkles, Layers, ShieldCheck } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function SubnetCalculator() {
  const [ipAddress, setIpAddress] = useState<string>("192.168.1.15");
  const [cidrPrefix, setCidrPrefix] = useState<number>(24);
  const [copied, setCopied] = useState<boolean>(false);

  // Subnet Calculation
  const subnetInfo = useMemo(() => {
    const cleanIp = ipAddress.trim();
    const octets = cleanIp.split(".").map((o) => parseInt(o, 10));

    if (octets.length !== 4 || octets.some((o) => isNaN(o) || o < 0 || o > 255)) {
      return {
        isValid: false,
        error: "Invalid IPv4 address format (e.g. 192.168.1.1)",
        networkIp: "",
        broadcastIp: "",
        firstUsable: "",
        lastUsable: "",
        usableHosts: 0,
        subnetMask: "",
        wildcardMask: "",
        ipClass: "",
      };
    }

    // IP to 32-bit integer
    const ipInt = ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;

    // Subnet mask integer
    const maskInt = cidrPrefix === 0 ? 0 : (~0 << (32 - cidrPrefix)) >>> 0;
    const wildcardInt = ~maskInt >>> 0;

    const networkInt = (ipInt & maskInt) >>> 0;
    const broadcastInt = (networkInt | wildcardInt) >>> 0;

    const intToIp = (num: number) => {
      return [
        (num >>> 24) & 255,
        (num >>> 16) & 255,
        (num >>> 8) & 255,
        num & 255,
      ].join(".");
    };

    const networkIp = intToIp(networkInt);
    const broadcastIp = intToIp(broadcastInt);
    const subnetMask = intToIp(maskInt);
    const wildcardMask = intToIp(wildcardInt);

    let firstUsable = "";
    let lastUsable = "";
    let usableHosts = 0;

    if (cidrPrefix === 31) {
      // Point to Point (RFC 3021)
      firstUsable = networkIp;
      lastUsable = broadcastIp;
      usableHosts = 2;
    } else if (cidrPrefix === 32) {
      firstUsable = networkIp;
      lastUsable = networkIp;
      usableHosts = 1;
    } else {
      firstUsable = intToIp(networkInt + 1);
      lastUsable = intToIp(broadcastInt - 1);
      usableHosts = Math.max(0, Math.pow(2, 32 - cidrPrefix) - 2);
    }

    // Determine IP Class
    let ipClass = "Classless";
    if (octets[0] >= 1 && octets[0] <= 126) ipClass = "Class A (Private: 10.0.0.0/8)";
    else if (octets[0] >= 128 && octets[0] <= 191) ipClass = "Class B (Private: 172.16.0.0/12)";
    else if (octets[0] >= 192 && octets[0] <= 223) ipClass = "Class C (Private: 192.168.0.0/16)";

    return {
      isValid: true,
      networkIp,
      broadcastIp,
      firstUsable,
      lastUsable,
      usableHosts,
      subnetMask,
      wildcardMask,
      ipClass,
    };
  }, [ipAddress, cidrPrefix]);

  const handleCopy = async () => {
    if (!subnetInfo.isValid || !subnetInfo.networkIp) return;
    const summary = `Subnet Calculation (${ipAddress}/${cidrPrefix})\n• Network Address: ${subnetInfo.networkIp}\n• Broadcast Address: ${subnetInfo.broadcastIp}\n• Usable Host Range: ${subnetInfo.firstUsable} – ${subnetInfo.lastUsable}\n• Usable Hosts: ${(subnetInfo.usableHosts || 0).toLocaleString()}\n• Subnet Mask: ${subnetInfo.subnetMask}\n• Wildcard Mask: ${subnetInfo.wildcardMask}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            IPv4 Host / Network IP Address
          </label>
          <input
            type="text"
            value={ipAddress}
            onChange={(e) => setIpAddress(e.target.value)}
            placeholder="192.168.1.1"
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[11px] text-muted-foreground">Standard dot-decimal IPv4 address</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            CIDR Subnet Mask Prefix (/8 to /30)
          </label>
          <select
            value={cidrPrefix}
            onChange={(e) => setCidrPrefix(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg"
          >
            {[8, 12, 16, 18, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30].map((p) => (
              <option key={p} value={p}>
                /{p} — Subnet Mask ({p === 24 ? "255.255.255.0 (254 Hosts)" : p === 16 ? "255.255.0.0 (65k Hosts)" : `/${p}`})
              </option>
            ))}
          </select>
          <span className="text-[11px] text-muted-foreground">Select prefix network size</span>
        </div>
      </div>

      {/* Results Overview */}
      {subnetInfo.isValid && (
        <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Network className="w-4 h-4 text-emerald-500" />
              IPv4 Subnet Allocation Details
            </h4>
            <button
              onClick={handleCopy}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Subnet Report"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-card rounded-xl border border-border space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Network Address</span>
              <p className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                {subnetInfo.networkIp}
              </p>
              <span className="text-[10px] text-muted-foreground">Subnet base identifier</span>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Broadcast Address</span>
              <p className="text-2xl font-bold font-mono text-foreground">
                {subnetInfo.broadcastIp}
              </p>
              <span className="text-[10px] text-muted-foreground">Subnet broadcast channel</span>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Total Usable Hosts</span>
              <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
                {subnetInfo.usableHosts.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">Hosts</span>
              </p>
              <span className="text-[10px] text-muted-foreground">2^{(32 - cidrPrefix)} minus 2 IPs</span>
            </div>
          </div>

          {/* Detailed Subnet Table */}
          <div className="space-y-2 pt-2 border-t border-border">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
              Host Range &amp; Subnet Masks:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-3 bg-card rounded-lg border border-border space-y-0.5">
                <span className="text-[10px] text-muted-foreground font-sans block">USABLE HOST RANGE</span>
                <p className="text-foreground font-bold">{subnetInfo.firstUsable} –</p>
                <p className="text-foreground font-bold">{subnetInfo.lastUsable}</p>
              </div>

              <div className="p-3 bg-card rounded-lg border border-border space-y-0.5">
                <span className="text-[10px] text-muted-foreground font-sans block">SUBNET MASK</span>
                <p className="text-foreground font-bold">{subnetInfo.subnetMask}</p>
                <span className="text-[10px] text-muted-foreground font-sans">Prefix /{cidrPrefix}</span>
              </div>

              <div className="p-3 bg-card rounded-lg border border-border space-y-0.5">
                <span className="text-[10px] text-muted-foreground font-sans block">WILDCARD MASK</span>
                <p className="text-foreground font-bold">{subnetInfo.wildcardMask}</p>
                <span className="text-[10px] text-muted-foreground font-sans">ACL Inverted Mask</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
