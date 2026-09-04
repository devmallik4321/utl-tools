"use client";

import { useState, useMemo } from "react";
import { Terminal, Copy, Check, Sparkles, FileCode } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_CURL = `curl -X POST https://api.example.com/v1/deployments \\
  -H "Authorization: Bearer ocaml_token_889" \\
  -H "Content-Type: application/json" \\
  -d '{"branch": "release", "commit": "a5bff79"}'`;

export function CurlToEzcurlConverter() {
  const [curlInput, setCurlInput] = useState<string>(SAMPLE_CURL);
  const [mode, setMode] = useState<"sync" | "lwt">("sync");
  const [copied, setCopied] = useState<boolean>(false);

  const ocamlCode = useMemo(() => {
    if (!curlInput.trim()) return "(* Paste a cURL command above to generate OCaml code *)";

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

    let code = `(* OCaml HTTP Client via Ezcurl *)\n`;

    if (mode === "sync") {
      code += `open Ezcurl\n\n`;
      code += `let () =\n`;
      code += `  let headers = [\n`;
      headers.forEach((h) => {
        code += `    ("${h.key}", "${h.val}");\n`;
      });
      code += `  ] in\n`;

      if (dataPayload) {
        code += `  let body = {|${dataPayload}|} in\n`;
        code += `  match Ezcurl.http ~headers ~url:"${rawUrl}" ~params:[] ~meth:\`${method} ~content:(\`String body) () with\n`;
      } else {
        code += `  match Ezcurl.http ~headers ~url:"${rawUrl}" ~params:[] ~meth:\`${method} () with\n`;
      }
      code += `  | Ok resp ->\n`;
      code += `    Printf.printf "Status: %d\\n" resp.code;\n`;
      code += `    print_endline resp.body\n`;
      code += `  | Error (code, msg) ->\n`;
      code += `    Printf.eprintf "cURL Error %s: %s\\n" (Curl.strerror code) msg\n`;
    } else {
      // Lwt Async
      code += `open Lwt.Syntax\n`;
      code += `open Ezcurl_lwt\n\n`;
      code += `let run () =\n`;
      code += `  let headers = [\n`;
      headers.forEach((h) => {
        code += `    ("${h.key}", "${h.val}");\n`;
      });
      code += `  ] in\n`;
      if (dataPayload) {
        code += `  let body = {|${dataPayload}|} in\n`;
        code += `  let* res = Ezcurl_lwt.http ~headers ~url:"${rawUrl}" ~params:[] ~meth:\`${method} ~content:(\`String body) () in\n`;
      } else {
        code += `  let* res = Ezcurl_lwt.http ~headers ~url:"${rawUrl}" ~params:[] ~meth:\`${method} () in\n`;
      }
      code += `  match res with\n`;
      code += `  | Ok resp ->\n`;
      code += `    Printf.printf "HTTP Status: %d\\n" resp.code;\n`;
      code += `    Lwt_io.printl resp.body\n`;
      code += `  | Error (code, msg) ->\n`;
      code += `    Lwt_io.eprintlf "Error %s: %s" (Curl.strerror code) msg\n\n`;
      code += `let () = Lwt_main.run (run ())\n`;
    }

    return code;
  }, [curlInput, mode]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(ocamlCode);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Choice */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("sync")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
            mode === "sync" ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
          }`}
        >
          Synchronous (Ezcurl)
        </button>
        <button
          onClick={() => setMode("lwt")}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
            mode === "lwt" ? "bg-blue-600 text-white border-blue-600" : "bg-card border-border text-foreground hover:bg-muted"
          }`}
        >
          Asynchronous (Ezcurl_lwt + Lwt)
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

      {/* Output OCaml Code */}
      <div className="p-5 bg-muted/30 border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <FileCode className="w-4 h-4 text-emerald-500" />
            OCaml Code ({mode === "sync" ? "Ezcurl" : "Ezcurl_lwt"})
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy OCaml"}</span>
          </button>
        </div>

        <pre className="p-4 bg-card border border-border rounded-xl font-mono text-xs text-emerald-600 dark:text-emerald-400 overflow-x-auto select-all">
          {ocamlCode}
        </pre>
      </div>
    </div>
  );
}
