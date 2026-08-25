import Link from "next/link";
import {
  getAllCategories,
  getPopularUtilities,
  getRecentUtilities,
  getAllUtilities,
} from "@/lib/registry";
import { CategoryCard } from "@/components/CategoryCard";
import { ToolCard } from "@/components/ToolCard";
import {
  Search,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Calculator,
  RefreshCw,
  KeyRound,
  Laptop,
  FileText,
  FileSpreadsheet,
  Dice5,
  Wifi,
  GraduationCap,
  Briefcase,
  Compass,
} from "lucide-react";

const intentShortcuts = [
  {
    title: "Calculate something",
    desc: "Compound interest, percentages, loan payments, BMI",
    href: "/category/finance",
    icon: Calculator,
    colorClass: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    title: "Convert something",
    desc: "Metric to imperial, text casing, color codes, base64",
    href: "/tools/unit-converter",
    icon: RefreshCw,
    colorClass: "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40",
  },
  {
    title: "Create something",
    desc: "Secure passwords, QR codes, UUIDs, dummy text",
    href: "/tools/password-generator",
    icon: KeyRound,
    colorClass: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40",
  },
  {
    title: "Check my device",
    desc: "Screen resolution, browser diagnostics, hardware specs",
    href: "/tools/browser-info",
    icon: Laptop,
    colorClass: "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40",
  },
  {
    title: "Work with text",
    desc: "Side-by-side diff checking, markdown preview, word counts",
    href: "/tools/diff-checker",
    icon: FileText,
    colorClass: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40",
  },
  {
    title: "Work with files",
    desc: "Convert CSV to JSON arrays, validate structured data",
    href: "/tools/csv-to-json-converter",
    icon: FileSpreadsheet,
    colorClass: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40",
  },
  {
    title: "Make a decision",
    desc: "Random item picker, wheel of fortune, dice rollers",
    href: "/tools/random-picker",
    icon: Dice5,
    colorClass: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40",
  },
  {
    title: "Understand my internet",
    desc: "Public IP address, latency ping, DNS diagnostics",
    href: "/tools/my-ip",
    icon: Wifi,
    colorClass: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40",
  },
  {
    title: "Prepare for school",
    desc: "Scientific calculator, GPA, unit conversions",
    href: "/tools/scientific-calculator",
    icon: GraduationCap,
    colorClass: "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40",
  },
  {
    title: "Run my business",
    desc: "Professional invoices, HTML email signatures, ROI calculations",
    href: "/tools/invoice-generator",
    icon: Briefcase,
    colorClass: "text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800",
  },
];

export default function HomePage() {
  const categories = getAllCategories();
  const popularTools = getPopularUtilities(8);
  const recentTools = getRecentUtilities(6);
  const totalCount = getAllUtilities().length;

  return (
    <div className="space-y-16 py-4 sm:py-8">
      {/* Hero Section */}
      <section className="relative text-center max-w-3xl mx-auto space-y-6 pt-4 sm:pt-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{totalCount} Free Online Utilities Available</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground">
            UTL<span className="text-blue-600 dark:text-blue-400">.tools</span>
          </h1>
          <p className="text-xl sm:text-2xl font-bold text-foreground/90">
            Free Online Utilities &amp; Digital Toolbox
          </p>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Simple tools that solve everyday problems. Instant, client-side, zero subscriptions, and 100% private.
          </p>
        </div>

        {/* Quick Search Launcher on Homepage */}
        <div className="pt-2 max-w-xl mx-auto">
          <Link
            href="/category/developer"
            className="flex items-center justify-between p-4 bg-card border border-border rounded-xl shadow-sm hover:border-slate-400 dark:hover:border-slate-600 transition-all text-muted-foreground group"
          >
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
              <span className="text-sm text-muted-foreground">
                Search utilities (e.g. "json", "diff", "ip", "password", "qr", "unit")...
              </span>
            </div>
            <kbd className="hidden sm:inline-flex px-2 py-1 text-xs font-mono bg-muted rounded border border-border text-muted-foreground">
              Press / or ⌘K
            </kbd>
          </Link>
        </div>

        {/* Quick Tags Ribbon */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground pt-1">
          <span className="font-semibold text-foreground">Popular:</span>
          <Link href="/tools/diff-checker" className="hover:text-blue-600 underline">Diff Checker</Link>
          <span>&bull;</span>
          <Link href="/tools/json-formatter" className="hover:text-blue-600 underline">JSON Formatter</Link>
          <span>&bull;</span>
          <Link href="/tools/password-generator" className="hover:text-blue-600 underline">Password Generator</Link>
          <span>&bull;</span>
          <Link href="/tools/unit-converter" className="hover:text-blue-600 underline">Unit Converter</Link>
          <span>&bull;</span>
          <Link href="/tools/my-ip" className="hover:text-blue-600 underline">My IP</Link>
          <span>&bull;</span>
          <Link href="/tools/invoice-generator" className="hover:text-blue-600 underline">Invoice Generator</Link>
        </div>
      </section>

      {/* COMPACT INTENT DISCOVERY SECTION: "What are you trying to do?" */}
      <section className="space-y-4 pt-2">
        <div className="flex items-end justify-between border-b border-border pb-3">
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
              Intent Discovery
            </span>
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              What are you trying to do?
            </h2>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:block">
            Quick shortcuts by practical goal
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {intentShortcuts.map((intent) => {
            const Icon = intent.icon;
            return (
              <Link
                key={intent.title}
                href={intent.href}
                className="group flex flex-col justify-between p-4 rounded-xl border border-border bg-card hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-sm transition-all"
              >
                <div className="space-y-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${intent.colorClass}`}>
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
                  Open <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Categories Section (9 Card Grid) */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-border pb-3">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Browse Taxonomies
            </span>
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              Utility Categories
            </h2>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {categories.length} Specialized Toolkits
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </section>

      {/* Popular Utilities Section */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-border pb-3">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Most Used
            </span>
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              Popular Utilities
            </h2>
          </div>
          <Link
            href="/category/developer"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            View all tools <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularTools.map((tool) => (
            <ToolCard key={tool.slug} utility={tool} />
          ))}
        </div>
      </section>

      {/* Recently Added Utilities */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-border pb-3">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Latest Additions
            </span>
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              Recently Added Utilities
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
            Continuously updated library
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentTools.map((tool) => (
            <ToolCard key={tool.slug} utility={tool} />
          ))}
        </div>
      </section>

      {/* Platform Philosophy Banner */}
      <section className="p-8 sm:p-12 rounded-2xl bg-card border border-border space-y-6">
        <div className="max-w-2xl space-y-2">
          <h3 className="text-2xl font-bold text-foreground">
            The UTL.tools Philosophy
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The web is overcrowded with bloated websites that force account creation, load intrusive tracking ads, or break after a few months. UTL.tools is built differently:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Boring but Extremely Useful</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No gimmicks or unnecessary visual excess. Focused purely on solving repetitive everyday tasks immediately.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Zero Server Dependence</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your input is processed locally in your browser and is not sent to UTL servers. If servers go offline, tools still work.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Zero Data Tracking</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your passwords, financial calculations, and JSON payloads are never logged or sent to any database.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
