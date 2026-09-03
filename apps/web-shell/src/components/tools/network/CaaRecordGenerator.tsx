"use client";

import { useState, useMemo } from "react";
import { ShieldCheck, Copy, Check, Sparkles, Lock, Terminal, Globe } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const CA_PRESETS = [
  { name: "Let's Encrypt", tag: "letsencrypt.org" },
  { name: "DigiCert", tag: "digicert.com" },
  { name: "Amazon AWS ACM", tag: "amazon.com" },
  { name: "Google Trust Services", tag: "pki.goog" },
  { name: "Sectigo (Comodo)", tag: "sectigo.com" },
  { name: "Cloudflare", tag: "cloudflare.com" },
];

export function CaaRecordGenerator() {
  const [domain, setDomain] = useState<string>("example.com");
  const [selectedCas, setSelectedCas] = useState<string[]>(["letsencrypt.org"]);
  const [allowWildcards, setAllowWildcards] = useState<boolean>(true);
  const [wildcardCas, setWildcardCas] = useState<string[]>(["letsencrypt.org"]);
  const [iodefEmail, setIodefEmail] = useState<string>("security@example.com");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleCa = (tag: string) => {
    if (selectedCas.includes(tag)) {
      setSelectedCas(selectedCas.filter((c) => c !== tag));
    } else {
      setSelectedCas([...selectedCas, tag]);
    }
  };

  const { bindRecords, digCommand } = useMemo(() => {
    const d = domain.trim() || "example.com";
    const lines: string[] = [];

    // Issue tags
    selectedCas.forEach((ca) => {
      lines.push(`${d}.  3600  IN  CAA  0 issue "${ca}"`);
    });

    // Issuewild tags
    if (!allowWildcards) {
      lines.push(`${d}.  3600  IN  CAA  0 issuewild ";"`);
    } else {
      wildcardCas.forEach((ca) => {
        lines.push(`${d}.  3600  IN  CAA  0 issuewild "${ca}"`);
      });
    }

    // Incident reporting
    if (iodefEmail.trim()) {
      lines.push(`${d}.  3600  IN  CAA  0 iodef "mailto:${iodefEmail.trim()}"`);
    }

    const dig = `dig CAA ${d} +short`;

    return {
      bindRecords: lines.join("\n"),
      digCommand: dig,
    };
  }, [domain, selectedCas, allowWildcards, wildcardCas, iodefEmail]);

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
            Security Incident Reporting (`iodef`)
          </label>
          <input
            type="email"
            value={iodefEmail}
            onChange={(e) => setIodefEmail(e.target.value)}
            placeholder="security@example.com"
            className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Notified if unauthorized CA issuance is attempted</span>
        </div>
      </div>

      {/* Allowed CAs Multi-Select */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Authorized Certificate Authorities (`issue`)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CA_PRESETS.map((ca) => {
            const active = selectedCas.includes(ca.tag);
            return (
              <button
                key={ca.tag}
                onClick={() => toggleCa(ca.tag)}
                className={`p-2.5 text-xs font-bold rounded-xl border text-left transition-colors flex items-center justify-between ${
                  active
                    ? "bg-blue-600/10 border-blue-600 text-blue-600 dark:text-blue-400"
                    : "bg-muted/40 border-border text-foreground hover:bg-muted"
                }`}
              >
                <span>{ca.name}</span>
                {active ? <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" /> : <span className="text-[10px] text-muted-foreground">+</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Wildcard Rule */}
      <div className="p-4 bg-card border border-border rounded-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-foreground block">Allow Wildcard SSL Issuance (`issuewild`)</span>
          <span className="text-[11px] text-muted-foreground">
            Disabling wildcards (`issuewild ";"`) prevents attackers from issuing `*.example.com` certificates.
          </span>
        </div>
        <button
          onClick={() => setAllowWildcards(!allowWildcards)}
          className={`px-4 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
            allowWildcards ? "bg-emerald-600 text-white border-emerald-600" : "bg-rose-600 text-white border-rose-600"
          }`}
        >
          {allowWildcards ? "Wildcards Allowed" : "Wildcards Forbidden"}
        </button>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Generated DNS CAA Records (BIND Zone Format)
          </h4>
          <button
            onClick={() => handleCopy("bind", bindRecords)}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copiedKey === "bind" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === "bind" ? "Copied!" : "Copy BIND Records"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {bindRecords}
        </pre>

        <div className="p-3 bg-card border border-border rounded-xl space-y-1 font-mono text-xs">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-muted-foreground">Terminal Verification Command:</span>
            <button
              onClick={() => handleCopy("dig", digCommand)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              {copiedKey === "dig" ? "Copied!" : "Copy Command"}
            </button>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 select-all">{digCommand}</p>
        </div>
      </div>
    </div>
  );
}
