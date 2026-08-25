"use client";

import { useState } from "react";
import { Copy, Check, Upload, FileText, Image, ArrowRight } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function Base64Encoder() {
  const [inputText, setInputText] = useState<string>("Hello, UTL.tools! 🚀");
  const [outputBase64, setOutputBase64] = useState<string>("");
  const [dataUriMode, setDataUriMode] = useState<boolean>(false);
  const [fileMime, setFileMime] = useState<string>("text/plain");
  const [copied, setCopied] = useState<boolean>(false);

  const encodeText = (text: string, isDataUri: boolean) => {
    try {
      if (!text) {
        setOutputBase64("");
        return;
      }
      // Proper UTF-8 string encoding using TextEncoder
      const bytes = new TextEncoder().encode(text);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const b64 = btoa(binary);
      setOutputBase64(isDataUri ? `data:${fileMime};charset=utf-8;base64,${b64}` : b64);
    } catch (e) {
      setOutputBase64("Encoding error.");
    }
  };

  const handleTextChange = (text: string) => {
    setInputText(text);
    encodeText(text, dataUriMode);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileMime(file.type || "application/octet-stream");
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        if (dataUriMode) {
          setOutputBase64(result);
        } else {
          const raw = result.split(",")[1] || result;
          setOutputBase64(raw);
        }
        setInputText(`[File: ${file.name} (${Math.round(file.size / 1024)} KB)]`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(outputBase64);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls & Options */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-card border border-border rounded-xl">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs sm:text-sm text-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dataUriMode}
              onChange={(e) => {
                setDataUriMode(e.target.checked);
                encodeText(inputText, e.target.checked);
              }}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Format as Data URI (`data:...;base64,`)</span>
          </label>
        </div>

        <div>
          <label className="cursor-pointer px-3 py-2 text-xs font-semibold border border-border rounded-lg hover:bg-muted text-foreground inline-flex items-center gap-1.5 transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File / Image</span>
            <input type="file" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Input / Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Textarea */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Input Plain Text
            </span>
            <span className="text-xs text-muted-foreground">{inputText.length} chars</span>
          </div>
          <textarea
            rows={10}
            value={inputText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Type or paste plain UTF-8 text here..."
            className="w-full p-3 font-mono text-xs sm:text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
          />
        </div>

        {/* Base64 Output Textarea */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Base64 Encoded Result
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Base64"}</span>
            </button>
          </div>
          <textarea
            rows={10}
            readOnly
            value={outputBase64 || "SGVsbG8sIFVUTC50b29scyEg8J+agA=="}
            className="w-full p-3 font-mono text-xs sm:text-sm bg-muted/40 border border-border rounded-lg focus:outline-none resize-y select-all break-all"
          />
        </div>
      </div>
    </div>
  );
}
