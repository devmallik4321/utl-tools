"use client";

import { useState, useMemo } from "react";
import { Server, Copy, Check, Sparkles, Terminal, Globe, Network, PhoneCall } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const PRESETS = [
  {
    name: "SIP TLS (Encrypted VoIP)",
    order: 10,
    pref: 10,
    flags: "s",
    service: "SIPS+D2T",
    regexp: "",
    replacement: "_sips._tcp.example.com.",
  },
  {
    name: "SIP UDP (Standard VoIP)",
    order: 20,
    pref: 10,
    flags: "s",
    service: "SIP+D2U",
    regexp: "",
    replacement: "_sip._udp.example.com.",
  },
  {
    name: "ENUM E.164 Phone to SIP URI",
    order: 100,
    pref: 10,
    flags: "u",
    service: "E2U+sip",
    regexp: "!^\\+?1555(.*)$!sip:\\1@sip.example.com!",
    replacement: ".",
  },
  {
    name: "SIP over WebSockets (WSS)",
    order: 10,
    pref: 20,
    flags: "s",
    service: "SIP+D2W",
    regexp: "",
    replacement: "_sip._wss.example.com.",
  },
];

export function NaptrRecordGenerator() {
  const [domain, setDomain] = useState<string>("example.com");
  const [order, setOrder] = useState<number>(10);
  const [preference, setPreference] = useState<number>(10);
  const [flags, setFlags] = useState<string>("s");
  const [service, setService] = useState<string>("SIPS+D2T");
  const [regexp, setRegexp] = useState<string>("");
  const [replacement, setReplacement] = useState<string>("_sips._tcp.example.com.");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const applyPreset = (p: typeof PRESETS[0]) => {
    setOrder(p.order);
    setPreference(p.pref);
    setFlags(p.flags);
    setService(p.service);
    setRegexp(p.regexp);
    setReplacement(p.replacement);
  };

  const { bindRecord, digCommand } = useMemo(() => {
    const d = domain.trim() || "example.com";
    const rep = replacement.trim() ? (replacement.endsWith(".") ? replacement : `${replacement}.`) : ".";
    const reg = regexp.trim() ? `"${regexp}"` : `""`;
    const flg = flags.trim() ? `"${flags}"` : `""`;
    const srv = service.trim() ? `"${service}"` : `""`;

    // BIND format:
    // example.com. IN NAPTR 10 10 "s" "SIPS+D2T" "" _sips._tcp.example.com.
    const bRecord = `${d}. IN NAPTR ${order} ${preference} ${flg} ${srv} ${reg} ${rep}`;
    const dig = `dig NAPTR ${d} +trace`;

    return {
      bindRecord: bRecord,
      digCommand: dig,
    };
  }, [domain, order, preference, flags, service, regexp, replacement]);

  const handleCopy = async (key: string, val: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => applyPreset(p)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border bg-card border-border text-foreground hover:bg-muted transition-colors"
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Input Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2 sm:col-span-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Domain Name or ENUM Zone
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
            Order (Priority)
          </label>
          <input
            type="number"
            min={0}
            max={65535}
            value={order}
            onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Lower evaluated first</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Preference (Tie-breaker)
          </label>
          <input
            type="number"
            min={0}
            max={65535}
            value={preference}
            onChange={(e) => setPreference(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Tie-breaker for same order</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Flags
          </label>
          <select
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value="s">"s" (SRV Record Terminal Lookup)</option>
            <option value="a">"a" (A/AAAA Record Terminal Lookup)</option>
            <option value="u">"u" (URI / SIP Terminal Regex)</option>
            <option value="p">"p" (Protocol-Specific Lookup)</option>
            <option value="">"" (Non-terminal rule)</option>
          </select>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Service Specifier
          </label>
          <input
            type="text"
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">e.g. SIPS+D2T, SIP+D2U, E2U+sip</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Regexp String
          </label>
          <input
            type="text"
            value={regexp}
            onChange={(e) => setRegexp(e.target.value)}
            placeholder="!^.*$!sip:user@host!"
            className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Leave empty if using replacement</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Replacement FQDN
          </label>
          <input
            type="text"
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
            placeholder="_sip._udp.example.com."
            className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Enter . if using regex</span>
        </div>
      </div>

      {/* Generated BIND Record Output */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between font-sans">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Server className="w-4 h-4 text-emerald-500" />
            RFC 3403 NAPTR DNS Record (BIND / Zone File)
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
          <span className="font-bold text-muted-foreground">Verification Command:</span>
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
  );
}
