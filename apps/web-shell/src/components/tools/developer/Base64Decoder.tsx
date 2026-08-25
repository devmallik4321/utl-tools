"use client";

import { useState } from "react";
import { Copy, Check, Image as ImageIcon, AlertCircle } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function Base64Decoder() {
  const [base64Input, setBase64Input] = useState<string>("SGVsbG8sIFVUTC50b29scyEg8J+agA==");
  const [decodedText, setDecodedText] = useState<string>("Hello, UTL.tools! 🚀");
  const [isImage, setIsImage] = useState<boolean>(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const decode = (input: string) => {
    setError(null);
    setIsImage(false);
    setImageSrc(null);

    if (!input.trim()) {
      setDecodedText("");
      return;
    }

    try {
      let raw = input.trim();

      // Check if Data URI
      if (raw.startsWith("data:image/")) {
        setIsImage(true);
        setImageSrc(raw);
        setDecodedText(`[Image Data URI detected — Preview rendered below]`);
        return;
      }

      // Strip data URI prefix if present
      if (raw.includes(",")) {
        raw = raw.split(",")[1];
      }

      // Clean whitespaces
      raw = raw.replace(/\s+/g, "");

      // Decode bytes with UTF-8 support
      const binary = atob(raw);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const decoded = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
      setDecodedText(decoded);
    } catch (e: any) {
      setError("Invalid Base64 string. Please check padding and character set.");
    }
  };

  const handleInputChange = (text: string) => {
    setBase64Input(text);
    decode(text);
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(decodedText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Base64 Input */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Base64 Input / Data URI
            </span>
            <span className="text-xs text-muted-foreground">{base64Input.length} chars</span>
          </div>
          <textarea
            rows={10}
            value={base64Input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Paste Base64 encoded string here..."
            className="w-full p-3 font-mono text-xs sm:text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
          />
        </div>

        {/* Decoded Plaintext */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Decoded Output (UTF-8)
            </span>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!decodedText || isImage}
              className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Text"}</span>
            </button>
          </div>

          {isImage && imageSrc ? (
            <div className="p-4 border border-border rounded-lg bg-muted/20 flex flex-col items-center justify-center min-h-[220px]">
              <img src={imageSrc} alt="Decoded Base64 preview" className="max-h-56 max-w-full rounded shadow" />
              <span className="text-xs text-muted-foreground mt-2">Decoded Image Preview</span>
            </div>
          ) : (
            <textarea
              rows={10}
              readOnly
              value={decodedText}
              className="w-full p-3 font-mono text-xs sm:text-sm bg-muted/40 border border-border rounded-lg focus:outline-none resize-y select-all"
            />
          )}
        </div>
      </div>
    </div>
  );
}
