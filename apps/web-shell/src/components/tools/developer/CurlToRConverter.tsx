"use client";

import { useState, useMemo } from "react";
import { Terminal, Copy, Check, Sparkles, FileCode } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_CURL = `curl -X POST https://api.example.com/v1/datasets \\
  -H "Authorization: Bearer token_sample_r_77" \\
  -H "Content-Type: application/json" \\
  -d '{"datasetName": "genomics_cohort_01", "samples": 450, "format": "feather"}'`;

export function CurlToRConverter() {
  const [curlInput, setCurlInput] = useState<string>(SAMPLE_CURL);
  const [useHttr2, setUseHttr2] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const rCode = useMemo(() => {
    if (!curlInput.trim()) return "# Paste a cURL command above to generate R code.";

    const clean = curlInput.replace(/\\\n/g, " ").replace(/\n/g, " ");

    // Extract URL
    const urlMatch = clean.match(/https?:\/\/[^\s'"]+/);
    const rawUrl = urlMatch ? urlMatch[0] : "https://api.example.com/endpoint";

    // Extract Method
    let method = "GET";
    const methodMatch = clean.match(/-X\s+([A-Z]+)/i) || clean.match(/--request\s+([A-Z]+)/i);
    if (methodMatch) {
      method = methodMatch[1].toUpperCase();
    } else if (clean.includes("-d ") || clean.includes("--data ") || clean.includes("--data-raw ")) {
      method = "POST";
    }

    // Extract Headers
    const headers: { key: string; val: string }[] = [];
    const headerRegex = /(?:-H|--header)\s+["']([^"']+)["']/g;
    let hMatch;
    while ((hMatch = headerRegex.exec(clean)) !== null) {
      const parts = hMatch[1].split(":");
      if (parts.length >= 2) {
        headers.push({
          key: parts[0].trim(),
          val: parts.slice(1).join(":").trim(),
        });
      }
    }

    // Extract Data / Body
    let dataPayload = "";
    const dataMatch = clean.match(/(?:-d|--data|--data-raw|--data-binary)\s+["']([^"']+)["']/);
    if (dataMatch) {
      dataPayload = dataMatch[1];
    }

    if (useHttr2) {
      // Modern httr2 syntax
      let code = `library(httr2)\n\nreq <- request("${rawUrl}") |>\n  req_method("${method}")`;

      if (headers.length > 0) {
        headers.forEach((h) => {
          code += ` |>\n  req_headers("${h.key}" = "${h.val}")`;
        });
      }

      if (dataPayload) {
        code += ` |>\n  req_body_raw('${dataPayload}', type = "application/json")`;
      }

      code += `\n\nresp <- req |>\n  req_perform()\n\n# Parse response JSON\nresp_body_json(resp)\n`;
      return code;
    } else {
      // Classic httr syntax
      let code = `library(httr)\n\nres <- ${method.toLowerCase()}("${rawUrl}"`;

      if (headers.length > 0) {
        const hPairs = headers.map((h) => `"${h.key}" = "${h.val}"`).join(", ");
        code += `,\n  add_headers(${hPairs})`;
      }

      if (dataPayload) {
        code += `,\n  body = '${dataPayload}',\n  encode = "json"`;
      }

      code += `)\n\n# Parse response\ncontent(res, "parsed")\n`;
      return code;
    }
  }, [curlInput, useHttr2]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(rCode);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Library Switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => setUseHttr2(true)}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
            useHttr2 ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
          }`}
        >
          Modern `httr2` (Native Pipe |&gt;)
        </button>
        <button
          onClick={() => setUseHttr2(false)}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
            !useHttr2 ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
          }`}
        >
          Classic `httr`
        </button>
      </div>

      {/* cURL Input */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <label className="font-semibold uppercase text-foreground">cURL Command Input</label>
          <span className="font-mono">Bash CLI format</span>
        </div>
        <textarea
          value={curlInput}
          onChange={(e) => setCurlInput(e.target.value)}
          rows={5}
          placeholder="Paste curl command here..."
          className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Generated R Code Output */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-emerald-500" />
            R Script ({useHttr2 ? "httr2" : "httr"})
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy R Code"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {rCode}
        </pre>
      </div>
    </div>
  );
}
