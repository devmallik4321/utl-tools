"use client";

import { useState, useMemo } from "react";
import { Shield, Copy, Check, Sparkles, Mail, AlertTriangle, Terminal, Globe } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const PROVIDERS = [
  { name: "Google Workspace", include: "include:_spf.google.com" },
  { name: "Microsoft 365", include: "include:spf.protection.outlook.com" },
  { name: "SendGrid", include: "include:sendgrid.net" },
  { name: "Mailgun", include: "include:mailgun.org" },
  { name: "Amazon SES", include: "include:amazonses.com" },
  { name: "Postmark", include: "include:spf.mtasv.net" },
];

export function SpfRecordBuilder() {
  const [domain, setDomain] = useState<string>("example.com");
  const [includeMx, setIncludeMx] = useState<boolean>(true);
  const [includeA, setIncludeA] = useState<boolean>(false);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([
    "include:_spf.google.com",
  ]);
  const [customIps, setCustomIps] = useState<string>("192.0.2.1/32");
  const [failPolicy, setFailPolicy] = useState<string>("~all"); // ~all softfail, -all hardfail
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { spfString, dnsTxtLine, digCommand, lookupCount } = useMemo(() => {
    const parts = ["v=spf1"];

    if (includeMx) parts.push("mx");
    if (includeA) parts.push("a");

    selectedProviders.forEach((p) => parts.push(p));

    if (customIps.trim()) {
      customIps
        .split(",")
        .map((ip) => ip.trim())
        .filter(Boolean)
        .forEach((ip) => {
          if (ip.includes(":")) {
            parts.push(`ip6:${ip}`);
          } else {
            parts.push(`ip4:${ip}`);
          }
        });
    }

    parts.push(failPolicy);

    const record = parts.join(" ");
    const d = domain.trim() || "example.com";
    const zoneLine = `${d}.  3600  IN  TXT  "${record}"`;
    const dig = `dig TXT ${d} +short`;

    // Calculate DNS lookups (mx = 1, a = 1, each include = 1)
    let lookups = selectedProviders.length;
    if (includeMx) lookups += 1;
    if (includeA) lookups += 1;

    return {
      spfString: record,
      dnsTxtLine: zoneLine,
      digCommand: dig,
      lookupCount: lookups,
    };
  }, [domain, includeMx, includeA, selectedProviders, customIps, failPolicy]);

  const toggleProvider = (inc: string) => {
    if (selectedProviders.includes(inc)) {
      setSelectedProviders(selectedProviders.filter((p) => p !== inc));
    } else {
      setSelectedProviders([...selectedProviders, inc]);
    }
  };

  const handleCopy = async (key: string, val: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Domain Input */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            SPF Enforcement Policy
          </label>
          <select
            value={failPolicy}
            onChange={(e) => setFailPolicy(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value="~all">~all (SoftFail - Recommended for DMARC)</option>
            <option value="-all">-all (HardFail - Reject unauthorized mail)</option>
            <option value="?all">?all (Neutral - Testing / Unrestricted)</option>
          </select>
        </div>
      </div>

      {/* Provider Checkboxes */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Email Service Providers (`include:`)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PROVIDERS.map((p) => {
            const active = selectedProviders.includes(p.include);
            return (
              <button
                key={p.name}
                onClick={() => toggleProvider(p.include)}
                className={`p-2.5 text-left rounded-xl border text-xs font-semibold transition-colors flex items-center justify-between ${
                  active
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-muted/40 border-border text-foreground hover:bg-muted"
                }`}
              >
                <span>{p.name}</span>
                {active && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Additional Directives */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-3">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Core DNS Mechanisms
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={includeMx}
                onChange={(e) => setIncludeMx(e.target.checked)}
                className="rounded accent-blue-600"
              />
              <span>Authorize Domain MX (`mx`)</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={includeA}
                onChange={(e) => setIncludeA(e.target.checked)}
                className="rounded accent-blue-600"
              />
              <span>Authorize Domain A Record (`a`)</span>
            </label>
          </div>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Custom Relay IP Addresses / CIDR
          </label>
          <input
            type="text"
            value={customIps}
            onChange={(e) => setCustomIps(e.target.value)}
            placeholder="192.0.2.1/32, 2001:db8::/32"
            className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* Lookup Count Badge */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-semibold text-muted-foreground">RFC 7208 DNS Lookups:</span>
        <span className={`px-2 py-0.5 rounded font-mono font-bold ${lookupCount <= 10 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"}`}>
          {lookupCount} / 10 limit
        </span>
      </div>

      {/* Generated SPF Record Card */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-500" />
            Generated DNS TXT SPF Record
          </h4>
          <button
            onClick={() => handleCopy("spf", spfString)}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copiedKey === "spf" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === "spf" ? "Copied!" : "Copy SPF Value"}</span>
          </button>
        </div>

        <pre className="p-3 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {spfString}
        </pre>

        <div className="space-y-2 font-mono text-xs">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-foreground">BIND Zone File Entry</span>
            <button
              onClick={() => handleCopy("zone", dnsTxtLine)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "zone" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "zone" ? "Copied!" : "Copy Zone Line"}</span>
            </button>
          </div>
          <pre className="p-3 bg-card border border-border rounded-xl text-blue-600 dark:text-blue-400 overflow-x-auto select-all">
            {dnsTxtLine}
          </pre>
        </div>
      </div>
    </div>
  );
}
