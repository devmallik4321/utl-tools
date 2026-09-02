"use client";

import { useState, useMemo } from "react";
import { Globe, Copy, Check, Sparkles, ShieldCheck, Mail } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const PROVIDERS = [
  { name: "Google Workspace / Gmail", spfInclude: "include:_spf.google.com", dkimSelector: "google" },
  { name: "Microsoft 365 / Outlook", spfInclude: "include:spf.protection.outlook.com", dkimSelector: "selector1" },
  { name: "SendGrid", spfInclude: "include:sendgrid.net", dkimSelector: "s1" },
  { name: "Mailgun", spfInclude: "include:mailgun.org", dkimSelector: "mailo" },
  { name: "Amazon SES", spfInclude: "include:amazonses.com", dkimSelector: "ses" },
];

export function EmailDnsGenerator() {
  const [domain, setDomain] = useState<string>("example.com");
  const [providerIndex, setProviderIndex] = useState<number>(0);
  const [dmarcPolicy, setDmarcPolicy] = useState<"none" | "quarantine" | "reject">("quarantine");
  const [reportEmail, setReportEmail] = useState<string>("dmarc-reports@example.com");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const provider = PROVIDERS[providerIndex];

  const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "") || "example.com";

  const spfRecord = `v=spf1 ${provider.spfInclude} ~all`;
  const dkimHost = `${provider.dkimSelector}._domainkey.${cleanDomain}`;
  const dkimVal = `v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...`;
  const dmarcHost = `_dmarc.${cleanDomain}`;
  const dmarcVal = `v=DMARC1; p=${dmarcPolicy}; sp=${dmarcPolicy}; rua=mailto:${reportEmail}; pct=100; aspf=r; adkim=r;`;

  const handleCopy = async (val: string, key: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Domain & Provider Inputs */}
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
            className="w-full px-3 py-2 text-sm font-semibold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Email Service Provider
          </label>
          <select
            value={providerIndex}
            onChange={(e) => setProviderIndex(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-blue-600 dark:text-blue-400"
          >
            {PROVIDERS.map((p, idx) => (
              <option key={p.name} value={idx}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            DMARC Enforcement Policy
          </label>
          <select
            value={dmarcPolicy}
            onChange={(e) => setDmarcPolicy(e.target.value as any)}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-emerald-600 dark:text-emerald-400"
          >
            <option value="none">p=none (Monitoring / Report only)</option>
            <option value="quarantine">p=quarantine (Send spam to Junk)</option>
            <option value="reject">p=reject (Block spoofed mail completely)</option>
          </select>
        </div>
      </div>

      {/* Generated DNS TXT Records List */}
      <div className="space-y-4">
        {/* 1. SPF */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              1. SPF Record (TXT @ {cleanDomain})
            </span>
            <button
              onClick={() => handleCopy(spfRecord, "spf")}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "spf" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "spf" ? "Copied!" : "Copy SPF"}</span>
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">Type: TXT | Host: @ (or {cleanDomain})</p>
          <pre className="p-3 bg-muted/40 border border-border rounded-lg font-mono text-xs text-foreground overflow-x-auto select-all">
            {spfRecord}
          </pre>
        </div>

        {/* 2. DKIM */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-blue-500" />
              2. DKIM Host Key (TXT)
            </span>
            <button
              onClick={() => handleCopy(dkimVal, "dkim")}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "dkim" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "dkim" ? "Copied!" : "Copy DKIM"}</span>
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground font-mono">Type: TXT | Host: {dkimHost}</p>
          <pre className="p-3 bg-muted/40 border border-border rounded-lg font-mono text-xs text-foreground overflow-x-auto select-all">
            {dkimVal}
          </pre>
        </div>

        {/* 3. DMARC */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-purple-500" />
              3. DMARC Security Record (TXT)
            </span>
            <button
              onClick={() => handleCopy(dmarcVal, "dmarc")}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "dmarc" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === "dmarc" ? "Copied!" : "Copy DMARC"}</span>
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground font-mono">Type: TXT | Host: {dmarcHost}</p>
          <pre className="p-3 bg-muted/40 border border-border rounded-lg font-mono text-xs text-foreground overflow-x-auto select-all">
            {dmarcVal}
          </pre>
        </div>
      </div>
    </div>
  );
}
