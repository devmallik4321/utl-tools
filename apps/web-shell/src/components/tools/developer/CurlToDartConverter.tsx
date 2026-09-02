"use client";

import { useState, useMemo } from "react";
import { Terminal, Copy, Check, Sparkles, FileCode } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_CURL = `curl -X POST https://api.example.com/v1/auth/login \\
  -H "Authorization: Bearer token_sample_dart_77" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "dev@example.com", "password": "secretPassword123"}'`;

export function CurlToDartConverter() {
  const [curlInput, setCurlInput] = useState<string>(SAMPLE_CURL);
  const [copied, setCopied] = useState<boolean>(false);

  const dartCode = useMemo(() => {
    if (!curlInput.trim()) return "// Paste a cURL command above to generate Dart / Flutter code.";

    const clean = curlInput.replace(/\\\n/g, " ").replace(/\n/g, " ");

    // Extract URL
    const urlMatch = clean.match(/https?:\/\/[^\s'"]+/);
    const rawUrl = urlMatch ? urlMatch[0] : "https://api.example.com/endpoint";

    // Extract Method
    let method = "get";
    const methodMatch = clean.match(/-X\s+([A-Z]+)/i) || clean.match(/--request\s+([A-Z]+)/i);
    if (methodMatch) {
      method = methodMatch[1].toLowerCase();
    } else if (clean.includes("-d ") || clean.includes("--data ") || clean.includes("--data-raw ")) {
      method = "post";
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

    let code = `import 'dart:convert';\nimport 'package:http/http.dart' as http;\n\nFuture<void> sendRequest() async {\n  final url = Uri.parse('${rawUrl}');\n`;

    if (headers.length > 0) {
      code += `  final headers = {\n`;
      headers.forEach((h) => {
        code += `    '${h.key}': '${h.val}',\n`;
      });
      code += `  };\n`;
    }

    if (dataPayload) {
      code += `  final body = '${dataPayload}';\n`;
    }

    code += `\n  try {\n    final response = await http.${method}(\n      url,\n`;
    if (headers.length > 0) code += `      headers: headers,\n`;
    if (dataPayload) code += `      body: body,\n`;
    code += `    );\n\n    if (response.statusCode >= 200 && response.statusCode < 300) {\n      print('Response status: \${response.statusCode}');\n      print('Response body: \${response.body}');\n    } else {\n      print('Request failed with status: \${response.statusCode}');\n    }\n  } catch (e) {\n    print('Network error: \$e');\n  }\n}\n`;

    return code;
  }, [curlInput]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(dartCode);
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

      {/* Generated Dart Code Output */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-emerald-500" />
            Dart &amp; Flutter `package:http` Code
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Dart Code"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {dartCode}
        </pre>
      </div>
    </div>
  );
}
