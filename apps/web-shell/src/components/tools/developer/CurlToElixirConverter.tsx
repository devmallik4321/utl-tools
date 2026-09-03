"use client";

import { useState, useMemo } from "react";
import { Terminal, Copy, Check, Sparkles, FileCode } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_CURL = `curl -X POST https://api.example.com/v1/webhooks \\
  -H "Authorization: Bearer token_sample_elixir_99" \\
  -H "Content-Type: application/json" \\
  -d '{"event": "invoice.paid", "amount": 2500, "currency": "usd"}'`;

export function CurlToElixirConverter() {
  const [curlInput, setCurlInput] = useState<string>(SAMPLE_CURL);
  const [useReq, setUseReq] = useState<boolean>(true); // Req (modern) vs HTTPoison
  const [copied, setCopied] = useState<boolean>(false);

  const elixirCode = useMemo(() => {
    if (!curlInput.trim()) return "# Paste a cURL command above to generate Elixir code.";

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

    if (useReq) {
      // Modern Req library (standard in Elixir 1.14+)
      let code = `# Using modern Req library (hex.pm/packages/req)\n`;
      code += `response = Req.new(\n  base_url: "${rawUrl}",\n  method: :${method.toLowerCase()}`;

      if (headers.length > 0) {
        const hLines = headers.map((h) => `    {"${h.key}", "${h.val}"}`).join(",\n");
        code += `,\n  headers: [\n${hLines}\n  ]`;
      }

      if (dataPayload) {
        code += `,\n  body: ~s(${dataPayload})`;
      }

      code += `\n)\n|> Req.request!()\n\n# Inspect decoded body\nIO.inspect(response.body)\n`;
      return code;
    } else {
      // HTTPoison
      let code = `# Using HTTPoison (hex.pm/packages/httpoison)\n`;
      const hLines = headers.map((h) => `  {"${h.key}", "${h.val}"}`).join(",\n");

      code += `headers = [\n${hLines}\n]\n\n`;

      if (dataPayload) {
        code += `body = ~s(${dataPayload})\n\n`;
        code += `case HTTPoison.${method.toLowerCase()}("${rawUrl}", body, headers) do\n`;
      } else {
        code += `case HTTPoison.${method.toLowerCase()}("${rawUrl}", headers) do\n`;
      }

      code += `  {:ok, %HTTPoison.Response{status_code: 200, body: resp_body}} ->\n`;
      code += `    IO.puts("Success: \#{resp_body}")\n\n`;
      code += `  {:ok, %HTTPoison.Response{status_code: code}} ->\n`;
      code += `    IO.puts("Received status: \#{code}")\n\n`;
      code += `  {:error, %HTTPoison.Error{reason: reason}} ->\n`;
      code += `    IO.inspect(reason)\nend\n`;
      return code;
    }
  }, [curlInput, useReq]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(elixirCode);
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
          onClick={() => setUseReq(true)}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
            useReq ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
          }`}
        >
          Modern `Req` (Recommended)
        </button>
        <button
          onClick={() => setUseReq(false)}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
            !useReq ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
          }`}
        >
          Classic `HTTPoison`
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

      {/* Generated Elixir Code Output */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-emerald-500" />
            Elixir Script ({useReq ? "Req" : "HTTPoison"})
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Elixir"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {elixirCode}
        </pre>
      </div>
    </div>
  );
}
