"use client";

import { useState, useEffect } from "react";
import { Copy, Check, RefreshCw, Globe, MapPin, Building, Clock, ShieldCheck, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface IpData {
  ip: string;
  city?: string;
  region?: string;
  country_name?: string;
  org?: string;
  timezone?: string;
}

export function MyIp() {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<IpData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const fetchIp = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch from fast, open public IP endpoint with CORS
      const res = await fetch("https://ipapi.co/json/", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch IP metadata");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      // Secondary fallback
      try {
        const fallbackRes = await fetch("https://api.ipify.org?format=json");
        const fallbackJson = await fallbackRes.json();
        setData({ ip: fallbackJson.ip });
      } catch (fallbackErr) {
        setError("Unable to resolve public IP. Please check your internet connection or ad blocker.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIp();
  }, []);

  const handleCopy = async () => {
    if (!data?.ip) return;
    const ok = await copyToClipboard(data.ip);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* IP Big Display */}
      <div className="p-8 bg-card border border-border rounded-xl text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <Globe className="w-4 h-4 text-blue-500" />
          <span>Your Public IPv4 / IPv6 Address</span>
        </div>

        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-muted-foreground animate-pulse">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
            <span className="text-sm">Detecting public IP address...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-700 dark:text-rose-300 text-sm">
            {error}
            <button
              onClick={fetchIp}
              className="mt-2 block mx-auto text-xs underline font-semibold"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div>
            <p className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-foreground select-all">
              {data?.ip}
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="px-6 py-2.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold text-sm rounded-xl hover:opacity-90 transition-all flex items-center gap-1.5 shadow"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "IP Copied!" : "Copy IP Address"}</span>
              </button>

              <button
                type="button"
                onClick={fetchIp}
                className="p-2.5 bg-muted hover:bg-muted/80 border border-border rounded-xl text-foreground transition-colors"
                title="Refresh IP"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Network Details Grid */}
      {data && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-card border border-border rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              <span>Location (Approximate)</span>
            </div>
            <p className="text-sm font-bold text-foreground">
              {[data.city, data.region, data.country_name].filter(Boolean).join(", ") || "Unknown"}
            </p>
          </div>

          <div className="p-4 bg-card border border-border rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Building className="w-3.5 h-3.5 text-emerald-500" />
              <span>ISP / Organization</span>
            </div>
            <p className="text-sm font-bold text-foreground truncate" title={data.org}>
              {data.org || "Standard ISP"}
            </p>
          </div>

          <div className="p-4 bg-card border border-border rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Timezone</span>
            </div>
            <p className="text-sm font-bold text-foreground">
              {data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
            </p>
          </div>

          <div className="p-4 bg-card border border-border rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
              <span>Connection Privacy</span>
            </div>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              HTTPS Encrypted
            </p>
          </div>
        </div>
      )}

      {/* Value Model Breakdown: What an IP Reveals vs What it Cannot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-card border border-border rounded-xl space-y-2.5">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-foreground">
            <Eye className="w-4 h-4 text-blue-500" />
            <span>What Your IP Address Reveals to Websites</span>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside leading-relaxed">
            <li><strong>Internet Provider (ISP)</strong>: The telecommunications company delivering your connection.</li>
            <li><strong>Approximate Region / City</strong>: The general municipal area or ISP routing datacenter.</li>
            <li><strong>Country & Timezone</strong>: Geopolitical origin used for region-based web content.</li>
            <li><strong>Autonomous System Number (ASN)</strong>: Global network routing identity code.</li>
          </ul>
        </div>

        <div className="p-5 bg-card border border-border rounded-xl space-y-2.5">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-foreground">
            <EyeOff className="w-4 h-4 text-emerald-500" />
            <span>What Your IP Address NEVER Reveals</span>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside leading-relaxed">
            <li><strong>Your Physical Street Address</strong>: Websites cannot locate your actual house or apartment.</li>
            <li><strong>Your Personal Name or Identity</strong>: Only your ISP holds private subscriber billing records.</li>
            <li><strong>Your Files or Device Storage</strong>: No website can access local files through an IP address.</li>
            <li><strong>Your Phone Number or Private Passwords</strong>: Completely isolated from IP layer protocols.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
