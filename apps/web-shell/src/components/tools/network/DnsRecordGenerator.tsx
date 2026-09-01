"use client";

import { useState, useMemo } from "react";
import { Globe, Copy, Check, ShieldCheck, Sparkles, Layers } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface ProviderPreset {
  name: string;
  spfInclude: string;
  mxRecords: { priority: number; host: string }[];
}

const PRESETS: Record<string, ProviderPreset> = {
  google: {
    name: "Google Workspace / Gmail",
    spfInclude: "include:_spf.google.com",
    mxRecords: [
      { priority: 1, host: "SMTP.GOOGLE.COM." },
    ],
  },
  microsoft: {
    name: "Microsoft 365 / Outlook",
    spfInclude: "include:spf.protection.outlook.com",
    mxRecords: [
      { priority: 0, host: "{domain}.mail.protection.outlook.com." },
    ],
  },
  sendgrid: {
    name: "Twilio SendGrid",
    spfInclude: "include:sendgrid.net",
    mxRecords: [
      { priority: 10, host: "mx.sendgrid.net." },
    ],
  },
  custom: {
    name: "Custom Mail Server",
    spfInclude: "include:mail.yourhost.com",
    mxRecords: [
      { priority: 10, host: "mail.{domain}." },
    ],
  },
};

export function DnsRecordGenerator() {
  const [domain, setDomain] = useState<string>("example.com");
  const [providerKey, setProviderKey] = useState<string>("google");
  const [dmarcPolicy, setDmarcPolicy] = useState<"none" | "quarantine" | "reject">("quarantine");
  const [dmarcEmail, setDmarcEmail] = useState<string>("dmarc-reports@example.com");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "") || "example.com";
  const provider = PRESETS[providerKey] || PRESETS.google;

  // Generate Records
  const spfRecord = `v=spf1 ${provider.spfInclude} ~all`;
  const dmarcRecord = `v=DMARC1; p=${dmarcPolicy}; rua=mailto:${dmarcEmail.trim()}; pct=100; sp=${dmarcPolicy};`;
  const mxRecords = provider.mxRecords.map((m) => ({
    priority: m.priority,
    host: m.host.replace("{domain}", cleanDomain.replace(/\./g, "-")),
  }));

  const handleCopy = async (key: string, text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleCopyAll = async () => {
    const all = [
      `; DNS Records for ${cleanDomain}`,
      `; SPF TXT Record`,
      `@  IN  TXT  "${spfRecord}"`,
      ``,
      `; DMARC TXT Record`,
      `_dmarc.${cleanDomain}.  IN  TXT  "${dmarcRecord}"`,
      ``,
      `; MX Records`,
      ...mxRecords.map((m) => `@  IN  MX  ${m.priority}  ${m.host}`),
    ].join("\n");

    const ok = await copyToClipboard(all);
    if (ok) {
      setCopiedKey("all");
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Configuration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Your Root Domain Name
          </label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            className="w-full px-3 py-2 text-sm font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[11px] text-muted-foreground">e.g. mycompany.com</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            Email Provider Preset
          </label>
          <select
            value={providerKey}
            onChange={(e) => setProviderKey(e.target.value)}
            className="w-full px-3 py-2 text-sm font-bold bg-background border border-border rounded-lg"
          >
            {Object.entries(PRESETS).map(([k, p]) => (
              <option key={k} value={k}>
                {p.name}
              </option>
            ))}
          </select>
          <span className="text-[11px] text-muted-foreground">Auto-populates SPF &amp; MX records</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
            DMARC Security Policy
          </label>
          <select
            value={dmarcPolicy}
            onChange={(e) => setDmarcPolicy(e.target.value as any)}
            className="w-full px-3 py-2 text-sm font-bold bg-background border border-border rounded-lg"
          >
            <option value="quarantine">Quarantine (Send spoofed emails to Spam)</option>
            <option value="reject">Reject (Block spoofed emails completely)</option>
            <option value="none">None (Monitor only / no enforcement)</option>
          </select>
          <span className="text-[11px] text-muted-foreground">Enforcement level against spoofing</span>
        </div>
      </div>

      {/* Generated Records View */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-blue-500" />
            Generated Email Deliverability DNS Records
          </h4>
          <button
            onClick={handleCopyAll}
            className="px-3 py-1.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold rounded-lg hover:opacity-90 inline-flex items-center gap-1.5 shadow-2xs"
          >
            {copiedKey === "all" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === "all" ? "Zone File Copied!" : "Copy Full Zone"}</span>
          </button>
        </div>

        {/* SPF TXT */}
        <div className="p-4 bg-card rounded-xl border border-border space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                SPF Record (TXT)
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">Host: @</span>
            </div>
            <button
              onClick={() => handleCopy("spf", spfRecord)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "spf" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>
          </div>
          <div className="p-2.5 bg-background rounded-lg border border-border font-mono text-xs text-foreground select-all break-all">
            {spfRecord}
          </div>
        </div>

        {/* DMARC TXT */}
        <div className="p-4 bg-card rounded-xl border border-border space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                DMARC Record (TXT)
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">Host: _dmarc</span>
            </div>
            <button
              onClick={() => handleCopy("dmarc", dmarcRecord)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "dmarc" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>
          </div>
          <div className="p-2.5 bg-background rounded-lg border border-border font-mono text-xs text-foreground select-all break-all">
            {dmarcRecord}
          </div>
        </div>

        {/* MX Records */}
        <div className="p-4 bg-card rounded-xl border border-border space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                MX Mail Server Records
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">Host: @</span>
            </div>
            <button
              onClick={() => handleCopy("mx", mxRecords.map((m) => `${m.priority} ${m.host}`).join("\n"))}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
            >
              {copiedKey === "mx" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy MX</span>
            </button>
          </div>
          <div className="space-y-1 font-mono text-xs text-foreground">
            {mxRecords.map((m, idx) => (
              <div key={idx} className="p-2 bg-background rounded-md border border-border flex justify-between items-center">
                <span>Priority: <strong>{m.priority}</strong></span>
                <span className="text-muted-foreground">{m.host}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
