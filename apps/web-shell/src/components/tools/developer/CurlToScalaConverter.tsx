"use client";

import { useState, useMemo } from "react";
import { Terminal, Copy, Check, Sparkles, FileCode } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_CURL = `curl -X POST https://api.example.com/v2/orders \\
  -H "Authorization: Bearer token_sample_scala_99" \\
  -H "Content-Type: application/json" \\
  -d '{"itemId": "SKU-4401", "quantity": 3, "priority": true}'`;

export function CurlToScalaConverter() {
  const [curlInput, setCurlInput] = useState<string>(SAMPLE_CURL);
  const [useSttp, setUseSttp] = useState<boolean>(true); // sttp.client4 vs requests-scala
  const [copied, setCopied] = useState<boolean>(false);

  const scalaCode = useMemo(() => {
    if (!curlInput.trim()) return "// Paste a cURL command above to generate Scala code.";

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

    // Extract Body
    let dataPayload = "";
    const dataMatch = clean.match(/(?:-d|--data|--data-raw|--data-binary)\s+["']([^"']+)["']/);
    if (dataMatch) {
      dataPayload = dataMatch[1];
    }

    if (useSttp) {
      // Modern sttp client 4 (Scala 3 / 2.13)
      let code = `import sttp.client4._\nimport sttp.client4.quick._\n\n`;
      code += `// Generated using sttp-client4 (softwaremill/sttp)\n`;
      code += `val request = basicRequest\n`;
      code += `  .${method.toLowerCase()}(uri"${rawUrl}")\n`;

      headers.forEach((h) => {
        code += `  .header("${h.key}", "${h.val}")\n`;
      });

      if (dataPayload) {
        code += `  .body("""${dataPayload}""")\n`;
      }

      code += `\nval backend = DefaultSyncBackend()\n`;
      code += `val response = request.send(backend)\n\n`;
      code += `println(s"Status: \${response.code}")\n`;
      code += `println(s"Body: \${response.body}")\n`;
      return code;
    } else {
      // requests-scala (Li Haoyi)
      let code = `// Using requests-scala (com.lihaoyi::requests)\n`;
      code += `val response = requests.${method.toLowerCase()}(\n`;
      code += `  "${rawUrl}"`;

      if (headers.length > 0) {
        const hLines = headers.map((h) => `    "${h.key}" -> "${h.val}"`).join(",\n");
        code += `,\n  headers = Map(\n${hLines}\n  )`;
      }

      if (dataPayload) {
        code += `,\n  data = """${dataPayload}"""`;
      }

      code += `\n)\n\nprintln(s"Status: \${response.statusCode}")\n`;
      code += `println(response.text())\n`;
      return code;
    }
  }, [curlInput, useSttp]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(scalaCode);
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
          onClick={() => setUseSttp(true)}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
            useSttp ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
          }`}
        >
          sttp-client4 (Recommended)
        </button>
        <button
          onClick={() => setUseSttp(false)}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
            !useSttp ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
          }`}
        >
          requests-scala (Li Haoyi)
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

      {/* Output Scala Code */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-emerald-500" />
            Scala Script ({useSttp ? "sttp-client4" : "requests-scala"})
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Scala"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {scalaCode}
        </pre>
      </div>
    </div>
  );
}
