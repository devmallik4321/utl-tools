"use client";

import { useState, useMemo } from "react";
import { Globe, Search, Copy, Check, Sparkles, ExternalLink, AlertCircle } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface StatusCode {
  code: number;
  phrase: string;
  category: "1xx" | "2xx" | "3xx" | "4xx" | "5xx";
  description: string;
  cause: string;
}

const HTTP_CODES: StatusCode[] = [
  { code: 200, phrase: "OK", category: "2xx", description: "Standard successful HTTP request.", cause: "Server fulfilled the requested action." },
  { code: 201, phrase: "Created", category: "2xx", description: "Request fulfilled and resulted in a new resource.", cause: "Typical response to a successful POST or PUT." },
  { code: 204, phrase: "No Content", category: "2xx", description: "Request processed successfully with empty payload body.", cause: "DELETE or PUT actions that don't return representations." },
  { code: 301, phrase: "Moved Permanently", category: "3xx", description: "Target resource assigned a permanent new URI.", cause: "Permanent URL canonicalization or HTTP to HTTPS redirect." },
  { code: 302, phrase: "Found / Temporary Redirect", category: "3xx", description: "Target resource temporarily resides under a different URI.", cause: "Temporary auth gate or maintenance redirect." },
  { code: 304, phrase: "Not Modified", category: "3xx", description: "Cached version is valid; no body returned.", cause: "Conditional GET with If-None-Match or If-Modified-Since headers." },
  { code: 400, phrase: "Bad Request", category: "4xx", description: "Server cannot process request due to client error.", cause: "Malformed syntax, invalid JSON, or missing required headers." },
  { code: 401, phrase: "Unauthorized", category: "4xx", description: "Request lacks valid authentication credentials.", cause: "Missing or expired JWT/OAuth token or API key." },
  { code: 403, phrase: "Forbidden", category: "4xx", description: "Server understands request but refuses authorization.", cause: "User is authenticated but lacks required role/permissions." },
  { code: 404, phrase: "Not Found", category: "4xx", description: "Origin server did not find current representation.", cause: "Broken link, deleted resource, or typo in API route URL." },
  { code: 405, phrase: "Method Not Allowed", category: "4xx", description: "Request method not supported for target resource.", cause: "Sending a POST to an endpoint that only accepts GET." },
  { code: 408, phrase: "Request Timeout", category: "4xx", description: "Client did not produce a request within server timeout.", cause: "Slow connection or stalled TCP payload." },
  { code: 409, phrase: "Conflict", category: "4xx", description: "Request conflicts with current state of resource.", cause: "Duplicate key violation, concurrent edit, or git push conflict." },
  { code: 422, phrase: "Unprocessable Entity", category: "4xx", description: "Syntax is correct but semantic instructions fail.", cause: "Validation errors (e.g. invalid email format or negative price)." },
  { code: 429, phrase: "Too Many Requests", category: "4xx", description: "Client sent too many requests in given timeframe.", cause: "Rate limit exceeded (look for Retry-After header)." },
  { code: 500, phrase: "Internal Server Error", category: "5xx", description: "Generic catch-all error when an unhandled exception occurs.", cause: "Unhandled code bug, crash, or database connection drop." },
  { code: 502, phrase: "Bad Gateway", category: "5xx", description: "Gateway or proxy received invalid response from upstream.", cause: "Node/Python backend process died behind Nginx/Cloudflare." },
  { code: 503, phrase: "Service Unavailable", category: "5xx", description: "Server currently unable to handle request due to overload.", cause: "High traffic spike or planned maintenance window." },
  { code: 504, phrase: "Gateway Timeout", category: "5xx", description: "Proxy did not receive timely response from upstream.", cause: "Backend database query ran too long before proxy timeout." },
];

export function HttpStatusReference() {
  const [search, setSearch] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [copiedCode, setCopiedCode] = useState<number | null>(null);

  const filteredCodes = useMemo(() => {
    return HTTP_CODES.filter((item) => {
      const matchesCat = categoryFilter === "all" || item.category === categoryFilter;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.code.toString().includes(q) ||
        item.phrase.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.cause.toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });
  }, [search, categoryFilter]);

  const handleCopy = async (c: StatusCode) => {
    const text = `HTTP ${c.code} ${c.phrase} — ${c.description} (Common Cause: ${c.cause})`;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedCode(c.code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code, name (e.g. 404, bad gateway, rate limit)..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-background border border-border rounded-xl text-foreground"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-xs font-bold bg-background border border-border rounded-xl text-foreground"
        >
          <option value="all">All HTTP Codes</option>
          <option value="2xx">2xx — Success</option>
          <option value="3xx">3xx — Redirection</option>
          <option value="4xx">4xx — Client Errors</option>
          <option value="5xx">5xx — Server Errors</option>
        </select>
      </div>

      {/* Codes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredCodes.map((c) => {
          let badgeColor = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
          if (c.category === "3xx") badgeColor = "bg-blue-500/10 text-blue-600 border-blue-500/20";
          if (c.category === "4xx") badgeColor = "bg-amber-500/10 text-amber-600 border-amber-500/20";
          if (c.category === "5xx") badgeColor = "bg-rose-500/10 text-rose-600 border-rose-500/20";

          return (
            <div key={c.code} className="p-4 bg-card border border-border rounded-xl space-y-2 hover:border-foreground/30 transition-colors">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 font-mono font-bold text-xs rounded-md border ${badgeColor}`}>
                    {c.code}
                  </span>
                  <h4 className="font-bold text-sm text-foreground">{c.phrase}</h4>
                </div>
                <button
                  onClick={() => handleCopy(c)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                  title="Copy details"
                >
                  {copiedCode === c.code ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <p className="text-xs text-foreground/90">{c.description}</p>
              <p className="text-[11px] text-muted-foreground">
                <strong className="text-foreground/70">Cause:</strong> {c.cause}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
