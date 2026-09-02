"use client";

import { useState } from "react";
import { Image as ImageIcon, Copy, Check, Upload, Download, Sparkles, FileCode } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function Base64ImageConverter() {
  const [base64String, setBase64String] = useState<string>("");
  const [mimeType, setMimeType] = useState<string>("image/png");
  const [fileSize, setFileSize] = useState<number>(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || "image/png");
    setFileSize(file.size);

    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      setBase64String(res);
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = async (val: string, key: string) => {
    const ok = await copyToClipboard(val);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleDownload = () => {
    if (!base64String) return;
    const a = document.createElement("a");
    a.href = base64String;
    a.download = `decoded_image.${mimeType.split("/")[1] || "png"}`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Drag and Drop Upload Area */}
      <div className="p-6 bg-card border-2 border-dashed border-border rounded-xl text-center space-y-3 hover:border-blue-500 transition-colors">
        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-full flex items-center justify-center mx-auto">
          <Upload className="w-6 h-6" />
        </div>
        <div>
          <label className="cursor-pointer text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline block">
            Choose an image file or drag &amp; drop
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <p className="text-xs text-muted-foreground pt-1">
            Supports PNG, JPEG, SVG, WebP, GIF (100% in-browser processing)
          </p>
        </div>
      </div>

      {/* Base64 Output and Image Preview Grid */}
      {base64String && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Preview Canvas */}
          <div className="p-4 bg-card border border-border rounded-xl space-y-3 flex flex-col items-center">
            <div className="w-full flex justify-between items-center text-xs text-muted-foreground">
              <span className="font-semibold uppercase text-foreground">Image Preview</span>
              <span>{(fileSize / 1024).toFixed(1)} KB</span>
            </div>
            <div className="w-full h-64 border border-border rounded-lg flex items-center justify-center p-3 bg-muted/20 overflow-hidden">
              <img
                src={base64String}
                alt="Decoded base64 preview"
                className="max-h-56 max-w-full object-contain rounded drop-shadow-xs"
              />
            </div>
            <button
              onClick={handleDownload}
              className="w-full py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold rounded-lg hover:opacity-90 inline-flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Image File</span>
            </button>
          </div>

          {/* Formatted Code Formats */}
          <div className="p-4 bg-card border border-border rounded-xl space-y-3">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
              Copy Embed Formats
            </span>

            {/* Raw Data URI */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Raw Data URI:</span>
                <button
                  onClick={() => handleCopy(base64String, "raw")}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  {copiedKey === "raw" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === "raw" ? "Copied!" : "Copy Data URI"}</span>
                </button>
              </div>
              <textarea
                readOnly
                value={base64String}
                rows={3}
                className="w-full px-2 py-1 text-[11px] font-mono bg-background border border-border rounded-md text-emerald-600 dark:text-emerald-400 select-all"
              />
            </div>

            {/* HTML Image Tag */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">HTML Image Tag:</span>
                <button
                  onClick={() => handleCopy(`<img src="${base64String}" alt="Embedded Image" />`, "html")}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  {copiedKey === "html" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === "html" ? "Copied!" : "Copy HTML"}</span>
                </button>
              </div>
              <textarea
                readOnly
                value={`<img src="${base64String}" alt="Embedded Image" />`}
                rows={2}
                className="w-full px-2 py-1 text-[11px] font-mono bg-background border border-border rounded-md text-foreground select-all"
              />
            </div>

            {/* CSS Background */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">CSS Background Image:</span>
                <button
                  onClick={() => handleCopy(`background-image: url("${base64String}");`, "css")}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  {copiedKey === "css" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === "css" ? "Copied!" : "Copy CSS"}</span>
                </button>
              </div>
              <textarea
                readOnly
                value={`background-image: url("${base64String}");`}
                rows={2}
                className="w-full px-2 py-1 text-[11px] font-mono bg-background border border-border rounded-md text-foreground select-all"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
