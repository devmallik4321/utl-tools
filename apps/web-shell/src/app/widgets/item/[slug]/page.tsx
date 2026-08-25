import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getAllWidgets,
  getWidgetBySlug,
  getWidgetCategoryBySlug,
  getRelatedWidgetsForUtility,
  getUtilityBySlug,
} from "@/lib/registry";
import { WidgetViewTracker } from "@/components/WidgetViewTracker";
import { ToolCard } from "@/components/ToolCard";
import { WidgetCard } from "@/components/WidgetCard";
import { FaqAccordion } from "@/components/FaqAccordion";
import {
  ChevronRight,
  Star,
  ExternalLink,
  Download,
  ShieldCheck,
  Zap,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  Monitor,
  Lock,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WidgetDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const widgets = getAllWidgets();
  return widgets.map((w) => ({
    slug: w.slug,
  }));
}

export async function generateMetadata({ params }: WidgetDetailPageProps): Promise<Metadata> {
  const widget = getWidgetBySlug(params.slug);
  if (!widget) return { title: "Widget Discovery Not Found" };

  return {
    title: `${widget.name} — Review, Specs & Installation for Windows`,
    description: widget.longDescription.slice(0, 160),
    keywords: widget.keywords,
    openGraph: {
      title: `${widget.name} — Windows Discovery`,
      description: widget.shortDescription,
      url: `https://utl.tools/widgets/item/${widget.slug}`,
      type: "website",
    },
  };
}

