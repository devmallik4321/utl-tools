"use client";

import { useState, useMemo } from "react";
import { ShieldCheck, Copy, Check, Sparkles, Mail, Terminal, Lock } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function DmarcRecordGenerator() {
  const [domain, setDomain] = useState<string>("example.com");
  const [policy, setPolicy] = useState<string>("reject"); // none, quarantine, reject
  const [ruaEmail, setRuaEmail] = useState<string>("dmarc-reports@example.com");
  const [rufEmail, setRufEmail] = useState<string>("");
  const [percentage, setPercentage] = useState<number>(100);
  const [spfAlignment, setSpfAlignment] = useState<string>("r"); // r = relaxed, s = strict
  const [dkimAlignment, setDkimAlignment] = useState<string>("r");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { dmarcValue, zoneLine, digCommand } = useMemo(() => {
    const d = domain.trim() || "example.com";
    const parts = ["v=DMARC1", `p=${policy}`];

    if (percentage < 100) {
      parts.push(`pct=${percentage}`);
    }

    if (ruaEmail.trim()) {
      parts.push(`rua=mailto:${ruaEmail.trim()}`);
    }

    if (rufEmail.trim()) {
      parts.push(`ruf=mailto:${rufEmail.trim()}`);
    }

    if (spfAlignment !== "r") {
      parts.push(`aspf=${spfAlignment}`);
    }

    if (dkimAlignment !== "r") {
      parts.push(`adkim=${dkimAlignment}`);
    }

    parts.push("fo=1");

    const record = parts.join("; ");
    const zone = `_dmarc.${d}.  3600  IN  TXT  "${record}"`;
    const dig = `dig TXT _dmarc.${d} +short`;

    return {
      dmarcValue: record,
      zoneLine: zone,
      digCommand: dig,
    };
  }, [domain, policy, ruaEmail, rufEmail, percentage, spfAlignment, dkimAlignment]);

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
            DMARC Policy (`p=`)
          </label>
          <select
            value={policy}
            onChange={(e) => setPolicy(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value="reject">p=reject (Full Protection - Drop Spoofed Mail)</option>
            <option value="quarantine">p=quarantine (Spam Folder - Quarantine Mail)</option>
            <option value="none">p=none (Monitoring Mode Only)</option>
          </select>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Enforcement Percentage (`pct=`)
          </label>
          <select
            value={percentage}
            onChange={(e) => setPercentage(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={100}>100% (Full Production Enforcement)</option>
            <option value={50}>50% (Phased Rollout Testing)</option>
            <option value={25}>25% (Initial Pilot Rollout)</option>
          </select>
        </div>
      </div>

      {/* Reporting & Alignment */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Aggregate Email Reports (`rua=`)
          </label>
          <input
            type="email"
            value={ruaEmail}
            onChange={(e) => setRuaEmail(e.target.value)}
            placeholder="dmarc-reports@example.com"
            className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            SPF Identifier Alignment
          </label>
          <select
            value={spfAlignment}
            onChange={(e) => setSpfAlignment(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value="r">aspf=r (Relaxed - Subdomains Allowed)</option>
            <option value="s">aspf=s (Strict - Exact Match Only)</option>
          </select>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            DKIM Identifier Alignment
          </label>
          <select
            value={dkimAlignment}
            onChange={(e) => setDkimAlignment(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value="r">adkim=r (Relaxed - Subdomains Allowed)</option>
            <option value="s">adkim=s (Strict - Exact Match Only)</option>
          </select>
        </div>
      </div>

      {/* Output Grid */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Generated DMARC DNS Record
          </h4>
          <button
            onClick={() => handleCopy("val", dmarcValue)}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copiedKey === "val" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === "val" ? "Copied!" : "Copy Value"}</span>
          </button>
        </div>

        <pre className="p-3 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {dmarcValue}
        </pre>

        <div className="space-y-2 font-mono text-xs">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-foreground">BIND Zone File Entry</span>
            <button
              onClick={() => handleCopy("zone", zoneLine)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "zone" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "zone" ? "Copied!" : "Copy Zone Line"}</span>
            </button>
          </div>
          <pre className="p-3 bg-card border border-border rounded-xl text-blue-600 dark:text-blue-400 overflow-x-auto select-all">
            {zoneLine}
          </pre>
        </div>
      </div>
    </div>
  );
}
