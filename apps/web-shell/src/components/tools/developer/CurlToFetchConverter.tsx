"use client";

import { useState } from "react";
import { Terminal, Code, Copy, Check, Sparkles } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_CURL = `curl -X POST https://api.example.com/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model": "gpt-4o", "messages": [{"role": "user", "content": "Hello!"}]}'`;

export function CurlToFetchConverter() {
  const [curlInput, setCurlInput] = useState<string>(SAMPLE_CURL);
  const [targetLang, setTargetLang] = useState<"fetch" | "python" | "axios">("fetch");
  const [copied, setCopied] = useState<boolean>(false);

  // Parse cURL
  const parseCurl = (raw: string) => {
    let text = raw.replace(/\\\n/g, " ").replace(/\\\r\n/g, " ").trim();

    // Extract URL
    let url = "https://example.com";
    const urlMatch = text.match(/https?:\/\/[^\s"']+/);
    if (urlMatch) {
      url = urlMatch[0];
    }

    // Extract Method
    let method = "GET";
    const methodMatch = text.match(/-X\s+([A-Z]+)/i) || text.match(/--request\s+([A-Z]+)/i);
    if (methodMatch) {
      method = methodMatch[1].toUpperCase();
    } else if (text.includes("-d ") || text.includes("--data ") || text.includes("--data-raw ")) {
      method = "POST";
    }

    // Extract Headers
    const headers: Record<string, string> = {};
    const headerRegex = /(?:-H|--header)\s+["']([^"']+)["']/g;
    let match;
    while ((match = headerRegex.exec(text)) !== null) {
      const parts = match[1].split(":");
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join(":").trim();
        headers[key] = value;
      }
    }

    // Extract Body
    let body: string | null = null;
    const bodyMatch = text.match(/(?:-d|--data|--data-raw|--data-binary)\s+['"]([\s\S]*?)['"](?:\s|$)/);
    if (bodyMatch) {
      body = bodyMatch[1];
    }

    return { url, method, headers, body };
  };

  const parsed = parseCurl(curlInput);

  // Generate code
  const getFetchCode = (): string => {
    const opts: any = {
      method: parsed.method,
    };
    if (Object.keys(parsed.headers).length > 0) {
      opts.headers = parsed.headers;
    }
    if (parsed.body) {
      opts.body = parsed.body;
    }

    return `const response = await fetch("${parsed.url}", {
  method: "${parsed.method}",
  headers: ${JSON.stringify(parsed.headers, null, 4).replace(/\n/g, "\n  ")},
  ${parsed.body ? `body: JSON.stringify(${parsed.body.startsWith("{") ? parsed.body : JSON.stringify(parsed.body)})` : ""}
});

const data = await response.json();
console.log(data);`;
  };

  const getPythonCode = (): string => {
    let headersStr = "{\n";
    for (const [k, v] of Object.entries(parsed.headers)) {
      headersStr += `    "${k}": "${v}",\n`;
    }
    headersStr += "}";

    return `import requests
import json

url = "${parsed.url}"
headers = ${headersStr}
${parsed.body ? `payload = json.loads('''${parsed.body}''')\n` : ""}
response = requests.${parsed.method.toLowerCase()}(
    url,
    headers=headers,
    ${parsed.body ? "json=payload," : ""}
)

print(response.status_code)
print(response.json())`;
  };

  const getAxiosCode = (): string => {
    return `import axios from "axios";

const config = {
  method: "${parsed.method.toLowerCase()}",
  url: "${parsed.url}",
  headers: ${JSON.stringify(parsed.headers, null, 4).replace(/\n/g, "\n  ")},
  ${parsed.body ? `data: ${parsed.body}` : ""}
};

const response = await axios(config);
console.log(response.data);`;
  };

  let generatedCode = "";
  if (targetLang === "fetch") generatedCode = getFetchCode();
  else if (targetLang === "python") generatedCode = getPythonCode();
  else generatedCode = getAxiosCode();

  const handleCopy = async () => {
    const ok = await copyToClipboard(generatedCode);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* cURL Input */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-2">
        <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">
          Paste cURL Command
        </label>
        <textarea
          rows={5}
          value={curlInput}
          onChange={(e) => setCurlInput(e.target.value)}
          placeholder="curl -X POST https://api.example.com -H 'Authorization: Bearer ...' -d '...'"
          className="w-full p-3 font-mono text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      </div>

      {/* Target Language Selector */}
      <div className="flex gap-2 p-1 bg-muted/50 rounded-xl border border-border">
        {[
          { id: "fetch", label: "JavaScript (Fetch API)" },
          { id: "python", label: "Python (Requests)" },
          { id: "axios", label: "JavaScript (Axios)" },
        ].map((lang) => (
          <button
            key={lang.id}
            onClick={() => setTargetLang(lang.id as any)}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-colors ${
              targetLang === lang.id ? "bg-card text-foreground shadow-xs border border-border" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* Code Output */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Code className="w-4 h-4 text-blue-500" />
            Generated {targetLang === "fetch" ? "Fetch Code" : targetLang === "python" ? "Python Code" : "Axios Code"}
          </span>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Code"}</span>
          </button>
        </div>

        <pre className="p-4 bg-muted/40 rounded-lg text-xs font-mono text-foreground overflow-x-auto border border-border">
          {generatedCode}
        </pre>
      </div>
    </div>
  );
}
