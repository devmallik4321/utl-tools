import Link from "next/link";
import {
  getAllCategories,
  getPopularUtilities,
  getRecentUtilities,
  getAllUtilities,
} from "@/lib/registry";
import { CategoryCard } from "@/components/CategoryCard";
import { ToolCard } from "@/components/ToolCard";
import { Search, Sparkles, ArrowRight, ShieldCheck, Zap, Layers, Wrench, CheckCircle } from "lucide-react";

export default function HomePage() {
  const categories = getAllCategories();
  const popularTools = getPopularUtilities(8);
  const recentTools = getRecentUtilities(6);
  const totalCount = getAllUtilities().length;

  return (
    <div className="space-y-16 py-4 sm:py-8">
      {/* Hero Section */}
      <section className="relative text-center max-w-3xl mx-auto space-y-6 pt-4 sm:pt-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{totalCount} Free Online Utilities Available</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground">
            UTL<span className="text-blue-600 dark:text-blue-400">.tools</span>
          </h1>
          <p className="text-xl sm:text-2xl font-bold text-foreground/90">
            Free Online Utilities
          </p>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Simple tools that solve everyday problems. Instant, client-side, zero subscriptions, and 100% private.
          </p>
        </div>

        {/* Quick Search Launcher on Homepage */}
        <div className="pt-2 max-w-xl mx-auto">
          <Link
            href="/category/developer"
            className="flex items-center justify-between p-3.5 bg-card border border-border rounded-xl shadow-sm hover:border-slate-400 dark:hover:border-slate-600 transition-all text-muted-foreground group"
          >
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
              <span className="text-sm text-muted-foreground">
                Search tools (e.g. "json", "ip", "password", "qr", "bmi")...
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
          <Link href="/tools/json-formatter" className="hover:text-blue-600 underline">JSON Formatter</Link>
          <span>&bull;</span>
          <Link href="/tools/password-generator" className="hover:text-blue-600 underline">Password Generator</Link>
          <span>&bull;</span>
          <Link href="/tools/qr-code-generator" className="hover:text-blue-600 underline">QR Code</Link>
          <span>&bull;</span>
          <Link href="/tools/my-ip" className="hover:text-blue-600 underline">My IP</Link>
          <span>&bull;</span>
          <Link href="/tools/invoice-generator" className="hover:text-blue-600 underline">Invoice Generator</Link>
          <span>&bull;</span>
          <Link href="/tools/spin-wheel" className="hover:text-blue-600 underline">Spin Wheel</Link>
        </div>
      </section>

      {/* Categories Section (9 Card Grid) */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Browse Taxonomies
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Utility Categories
            </h2>
          </div>
          <span className="text-xs text-muted-foreground">
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
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Most Used
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
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
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Latest Additions
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
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
              All tools run statically in your browser. If our servers go offline, the tools continue executing in your tab.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Zero Data Tracking</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your passwords, financial calculations, and JSON payloads never touch any database or external analytics.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
