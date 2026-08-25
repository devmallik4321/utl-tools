"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Monitor, Cpu, HardDrive, ShieldCheck, Info, AlertCircle } from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface BrowserDiagnosis {
  browserName: string;
  browserVersion: string;
  operatingSystem: string;
  platform: string;
  userAgent: string;
  cpuCores: string;
  deviceMemory: string;
  gpuRenderer: string;
  screenResolution: string;
  viewportDimensions: string;
  devicePixelRatio: string;
  colorDepth: string;
  language: string;
  preferredLanguages: string;
  timezone: string;
  touchSupport: string;
  cookiesEnabled: string;
  onlineStatus: string;
  doNotTrack: string;
}

export function BrowserInfo() {
  const [data, setData] = useState<BrowserDiagnosis | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const nav = window.navigator as any;
    const ua = nav.userAgent || "";

    // 1. Robust Browser & Version Detection
    let browserName = "Unknown Browser";
    let browserVersion = "Unknown";

    if (nav.userAgentData && Array.isArray(nav.userAgentData.brands)) {
      const brands = nav.userAgentData.brands.filter(
        (b: any) => !b.brand.includes("Not") && !b.brand.includes("Brand")
      );
      if (brands.length > 0) {
        const primary = brands[brands.length - 1];
        browserName = primary.brand;
        browserVersion = primary.version;
      }
    }

    if (browserName === "Unknown Browser" || browserName === "Chromium") {
      if (/Edg\/([0-9.]+)/.test(ua)) {
        browserName = "Microsoft Edge";
        browserVersion = ua.match(/Edg\/([0-9.]+)/)?.[1] || "";
      } else if (/OPR\/([0-9.]+)|Opera\/([0-9.]+)/.test(ua)) {
        browserName = "Opera";
        browserVersion = ua.match(/(?:OPR|Opera)\/([0-9.]+)/)?.[1] || "";
      } else if (/Chrome\/([0-9.]+)|CriOS\/([0-9.]+)/.test(ua)) {
        browserName = "Google Chrome";
        browserVersion = ua.match(/(?:Chrome|CriOS)\/([0-9.]+)/)?.[1] || "";
      } else if (/Firefox\/([0-9.]+)|FxiOS\/([0-9.]+)/.test(ua)) {
        browserName = "Mozilla Firefox";
        browserVersion = ua.match(/(?:Firefox|FxiOS)\/([0-9.]+)/)?.[1] || "";
      } else if (/Version\/([0-9.]+).*Safari/.test(ua)) {
        browserName = "Apple Safari";
        browserVersion = ua.match(/Version\/([0-9.]+)/)?.[1] || "";
      }
    }

    // 2. Robust OS Detection
    let osName = "Unknown OS";
    if (/Windows NT 10.0/.test(ua)) {
      osName = "Windows 10 / Windows 11";
    } else if (/Windows NT 6.3/.test(ua)) {
      osName = "Windows 8.1";
    } else if (/Windows NT 6.1/.test(ua)) {
      osName = "Windows 7";
    } else if (/Mac OS X ([0-9_]+)/.test(ua)) {
      const ver = ua.match(/Mac OS X ([0-9_]+)/)?.[1]?.replace(/_/g, ".") || "";
      osName = `macOS ${ver}`;
    } else if (/Android ([0-9.]+)/.test(ua)) {
      const ver = ua.match(/Android ([0-9.]+)/)?.[1] || "";
      osName = `Android ${ver}`;
    } else if (/iPhone|iPad|iPod/.test(ua)) {
      osName = "iOS";
    } else if (/CrOS/.test(ua)) {
      osName = "ChromeOS";
    } else if (/Linux/.test(ua)) {
      osName = "Linux";
    }

    // 3. WebGL GPU Renderer Inspection
    let gpuRenderer = "Standard Hardware Acceleration";
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || (canvas.getContext("experimental-webgl") as any);
      if (gl) {
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || gpuRenderer;
        }
      }
    } catch {}

    const diagnosis: BrowserDiagnosis = {
      browserName,
      browserVersion,
      operatingSystem: osName,
      platform: nav.platform || "Web Platform",
      userAgent: ua,
      cpuCores: nav.hardwareConcurrency ? `${nav.hardwareConcurrency} Logical Cores` : "Unavailable",
      deviceMemory: nav.deviceMemory ? `~${nav.deviceMemory} GB` : "Protected / Unavailable",
      gpuRenderer,
      screenResolution: `${window.screen.width} × ${window.screen.height} px`,
      viewportDimensions: `${window.innerWidth} × ${window.innerHeight} px`,
      devicePixelRatio: `${window.devicePixelRatio || 1}x`,
      colorDepth: `${window.screen.colorDepth || 24}-bit`,
      language: nav.language || "en-US",
      preferredLanguages: nav.languages ? nav.languages.join(", ") : nav.language || "en-US",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      touchSupport: "ontouchstart" in window || nav.maxTouchPoints > 0 ? `Yes (${nav.maxTouchPoints || 1} touch points)` : "No (Mouse & Keyboard)",
      cookiesEnabled: nav.cookieEnabled ? "Enabled" : "Disabled",
      onlineStatus: nav.onLine ? "Online (Connected)" : "Offline",
      doNotTrack: nav.doNotTrack === "1" ? "Enabled (1)" : "Unspecified / Disabled (0)",
    };

    // Async User Agent Client Hints platformVersion check for Windows 11
    if (nav.userAgentData && typeof nav.userAgentData.getHighEntropyValues === "function") {
      nav.userAgentData.getHighEntropyValues(["platformVersion", "architecture", "model"])
        .then((hints: any) => {
          if (hints.platformVersion) {
            const major = parseInt(hints.platformVersion.split(".")[0], 10);
            if (major >= 13) {
              setData((prev) => prev ? { ...prev, operatingSystem: "Windows 11" } : null);
            } else if (major >= 1) {
              setData((prev) => prev ? { ...prev, operatingSystem: "Windows 10" } : null);
            }
          }
        })
        .catch(() => {});
    }

    setData(diagnosis);
  }, []);

  const handleCopyReport = async () => {
    if (!data) return;
    const markdown = [
      "### System & Browser Diagnostics Report",
      `- **Browser**: ${data.browserName} (v${data.browserVersion})`,
      `- **Operating System**: ${data.operatingSystem}`,
      `- **Platform Architecture**: ${data.platform}`,
      `- **CPU Logical Cores**: ${data.cpuCores}`,
      `- **Device Memory**: ${data.deviceMemory}`,
      `- **GPU Renderer**: ${data.gpuRenderer}`,
      `- **Physical Screen Resolution**: ${data.screenResolution}`,
      `- **CSS Viewport Size**: ${data.viewportDimensions}`,
      `- **Device Pixel Ratio (DPR)**: ${data.devicePixelRatio}`,
      `- **Color Depth**: ${data.colorDepth}`,
      `- **Timezone**: ${data.timezone}`,
      `- **Language**: ${data.language} (${data.preferredLanguages})`,
      `- **Touch Capabilities**: ${data.touchSupport}`,
      `- **Cookies**: ${data.cookiesEnabled}`,
      `- **Online Status**: ${data.onlineStatus}`,
      `- **Raw User-Agent**: \`${data.userAgent}\``,
      `\n*Generated by UTL.tools at ${new Date().toISOString()}*`,
    ].join("\n");

    const ok = await copyToClipboard(markdown);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!data) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm">
        Auditing browser and hardware environment...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-card border border-border rounded-xl">
        <div className="space-y-0.5">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Audited Client Environment
          </span>
          <span className="text-xs text-muted-foreground">
            Audited in real time via W3C Navigator, WebGL, and Screen APIs
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopyReport}
          className="px-4 py-2.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Report Copied!" : "Copy Diagnostics Markdown"}</span>
        </button>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-card border border-border rounded-xl space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Detected Browser
          </span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {data.browserName}
          </p>
          <span className="text-xs font-mono text-muted-foreground">Version {data.browserVersion}</span>
        </div>

        <div className="p-5 bg-card border border-border rounded-xl space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Operating System
          </span>
          <p className="text-2xl font-black text-foreground">
            {data.operatingSystem}
          </p>
          <span className="text-xs font-mono text-muted-foreground">{data.platform}</span>
        </div>

        <div className="p-5 bg-card border border-border rounded-xl space-y-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            CPU &amp; Memory
          </span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {data.cpuCores}
          </p>
          <span className="text-xs font-mono text-muted-foreground">{data.deviceMemory} RAM</span>
        </div>
      </div>

      {/* Structured Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-card border border-border rounded-xl space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            GPU Graphics Renderer
          </span>
          <p className="text-xs font-mono text-foreground font-medium break-words">
            {data.gpuRenderer}
          </p>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Display Resolution &amp; Viewport
          </span>
          <p className="text-xs font-mono text-foreground font-medium">
            {data.screenResolution} (CSS: {data.viewportDimensions} @ {data.devicePixelRatio})
          </p>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Timezone &amp; Locales
          </span>
          <p className="text-xs font-mono text-foreground font-medium">
            {data.timezone} ({data.preferredLanguages})
          </p>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Input &amp; Touch Capabilities
          </span>
          <p className="text-xs font-mono text-foreground font-medium">
            {data.touchSupport}
          </p>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Storage &amp; Cookies
          </span>
          <p className="text-xs font-mono text-foreground font-medium">
            Cookies: {data.cookiesEnabled} | DNT: {data.doNotTrack}
          </p>
        </div>

        <div className="p-4 bg-card border border-border rounded-xl space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Connectivity Status
          </span>
          <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium">
            {data.onlineStatus}
          </p>
        </div>
      </div>

      {/* Raw User-Agent Block */}
      <div className="p-5 bg-card border border-border rounded-xl space-y-2">
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
          Raw HTTP User-Agent String
        </span>
        <textarea
          rows={3}
          readOnly
          value={data.userAgent}
          className="w-full p-3 font-mono text-xs bg-muted/40 border border-border rounded-lg select-all leading-relaxed"
        />
      </div>

      {/* Technical Limitations Note */}
      <div className="p-4 bg-muted/30 border border-border rounded-xl flex items-start gap-2.5 text-xs text-muted-foreground">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <span>
          <strong>Browser Detection Note:</strong> Modern browsers freeze the standard User-Agent header (often reporting "Windows NT 10.0" or generic Chromium tokens) to prevent passive device fingerprinting. This tool queries User-Agent Client Hints (UA-CH) when permitted by your browser for enhanced hardware accuracy.
        </span>
      </div>
    </div>
  );
}
