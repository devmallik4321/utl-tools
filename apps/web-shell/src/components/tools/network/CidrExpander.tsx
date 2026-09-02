"use client";

import { useState, useMemo } from "react";
import { Network, Copy, Check, Sparkles, Globe, Server } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function CidrExpander() {
  const [cidrInput, setCidrInput] = useState<string>("192.168.1.0/24");
  const [copied, setCopied] = useState<boolean>(false);

  const { isValid, networkIp, broadcastIp, firstHost, lastHost, totalHosts, usableHosts, subnetMask, wildcardMask } =
    useMemo(() => {
      const match = cidrInput.trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/);
      if (!match) {
        return { isValid: false, networkIp: "-", broadcastIp: "-", firstHost: "-", lastHost: "-", totalHosts: 0, usableHosts: 0, subnetMask: "-", wildcardMask: "-" };
      }

      const octets = [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), parseInt(match[4])];
      const prefix = parseInt(match[5]);

      if (octets.some((o) => o < 0 || o > 255) || prefix < 0 || prefix > 32) {
        return { isValid: false, networkIp: "-", broadcastIp: "-", firstHost: "-", lastHost: "-", totalHosts: 0, usableHosts: 0, subnetMask: "-", wildcardMask: "-" };
      }

      const ipInt = (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3];
      const maskInt = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
      const wildcardInt = ~maskInt >>> 0;

      const netInt = (ipInt & maskInt) >>> 0;
      const bcastInt = (netInt | wildcardInt) >>> 0;

      const intToIp = (val: number) => {
        return [(val >>> 24) & 255, (val >>> 16) & 255, (val >>> 8) & 255, val & 255].join(".");
      };

      const total = Math.pow(2, 32 - prefix);
      const usable = prefix >= 31 ? (prefix === 31 ? 2 : 1) : Math.max(0, total - 2);

      const firstHostInt = prefix >= 31 ? netInt : netInt + 1;
      const lastHostInt = prefix >= 31 ? bcastInt : bcastInt - 1;

      return {
        isValid: true,
        networkIp: intToIp(netInt),
        broadcastIp: intToIp(bcastInt),
        firstHost: intToIp(firstHostInt),
        lastHost: intToIp(lastHostInt),
        totalHosts: total,
        usableHosts: usable,
        subnetMask: intToIp(maskInt),
        wildcardMask: intToIp(wildcardInt),
      };
    }, [cidrInput]);

  const handleCopy = async () => {
    const summary = `CIDR Subnet Expansion (${cidrInput})\n• Network IP: ${networkIp}\n• Broadcast IP: ${broadcastIp}\n• Usable Host Range: ${firstHost} — ${lastHost}\n• Usable Hosts: ${usableHosts.toLocaleString()} (${totalHosts.toLocaleString()} total)\n• Subnet Mask: ${subnetMask}\n• Wildcard Mask: ${wildcardMask}`;
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
          Enter IPv4 CIDR Block Notation
        </label>
        <input
          type="text"
          value={cidrInput}
          onChange={(e) => setCidrInput(e.target.value)}
          placeholder="e.g. 192.168.1.0/24, 10.0.0.0/16"
          className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
        />
        <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground pt-1">
          <span>Presets:</span>
          <button onClick={() => setCidrInput("192.168.1.0/24")} className="hover:underline text-blue-600">/24 (254 hosts)</button>
          <span>•</span>
          <button onClick={() => setCidrInput("10.0.0.0/16")} className="hover:underline text-blue-600">/16 (65,534 hosts)</button>
          <span>•</span>
          <button onClick={() => setCidrInput("172.16.0.0/12")} className="hover:underline text-blue-600">/12 (1M hosts)</button>
          <span>•</span>
          <button onClick={() => setCidrInput("192.168.0.0/22")} className="hover:underline text-blue-600">/22 (1,022 hosts)</button>
        </div>
      </div>

      {/* Expansion Details */}
      {isValid && (
        <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Network className="w-4 h-4 text-emerald-500" />
              Subnet IP Range &amp; Host Capacity
            </h4>
            <button
              onClick={handleCopy}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy CIDR Details"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
            <div className="p-4 bg-card rounded-xl border border-border space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
                Usable IPv4 Hosts
              </span>
              <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {usableHosts.toLocaleString()}
              </p>
              <span className="text-[10px] text-muted-foreground font-sans">
                {totalHosts.toLocaleString()} total addresses
              </span>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
                Subnet Netmask
              </span>
              <p className="text-xl font-bold text-foreground">{subnetMask}</p>
              <span className="text-[10px] text-muted-foreground font-sans">Standard dotted decimal mask</span>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase font-sans">
                Wildcard Mask (ACLs)
              </span>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{wildcardMask}</p>
              <span className="text-[10px] text-muted-foreground font-sans">For Cisco / firewall ACLs</span>
            </div>
          </div>

          {/* Range Table */}
          <div className="p-4 bg-card rounded-xl border border-border space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground font-sans">Network Address:</span>
              <strong className="text-foreground">{networkIp}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground font-sans">First Usable Host IP:</span>
              <strong className="text-emerald-600 dark:text-emerald-400">{firstHost}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground font-sans">Last Usable Host IP:</span>
              <strong className="text-emerald-600 dark:text-emerald-400">{lastHost}</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground font-sans">Broadcast Address:</span>
              <strong className="text-foreground">{broadcastIp}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
