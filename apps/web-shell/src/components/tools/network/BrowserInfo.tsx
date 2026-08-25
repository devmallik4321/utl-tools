"use client";

import { useState, useEffect } from "react";
import {
  Copy,
  Check,
  Monitor,
  Cpu,
  HardDrive,
  ShieldCheck,
  Info,
  Laptop,
  Globe,
  Wifi,
  Zap,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

interface CapabilityItem {
  label: string;
  value: string;
  reliability: "reliable" | "inferred";
  note?: string;
}

interface DiagnosticGroup {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: CapabilityItem[];
}

export function BrowserInfo() {
  const [groups, setGroups] = useState<DiagnosticGroup[] | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [userAgentStr, setUserAgentStr] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const nav = window.navigator as any;
    const ua = nav.userAgent || "";
    setUserAgentStr(ua);

    // 1. Browser Name & Engine Detection
    let browserName = "Unknown Browser";
    let browserVersion = "Unknown";
    let browserReliability: "reliable" | "inferred" = "inferred";

    if (nav.userAgentData && Array.isArray(nav.userAgentData.brands)) {
      const brands = nav.userAgentData.brands.filter(
        (b: any) => !b.brand.includes("Not") && !b.brand.includes("Brand")
      );
      if (brands.length > 0) {
        const primary = brands[brands.length - 1];
        browserName = primary.brand;
        browserVersion = primary.version;
        browserReliability = "reliable";
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

    // 2. OS & Architecture Detection
    let osName = "Unknown OS";
    let osReliability: "reliable" | "inferred" = "inferred";
    if (/Windows NT 10.0/.test(ua)) {
      osName = "Windows 10 / 11 (NT 10.0)";
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

    // 3. WebGL GPU Renderer
    let gpuRenderer = "Hardware Acceleration (WebGL)";
    let gpuReliability: "reliable" | "inferred" = "inferred";
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || (canvas.getContext("experimental-webgl") as any);
      if (gl) {
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || gpuRenderer;
          gpuReliability = "reliable";
        }
      }
    } catch {}

    // 4. Network Info
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
    const connectionType = conn?.effectiveType ? `${conn.effectiveType.toUpperCase()} (${conn.downlink || "?"} Mbps)` : "Standard Broadband / Cellular";
    const rttEstimate = conn?.rtt ? `~${conn.rtt} ms RTT` : "Standard Latency";

    // 5. Browser Capabilities & Web APIs
    const hasWebCrypto = typeof window.crypto?.getRandomValues === "function";
    const hasWebSpeech = typeof window.speechSynthesis !== "undefined";
    const hasServiceWorker = "serviceWorker" in nav;
    const hasWebAudio = typeof window.AudioContext !== "undefined" || typeof (window as any).webkitAudioContext !== "undefined";
    const hasLocalStorage = typeof window.localStorage !== "undefined";
    const hasClipboard = typeof nav.clipboard?.writeText === "function";

    const builtGroups: DiagnosticGroup[] = [
      {
        id: "device",
        title: "Device & Hardware",
        icon: Laptop,
        items: [
          {
            label: "Operating System",
            value: osName,
            reliability: osReliability,
            note: "Inferred from UA; Client Hints audited if permitted",
          },
          {
            label: "CPU Concurrency",
            value: nav.hardwareConcurrency ? `${nav.hardwareConcurrency} Logical Cores` : "Unavailable",
            reliability: "reliable",
            note: "Hardware concurrency reported by W3C Navigator",
          },
          {
            label: "Device Memory",
            value: nav.deviceMemory ? `~${nav.deviceMemory} GB RAM` : "Protected / Unknown",
            reliability: "inferred",
            note: "Bucketed by browser to reduce fingerprinting surface",
          },
          {
            label: "Touch Screen Support",
            value: "ontouchstart" in window || nav.maxTouchPoints > 0 ? `Yes (${nav.maxTouchPoints || 1} touch points)` : "No (Pointer / Keyboard)",
            reliability: "reliable",
          },
        ],
      },
      {
        id: "browser",
        title: "Browser & Engine",
        icon: Globe,
        items: [
          {
            label: "Browser Client",
            value: `${browserName} (v${browserVersion})`,
            reliability: browserReliability,
          },
          {
            label: "Platform Identifier",
            value: nav.platform || "Standard Web Client",
            reliability: "inferred",
          },
          {
            label: "System Language",
            value: `${nav.language || "en-US"} (All: ${nav.languages ? nav.languages.join(", ") : nav.language})`,
            reliability: "reliable",
          },
          {
            label: "Cookies & Storage",
            value: nav.cookieEnabled ? "Cookies Enabled" : "Cookies Blocked",
            reliability: "reliable",
          },
          {
            label: "Do Not Track (DNT)",
            value: nav.doNotTrack === "1" ? "Active (1)" : "Unspecified / Inactive (0)",
            reliability: "reliable",
          },
        ],
      },
      {
        id: "display",
        title: "Display & Graphics",
        icon: Monitor,
        items: [
          {
            label: "Physical Screen Resolution",
            value: `${window.screen.width} × ${window.screen.height} px (${window.screen.colorDepth || 24}-bit color)`,
            reliability: "reliable",
          },
          {
            label: "CSS Viewport Dimensions",
            value: `${window.innerWidth} × ${window.innerHeight} px`,
            reliability: "reliable",
          },
          {
            label: "Device Pixel Ratio (DPR)",
            value: `${window.devicePixelRatio || 1}x`,
            reliability: "reliable",
          },
          {
            label: "GPU Hardware Renderer",
            value: gpuRenderer,
            reliability: gpuReliability,
            note: "Queried via WebGL unmasked vendor & renderer extension",
          },
        ],
      },
      {
        id: "network",
        title: "Network & Environment",
        icon: Wifi,
        items: [
          {
            label: "Online Connection",
            value: nav.onLine ? "Connected (Online)" : "Disconnected (Offline)",
            reliability: "reliable",
          },
          {
            label: "Effective Connection Speed",
            value: connectionType,
            reliability: "inferred",
          },
          {
            label: "Round-Trip Time Estimate",
            value: rttEstimate,
            reliability: "inferred",
          },
          {
            label: "Configured Timezone",
            value: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
            reliability: "reliable",
          },
        ],
      },
      {
        id: "capabilities",
        title: "Browser API Capabilities",
        icon: Zap,
        items: [
          {
            label: "Web Crypto API",
            value: hasWebCrypto ? "Supported (Hardware Entropy Available)" : "Unsupported",
            reliability: "reliable",
          },
          {
            label: "Web Speech Synthesis",
            value: hasWebSpeech ? "Supported (W3C Speech API)" : "Unsupported",
            reliability: "reliable",
          },
          {
            label: "Web Audio API",
            value: hasWebAudio ? "Supported (AudioContext Synthesizer)" : "Unsupported",
            reliability: "reliable",
          },
          {
            label: "Service Workers",
            value: hasServiceWorker ? "Supported (Offline Caching Capable)" : "Unsupported",
            reliability: "reliable",
          },
          {
            label: "Async Clipboard API",
            value: hasClipboard ? "Supported (1-Click Safe Copy)" : "Fallback Only",
            reliability: "reliable",
          },
        ],
      },
    ];

    setGroups(builtGroups);

    // High Entropy Client Hints Check (Windows 11 / Architecture)
    if (nav.userAgentData && typeof nav.userAgentData.getHighEntropyValues === "function") {
      nav.userAgentData.getHighEntropyValues(["platformVersion", "architecture", "model"])
        .then((hints: any) => {
          if (hints.platformVersion) {
            const major = parseInt(hints.platformVersion.split(".")[0], 10);
            const verifiedOS = major >= 13 ? "Windows 11" : major >= 1 ? "Windows 10" : osName;
            setGroups((prev) => {
              if (!prev) return null;
              return prev.map((g) => {
                if (g.id !== "device") return g;
                return {
                  ...g,
                  items: g.items.map((item) =>
                    item.label === "Operating System"
                      ? { ...item, value: `${verifiedOS} (v${hints.platformVersion}, ${hints.architecture || "x64"})`, reliability: "reliable" }
                      : item
                  ),
                };
              });
            });
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleCopyReport = async () => {
    if (!groups) return;

    const sections = groups.map((g) => {
      const itemsList = g.items
        .map((item) => `  - **${item.label}**: ${item.value} [${item.reliability === "reliable" ? "Reliable W3C API" : "Inferred"}]`)
        .join("\n");
      return `### ${g.title}\n${itemsList}`;
    });

    const report = [
      "# UTL.tools System & Browser Diagnostics Report",
      `*Audited: ${new Date().toISOString()}*\n`,
      ...sections,
      `\n### Raw HTTP User-Agent String\n\`\`\`\n${userAgentStr}\n\`\`\``,
    ].join("\n\n");

    const ok = await copyToClipboard(report);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!groups) {
    return (
      <div className="p-12 text-center text-muted-foreground text-sm">
        Auditing browser hardware, W3C capabilities, and graphics environment...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Action Bar & Reliability Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-card border border-border rounded-xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">
              Diagnostic Audit Result
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
              <CheckCircle2 className="w-3 h-3" /> W3C Standard APIs
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Audited locally in your browser memory. Data is never transmitted to any external server.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyReport}
          className="px-4 py-2.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm self-start sm:self-auto shrink-0"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? "Report Copied!" : "Copy Diagnostics Markdown"}</span>
        </button>
      </div>

      {/* Structured Diagnostic Groups */}
      <div className="space-y-6">
        {groups.map((group) => {
          const Icon = group.icon;
          return (
            <div key={group.id} className="p-6 bg-card border border-border rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-border pb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  {group.title}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-muted/40 border border-border/70 rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
                        {item.label}
                      </span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded shrink-0 ${
                          item.reliability === "reliable"
                            ? "bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                            : "bg-amber-100/70 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                        }`}
                        title={
                          item.reliability === "reliable"
                            ? "Confirmed directly by W3C hardware/browser API"
                            : "Approximate or inferred metric"
                        }
                      >
                        {item.reliability === "reliable" ? "Direct" : "Inferred"}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold font-mono text-foreground break-words">
                      {item.value}
                    </p>
                    {item.note && (
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        {item.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Raw User-Agent Inspection */}
      <div className="p-6 bg-card border border-border rounded-2xl space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider">
            Raw HTTP User-Agent String
          </span>
          <span className="text-[11px] text-muted-foreground font-mono">
            navigator.userAgent
          </span>
        </div>
        <textarea
          rows={3}
          readOnly
          value={userAgentStr}
          className="w-full p-3 font-mono text-xs bg-muted/40 border border-border rounded-xl select-all leading-relaxed"
        />
      </div>

      {/* Technical Limitations & Transparency */}
      <div className="p-4 bg-muted/30 border border-border rounded-xl flex items-start gap-2.5 text-xs text-muted-foreground">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <span>
          <strong>Diagnostic Transparency:</strong> Modern browsers intentionally limit certain hardware queries (such as exact RAM down to the megabyte or specific OS builds) to protect user privacy against fingerprinting. Where exact values cannot be queried directly via W3C APIs, metrics are labeled as <em>Inferred</em>.
        </span>
      </div>
    </div>
  );
}
