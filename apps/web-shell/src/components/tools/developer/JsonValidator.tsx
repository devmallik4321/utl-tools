"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Wrench, RotateCcw, Copy, Check } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function JsonValidator() {
  const [jsonText, setJsonText] = useState<string>('{\n  "status": "success",\n  "code": 200,\n  "data": {\n    "message": "Valid RFC 8259 JSON payload"\n  }\n}');
  const [copied, setCopied] = useState<boolean>(false);

  const validateJson = (text: string) => {
    if (!text.trim()) return { isValid: true, empty: true, error: null };
    try {
      JSON.parse(text);
      return { isValid: true, empty: false, error: null };
    } catch (e: any) {
      const msg = e.message || "Invalid JSON";
      return { isValid: false, empty: false, error: msg };
    }
  };

  const status = validateJson(jsonText);

  const attemptAutoFix = () => {
    try {
      // Clean common trailing commas and convert single-quoted strings
      let fixed = jsonText
        // Replace single quotes around keys/strings
        .replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"')
        // Remove trailing commas before } or ]
        .replace(/,\s*([}\]])/g, "$1");
      
      JSON.parse(fixed);
      setJsonText(fixed);
    } catch {
      // If simple regex fix fails, do nothing
    }
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(jsonText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Validation Status Banner */}
      <div
        className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
          status.empty
            ? "bg-muted/40 border-border text-muted-foreground"
            : status.isValid
            ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
            : "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300"
        }`}
      >
        <div className="flex items-center gap-3">
          {status.empty ? (
            <span className="text-xs font-semibold uppercase">Awaiting JSON input...</span>
          ) : status.isValid ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <span className="font-bold text-sm block">Valid JSON Syntax</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400">
                  Input conforms 100% to RFC 8259 specifications.
                </span>
              </div>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <div>
                <span className="font-bold text-sm block">Invalid JSON Syntax</span>
                <span className="text-xs font-mono break-all">{status.error}</span>
              </div>
            </>
          )}
        </div>

        {!status.isValid && !status.empty && (
          <button
            type="button"
            onClick={attemptAutoFix}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shrink-0"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Attempt Auto-Fix</span>
          </button>
        )}
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          rows={14}
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder="Paste JSON string to validate in real time..."
          className="w-full p-4 font-mono text-xs sm:text-sm bg-card border border-border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y leading-relaxed text-foreground"
          spellCheck={false}
        />
      </div>

      {/* Action Footer */}
      <div className="flex justify-between items-center text-xs">
        <button
          type="button"
          onClick={() => setJsonText("")}
          className="text-muted-foreground hover:text-foreground"
        >
          Clear Editor
        </button>

        <button
          type="button"
          onClick={handleCopy}
          className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold text-xs rounded-lg hover:opacity-90 transition-opacity inline-flex items-center gap-1.5"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied!" : "Copy Clean JSON"}</span>
        </button>
      </div>
    </div>
  );
}
