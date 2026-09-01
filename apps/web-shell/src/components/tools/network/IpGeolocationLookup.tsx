"use client";

import { useState, useMemo } from "react";
import { Globe, ShieldCheck, Search, Copy, Check, Info, Server, MapPin } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface IpAnalysis {
  ip: string;
  type: "IPv4" | "IPv6" | "Invalid";
  scope: "Public" | "Private (RFC 1918)" | "Loopback (RFC 1122)" | "Carrier-Grade NAT (RFC 6598)" | "Link-Local" | "Multicast";
  isReserved: boolean;
  reverseArpa: string;
  binaryRepresentation: string;
}

export function IpGeolocationLookup() {
  const [targetIp, setTargetIp] = useState<string>("8.8.8.8");
  const [geoData, setGeoData] = useState<any | null>(null);
  const [loadingGeo, setLoadingGeo] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Client-Side Deterministic IP Analyzer (100% Zero-Knowledge)
  const analysis = useMemo<IpAnalysis>(() => {
    const clean = targetIp.trim();

    // Check IPv4
    const v4Parts = clean.split(".");
    if (v4Parts.length === 4 && v4Parts.every((p) => /^\d+$/.test(p) && parseInt(p, 10) >= 0 && parseInt(p, 10) <= 255)) {
      const nums = v4Parts.map((p) => parseInt(p, 10));
      let scope: IpAnalysis["scope"] = "Public";
      let isReserved = false;

      if (nums[0] === 10) {
        scope = "Private (RFC 1918)";
        isReserved = true;
      } else if (nums[0] === 172 && nums[1] >= 16 && nums[1] <= 31) {
        scope = "Private (RFC 1918)";
        isReserved = true;
      } else if (nums[0] === 192 && nums[1] === 168) {
        scope = "Private (RFC 1918)";
        isReserved = true;
      } else if (nums[0] === 127) {
        scope = "Loopback (RFC 1122)";
        isReserved = true;
      } else if (nums[0] === 100 && nums[1] >= 64 && nums[1] <= 127) {
        scope = "Carrier-Grade NAT (RFC 6598)";
        isReserved = true;
      } else if (nums[0] === 169 && nums[1] === 254) {
        scope = "Link-Local";
        isReserved = true;
      } else if (nums[0] >= 224 && nums[0] <= 239) {
        scope = "Multicast";
        isReserved = true;
      }

      const reverseArpa = `${nums[3]}.${nums[2]}.${nums[1]}.${nums[0]}.in-addr.arpa`;
      const binaryRepresentation = nums.map((n) => n.toString(2).padStart(8, "0")).join(" ");

      return {
        ip: clean,
        type: "IPv4",
        scope,
        isReserved,
        reverseArpa,
        binaryRepresentation,
      };
    }

    // Check IPv6
    if (clean.includes(":") && clean.length >= 2) {
      return {
        ip: clean,
        type: "IPv6",
        scope: clean.startsWith("fe80") ? "Link-Local" : clean === "::1" ? "Loopback (RFC 1122)" : "Public",
        isReserved: clean === "::1" || clean.startsWith("fc00") || clean.startsWith("fe80"),
        reverseArpa: `${clean}.ip6.arpa`,
        binaryRepresentation: "IPv6 128-bit address structure",
      };
    }

    return {
      ip: clean,
      type: "Invalid",
      scope: "Public",
      isReserved: false,
      reverseArpa: "N/A",
      binaryRepresentation: "N/A",
    };
  }, [targetIp]);

  // Optional External Lookup with Explicit User Action
  const fetchLiveGeo = async () => {
    if (analysis.type === "Invalid" || analysis.isReserved) return;
    setLoadingGeo(true);
    try {
      const res = await fetch(`https://ipapi.co/${encodeURIComponent(targetIp.trim())}/json/`);
      if (res.ok) {
        const data = await res.json();
        setGeoData(data);
      } else {
        setGeoData({ error: "Geolocation data temporarily unavailable from public registry" });
      }
    } catch (err: any) {
      setGeoData({ error: "Network error fetching external geolocation" });
    } finally {
      setLoadingGeo(false);
    }
  };

  const handleCopy = async () => {
    const summary = `IP Analysis: ${targetIp}\n• Type: ${analysis.type}\n• Scope: ${analysis.scope}\n• Reverse DNS PTR: ${analysis.reverseArpa}\n• Binary: ${analysis.binaryRepresentation}${geoData && !geoData.error ? `\n• Geolocation: ${geoData.city}, ${geoData.region}, ${geoData.country_name} (${geoData.org || geoData.asn})` : ""}`;
    const ok = await copyToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Privacy Invariant Banner */}
      <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl flex items-start gap-2 text-emerald-800 dark:text-emerald-300 text-xs">
        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Zero-Knowledge Architecture:</span> Local IP analysis (subnet classification, RFC 1918 scope, reverse ARPA pointer, binary structure) executes 100% in your browser memory without server transmission.
        </div>
      </div>

      {/* Input Field */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
          Enter IPv4 or IPv6 Address
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={targetIp}
            onChange={(e) => {
              setTargetIp(e.target.value);
              setGeoData(null);
            }}
            placeholder="e.g. 8.8.8.8, 1.1.1.1, 192.168.1.1"
            className="flex-1 px-3.5 py-2 text-base font-mono font-bold bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={fetchLiveGeo}
            disabled={loadingGeo || analysis.type === "Invalid" || analysis.isReserved}
            className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{loadingGeo ? "Querying..." : "Query Public Geolocation"}</span>
          </button>
        </div>
      </div>

      {/* Deterministic Client-Side Analysis */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Server className="w-4 h-4 text-blue-500" />
            Deterministic IP Classification &amp; Scope
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Report"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">IP Protocol</span>
            <p className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              {analysis.type}
            </p>
            <span className="text-[10px] text-muted-foreground">Address format version</span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Network Scope</span>
            <p className="text-base font-bold font-mono text-foreground truncate">
              {analysis.scope}
            </p>
            <span className="text-[10px] text-muted-foreground">
              {analysis.isReserved ? "Private/Reserved non-routable range" : "Globally routable public internet"}
            </span>
          </div>

          <div className="p-4 bg-card rounded-xl border border-border space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Reverse DNS PTR</span>
            <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 truncate">
              {analysis.reverseArpa}
            </p>
            <span className="text-[10px] text-muted-foreground">ARPA zone pointer</span>
          </div>
        </div>

        <div className="p-3 bg-card rounded-lg border border-border text-xs font-mono space-y-1">
          <span className="text-[10px] text-muted-foreground font-sans uppercase font-bold block">
            32-Bit Binary Octet Stream
          </span>
          <p className="text-foreground font-bold">{analysis.binaryRepresentation}</p>
        </div>
      </div>

      {/* Geolocation Results (If explicitly triggered) */}
      {geoData && (
        <div className="p-5 bg-card border border-border rounded-xl space-y-3">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-500" />
            Public Geolocation &amp; ISP Data
          </h4>

          {geoData.error ? (
            <p className="text-xs text-rose-600 dark:text-rose-400">{geoData.error}</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-muted/40 rounded-lg space-y-0.5">
                <span className="text-[10px] text-muted-foreground font-bold uppercase">City &amp; Region</span>
                <p className="font-bold text-foreground">{geoData.city}, {geoData.region}</p>
              </div>

              <div className="p-3 bg-muted/40 rounded-lg space-y-0.5">
                <span className="text-[10px] text-muted-foreground font-bold uppercase">Country</span>
                <p className="font-bold text-foreground">{geoData.country_name} ({geoData.country_code})</p>
              </div>

              <div className="p-3 bg-muted/40 rounded-lg space-y-0.5">
                <span className="text-[10px] text-muted-foreground font-bold uppercase">Organization / ISP</span>
                <p className="font-bold text-foreground truncate">{geoData.org || geoData.asn || "N/A"}</p>
              </div>

              <div className="p-3 bg-muted/40 rounded-lg space-y-0.5">
                <span className="text-[10px] text-muted-foreground font-bold uppercase">Timezone</span>
                <p className="font-bold text-foreground">{geoData.timezone || "N/A"}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
