import Link from "next/link";
import type { Metadata } from "next";
import {
  getAllWidgets,
  getAllWidgetCategories,
  getPopularWidgets,
  getAllUtilities,
} from "@/lib/registry";
import { WidgetCard } from "@/components/WidgetCard";
import { WidgetCategoryCard } from "@/components/WidgetCategoryCard";
import { WidgetSearchModal } from "@/components/WidgetSearchModal";
import {
  Monitor,
  Search,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Layers,
  HelpCircle,
  Clock,
  Cpu,
  Wifi,
  Calculator,
  KeyRound,
  FileText,
  FileSpreadsheet,
  Dice5,
  GraduationCap,
  Briefcase,
  Laptop,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Windows Widget Discovery & Desktop Tools — UTL.tools",
  description:
    "Find useful Windows widgets, Edge sidebars, system tray tools, and desktop overlays you didn't know existed. Compare free Windows 11 widgets, installation methods, and related web utilities.",
  keywords: [
    "windows widgets discovery",
    "best windows 11 widgets",
    "free windows desktop tools",
    "windows clock widget",
    "system monitor widget windows",
    "network speed tray monitor",
    "windows productivity tools",
  ],
  openGraph: {
    title: "Windows Widget Discovery & Desktop Tools — UTL.tools",
    description:
      "Find useful Windows widgets, Edge sidebars, system tray tools, and desktop overlays you didn't know existed.",
    url: "https://utl.tools/widgets",
    type: "website",
  },
};

const intentShortcuts = [
  { title: "I want a clock or timer", desc: "Native Windows 11 clock, focus timers, world time", href: "/widgets/clock", icon: Clock },
  { title: "I want to monitor my PC", desc: "CPU, GPU, RAM temperature and performance gauges", href: "/widgets/system-monitoring", icon: Cpu },
  { title: "I want to monitor my internet", desc: "Real-time taskbar download/upload speed meters", href: "/widgets/network", icon: Wifi },
  { title: "I want productivity tools", desc: "Sticky notes, task lists, Pomodoro timers", href: "/widgets/productivity", icon: Briefcase },
  { title: "I want developer tools", desc: "Offline JSON formatters, JWT decoders, DevToys", href: "/widgets/developer", icon: Laptop },
  { title: "I want AI tools", desc: "Edge Copilot sidebar, AI draft helpers", href: "/widgets/ai", icon: Sparkles },
  { title: "I want weather", desc: "Live taskbar forecasts and radar maps", href: "/widgets/weather", icon: Monitor },
  { title: "I want a calendar", desc: "Desktop agenda feeds and event countdowns", href: "/widgets/calendar", icon: GraduationCap },
];

