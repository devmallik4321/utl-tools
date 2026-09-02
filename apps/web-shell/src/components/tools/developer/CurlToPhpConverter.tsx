"use client";

import { useState, useMemo } from "react";
import { Terminal, Copy, Check, Sparkles, FileCode } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_CURL = `curl -X POST "https://api.stripe.com/v1/charges" \\
  -H "Authorization: Bearer sk_test_51H..." \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "amount=2000&currency=usd&description=Payment"`;

export function CurlToPhpConverter() {
  const [curlInput, setCurlInput] = useState<string>(SAMPLE_CURL);
  const [copied, setCopied] = useState<boolean>(false);

  const phpCode = useMemo(() => {
    if (!curlInput.trim()) return "<?php\n// Paste a cURL command above to generate PHP cURL code.";

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
    const headers: string[] = [];
    const headerRegex = /(?:-H|--header)\s+["']([^"']+)["']/g;
    let hMatch;
    while ((hMatch = headerRegex.exec(clean)) !== null) {
      headers.push(hMatch[1]);
    }

    // Extract Data / Body
    let postFields = "";
    const dataMatch = clean.match(/(?:-d|--data|--data-raw|--data-binary)\s+["']([^"']+)["']/);
    if (dataMatch) {
      postFields = dataMatch[1];
    }

    let php = `<?php\n\n$curl = curl_init();\n\ncurl_setopt_array($curl, [\n`;
    php += `  CURLOPT_URL => '${rawUrl}',\n`;
    php += `  CURLOPT_RETURNTRANSFER => true,\n`;
    php += `  CURLOPT_ENCODING => '',\n`;
    php += `  CURLOPT_MAXREDIRS => 10,\n`;
    php += `  CURLOPT_TIMEOUT => 30,\n`;
    php += `  CURLOPT_FOLLOWLOCATION => true,\n`;
    php += `  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\n`;

    if (method !== "GET") {
      php += `  CURLOPT_CUSTOMREQUEST => '${method}',\n`;
    }

    if (postFields) {
      php += `  CURLOPT_POSTFIELDS => '${postFields.replace(/'/g, "\\'")}',\n`;
    }

    if (headers.length > 0) {
      php += `  CURLOPT_HTTPHEADER => [\n`;
      headers.forEach((h) => {
        php += `    '${h}',\n`;
      });
      php += `  ],\n`;
    }

    php += `]);\n\n$response = curl_exec($curl);\n$err = curl_error($curl);\n\ncurl_close($curl);\n\nif ($err) {\n  echo "cURL Error #:" . $err;\n} else {\n  echo $response;\n}\n`;

    return php;
  }, [curlInput]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(phpCode);
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

      {/* Generated PHP Code Output */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-emerald-500" />
            PHP cURL Script Code
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy PHP Code"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {phpCode}
        </pre>
      </div>
    </div>
  );
}
