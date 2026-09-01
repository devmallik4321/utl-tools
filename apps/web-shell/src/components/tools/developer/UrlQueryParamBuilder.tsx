"use client";

import { useState, useMemo, useEffect } from "react";
import { Link2, Copy, Check, Plus, Trash2, Sparkles, ExternalLink } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface QueryParam {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

const SAMPLE_URL = "https://utl.tools/tools/search?q=developer+utilities&category=finance&sort=popular#results";

export function UrlQueryParamBuilder() {
  const [rawUrl, setRawUrl] = useState<string>(SAMPLE_URL);
  const [baseUrl, setBaseUrl] = useState<string>("https://utl.tools/tools/search");
  const [hash, setHash] = useState<string>("results");
  const [params, setParams] = useState<QueryParam[]>([
    { id: "1", key: "q", value: "developer utilities", enabled: true },
    { id: "2", key: "category", value: "finance", enabled: true },
    { id: "3", key: "sort", value: "popular", enabled: true },
  ]);
  const [copied, setCopied] = useState<boolean>(false);

  // Parse raw URL when user inputs
  const parseUrl = (urlString: string) => {
    try {
      const url = new URL(urlString);
      setBaseUrl(`${url.origin}${url.pathname}`);
      setHash(url.hash.replace(/^#/, ""));

      const newParams: QueryParam[] = [];
      url.searchParams.forEach((value, key) => {
        newParams.push({ id: Math.random().toString(), key, value, enabled: true });
      });
      setParams(newParams);
    } catch {
      // invalid url fallback
    }
  };

  const reconstructedUrl = useMemo(() => {
    try {
      const url = new URL(baseUrl || "https://example.com");
      const searchParams = new URLSearchParams();
      params
        .filter((p) => p.enabled && p.key.trim() !== "")
        .forEach((p) => {
          searchParams.append(p.key.trim(), p.value);
        });

      const qs = searchParams.toString();
      const h = hash.trim() ? `#${hash.trim()}` : "";
      return `${baseUrl}${qs ? `?${qs}` : ""}${h}`;
    } catch {
      return baseUrl;
    }
  }, [baseUrl, params, hash]);

  const addParam = () => {
    setParams([...params, { id: Date.now().toString(), key: "", value: "", enabled: true }]);
  };

  const removeParam = (id: string) => {
    setParams(params.filter((p) => p.id !== id));
  };

  const updateParam = (id: string, field: keyof QueryParam, val: any) => {
    setParams(params.map((p) => (p.id === id ? { ...p, [field]: val } : p)));
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(reconstructedUrl);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Raw URL Input */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
          Paste Full URL to Parse
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={rawUrl}
            onChange={(e) => {
              setRawUrl(e.target.value);
              parseUrl(e.target.value);
            }}
            placeholder="https://example.com/api?key=value#hash"
            className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground"
          />
        </div>
      </div>

      {/* Query Parameters Table */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider">
            Query Parameters ({params.filter((p) => p.enabled).length} active)
          </span>
          <button
            onClick={addParam}
            className="px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg inline-flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Param</span>
          </button>
        </div>

        <div className="space-y-2">
          {params.map((param) => (
            <div key={param.id} className="flex items-center gap-2 text-xs font-mono">
              <input
                type="checkbox"
                checked={param.enabled}
                onChange={(e) => updateParam(param.id, "enabled", e.target.checked)}
                className="w-3.5 h-3.5 rounded text-blue-600 cursor-pointer"
              />
              <input
                type="text"
                value={param.key}
                onChange={(e) => updateParam(param.id, "key", e.target.value)}
                placeholder="key"
                className="w-1/3 px-2.5 py-1.5 font-bold bg-background border border-border rounded-lg"
              />
              <span className="text-muted-foreground">=</span>
              <input
                type="text"
                value={param.value}
                onChange={(e) => updateParam(param.id, "value", e.target.value)}
                placeholder="value"
                className="flex-1 px-2.5 py-1.5 bg-background border border-border rounded-lg"
              />
              <button
                onClick={() => removeParam(param.id)}
                className="text-muted-foreground hover:text-rose-500 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Reconstructed URL Output */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Link2 className="w-4 h-4 text-emerald-500" />
            Reconstructed &amp; Encoded Target URL
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy URL"}</span>
          </button>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 break-all select-all font-bold">
          {reconstructedUrl}
        </div>
      </div>
    </div>
  );
}
