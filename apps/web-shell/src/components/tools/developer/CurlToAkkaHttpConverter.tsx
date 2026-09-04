"use client";

import { useState, useMemo } from "react";
import { Terminal, Copy, Check, Sparkles, Code2, ArrowRight } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

const SAMPLE_CURL = `curl -X POST "https://api.example.com/v1/orders" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sec_tok_89a3f" \\
  -d '{"itemId": "SKU-9921", "quantity": 4, "currency": "USD"}'`;

export function CurlToAkkaHttpConverter() {
  const [curlInput, setCurlInput] = useState<string>(SAMPLE_CURL);
  const [framework, setFramework] = useState<"akka" | "pekko">("pekko");
  const [copied, setCopied] = useState<boolean>(false);

  const { method, url, headers, body } = useMemo(() => {
    let m = "GET";
    let u = "https://api.example.com";
    const hdrs: { name: string; value: string }[] = [];
    let b = "";

    const methodMatch = curlInput.match(/-X\s+([A-Z]+)/i) || curlInput.match(/--request\s+([A-Z]+)/i);
    if (methodMatch) {
      m = methodMatch[1].toUpperCase();
    } else if (curlInput.includes("-d ") || curlInput.includes("--data ") || curlInput.includes("--data-raw ")) {
      m = "POST";
    }

    const urlMatch = curlInput.match(/curl\s+(?:-[^\s]+\s+)*['"]?([^'"\s\\]+)['"]?/i);
    if (urlMatch) {
      u = urlMatch[1];
    }

    const headerRegex = /(?:-H|--header)\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = headerRegex.exec(curlInput)) !== null) {
      const parts = match[1].split(":");
      if (parts.length >= 2) {
        hdrs.push({
          name: parts[0].trim(),
          value: parts.slice(1).join(":").trim(),
        });
      }
    }

    const dataMatch =
      curlInput.match(/(?:-d|--data|--data-raw)\s+'([^']+)'/) ||
      curlInput.match(/(?:-d|--data|--data-raw)\s+"([^"]+)"/) ||
      curlInput.match(/(?:-d|--data|--data-raw)\s+([^\s\\]+)/);

    if (dataMatch) {
      b = dataMatch[1];
    }

    return { method: m, url: u, headers: hdrs, body: b };
  }, [curlInput]);

  const generatedCode = useMemo(() => {
    const pkg = framework === "pekko" ? "org.apache.pekko" : "akka";
    const libName = framework === "pekko" ? "Pekko HTTP" : "Akka HTTP";

    const nonContentTypeHeaders = headers.filter(
      (h) => h.name.toLowerCase() !== "content-type"
    );

    let headersBlock = "    headers = List.empty";
    if (nonContentTypeHeaders.length > 0) {
      const hdrsList = nonContentTypeHeaders
        .map((h) => `      RawHeader("${h.name}", "${h.value.replace(/"/g, '\\"')}")`)
        .join(",\n");
      headersBlock = `    headers = List(\n${hdrsList}\n    )`;
    }

    let entityBlock = "    entity = HttpEntity.Empty";
    if (body) {
      const isJson = headers.some(
        (h) => h.name.toLowerCase() === "content-type" && h.value.includes("json")
      ) || body.trim().startsWith("{") || body.trim().startsWith("[");

      const ct = isJson ? "ContentTypes.`application/json`" : "ContentTypes.`text/plain(UTF-8)`";
      const escapedBody = body.replace(/"/g, '\\"');
      entityBlock = `    entity = HttpEntity(\n      ${ct},\n      "${escapedBody}"\n    )`;
    }

    return `// Generated with UTL.tools ${libName} Converter
package com.example.client

import ${pkg}.actor.ActorSystem
import ${pkg}.http.scaladsl.Http
import ${pkg}.http.scaladsl.model._
import ${pkg}.http.scaladsl.model.headers.RawHeader
import ${pkg}.http.scaladsl.unmarshalling.Unmarshal

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success}

object HttpClientRequest {

  def sendRequest()(implicit system: ActorSystem, ec: ExecutionContext): Future[String] = {
    val request = HttpRequest(
      method = HttpMethods.${method},
      uri = "${url}",
  ${headersBlock},
  ${entityBlock}
    )

    val responseFuture: Future[HttpResponse] = Http().singleRequest(request)

    responseFuture.flatMap { response =>
      if (response.status.isSuccess()) {
        Unmarshal(response.entity).to[String]
      } else {
        response.discardEntityBytes()
        Future.failed(new RuntimeException(s"HTTP request failed with status: \${response.status}"))
      }
    }
  }

  def main(args: Array[String]): Unit = {
    implicit val system: ActorSystem = ActorSystem("HttpClientSystem")
    implicit val ec: ExecutionContext = system.dispatcher

    sendRequest().onComplete {
      case Success(body) =>
        println(s"Response body: $body")
        system.terminate()
      case Failure(exception) =>
        System.err.println(s"Request failed: \${exception.getMessage}")
        system.terminate()
    }
  }
}
`;
  }, [framework, method, url, headers, body]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(generatedCode);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Framework Selector */}
      <div className="p-4 bg-card border border-border rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Scala Reactive HTTP Client Generator
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase">
            Framework:
          </label>
          <div className="flex bg-secondary p-0.5 rounded-lg border border-border">
            <button
              onClick={() => setFramework("pekko")}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                framework === "pekko"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Apache Pekko HTTP
            </button>
            <button
              onClick={() => setFramework("akka")}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                framework === "akka"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Akka HTTP
            </button>
          </div>
        </div>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-primary" />
              Source cURL Command
            </label>
            <button
              onClick={() => setCurlInput(SAMPLE_CURL)}
              className="text-xs text-primary hover:underline font-semibold"
            >
              Load Sample
            </button>
          </div>
          <textarea
            rows={12}
            value={curlInput}
            onChange={(e) => setCurlInput(e.target.value)}
            className="w-full px-3 py-2 text-xs font-mono bg-background border border-border rounded-lg text-foreground resize-none"
            placeholder="curl -X POST https://api.example.com -H '...' -d '...'"
          />
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
            <span>Method: <strong className="text-foreground">{method}</strong></span>
            <span>•</span>
            <span>Headers: <strong className="text-foreground">{headers.length}</strong></span>
            <span>•</span>
            <span>Body: <strong className="text-foreground">{body ? "Present" : "None"}</strong></span>
          </div>
        </div>

        {/* Output */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Scala ({framework === "pekko" ? "Apache Pekko HTTP" : "Akka HTTP"})
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground rounded-lg border border-border transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied Scala" : "Copy Code"}</span>
            </button>
          </div>
          <pre className="p-3 bg-muted/40 border border-border/70 rounded-lg text-xs font-mono text-muted-foreground overflow-x-auto max-h-[320px]">
            {generatedCode}
          </pre>
        </div>
      </div>
    </div>
  );
}
