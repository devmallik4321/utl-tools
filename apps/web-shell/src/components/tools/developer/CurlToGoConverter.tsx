"use client";

import { useState, useMemo } from "react";
import { Terminal, Copy, Check, Sparkles, FileCode } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_CURL = `curl -X POST https://api.github.com/repos/octocat/hello-world/issues \\
  -H "Authorization: Bearer ghp_99128ab" \\
  -H "Accept: application/vnd.github.v3+json" \\
  -d '{"title": "Bug in production", "body": "Need urgent fix"}'`;

export function CurlToGoConverter() {
  const [curlInput, setCurlInput] = useState<string>(SAMPLE_CURL);
  const [copied, setCopied] = useState<boolean>(false);

  const goCode = useMemo(() => {
    if (!curlInput.trim()) return "// Paste a cURL command above to generate Go code.";

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

    let code = `package main\n\nimport (\n  "fmt"\n  "io"\n  "net/http"\n`;
    if (dataPayload) {
      code += `  "strings"\n`;
    }
    code += `)\n\nfunc main() {\n  url := "${rawUrl}"\n`;

    if (dataPayload) {
      code += `  payload := strings.NewReader(\`${dataPayload}\`)\n  req, err := http.NewRequest("${method}", url, payload)\n`;
    } else {
      code += `  req, err := http.NewRequest("${method}", url, nil)\n`;
    }

    code += `  if err != nil {\n    panic(err)\n  }\n\n`;

    headers.forEach((h) => {
      code += `  req.Header.Add("${h.key}", "${h.val}")\n`;
    });

    code += `\n  client := &http.Client{}\n  resp, err := client.Do(req)\n  if err != nil {\n    panic(err)\n  }\n  defer resp.Body.Close()\n\n  body, err := io.ReadAll(resp.Body)\n  if err != nil {\n    panic(err)\n  }\n\n  fmt.Println("Status:", resp.Status)\n  fmt.Println("Response:", string(body))\n}\n`;

    return code;
  }, [curlInput]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(goCode);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
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

      {/* Generated Go Code Output */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-emerald-500" />
            Golang Standard Library `net/http` Script
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Go Code"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {goCode}
        </pre>
      </div>
    </div>
  );
}
