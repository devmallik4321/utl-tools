"use client";

import { useState, useMemo } from "react";
import { Globe, Copy, Check, Sparkles, FileText, Calendar, ShieldAlert } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_WHOIS = `Domain Name: GITHUB.COM
Registry Domain ID: 1262D9FD-COM
Registrar WHOIS Server: whois.markmonitor.com
Registrar URL: http://www.markmonitor.com
Updated Date: 2024-09-01T09:18:22Z
Creation Date: 2007-10-09T18:20:50Z
Registry Expiry Date: 2026-10-09T18:20:50Z
Registrar: MarkMonitor Inc.
Registrar IANA ID: 292
Domain Status: clientDeleteProhibited https://icann.org/epp#clientDeleteProhibited
Domain Status: clientTransferProhibited https://icann.org/epp#clientTransferProhibited
Domain Status: clientUpdateProhibited https://icann.org/epp#clientUpdateProhibited
Name Server: DNS1.P08.NSONE.NET
Name Server: DNS2.P08.NSONE.NET
Name Server: NS-1283.AWSDNS-32.ORG
Name Server: NS-1707.AWSDNS-21.CO.UK
DNSSEC: unsigned`;

export function WhoisParser() {
  const [rawWhois, setRawWhois] = useState<string>(SAMPLE_WHOIS);
  const [copied, setCopied] = useState<boolean>(false);

  const parsed = useMemo(() => {
    if (!rawWhois.trim()) return null;

    const getField = (patterns: RegExp[]): string => {
      for (const p of patterns) {
        const match = rawWhois.match(p);
        if (match && match[1]) return match[1].trim();
      }
      return "N/A";
    };

    const domain = getField([/Domain Name:\s*([^\r\n]+)/i, /domain:\s*([^\r\n]+)/i]);
    const registrar = getField([/Registrar:\s*([^\r\n]+)/i, /registrar-name:\s*([^\r\n]+)/i]);
    const created = getField([/Creation Date:\s*([^\r\n]+)/i, /created:\s*([^\r\n]+)/i]);
    const updated = getField([/Updated Date:\s*([^\r\n]+)/i, /last-updated:\s*([^\r\n]+)/i]);
    const expires = getField([/Registry Expiry Date:\s*([^\r\n]+)/i, /Expiry Date:\s*([^\r\n]+)/i, /paid-till:\s*([^\r\n]+)/i]);
    const dnssec = getField([/DNSSEC:\s*([^\r\n]+)/i]);

    // Name Servers
    const nsMatches = rawWhois.matchAll(/(?:Name Server|nserver):\s*([^\r\n]+)/gi);
    const nameServers = Array.from(nsMatches, (m) => m[1].trim());

    // Domain Statuses
    const statusMatches = rawWhois.matchAll(/(?:Domain Status|status):\s*([^\s\r\n]+)/gi);
    const statuses = Array.from(new Set(Array.from(statusMatches, (m) => m[1].trim())));

    // Calculate days remaining
    let daysUntilExpire: number | null = null;
    if (expires !== "N/A") {
      const expDate = new Date(expires);
      if (!isNaN(expDate.getTime())) {
        const diff = expDate.getTime() - Date.now();
        daysUntilExpire = Math.round(diff / (1000 * 60 * 60 * 24));
      }
    }

    return {
      domain,
      registrar,
      created,
      updated,
      expires,
      dnssec,
      nameServers: nameServers.length > 0 ? nameServers : ["N/A"],
      statuses: statuses.length > 0 ? statuses : ["N/A"],
      daysUntilExpire,
    };
  }, [rawWhois]);

  const handleCopy = async () => {
    if (!parsed) return;
    const summary = `WHOIS Record Summary for ${parsed.domain}\n• Registrar: ${parsed.registrar}\n• Registered: ${parsed.created}\n• Expiration: ${parsed.expires} (${parsed.daysUntilExpire} days remaining)\n• Name Servers: ${parsed.nameServers.join(", ")}\n• DNSSEC: ${parsed.dnssec}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Raw WHOIS Input */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <label className="font-semibold uppercase text-foreground">Raw WHOIS Output</label>
          <span className="font-mono">In-Memory RegEx Parser</span>
        </div>
        <textarea
          value={rawWhois}
          onChange={(e) => setRawWhois(e.target.value)}
          rows={7}
          placeholder="Paste raw WHOIS terminal output here..."
          className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Structured Card Grid */}
      {parsed && (
        <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-500" />
              Parsed Domain Registration Profile
            </h4>
            <button
              onClick={handleCopy}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Summary"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 bg-card rounded-xl border border-border">
              <span className="text-[10px] text-muted-foreground uppercase font-sans block">Domain Name</span>
              <span className="text-base font-bold text-foreground">{parsed.domain}</span>
            </div>

            <div className="p-3 bg-card rounded-xl border border-border">
              <span className="text-[10px] text-muted-foreground uppercase font-sans block">Registrar</span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{parsed.registrar}</span>
            </div>

            <div className="p-3 bg-card rounded-xl border border-border">
              <span className="text-[10px] text-muted-foreground uppercase font-sans block">Expiration Date</span>
              <span className="text-sm font-bold text-foreground">{parsed.expires}</span>
              {parsed.daysUntilExpire !== null && (
                <span
                  className={`text-[10px] font-bold block pt-0.5 ${
                    parsed.daysUntilExpire < 30
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {parsed.daysUntilExpire} days remaining
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 bg-card rounded-xl border border-border space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-sans block">Name Servers</span>
              <div className="space-y-0.5 text-foreground">
                {parsed.nameServers.map((ns, i) => (
                  <div key={i}>{ns}</div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-card rounded-xl border border-border space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-sans block">Domain EPP Statuses</span>
              <div className="flex flex-wrap gap-1">
                {parsed.statuses.map((st, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-muted rounded font-mono text-[10px] text-foreground border border-border"
                  >
                    {st}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
