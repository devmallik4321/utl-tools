"use client";

import { useState, useRef } from "react";
import { Copy, Check, Upload, FileUp, Download, RefreshCw, FileText } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

export function Base64Encoder() {
  const [inputText, setInputText] = useState<string>("Hello, UTL.tools! 🚀");
  const [outputBase64, setOutputBase64] = useState<string>("SGVsbG8sIFVUTC50b29scyEg8J+agA==");
  const [dataUriMode, setDataUriMode] = useState<boolean>(false);
  const [fileMime, setFileMime] = useState<string>("text/plain");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const encodeText = (text: string, isDataUri: boolean) => {
    try {
      if (!text) {
        setOutputBase64("");
        return;
      }
      const bytes = new TextEncoder().encode(text);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const b64 = btoa(binary);
      setOutputBase64(isDataUri ? `data:${fileMime};charset=utf-8;base64,${b64}` : b64);
    } catch {
      setOutputBase64("Encoding error.");
    }
  };

  const handleTextChange = (text: string) => {
    setInputText(text);
    setFileName(null);
    setFileSize(null);
    encodeText(text, dataUriMode);
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    setFileSize(file.size);
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
        setInputText(`[Binary File: ${file.name} (${(file.size / 1024).toFixed(1)} KB, MIME: ${file.type || "octet-stream"})]`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(outputBase64);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadFile = () => {
    if (!outputBase64) return;
    try {
      let b64Data = outputBase64;
      let mime = fileMime;
      if (outputBase64.startsWith("data:")) {
        const parts = outputBase64.split(",");
        mime = parts[0].split(":")[1].split(";")[0];
        b64Data = parts[1];
      }
      const byteCharacters = atob(b64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName ? `decoded_${fileName}` : "decoded_file.bin";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Could not decode Base64 string to file. Ensure it is valid Base64.");
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
                if (fileName) {
                  if (e.target.checked && !outputBase64.startsWith("data:")) {
                    setOutputBase64(`data:${fileMime};base64,${outputBase64}`);
                  } else if (!e.target.checked && outputBase64.startsWith("data:")) {
                    setOutputBase64(outputBase64.split(",")[1] || outputBase64);
                  }
                } else {
                  encodeText(inputText, e.target.checked);
                }
              }}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Format as Data URI (<code>data:{fileMime};base64,...</code>)</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 text-xs font-semibold border border-border rounded-lg hover:bg-muted text-foreground inline-flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File / Binary</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
          isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : "border-border hover:bg-muted/30"
        }`}
      >
        <FileUp className="w-6 h-6 text-muted-foreground mb-2" />
        <p className="text-xs font-semibold text-foreground">
          Drag and drop any file here (Images, PDF, GLB, Audio, Binaries)
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          100% processed in your browser. Files are never uploaded to any server.
        </p>
      </div>

      {/* Input / Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Textarea */}
        <div className="p-4 bg-card border border-border rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
              {fileName ? "Selected File" : "Input Plain Text"}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {fileSize ? `${(fileSize / 1024).toFixed(1)} KB` : `${inputText.length} chars`}
            </span>
          </div>
          <textarea
            rows={8}
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
              Base64 Encoded String
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadFile}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium"
                title="Download decoded binary file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>
          </div>
          <textarea
            rows={8}
            readOnly
            value={outputBase64}
            className="w-full p-3 font-mono text-xs bg-muted/40 border border-border rounded-lg focus:outline-none resize-y select-all break-all"
          />
        </div>
      </div>
    </div>
  );
}
