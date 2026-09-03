"use client";

import { useState, useMemo } from "react";
import { ShieldAlert, Copy, Check, Sparkles, Terminal, Globe, Lock } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_HASH = "d2abf1c3822d4f394856d61b0d353e1642645ab18f7f44e119c3a65374505890";

export function TlsaRecordGenerator() {
  const [domain, setDomain] = useState<string>("mail.example.com");
  const [port, setPort] = useState<number>(25); // 25 for SMTP, 443 for HTTPS
  const [protocol, setProtocol] = useState<string>("tcp");
  const [usage, setUsage] = useState<number>(3); // 3 = DANE-EE
  const [selector, setSelector] = useState<number>(1); // 1 = SPKI (Public Key)
  const [matchingType, setMatchingType] = useState<number>(1); // 1 = SHA-256
  const [certHash, setCertHash] = useState<string>(SAMPLE_HASH);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { recordName, recordValue, bindLine, opensslExtractCmd, digTestCmd } = useMemo(() => {
    const cleanDomain = domain.trim().replace(/^\.+|\.+$/g, "") || "example.com";
    const name = `_${port}._${protocol}.${cleanDomain}.`;
    const cleanHash = certHash.trim().replace(/\s+/g, "").toLowerCase();
    const val = `${usage} ${selector} ${matchingType} ${cleanHash || SAMPLE_HASH}`;
    const bind = `${name}  3600  IN  TLSA  ${val}`;

    // OpenSSL command to extract SPKI SHA-256 for this host
    let opensslCmd = "";
    if (port === 25) {
      opensslCmd = `openssl s_client -connect ${cleanDomain}:25 -starttls smtp < /dev/null 2>/dev/null | openssl x509 -pubkey -noout | openssl pkey -pubin -outform DER | openssl dgst -sha256 -hex`;
    } else {
      opensslCmd = `openssl s_client -connect ${cleanDomain}:${port} < /dev/null 2>/dev/null | openssl x509 -pubkey -noout | openssl pkey -pubin -outform DER | openssl dgst -sha256 -hex`;
    }

    const dig = `dig TLSA _${port}._${protocol}.${cleanDomain} +dnssec +short`;

    return {
      recordName: name,
      recordValue: val,
      bindLine: bind,
      opensslExtractCmd: opensslCmd,
      digTestCmd: dig,
    };
  }, [domain, port, protocol, usage, selector, matchingType, certHash]);

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
            Host / Subdomain
          </label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="mail.example.com"
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Service Port
          </label>
          <select
            value={port}
            onChange={(e) => setPort(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={25}>Port 25 (SMTP Mail - Recommended for DANE)</option>
            <option value={443}>Port 443 (HTTPS Web)</option>
            <option value={587}>Port 587 (Submission)</option>
            <option value={465}>Port 465 (SMTPS)</option>
            <option value={993}>Port 993 (IMAPS)</option>
          </select>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Protocol
          </label>
          <select
            value={protocol}
            onChange={(e) => setProtocol(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value="tcp">TCP (Standard)</option>
            <option value="udp">UDP</option>
          </select>
        </div>
      </div>

      {/* DANE Parameters (Usage, Selector, Matching) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            1. Certificate Usage
          </label>
          <select
            value={usage}
            onChange={(e) => setUsage(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={3}>3 - DANE-EE (Domain Issued Cert / Standard)</option>
            <option value={2}>2 - DANE-TA (Trust Anchor Assertion)</option>
            <option value={1}>1 - PKIX-EE (CA Constrained Cert)</option>
            <option value={0}>0 - PKIX-TA (CA Constrained Trust Anchor)</option>
          </select>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            2. Selector
          </label>
          <select
            value={selector}
            onChange={(e) => setSelector(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={1}>1 - SPKI (Public Key only - Survives Renewal)</option>
            <option value={0}>0 - Full Certificate</option>
          </select>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            3. Matching Type
          </label>
          <select
            value={matchingType}
            onChange={(e) => setMatchingType(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value={1}>1 - SHA-256 (64 hex characters - Standard)</option>
            <option value={2}>2 - SHA-512 (128 hex characters)</option>
            <option value={0}>0 - Full Exact Hex</option>
          </select>
        </div>
      </div>

      {/* SHA-256 Hash Input */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Certificate / Public Key Fingerprint (SHA-256 Hex)
        </label>
        <input
          type="text"
          value={certHash}
          onChange={(e) => setCertHash(e.target.value)}
          placeholder="Paste 64-character SHA-256 hash here..."
          className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground"
        />
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-emerald-500" />
            Generated DNS TLSA Record (RFC 6698)
          </h4>
          <button
            onClick={() => handleCopy("bind", bindLine)}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copiedKey === "bind" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === "bind" ? "Copied!" : "Copy BIND Record"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {bindLine}
        </pre>

        {/* Extraction Helper */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2 font-mono text-xs">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-foreground">Terminal Command to Extract Fingerprint:</span>
            <button
              onClick={() => handleCopy("extract", opensslExtractCmd)}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              {copiedKey === "extract" ? "Copied!" : "Copy OpenSSL"}
            </button>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 select-all">{opensslExtractCmd}</p>
        </div>
      </div>
    </div>
  );
}
