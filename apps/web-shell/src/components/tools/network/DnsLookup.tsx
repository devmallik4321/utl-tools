"use client";

import { useState } from "react";
import { Search, Globe, Check, Copy, AlertCircle, RefreshCw } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface DnsAnswer {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

const RECORD_TYPES: Record<string, number> = {
  ANY: 255,
  A: 1,
  AAAA: 28,
  CNAME: 5,
  MX: 15,
  TXT: 16,
  NS: 2,
  SOA: 6,
  CAA: 257,
};

const TYPE_NAMES: Record<number, string> = {
  1: "A",
  28: "AAAA",
  5: "CNAME",
  15: "MX",
  16: "TXT",
  2: "NS",
  6: "SOA",
  257: "CAA",
};

export function DnsLookup() {
  const [domain, setDomain] = useState<string>("github.com");
  const [recordType, setRecordType] = useState<string>("A");
  const [loading, setLoading] = useState<boolean>(false);
  const [records, setRecords] = useState<DnsAnswer[]>([
    { name: "github.com", type: 1, TTL: 60, data: "140.82.121.3" },
    { name: "github.com", type: 1, TTL: 60, data: "140.82.121.4" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const queryDns = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanDomain = domain.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!cleanDomain) return;

    setLoading(true);
    setError(null);

    try {
      // Query Cloudflare DNS-over-HTTPS
      const typeCode = RECORD_TYPES[recordType] || 1;
      const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(cleanDomain)}&type=${recordType === "ANY" ? "A" : recordType}`;
      const res = await fetch(url, {
        headers: { Accept: "application/dns-json" },
      });

      if (!res.ok) throw new Error("DNS resolution request failed.");

      const json = await res.json();
      if (json.Status !== 0 && (!json.Answer || json.Answer.length === 0)) {
        if (json.Status === 3) {
          setError(`NXDOMAIN: The domain '${cleanDomain}' does not exist.`);
        } else {
          setError(`No ${recordType} records found for '${cleanDomain}' (Status: ${json.Status}).`);
        }
        setRecords([]);
      } else {
        setRecords(json.Answer || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to query DNS. Please verify your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const copyRecord = async (text: string, idx: number) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 1800);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar Form */}
      <div className="p-5 bg-card border border-border rounded-xl">
        <form onSubmit={queryDns} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-7 relative">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="Enter domain (e.g. google.com, vercel.com)"
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <Globe className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="sm:col-span-3">
            <select
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none"
            >
              {Object.keys(RECORD_TYPES).map((rt) => (
                <option key={rt} value={rt}>
                  {rt} Record
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs sm:text-sm rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1.5 shadow"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>{loading ? "Querying..." : "Lookup"}</span>
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Table */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
            DNS Answers ({records.length})
          </span>
          <span className="text-[11px] text-muted-foreground">
            Queried via Cloudflare 1.1.1.1 (DoH)
          </span>
        </div>

        {records.length === 0 && !error && !loading ? (
          <p className="text-xs text-muted-foreground py-8 text-center">
            No records to display. Enter a domain and click Lookup.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground uppercase font-semibold text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">TTL</th>
                  <th className="py-2.5 px-3">Data / Value</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {records.map((r, i) => (
                  <tr key={i} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-3 text-foreground font-medium">{r.name}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[10px] font-bold">
                        {TYPE_NAMES[r.type] || r.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">{r.TTL}s</td>
                    <td className="py-3 px-3 text-foreground font-bold break-all select-all">
                      {r.data}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => copyRecord(r.data, i)}
                        className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                        title="Copy Value"
                      >
                        {copiedIndex === i ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
