"use client";

import { useState, useMemo } from "react";
import { Server, Copy, Check, Sparkles, Terminal, Globe, ShieldCheck } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const PRESETS = [
  { name: "Minecraft Server", service: "_minecraft", proto: "_tcp", port: 25565 },
  { name: "SIP (VoIP TLS)", service: "_sip", proto: "_tls", port: 5061 },
  { name: "Active Directory LDAP", service: "_ldap", proto: "_tcp", port: 389 },
  { name: "XMPP / Jabber", service: "_xmpp-client", proto: "_tcp", port: 5222 },
];

export function SrvRecordGenerator() {
  const [service, setService] = useState<string>("_minecraft");
  const [proto, setProto] = useState<string>("_tcp");
  const [domain, setDomain] = useState<string>("example.com");
  const [priority, setPriority] = useState<number>(0);
  const [weight, setWeight] = useState<number>(5);
  const [port, setPort] = useState<number>(25565);
  const [target, setTarget] = useState<string>("mc.hostnode1.com");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { recordName, recordValue, bindRecord, digCommand } = useMemo(() => {
    const s = service.startsWith("_") ? service : `_${service}`;
    const p = proto.startsWith("_") ? proto : `_${proto}`;
    const d = domain.trim().replace(/^\.+|\.+$/g, "") || "example.com";
    const t = target.trim().replace(/^\.+|\.+$/g, "") || "target.example.com";

    const name = `${s}.${p}.${d}.`;
    const val = `${priority} ${weight} ${port} ${t}.`;
    const bind = `${name}  3600  IN  SRV  ${val}`;
    const dig = `dig SRV ${s}.${p}.${d} +short`;

    return {
      recordName: name,
      recordValue: val,
      bindRecord: bind,
      digCommand: dig,
    };
  }, [service, proto, domain, priority, weight, port, target]);

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
        {PRESETS.map((pr) => (
          <button
            key={pr.name}
            onClick={() => {
              setService(pr.service);
              setProto(pr.proto);
              setPort(pr.port);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
              service === pr.service && proto === pr.proto
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            {pr.name}
          </button>
        ))}
      </div>

      {/* Main Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Service Tag
          </label>
          <input
            type="text"
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="_minecraft"
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Protocol Tag
          </label>
          <select
            value={proto}
            onChange={(e) => setProto(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold bg-background border border-border rounded-lg text-foreground"
          >
            <option value="_tcp">_tcp (Transmission Control Protocol)</option>
            <option value="_udp">_udp (User Datagram Protocol)</option>
            <option value="_tls">_tls (Transport Layer Security)</option>
          </select>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Apex Domain
          </label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* SRV Targets & Weight */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Priority
          </label>
          <input
            type="number"
            min={0}
            max={65535}
            value={priority}
            onChange={(e) => setPriority(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Lower = higher priority (0 is first)</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Weight
          </label>
          <input
            type="number"
            min={0}
            max={65535}
            value={weight}
            onChange={(e) => setWeight(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Load-balancing ratio among same priority</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Port
          </label>
          <input
            type="number"
            min={1}
            max={65535}
            value={port}
            onChange={(e) => setPort(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-3 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">Target service port</span>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Target Host
          </label>
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="mc.hostnode.com"
            className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground"
          />
          <span className="text-[10px] text-muted-foreground">FQDN of server (no IP addresses)</span>
        </div>
      </div>

      {/* Results Overview */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Server className="w-4 h-4 text-emerald-500" />
            Generated DNS SRV Record (RFC 2782)
          </h4>
          <button
            onClick={() => handleCopy("bind", bindRecord)}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copiedKey === "bind" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === "bind" ? "Copied!" : "Copy BIND Record"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {bindRecord}
        </pre>

        {/* Cloudflare / UI Table */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2 font-mono text-xs">
          <span className="font-bold text-foreground font-sans">DNS Management Panel Mapping:</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-muted-foreground">
            <div>Name: <span className="text-foreground font-semibold">{service}.{proto}</span></div>
            <div>Priority: <span className="text-foreground font-semibold">{priority}</span></div>
            <div>Weight: <span className="text-foreground font-semibold">{weight}</span></div>
            <div>Port: <span className="text-foreground font-semibold">{port}</span></div>
          </div>
          <div>Target: <span className="text-foreground font-semibold">{target}</span></div>
        </div>

        {/* Dig Command */}
        <div className="p-3 bg-card border border-border rounded-xl space-y-1 font-mono text-xs">
          <div className="flex justify-between items-center font-sans">
            <span className="font-bold text-muted-foreground">Terminal Test Command:</span>
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
