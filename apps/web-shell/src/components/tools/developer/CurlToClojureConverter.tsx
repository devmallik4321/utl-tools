"use client";

import { useState, useMemo } from "react";
import { Terminal, Copy, Check, Sparkles, FileCode } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_CURL = `curl -X POST https://api.example.com/v1/orders \\
  -H "Authorization: Bearer token_sample_clj_88" \\
  -H "Content-Type: application/json" \\
  -d '{"orderId": "ORD-9912", "amount": 129.50, "currency": "USD"}'`;

export function CurlToClojureConverter() {
  const [curlInput, setCurlInput] = useState<string>(SAMPLE_CURL);
  const [useBabashka, setUseBabashka] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const cljCode = useMemo(() => {
    if (!curlInput.trim()) return ";; Paste a cURL command above to generate Clojure code.";

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

    if (useBabashka) {
      // babashka.http-client syntax
      let code = `(ns api-client\n  (:require [babashka.http-client :as http]\n            [cheshire.core :as json]))\n\n`;
      code += `(def response\n  (http/${method.toLowerCase()} "${rawUrl}"`;

      const options: string[] = [];
      if (headers.length > 0) {
        const headerLines = headers.map((h) => `            "${h.key}" "${h.val}"`).join("\n");
        options.push(`:headers {\n${headerLines}}`);
      }

      if (dataPayload) {
        options.push(`:body '${dataPayload}'`);
      }

      if (options.length > 0) {
        code += `\n   {${options.join("\n    ")}}`;
      }
      code += `))\n\n;; Print response status and body\n(println (:status response))\n(println (:body response))\n`;
      return code;
    } else {
      // Standard clj-http.client syntax
      let code = `(ns api-client\n  (:require [clj-http.client :as client]\n            [cheshire.core :as json]))\n\n`;
      code += `(def response\n  (client/${method.toLowerCase()} "${rawUrl}"\n   {`;

      const opts: string[] = [];
      if (headers.length > 0) {
        const hLines = headers.map((h) => `             "${h.key}" "${h.val}"`).join("\n");
        opts.push(`:headers {\n${hLines}}`);
      }

      if (dataPayload) {
        opts.push(`:body '${dataPayload}'\n    :content-type :json`);
      }

      opts.push(`:as :json\n    :throw-exceptions false`);

      code += `${opts.join("\n    ")}}))\n\n;; Inspect parsed body\n(println (:status response))\n(println (:body response))\n`;
      return code;
    }
  }, [curlInput, useBabashka]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(cljCode);
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
          onClick={() => setUseBabashka(false)}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
            !useBabashka ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
          }`}
        >
          Standard `clj-http.client`
        </button>
        <button
          onClick={() => setUseBabashka(true)}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
            useBabashka ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
          }`}
        >
          Lightweight `babashka.http-client`
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

      {/* Generated Clojure Code Output */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-emerald-500" />
            Clojure Code ({useBabashka ? "babashka" : "clj-http"})
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Clojure"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {cljCode}
        </pre>
      </div>
    </div>
  );
}
