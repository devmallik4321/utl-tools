"use client";

import { useState } from "react";
import { Copy, Check, Table } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function UrlDecoder() {
  const [inputUrl, setInputUrl] = useState<string>(
    "https%3A%2F%2Futl.tools%2Fsearch%3Fq%3Dfree%20online%20utilities%20%26%20filter%3Dall%26utm_source%3Dnewsletter%26utm_campaign%3Dlaunch"
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const decodeUrl = (text: string): string => {
    try {
      // Replace '+' with space first if needed, then decodeURIComponent
      return decodeURIComponent(text.replace(/\+/g, " "));
    } catch {
      return text;
    }
  };

  const decoded = decodeUrl(inputUrl);

  // Parse URL components and query params
  let parsedUrl: { origin: string; pathname: string; params: [string, string][] } | null = null;
  try {
    const candidate = decoded.startsWith("http://") || decoded.startsWith("https://") ? decoded : `https://${decoded}`;
    const u = new URL(candidate);
    const paramsList: [string, string][] = [];
    u.searchParams.forEach((val, key) => {
      paramsList.push([key, val]);
    });
    parsedUrl = {
      origin: u.origin,
      pathname: u.pathname,
      params: paramsList,
    };
  } catch {
    parsedUrl = null;
  }

  const handleCopyDecoded = async () => {
    const ok = await copyToClipboard(decoded);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyParam = async (val: string, key: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    }
  };

  return (
    <div className="space-y-6">
      {/* Grid Input / Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Encoded URL / String
          </span>
          <textarea
            rows={7}
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Paste percent-encoded URL here..."
            className="w-full p-3 font-mono text-xs sm:text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
          />
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Decoded Plain URL
            </span>
            <button
              type="button"
              onClick={handleCopyDecoded}
              className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Decoded"}</span>
            </button>
          </div>
          <textarea
            rows={7}
            readOnly
            value={decoded}
            className="w-full p-3 font-mono text-xs sm:text-sm bg-muted/40 border border-border rounded-lg focus:outline-none resize-y select-all break-all"
          />
        </div>
      </div>

      {/* Query Parameters Table */}
      {parsedUrl && parsedUrl.params.length > 0 && (
        <div className="p-5 bg-card border border-border rounded-xl space-y-3">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Parsed Query Parameters ({parsedUrl.params.length})
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-border text-muted-foreground uppercase text-[10px]">
                  <th className="py-2 px-3">Parameter Key</th>
                  <th className="py-2 px-3">Decoded Value</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {parsedUrl.params.map(([k, v], i) => (
                  <tr key={i} className="hover:bg-muted/40">
                    <td className="py-2.5 px-3 font-bold text-foreground">{k}</td>
                    <td className="py-2.5 px-3 text-foreground break-all">{v}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleCopyParam(v, `${k}-${i}`)}
                        className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                        title="Copy Value"
                      >
                        {copiedKey === `${k}-${i}` ? (
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
        </div>
      )}
    </div>
  );
}
