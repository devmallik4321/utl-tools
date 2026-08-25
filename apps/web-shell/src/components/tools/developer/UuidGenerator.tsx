"use client";

import { useState, useEffect } from "react";
import { Copy, Check, RefreshCw, Download, Layers } from "lucide-react";
import { copyToClipboard, downloadFile } from "@/lib/utils";

export function UuidGenerator() {
  const [version, setVersion] = useState<"v4" | "v1">("v4");
  const [quantity, setQuantity] = useState<number>(5);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [hyphens, setHyphens] = useState<boolean>(true);
  const [braces, setBraces] = useState<boolean>(false);
  const [uuids, setUuids] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  const generateSingleUuid = (): string => {
    let id: string;
    if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID && version === "v4") {
      id = window.crypto.randomUUID();
    } else {
      // RFC4122 standard fallback
      id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }

    if (!hyphens) {
      id = id.replace(/-/g, "");
    }
    if (uppercase) {
      id = id.toUpperCase();
    }
    if (braces) {
      id = `{${id}}`;
    }
    return id;
  };

  const generateBatch = () => {
    const list: string[] = [];
    for (let i = 0; i < quantity; i++) {
      list.push(generateSingleUuid());
    }
    setUuids(list);
  };

  useEffect(() => {
    generateBatch();
  }, [version, quantity, uppercase, hyphens, braces]);

  const copySingle = async (id: string, index: number) => {
    const ok = await copyToClipboard(id);
    if (ok) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1800);
    }
  };

  const copyAll = async () => {
    const ok = await copyToClipboard(uuids.join("\n"));
    if (ok) {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const handleDownload = () => {
    downloadFile(uuids.join("\n"), "uuids.txt");
  };

  return (
    <div className="space-y-6">
      {/* Configuration Controls */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              UUID Version
            </label>
            <select
              value={version}
              onChange={(e) => setVersion(e.target.value as any)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none"
            >
              <option value="v4">Version 4 (Cryptographically Random)</option>
              <option value="v1">Version 1 (Timestamp Based)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5">
              Quantity to Generate
            </label>
            <input
              type="number"
              min={1}
              max={500}
              value={quantity}
              onChange={(e) => setQuantity(Math.min(500, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-background border border-border rounded-lg focus:outline-none"
            />
          </div>

          <div className="md:col-span-2 flex flex-wrap items-center gap-4 pt-4">
            <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hyphens}
                onChange={(e) => setHyphens(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Include Hyphens</span>
            </label>

            <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Uppercase (A-F)</span>
            </label>

            <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={braces}
                onChange={(e) => setBraces(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Enclose in Braces &#123;&#125;</span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={generateBatch}
            className="px-6 py-2.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs sm:text-sm rounded-xl hover:opacity-90 transition-all flex items-center gap-1.5 shadow"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Generate New Batch</span>
          </button>
        </div>
      </div>

      {/* UUIDs Output List */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Generated UUIDs ({uuids.length})
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (.txt)</span>
            </button>
            <button
              type="button"
              onClick={copyAll}
              className="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-1 shadow-sm"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? "All Copied!" : "Copy All"}</span>
            </button>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto space-y-2 p-2 bg-muted/20 rounded-lg">
          {uuids.map((id, idx) => (
            <div
              key={idx}
              className="p-3 bg-background border border-border rounded-lg flex items-center justify-between font-mono text-xs sm:text-sm select-all group hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
            >
              <span className="text-foreground font-semibold break-all">{id}</span>
              <button
                type="button"
                onClick={() => copySingle(id, idx)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded bg-muted/50 hover:bg-muted ml-2 shrink-0"
                title="Copy this UUID"
              >
                {copiedIndex === idx ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
