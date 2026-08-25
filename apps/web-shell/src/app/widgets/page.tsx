import { Metadata } from "next";
import Link from "next/link";
import { AppWindow, Monitor, ShieldCheck, Download, Sparkles, Compass, CheckCircle2, ArrowRight } from "lucide-react";
import categories from "@/../../registry/categories.json";

export const metadata: Metadata = {
  title: "Windows & Web Widget Discovery — Pin Utilities to Your Desktop | UTL.tools",
  description: "Learn how to pin UTL utilities directly to your Windows desktop, Windows Widgets board, or browser sidebar for instant one-click access.",
  alternates: {
    canonical: "https://utl.tools/widgets",
  },
};

const WIDGET_GUIDES = [
  {
    id: "edge-sidebar",
    title: "Edge Sidebar & Windows Copilot Bar",
    badge: "Native Windows 11",
    desc: "Pin any UTL utility directly into Microsoft Edge's persistent sidebar so it slides out over any open application without losing your window focus.",
    steps: [
      "Open any UTL tool page (e.g. Password Generator or Unit Converter) in Microsoft Edge.",
      "Click the '+' (Customize sidebar) icon in the right-hand Edge sidebar.",
      "Select 'Add current page' to pin the utility as an instant floating widget.",
      "Click the pinned icon anytime to open the utility in a lightweight split-pane flyout."
    ],
    recommendedTools: [
      { name: "Password Generator", slug: "password-generator" },
      { name: "Unit Converter", slug: "unit-converter" },
      { name: "Talking Alarm Clock", slug: "talking-alarm-clock" }
    ]
  },
  {
    id: "pwa-desktop",
    title: "Standalone Desktop PWA Window",
    badge: "Chrome & Edge",
    desc: "Install UTL.tools as a borderless Progressive Web App (PWA) with its own taskbar icon and independent desktop window.",
    steps: [
      "In Chrome or Edge, click the Install icon in the right side of the address bar (or Menu > 'Save and Share' > 'Install UTL.tools').",
      "Confirm 'Install' to place an official shortcut in your Windows Start Menu and Taskbar.",
      "Launch UTL.tools in its own ultra-fast, zero-overhead desktop window."
    ],
    recommendedTools: [
      { name: "Diff Checker", slug: "diff-checker" },
      { name: "JSON Formatter", slug: "json-formatter" },
      { name: "Stopwatch & Timer", slug: "stopwatch-timer" }
    ]
  },
  {
    id: "windows-widgets-board",
    title: "Windows 11 Widgets Board Integration",
    badge: "Windows 11 (Win + W)",
    desc: "Information regarding the Microsoft Windows App SDK Web Widget standard for native dashboard pinning.",
    steps: [
      "Press 'Windows Key + W' on your keyboard to open the Windows 11 Widgets board.",
      "Click the '+' button in the top-right corner of the widgets panel.",
      "When the official UTL.tools Microsoft Store companion widget is launched, you will be able to pin live quick-tools (like Stopwatch or World Time) directly to your board.",
      "In the meantime, pinning via Edge Sidebar provides identical zero-click accessibility."
    ],
    recommendedTools: [
      { name: "Talking Alarm Clock", slug: "talking-alarm-clock" },
      { name: "Random Picker", slug: "random-picker" },
      { name: "My IP Address", slug: "my-ip" }
    ]
  }
];

export default function WidgetsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 py-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-700 dark:text-blue-300">
          <AppWindow className="w-3.5 h-3.5" />
          <span>Desktop &amp; Widget Integration</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
          Windows &amp; Web Widget Discovery
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
          Access your favorite UTL utilities in zero clicks. Pin our lightweight, privacy-first tools directly to your Windows desktop, Edge sidebar flyout, or taskbar without installing heavy bloated background applications.
        </p>
      </div>

      {/* Trust Guarantee Card */}
      <div className="p-6 bg-card border border-border rounded-2xl flex items-start gap-4 shadow-xs">
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-foreground">Zero Background Battery Drain &amp; Pure Privacy</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Unlike heavy electron desktop utilities that run background telemetry processes, UTL.tools widgets run strictly inside sandboxed Web API containers with zero CPU overhead when closed and zero remote tracking.
          </p>
        </div>
      </div>

      {/* Integration Guides */}
      <div className="space-y-8">
        <h2 className="text-xl font-bold text-foreground">Recommended Widget Setup Methods</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {WIDGET_GUIDES.map((guide) => (
            <div
              key={guide.id}
              className="p-6 bg-card border border-border rounded-2xl flex flex-col justify-between space-y-6 shadow-xs hover:border-slate-400 dark:hover:border-slate-600 transition-colors"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wider">
                    {guide.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-foreground">{guide.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{guide.desc}</p>

                <div className="space-y-2 pt-2 border-t border-border">
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                    How to Setup:
                  </span>
                  <ol className="space-y-2 text-xs text-muted-foreground">
                    {guide.steps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="font-bold text-foreground shrink-0">{idx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="pt-4 border-t border-border space-y-2">
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  Top Recommended Utilities:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {guide.recommendedTools.map((t) => (
                    <Link
                      key={t.slug}
                      href={`/tools/${t.slug}`}
                      className="px-2 py-1 text-[11px] font-medium bg-muted hover:bg-muted/80 text-foreground rounded-lg border border-border transition-colors flex items-center gap-1"
                    >
                      <span>{t.name}</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="p-8 bg-muted/30 border border-border rounded-2xl text-center space-y-4">
        <h3 className="text-base font-bold text-foreground">Explore All 47 Production Utilities</h3>
        <p className="text-xs text-muted-foreground max-w-xl mx-auto">
          Every single utility on UTL.tools is 100% free, runs instantly in client-side browser memory, and requires zero account registration.
        </p>
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs rounded-xl hover:opacity-90 shadow-sm transition-opacity"
          >
            <span>Browse Complete Utility Toolbox</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
