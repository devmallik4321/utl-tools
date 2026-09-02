"use client";

import { useState, useMemo } from "react";
import { Terminal, Copy, Check, Sparkles, FileCode } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_CURL = `curl -X POST https://api.example.com/v1/orders \\
  -H "Authorization: Bearer sec_tok_99128a" \\
  -H "Content-Type: application/json" \\
  -d '{"productId": "prod_441", "quantity": 3, "currency": "USD"}'`;

export function CurlToAxiosConverter() {
  const [curlInput, setCurlInput] = useState<string>(SAMPLE_CURL);
  const [syntaxStyle, setSyntaxStyle] = useState<"async" | "promise">("async");
  const [copied, setCopied] = useState<boolean>(false);

  const axiosCode = useMemo(() => {
    if (!curlInput.trim()) return "// Paste a curl command above to generate Axios code.";

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

    let code = `import axios from 'axios';\n\n`;

    const configObj: Record<string, any> = {
      method: method.toLowerCase(),
      url: rawUrl,
    };
    if (Object.keys(headers).length > 0) {
      configObj.headers = headers;
    }
    if (dataPayload) {
      configObj.data = dataPayload;
    }

    const configJson = JSON.stringify(configObj, null, 2);

    if (syntaxStyle === "async") {
      code += `async function makeRequest() {\n  try {\n    const response = await axios(${configJson});\n    console.log('Status:', response.status);\n    console.log('Data:', response.data);\n    return response.data;\n  } catch (error) {\n    console.error('Axios Error:', error.response ? error.response.data : error.message);\n    throw error;\n  }\n}\n\nmakeRequest();`;
    } else {
      code += `axios(${configJson})\n  .then(response => {\n    console.log('Status:', response.status);\n    console.log('Data:', response.data);\n  })\n  .catch(error => {\n    console.error('Axios Error:', error.response ? error.response.data : error.message);\n  });`;
    }

    return code;
  }, [curlInput, syntaxStyle]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(axiosCode);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* cURL Input Pane */}
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

      {/* Generated Axios Code */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-emerald-500" />
              JavaScript / TypeScript Axios Code
            </h4>
            <div className="flex p-0.5 bg-muted rounded-lg border border-border text-xs">
              <button
                onClick={() => setSyntaxStyle("async")}
                className={`px-2 py-0.5 rounded-md font-semibold ${
                  syntaxStyle === "async" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"
                }`}
              >
                Async / Await
              </button>
              <button
                onClick={() => setSyntaxStyle("promise")}
                className={`px-2 py-0.5 rounded-md font-semibold ${
                  syntaxStyle === "promise" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"
                }`}
              >
                .then() / .catch()
              </button>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Axios Code"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {axiosCode}
        </pre>
      </div>
    </div>
  );
}
