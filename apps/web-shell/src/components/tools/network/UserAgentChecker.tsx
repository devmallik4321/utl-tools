"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Smartphone, Laptop, Tablet, Eye } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface UABreakdown {
  browser: string;
  browserVersion: string;
  os: string;
  engine: string;
  deviceType: string;
  isMobile: boolean;
  rawUA: string;
}

export function UserAgentChecker() {
  const [customUA, setCustomUA] = useState<string>("");
  const [parsed, setParsed] = useState<UABreakdown | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const parseUA = (uaString: string): UABreakdown => {
    const ua = uaString || "";

    // Detect Browser
    let browser = "Unknown Browser";
    let browserVersion = "Unknown";

    if (/Edg\/([\d.]+)/.test(ua)) {
      browser = "Microsoft Edge";
      browserVersion = RegExp.$1;
    } else if (/Chrome\/([\d.]+)/.test(ua) && !/Chromium/.test(ua)) {
      browser = "Google Chrome";
      browserVersion = RegExp.$1;
    } else if (/Firefox\/([\d.]+)/.test(ua)) {
      browser = "Mozilla Firefox";
      browserVersion = RegExp.$1;
    } else if (/Version\/([\d.]+).*Safari/.test(ua)) {
      browser = "Apple Safari";
      browserVersion = RegExp.$1;
    } else if (/OPR\/([\d.]+)/.test(ua) || /Opera\/([\d.]+)/.test(ua)) {
      browser = "Opera";
      browserVersion = RegExp.$1;
    }

    // Detect OS
    let os = "Unknown OS";
    if (/Windows NT 10.0/.test(ua)) os = "Windows 10 / 11";
    else if (/Windows NT 6.3/.test(ua)) os = "Windows 8.1";
    else if (/Windows NT 6.1/.test(ua)) os = "Windows 7";
    else if (/Mac OS X ([\d_]+)/.test(ua)) os = `macOS ${RegExp.$1.replace(/_/g, ".")}`;
    else if (/Android ([\d.]+)/.test(ua)) os = `Android ${RegExp.$1}`;
    else if (/iPhone OS ([\d_]+)/.test(ua)) os = `iOS ${RegExp.$1.replace(/_/g, ".")}`;
    else if (/iPad.*OS ([\d_]+)/.test(ua)) os = `iPadOS ${RegExp.$1.replace(/_/g, ".")}`;
    else if (/Linux/.test(ua)) os = "Linux";

    // Detect Engine
    let engine = "Unknown Engine";
    if (/AppleWebKit\/([\d.]+)/.test(ua)) engine = `WebKit / Blink (${RegExp.$1})`;
    else if (/Gecko\/([\d.]+)/.test(ua)) engine = `Gecko (${RegExp.$1})`;

    // Detect Device Type
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
    const isTablet = /Tablet|iPad/i.test(ua);
    const deviceType = isTablet ? "Tablet" : isMobile ? "Mobile Phone" : "Desktop Computer";

    return {
      browser,
      browserVersion,
      os,
      engine,
      deviceType,
      isMobile,
      rawUA: ua,
    };
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentUA = window.navigator.userAgent;
      setCustomUA(currentUA);
      setParsed(parseUA(currentUA));
    }
  }, []);

  const handleCustomChange = (text: string) => {
    setCustomUA(text);
    setParsed(parseUA(text));
  };

  const handleCopy = async () => {
    if (!customUA) return;
    const ok = await copyToClipboard(customUA);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Raw UA input/display */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Current User-Agent Header
          </label>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy UA"}</span>
          </button>
        </div>

        <textarea
          rows={3}
          value={customUA}
          onChange={(e) => handleCustomChange(e.target.value)}
          placeholder="Paste custom User-Agent string to parse..."
          className="w-full p-3 font-mono text-xs sm:text-sm bg-background border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none select-all"
        />

        <div className="flex justify-between items-center text-[11px] text-muted-foreground">
          <span>Edit or paste any server access log User-Agent above to parse</span>
          <button
            type="button"
            onClick={() => handleCustomChange(window.navigator.userAgent)}
            className="underline hover:text-foreground"
          >
            Reset to My Browser
          </button>
        </div>
      </div>

      {/* Structured Breakdown Cards */}
      {parsed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 bg-card border border-border rounded-xl space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Browser
            </span>
            <p className="text-lg font-bold text-foreground">{parsed.browser}</p>
            <span className="text-xs font-mono text-muted-foreground">v{parsed.browserVersion}</span>
          </div>

          <div className="p-5 bg-card border border-border rounded-xl space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Operating System
            </span>
            <p className="text-lg font-bold text-foreground">{parsed.os}</p>
            <span className="text-xs text-muted-foreground font-mono">Platform</span>
          </div>

          <div className="p-5 bg-card border border-border rounded-xl space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Device Category
            </span>
            <div className="flex items-center gap-2 mt-1">
              {parsed.deviceType === "Desktop Computer" ? (
                <Laptop className="w-5 h-5 text-blue-500" />
              ) : parsed.deviceType === "Tablet" ? (
                <Tablet className="w-5 h-5 text-purple-500" />
              ) : (
                <Smartphone className="w-5 h-5 text-emerald-500" />
              )}
              <span className="text-base font-bold text-foreground">{parsed.deviceType}</span>
            </div>
          </div>

          <div className="p-5 bg-card border border-border rounded-xl space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Rendering Engine
            </span>
            <p className="text-sm font-bold text-foreground truncate" title={parsed.engine}>
              {parsed.engine}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
