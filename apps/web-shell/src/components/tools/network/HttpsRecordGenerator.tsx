"use client";

import { useState, useMemo } from "react";
import { Globe, Server, Copy, Check, Sparkles, Terminal, ShieldCheck, Zap } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function HttpsRecordGenerator() {
  const [domain, setDomain] = useState<string>("example.com");
  const [priority, setPriority] = useState<number>(1); // 0 = AliasMode, >0 = ServiceMode
  const [targetName, setTargetName] = useState<string>(".");
  const [alpnH3, setAlpnH3] = useState<boolean>(true);
  const [alpnH2, setAlpnH2] = useState<boolean>(true);
  const [ipv4Hints, setIpv4Hints] = useState<string>("198.51.100.10");
  const [ipv6Hints, setIpv6Hints] = useState<string>("2001:db8::10");
  const [port, setPort] = useState<number>(443);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { bindRecord, cloudflareFormat, digQuery } = useMemo(() => {
    const d = domain.trim() || "example.com";
    const target = targetName.trim() || ".";

    if (priority === 0) {
      // AliasMode
      const bRecord = `${d}. IN HTTPS 0 ${target.endsWith(".") || target === "." ? target : `${target}.`}`;
      const cf = `Name: ${d} | Type: HTTPS | Priority: 0 | Target: ${target}`;
      return {
        bindRecord: bRecord,
        cloudflareFormat: cf,
        digQuery: `dig HTTPS ${d} +dnssec`,
      };
    }

    // ServiceMode
    const alpnList: string[] = [];
    if (alpnH3) alpnList.push("h3");
    if (alpnH2) alpnList.push("h2");

    const params: string[] = [];
    if (alpnList.length > 0) {
      params.push(`alpn="${alpnList.join(",")}"`);
    }
    if (ipv4Hints.trim()) {
      params.push(`ipv4hint="${ipv4Hints.trim()}"`);
    }
    if (ipv6Hints.trim()) {
      params.push(`ipv6hint="${ipv6Hints.trim()}"`);
    }
    if (port !== 443 && port > 0) {
      params.push(`port="${port}"`);
    }

    const bRecord = `${d}. IN HTTPS ${priority} ${target} ${params.join(" ")}`;
    const cf = `Name: ${d} | Priority: ${priority} | Target: ${target} | Value: ${params.join(" ")}`;

    return {
      bindRecord: bRecord,
      cloudflareFormat: cf,
      digQuery: `dig HTTPS ${d} +dnssec`,
    };
  }, [domain, priority, targetName, alpnH3, alpnH2, ipv4Hints, ipv6Hints, port]);

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
            Domain Name (FQDN)
          </label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Priority (0 = AliasMode, &gt;0 = ServiceMode)
          </label>
          <input
            type="number"
            min={0}
            max={65535}
            value={priority}
            onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-blue-600 dark:text-blue-400"
          />
          <span className="text-[10px] text-muted-foreground">0 delegates to target alias</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Target Name (. for self)
          </label>
          <input
            type="text"
            value={targetName}
            onChange={(e) => setTargetName(e.target.value)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Use . if hosted on origin</span>
        </div>
      </div>

      {priority > 0 && (
        <div className="p-4 bg-card border border-border rounded-xl space-y-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
            RFC 9460 Service Parameters
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground block">ALPN Protocols</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setAlpnH3(!alpnH3)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                    alpnH3 ? "bg-emerald-600 text-white border-emerald-600" : "bg-card border-border text-foreground hover:bg-muted"
                  }`}
                >
                  h3 (HTTP/3 QUIC)
                </button>
                <button
                  onClick={() => setAlpnH2(!alpnH2)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                    alpnH2 ? "bg-emerald-600 text-white border-emerald-600" : "bg-card border-border text-foreground hover:bg-muted"
                  }`}
                >
                  h2 (HTTP/2)
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">IPv4 Hint (ipv4hint)</label>
              <input
                type="text"
                value={ipv4Hints}
                onChange={(e) => setIpv4Hints(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">IPv6 Hint (ipv6hint)</label>
              <input
                type="text"
                value={ipv6Hints}
                onChange={(e) => setIpv6Hints(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Port Override (Default 443)</label>
              <input
                type="number"
                value={port}
                onChange={(e) => setPort(parseInt(e.target.value) || 443)}
                className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground"
              />
            </div>
          </div>
        </div>
      )}

      {/* Generated Record Snippet */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between font-sans">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Server className="w-4 h-4 text-emerald-500" />
            RFC 9460 HTTPS DNS Record (BIND / Zone File)
          </h4>
          <button
            onClick={() => handleCopy("bind", bindRecord)}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copiedKey === "bind" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === "bind" ? "Copied!" : "Copy Record"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {bindRecord}
        </pre>
      </div>

      {/* Dig Command */}
      <div className="p-3 bg-card border border-border rounded-xl space-y-1 font-mono text-xs">
        <div className="flex justify-between items-center font-sans">
          <span className="font-bold text-muted-foreground">DNS Query Command:</span>
          <button
            onClick={() => handleCopy("dig", digQuery)}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
          >
            {copiedKey === "dig" ? "Copied!" : "Copy Command"}
          </button>
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-400 select-all">{digQuery}</p>
      </div>
    </div>
  );
}
