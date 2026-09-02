"use client";

import { useState, useMemo } from "react";
import { Globe, Search, Copy, Check, Sparkles, ShieldCheck, Terminal } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface DnsProvider {
  name: string;
  focus: string;
  ipv4Primary: string;
  ipv4Secondary: string;
  ipv6Primary: string;
  dohUrl: string;
}

const PROVIDERS: DnsProvider[] = [
  {
    name: "Cloudflare",
    focus: "Speed & Privacy (No logging)",
    ipv4Primary: "1.1.1.1",
    ipv4Secondary: "1.0.0.1",
    ipv6Primary: "2606:4700:4700::1111",
    dohUrl: "https://cloudflare-dns.com/dns-query",
  },
  {
    name: "Google Public DNS",
    focus: "Global Reach & Performance",
    ipv4Primary: "8.8.8.8",
    ipv4Secondary: "8.8.4.4",
    ipv6Primary: "2001:4860:4860::8888",
    dohUrl: "https://dns.google/dns-query",
  },
  {
    name: "Quad9",
    focus: "Security & Threat Blocking (Malware/Phishing)",
    ipv4Primary: "9.9.9.9",
    ipv4Secondary: "149.112.112.112",
    ipv6Primary: "2620:fe::fe",
    dohUrl: "https://dns.quad9.net/dns-query",
  },
  {
    name: "Cisco OpenDNS",
    focus: "Reliability & Web Filtering",
    ipv4Primary: "208.67.222.222",
    ipv4Secondary: "208.67.220.220",
    ipv6Primary: "2620:119:35::35",
    dohUrl: "https://doh.opendns.com/dns-query",
  },
  {
    name: "AdGuard DNS",
    focus: "Ad & Tracker Blocking",
    ipv4Primary: "94.140.14.14",
    ipv4Secondary: "94.140.15.15",
    ipv6Primary: "2a10:50c0::ad1:ff",
    dohUrl: "https://dns.adguard-dns.com/dns-query",
  },
  {
    name: "CleanBrowsing",
    focus: "Family & Adult Content Filter",
    ipv4Primary: "185.228.168.168",
    ipv4Secondary: "185.228.169.168",
    ipv6Primary: "2a0d:2a00:1::",
    dohUrl: "https://doh.cleanbrowsing.org/doh/family-filter/",
  },
];

export function DnsResolversReference() {
  const [search, setSearch] = useState<string>("");
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return PROVIDERS;
    return PROVIDERS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.ipv4Primary.includes(q) ||
        p.focus.toLowerCase().includes(q)
    );
  }, [search]);

  const handleCopy = async (text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedIp(text);
      setTimeout(() => setCopiedIp(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search resolver (e.g. Cloudflare, 1.1.1.1, Google, malware blocking)..."
          className="w-full pl-9 pr-3 py-2 text-xs bg-background border border-border rounded-xl text-foreground"
        />
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((p) => (
          <div key={p.name} className="p-4 bg-card border border-border rounded-xl space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-sm text-foreground">{p.name}</h4>
                <p className="text-[11px] text-muted-foreground">{p.focus}</p>
              </div>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded font-bold">
                Anycast Global
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="p-2 bg-muted/40 rounded-lg flex justify-between items-center">
                <div>
                  <span className="text-[9px] text-muted-foreground uppercase block font-sans">Primary IPv4</span>
                  <span className="font-bold text-foreground">{p.ipv4Primary}</span>
                </div>
                <button
                  onClick={() => handleCopy(p.ipv4Primary)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  {copiedIp === p.ipv4Primary ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="p-2 bg-muted/40 rounded-lg flex justify-between items-center">
                <div>
                  <span className="text-[9px] text-muted-foreground uppercase block font-sans">Secondary IPv4</span>
                  <span className="font-bold text-foreground">{p.ipv4Secondary}</span>
                </div>
                <button
                  onClick={() => handleCopy(p.ipv4Secondary)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  {copiedIp === p.ipv4Secondary ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="text-[10px] font-mono text-muted-foreground truncate">
              <strong className="font-sans text-foreground">DoH:</strong> {p.dohUrl}
            </div>
          </div>
        ))}
      </div>

      {/* Flush DNS Cheat Sheet */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-emerald-500" />
          Clear &amp; Flush Local DNS Cache Commands
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
          <div className="p-3 bg-card border border-border rounded-lg flex justify-between items-center">
            <div>
              <span className="text-[10px] text-muted-foreground font-sans uppercase block">Windows</span>
              <span>ipconfig /flushdns</span>
            </div>
            <button
              onClick={() => handleCopy("ipconfig /flushdns")}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              {copiedIp === "ipconfig /flushdns" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="p-3 bg-card border border-border rounded-lg flex justify-between items-center">
            <div>
              <span className="text-[10px] text-muted-foreground font-sans uppercase block">macOS</span>
              <span>sudo dscacheutil -flushcache</span>
            </div>
            <button
              onClick={() => handleCopy("sudo dscacheutil -flushcache")}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              {copiedIp === "sudo dscacheutil -flushcache" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="p-3 bg-card border border-border rounded-lg flex justify-between items-center">
            <div>
              <span className="text-[10px] text-muted-foreground font-sans uppercase block">Linux (systemd)</span>
              <span>sudo resolvectl flush-caches</span>
            </div>
            <button
              onClick={() => handleCopy("sudo resolvectl flush-caches")}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              {copiedIp === "sudo resolvectl flush-caches" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