export default function WidgetsMainPage() {
  const categories = getAllWidgetCategories();
  const popularWidgets = getPopularWidgets(6);
  const totalWidgets = getAllWidgets().length;
  const totalUtilities = getAllUtilities().length;

  return (
    <div className="space-y-16 py-4 sm:py-8">
      {/* Hero Header */}
      <section className="relative text-center max-w-4xl mx-auto space-y-6 pt-4 sm:pt-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>Windows Widget Discovery Layer V1 &bull; {totalWidgets} Verified Discoveries</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground">
            Windows <span className="text-blue-600 dark:text-blue-400">Widget Discovery</span>
          </h1>
          <p className="text-xl sm:text-2xl font-bold text-foreground/90">
            Find useful Windows widgets and desktop tools you didn't know existed.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A curated, independent discovery experience matching everyday tasks to native Windows 11 widgets, Edge sidebars, tray meters, and desktop utilities.
          </p>
        </div>

        {/* Interactive Search Launcher */}
        <div className="pt-2 max-w-xl mx-auto">
          <WidgetSearchModal />
        </div>
      </section>

      {/* TECHNICAL CLASSIFICATION TRANSPARENCY BLOCK */}
      <section className="p-6 bg-card border border-border rounded-2xl space-y-4 shadow-xs">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Layers className="w-5 h-5 text-blue-500" />
          <h2 className="text-base font-bold text-foreground">
            Understanding Windows Desktop Utility Architecture Types
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-muted/40 border border-border/80 rounded-xl space-y-1">
            <span className="font-bold text-foreground block text-sm">Windows 11 Widget</span>
            <p className="text-muted-foreground leading-relaxed">
              Native widgets pinned to the Windows 11 Widgets Board (Win + W) or taskbar.
            </p>
          </div>

          <div className="p-3.5 bg-muted/40 border border-border/80 rounded-xl space-y-1">
            <span className="font-bold text-foreground block text-sm">Edge Sidebar</span>
            <p className="text-muted-foreground leading-relaxed">
              Persistent sidebar overlays (like Copilot) running alongside your browser tabs.
            </p>
          </div>

          <div className="p-3.5 bg-muted/40 border border-border/80 rounded-xl space-y-1">
            <span className="font-bold text-foreground block text-sm">System Tray Tool</span>
            <p className="text-muted-foreground leading-relaxed">
              Lightweight taskbar utilities (like net speed gauges or HWiNFO temp counters).
            </p>
          </div>

          <div className="p-3.5 bg-muted/40 border border-border/80 rounded-xl space-y-1">
            <span className="font-bold text-foreground block text-sm">Desktop Overlay</span>
            <p className="text-muted-foreground leading-relaxed">
              Pinned wallpaper skins (Rainmeter) or Xbox Game Bar hardware pin overlays.
            </p>
          </div>
        </div>
      </section>

      {/* USER INTENT DISCOVERY: "What are you trying to do?" */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-border pb-3">
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
              Goal-Oriented Discovery
            </span>
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              What are you trying to do on Windows?
            </h2>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:block">
            Find the right desktop solution by practical goal
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {intentShortcuts.map((intent) => {
            const Icon = intent.icon;
            return (
              <Link
                key={intent.title}
                href={intent.href}
                className="group flex flex-col justify-between p-4 rounded-xl border border-border bg-card hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-xs transition-all"
              >
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {intent.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {intent.desc}
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Explore <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* POPULAR DISCOVERIES GRID */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-border pb-3">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Featured Discoveries
            </span>
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              Essential Windows Desktop Discoveries
            </h2>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {popularWidgets.length} Verified Highlights
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularWidgets.map((widget) => (
            <WidgetCard key={widget.slug} widget={widget} />
          ))}
        </div>
      </section>

      {/* WIDGET CATEGORIES GRID */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-border pb-3">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Extensible Taxonomy
            </span>
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              Browse Widget Categories
            </h2>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {categories.length} Specialized Domains
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <WidgetCategoryCard key={cat.slug} category={cat} />
          ))}
        </div>
      </section>

      {/* CROSS-LINKING GATEWAY: RELATED UTL WEB UTILITIES */}
      <section className="p-8 bg-card border border-border rounded-2xl space-y-6 shadow-xs">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
            <Zap className="w-3.5 h-3.5 text-emerald-500" />
            <span>Zero-Install Client-Side Web Utilities</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Prefer Instant Web Execution Without Installing Anything?
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            UTL.tools hosts {totalUtilities} standalone interactive web utilities that run 100% inside your browser memory with zero installation, zero data logging, and sub-50ms execution speed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/tools/talking-alarm-clock"
            className="p-4 bg-muted/40 border border-border rounded-xl space-y-1 hover:border-slate-400 transition-all"
          >
            <span className="font-bold text-sm text-foreground block">Talking Alarm Clock</span>
            <p className="text-xs text-muted-foreground">Voice announcements &amp; audio alerts in browser.</p>
          </Link>

          <Link
            href="/tools/browser-info"
            className="p-4 bg-muted/40 border border-border rounded-xl space-y-1 hover:border-slate-400 transition-all"
          >
            <span className="font-bold text-sm text-foreground block">Browser &amp; Hardware Info</span>
            <p className="text-xs text-muted-foreground">Instant W3C CPU, GPU, and RAM diagnostics.</p>
          </Link>

          <Link
            href="/tools/diff-checker"
            className="p-4 bg-muted/40 border border-border rounded-xl space-y-1 hover:border-slate-400 transition-all"
          >
            <span className="font-bold text-sm text-foreground block">Diff Checker &amp; Text Compare</span>
            <p className="text-xs text-muted-foreground">Side-by-side offline text comparator.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