export default function WidgetDetailPage({ params }: WidgetDetailPageProps) {
  const widget = getWidgetBySlug(params.slug);
  if (!widget) notFound();

  const category = getWidgetCategoryBySlug(widget.category);

  // Fetch related UTL web utilities
  const relatedUtilities = (widget.relatedUtilities || [])
    .map((slug) => getUtilityBySlug(slug))
    .filter((u): u is NonNullable<typeof u> => u !== undefined);

  // Fetch related widgets
  const relatedWidgets = (widget.relatedWidgets || [])
    .map((slug) => getWidgetBySlug(slug))
    .filter((w): w is NonNullable<typeof w> => w !== undefined);

  // Schema.org JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": widget.name,
        "operatingSystem": widget.operatingSystems.join(", "),
        "applicationCategory": "UtilitiesApplication",
        "offers": {
          "@type": "Offer",
          "price": widget.isFree ? "0.00" : "Varies",
          "priceCurrency": "USD",
        },
        "description": widget.shortDescription,
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://utl.tools" },
          { "@type": "ListItem", "position": 2, "name": "Widgets Discovery", "item": "https://utl.tools/widgets" },
          { "@type": "ListItem", "position": 3, "name": category?.name || widget.category, "item": `https://utl.tools/widgets/${widget.category}` },
          { "@type": "ListItem", "position": 4, "name": widget.name, "item": `https://utl.tools/widgets/item/${widget.slug}` },
        ],
      },
    ],
  };

  return (
    <>
      <WidgetViewTracker widgetSlug={widget.slug} category={widget.category} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-10 py-4">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/widgets" className="hover:text-foreground">Widgets Discovery</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/widgets/${widget.category}`} className="hover:text-foreground capitalize">
            {category?.name || widget.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-foreground truncate">{widget.name}</span>
        </nav>

        {/* HERO HEADER & SOURCE ACTION */}
        <div className="p-6 sm:p-8 bg-card border border-border rounded-2xl space-y-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {widget.platformType.replace(/_/g, " ")}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                  {widget.provider}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200">
                  Verified: {widget.lastVerified}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                {widget.name}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
                {widget.shortDescription}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
              <a
                href={widget.installationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Get / Install Options</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

              <a
                href={widget.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-muted text-foreground border border-border font-semibold text-xs rounded-xl hover:bg-muted/80 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Official Source</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </div>
          </div>

          {/* VERDICT & RATING METRICS STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-border/60 text-xs">
            <div className="p-3 bg-muted/40 rounded-xl space-y-0.5 border border-border/60">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">Usefulness</span>
              <span className="font-mono font-bold text-base text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {widget.usefulnessScore.toFixed(1)}/10
              </span>
            </div>

            <div className="p-3 bg-muted/40 rounded-xl space-y-0.5 border border-border/60">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">Installation</span>
              <span className="font-bold text-foreground">{widget.installationDifficulty}</span>
            </div>

            <div className="p-3 bg-muted/40 rounded-xl space-y-0.5 border border-border/60">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">Resource Usage</span>
              <span className="font-bold text-foreground">{widget.resourceUsage} RAM</span>
            </div>

            <div className="p-3 bg-muted/40 rounded-xl space-y-0.5 border border-border/60">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">Privacy Rating</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{widget.privacyRating}</span>
            </div>

            <div className="p-3 bg-muted/40 rounded-xl space-y-0.5 border border-border/60 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">Pricing</span>
              <span className="font-bold text-foreground">{widget.isFree ? "Free" : widget.pricing}</span>
            </div>
          </div>
        </div>

        {/* WHAT IT DOES & BEST USE CASES */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-card border border-border rounded-xl space-y-3 shadow-xs">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" />
              What It Is &amp; How It Works
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {widget.longDescription}
            </p>
          </div>

          <div className="p-6 bg-card border border-border rounded-xl space-y-3 shadow-xs">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Best Use Cases &amp; Target Audience
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {widget.bestFor}
            </p>
            <div className="pt-2">
              <span className="text-xs font-semibold text-foreground block mb-1">Key Capabilities:</span>
              <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                {widget.capabilities.map((cap, idx) => (
                  <li key={idx}>{cap}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* INSTALLATION GUIDANCE & LIMITATIONS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-card border border-border rounded-xl space-y-2 shadow-xs">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-500" />
              Installation Method &amp; Requirements
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {widget.installationMethod}
            </p>
            <div className="text-xs text-muted-foreground pt-1">
              <strong>Supported OS:</strong> {widget.operatingSystems.join(", ")} ({widget.windowsVersions.join(", ")})
            </div>
          </div>

          <div className="p-6 bg-card border border-border rounded-xl space-y-2 shadow-xs">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Known Limitations &amp; Considerations
            </h3>
            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
              {widget.limitations.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* EDITORIAL REVIEW & VERDICT */}
        <section className="p-6 bg-card border border-border rounded-2xl space-y-3 shadow-xs">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            UTL Editorial Review &amp; Verdict
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {widget.review}
          </p>
          <div className="p-3 bg-muted/40 border border-border rounded-xl text-xs font-semibold text-foreground">
            <strong>Verdict:</strong> {widget.verdict}
          </div>
        </section>

        {/* CONTEXTUAL CROSS-LINK: RELATED UTL WEB UTILITIES */}
        {relatedUtilities.length > 0 && (
          <section className="space-y-4 pt-6 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Zero-Install Web Alternatives
                </span>
                <h2 className="text-lg font-bold text-foreground">
                  Related UTL.tools Web Utilities
                </h2>
              </div>
              <Link
                href="/category/developer"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                All web utilities <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedUtilities.map((tool) => (
                <ToolCard key={tool.slug} utility={tool} />
              ))}
            </div>
          </section>
        )}

        {/* RELATED WINDOWS DISCOVERIES */}
        {relatedWidgets.length > 0 && (
          <section className="space-y-4 pt-6 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Complementary Discoveries
                </span>
                <h2 className="text-lg font-bold text-foreground">
                  Related Desktop Discoveries
                </h2>
              </div>
              <Link
                href={`/widgets/${widget.category}`}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                All {category?.name || widget.category} discoveries <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedWidgets.map((relWidget) => (
                <WidgetCard key={relWidget.slug} widget={relWidget} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
