"use client";

import { useState, useMemo } from "react";
import { Terminal, Copy, Check, Sparkles, FileCode, ArrowRight } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_CURL = `curl -X POST https://api.example.com/v1/users \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Alice Developer", "role": "engineer", "active": true}'`;

export function CurlToPythonConverter() {
  const [curlInput, setCurlInput] = useState<string>(SAMPLE_CURL);
  const [copied, setCopied] = useState<boolean>(false);

  const pythonCode = useMemo(() => {
    if (!curlInput.trim()) return "# Paste a curl command above to generate Python requests code.";

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
    const headers: Record<string, string> = {};
    const headerRegex = /(?:-H|--header)\s+["']([^"']+)["']/g;
    let hMatch;
    while ((hMatch = headerRegex.exec(clean)) !== null) {
      const parts = hMatch[1].split(":");
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join(":").trim();
        headers[key] = val;
      }
    }

    // Extract Data / Body
    let dataPayload: any = null;
    let isJson = false;
    const dataMatch = clean.match(/(?:-d|--data|--data-raw|--data-binary)\s+["']([^"']+)["']/);
    if (dataMatch) {
      const rawData = dataMatch[1];
      try {
        dataPayload = JSON.parse(rawData);
        isJson = true;
      } catch {
        dataPayload = rawData;
      }
    }

    // Format Python code
    let py = `import requests\n\nurl = "${rawUrl}"\n\n`;

    if (Object.keys(headers).length > 0) {
      py += `headers = ${JSON.stringify(headers, null, 4)}\n\n`;
    }

    if (isJson && dataPayload) {
      py += `json_data = ${JSON.stringify(dataPayload, null, 4)}\n\n`;
    } else if (dataPayload) {
      py += `data = """${dataPayload}"""\n\n`;
    }

    py += `response = requests.${method.toLowerCase()}(\n    url,\n`;
    if (Object.keys(headers).length > 0) {
      py += `    headers=headers,\n`;
    }
    if (isJson && dataPayload) {
      py += `    json=json_data,\n`;
    } else if (dataPayload) {
      py += `    data=data,\n`;
    }
    py += `    timeout=30,\n)\n\n`;
    py += `print(f"Status Code: {response.status_code}")\ntry:\n    print(response.json())\nexcept Exception:\n    print(response.text)\n`;

    return py;
  }, [curlInput]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(pythonCode);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* cURL Input Pane */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
            cURL Command Input
          </label>
          <span className="text-xs text-muted-foreground font-mono">Bash CLI format</span>
        </div>
        <textarea
          value={curlInput}
          onChange={(e) => setCurlInput(e.target.value)}
          rows={4}
          placeholder="Paste curl command here..."
          className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Generated Python Output Pane */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-emerald-500" />
            Python Requests Code
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Python Code"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-foreground overflow-x-auto select-all">
          {pythonCode}
        </pre>
      </div>
    </div>
  );
}
