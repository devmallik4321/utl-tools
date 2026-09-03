"use client";

import { useState, useMemo } from "react";
import { Terminal, Copy, Check, Sparkles, FileCode } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_CURL = `curl -X POST https://api.example.com/v1/orders \\
  -H "Authorization: Bearer secret_perl_token_123" \\
  -H "Content-Type: application/json" \\
  -d '{"item_id": "SKU-9921", "quantity": 3}'`;

export function CurlToPerlConverter() {
  const [curlInput, setCurlInput] = useState<string>(SAMPLE_CURL);
  const [moduleChoice, setModuleChoice] = useState<"lwp" | "tiny">("lwp");
  const [copied, setCopied] = useState<boolean>(false);

  const perlCode = useMemo(() => {
    if (!curlInput.trim()) return "# Paste a cURL command above to generate Perl script.";

    const clean = curlInput.replace(/\\\n/g, " ").replace(/\n/g, " ");

    // URL
    const urlMatch = clean.match(/https?:\/\/[^\s'"]+/);
    const rawUrl = urlMatch ? urlMatch[0] : "https://api.example.com/endpoint";

    // Method
    let method = "GET";
    const methodMatch = clean.match(/-X\s+([A-Z]+)/i) || clean.match(/--request\s+([A-Z]+)/i);
    if (methodMatch) {
      method = methodMatch[1].toUpperCase();
    } else if (clean.includes("-d ") || clean.includes("--data ") || clean.includes("--data-raw ")) {
      method = "POST";
    }

    // Headers
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

    // Body
    let dataPayload = "";
    const dataMatch = clean.match(/(?:-d|--data|--data-raw|--data-binary)\s+["']([^"']+)["']/);
    if (dataMatch) {
      dataPayload = dataMatch[1];
    }

    let code = `#!/usr/bin/env perl\nuse strict;\nuse warnings;\n\n`;

    if (moduleChoice === "lwp") {
      code += `use LWP::UserAgent;\nuse HTTP::Request;\n\n`;
      code += `my $ua = LWP::UserAgent->new;\n`;
      code += `$ua->timeout(15);\n\n`;
      code += `my $req = HTTP::Request->new("${method}" => "${rawUrl}");\n`;

      headers.forEach((h) => {
        code += `$req->header('${h.key}' => '${h.val}');\n`;
      });

      if (dataPayload) {
        code += `my $payload = q{${dataPayload}};\n`;
        code += `$req->content($payload);\n`;
      }

      code += `\nmy $res = $ua->request($req);\n\n`;
      code += `if ($res->is_success) {\n`;
      code += `    print "Response Code: " . $res->code . "\\n";\n`;
      code += `    print $res->decoded_content . "\\n";\n`;
      code += `} else {\n`;
      code += `    die "HTTP Request Failed: " . $res->status_line . "\\n";\n`;
      code += `}\n`;
    } else {
      // HTTP::Tiny
      code += `use HTTP::Tiny;\n\n`;
      code += `my $http = HTTP::Tiny->new(timeout => 15);\n\n`;
      code += `my %options = (\n`;
      if (headers.length > 0) {
        code += `    headers => {\n`;
        headers.forEach((h) => {
          code += `        '${h.key}' => '${h.val}',\n`;
        });
        code += `    },\n`;
      }
      if (dataPayload) {
        code += `    content => q{${dataPayload}},\n`;
      }
      code += `);\n\n`;
      code += `my $res = $http->request('${method}', '${rawUrl}', \\%options);\n\n`;
      code += `if ($res->{success}) {\n`;
      code += `    print "HTTP Status: " . $res->{status} . "\\n";\n`;
      code += `    print $res->{content} . "\\n";\n`;
      code += `} else {\n`;
      code += `    die "Failed: $res->{status} $res->{reason}\\n";\n`;
      code += `}\n`;
    }

    return code;
  }, [curlInput, moduleChoice]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(perlCode);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Choice */}
      <div className="flex gap-2">
        <button
          onClick={() => setModuleChoice("lwp")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
            moduleChoice === "lwp" ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
          }`}
        >
          LWP::UserAgent (Standard CPAN)
        </button>
        <button
          onClick={() => setModuleChoice("tiny")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
            moduleChoice === "tiny" ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
          }`}
        >
          HTTP::Tiny (Perl Core / Zero Dependency)
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

      {/* Output Perl Code */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-emerald-500" />
            Perl Script ({moduleChoice === "lwp" ? "LWP::UserAgent" : "HTTP::Tiny"})
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Perl"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {perlCode}
        </pre>
      </div>
    </div>
  );
}
