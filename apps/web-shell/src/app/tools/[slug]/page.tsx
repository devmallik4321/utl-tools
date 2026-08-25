import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getAllUtilities,
  getUtilityBySlug,
  getRelatedUtilities,
  getCategoryBySlug,
  getRelatedWidgetsForUtility,
} from "@/lib/registry";
import { ToolDispatcher } from "@/components/tools/ToolDispatcher";
import { ToolCard } from "@/components/ToolCard";
import { WidgetCard } from "@/components/WidgetCard";
import { FaqAccordion } from "@/components/FaqAccordion";
import { BookmarkButton } from "@/components/BookmarkButton";
import { ShareButton } from "@/components/ShareButton";
import { UtilityViewTracker } from "@/components/UtilityViewTracker";
import { getCategoryTheme } from "@/lib/categoryThemes";
import {
  ChevronRight,
  ShieldCheck,
  Zap,
  Info,
  HelpCircle,
  ArrowRight,
  Compass,
  AlertCircle,
  CheckCircle2,
  Lock,
  Sparkles,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UtilityPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const utilities = getAllUtilities();
  return utilities.map((u) => ({
    slug: u.slug,
  }));
}

export async function generateMetadata({ params }: UtilityPageProps): Promise<Metadata> {
  const utility = getUtilityBySlug(params.slug);
  if (!utility) return { title: "Utility Not Found" };

  return {
    title: utility.seo.title,
    description: utility.seo.metaDescription,
    keywords: utility.keywords,
    openGraph: {
      title: `${utility.name} — UTL.tools`,
      description: utility.seo.metaDescription,
      url: `https://utl.tools/tools/${utility.slug}`,
      type: "website",
    },
  };
}

export default function UtilityPage({ params }: UtilityPageProps) {
  const utility = getUtilityBySlug(params.slug);
  if (!utility) notFound();

  const relatedTools = getRelatedUtilities(utility.slug, 4);
  const relatedWidgets = getRelatedWidgetsForUtility(utility.slug, 3);
  const category = getCategoryBySlug(utility.category);
  const theme = getCategoryTheme(utility.category);

  // Schema.org JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": utility.name,
        "operatingSystem": "All",
        "applicationCategory": "UtilitiesApplication",
        "offers": {
          "@type": "Offer",
          "price": "0.00",
          "priceCurrency": "USD",
        },
        "description": utility.description,
      },
      {
        "@type": "FAQPage",
        "mainEntity": utility.seo.faqs.map((faq) => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer,
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://utl.tools",
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": category?.name || utility.category,
            "item": `https://utl.tools/category/${utility.category}`,
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": utility.name,
            "item": `https://utl.tools/tools/${utility.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <UtilityViewTracker utilityId={utility.id} category={utility.category} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-10 py-4">
        {/* Breadcrumb Navigation & Freshness Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground">
          <nav className="flex items-center gap-2" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/category/${utility.category}`} className="hover:text-foreground capitalize">
              {category?.name || utility.category}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-foreground truncate">{utility.name}</span>
          </nav>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Updated: August 2026 • Verified v1.2</span>
          </div>
        </div>

        {/* Tool Header & Intent Badges */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                {utility.name}
              </h1>
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border",
                  theme.badgeClass
                )}
              >
                {category?.name || utility.category}
              </span>
              {utility.badge && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                  {utility.badge}
                </span>
              )}
            </div>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
              {utility.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
            <BookmarkButton slug={utility.slug} name={utility.name} />
            <ShareButton title={utility.name} slug={utility.slug} />
          </div>
        </div>

        {/* MAIN INTERACTIVE TOOL CANVAS */}
        <section className="bg-card/70 border border-border p-4 sm:p-8 rounded-2xl shadow-sm space-y-4">
          <ToolDispatcher utility={utility} />
        </section>

        {/* Security & Client-Side Privacy Trust Callout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-muted/40 border border-border rounded-xl text-xs text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              <strong>Local Browser Execution:</strong> Your input is processed locally in your browser and is not sent to UTL servers.
            </span>
          </div>
          {utility.formula && (
            <span className="font-mono text-[11px] text-foreground/80 sm:text-right shrink-0">
              {utility.formula}
            </span>
          )}
        </div>

        {/* VALUE MODEL: RESULT INTERPRETATION & PRACTICAL GUIDANCE */}
        {(utility.resultInterpretation || utility.practicalGuidance) && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {utility.resultInterpretation && (
              <div className="p-6 bg-card border border-border rounded-xl space-y-2.5 shadow-sm">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-500" />
                  Understanding Your Results
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {utility.resultInterpretation}
                </p>
              </div>
            )}

            {utility.practicalGuidance && (
              <div className="p-6 bg-card border border-border rounded-xl space-y-2.5 shadow-sm">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Practical Guidance & Next Steps
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {utility.practicalGuidance}
                </p>
              </div>
            )}
          </section>
        )}

        {/* CORE KNOWLEDGE: WHAT IS THIS / HOW IT WORKS / WHY USE IT */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-6 bg-card border border-border rounded-xl space-y-2.5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" />
              What is this?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {utility.seo.whatIsThis}
            </p>
          </div>

          <div className="p-6 bg-card border border-border rounded-xl space-y-2.5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              How does it work?
            </h3>
            <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {utility.seo.howItWorks}
            </div>
          </div>

          <div className="p-6 bg-card border border-border rounded-xl space-y-2.5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-500" />
              Why use it?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {utility.seo.whyUseIt}
            </p>
          </div>
        </section>

        {/* LIMITATIONS & TECHNICAL TRANSPARENCY */}
        {utility.limitations && (
          <div className="p-5 bg-card/50 border border-border rounded-xl space-y-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Technical Scope & Calculation Limitations</span>
            </div>
            <p className="leading-relaxed">
              {utility.limitations}
            </p>
          </div>
        )}

        {/* FREQUENTLY ASKED QUESTIONS */}
        {utility.seo.faqs && utility.seo.faqs.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-bold text-foreground">
                Frequently Asked Questions
              </h2>
            </div>
            <FaqAccordion items={utility.seo.faqs} />
          </section>
        )}

        {/* CONTEXTUAL WINDOWS WIDGET / DESKTOP DISCOVERY GATEWAY */}
        {relatedWidgets.length > 0 && (
          <section className="p-6 bg-card border border-border rounded-2xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                  Windows Desktop &amp; Widget Options
                </span>
                <h2 className="text-lg font-bold text-foreground">
                  Want this capability on your Windows desktop?
                </h2>
              </div>
              <Link
                href="/widgets"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                All Windows widgets <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedWidgets.map((relWidget) => (
                <WidgetCard key={relWidget.slug} widget={relWidget} />
              ))}
            </div>
          </section>
        )}

        {/* RELATED UTILITIES GATEWAY */}
        {relatedTools.length > 0 && (
          <section className="space-y-4 pt-6 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Complementary Utilities
                </span>
                <h2 className="text-lg font-bold text-foreground">
                  Related Tools for Your Workflow
                </h2>
              </div>
              <Link
                href={`/category/${utility.category}`}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                All {category?.name || utility.category} tools <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedTools.map((relTool) => (
                <ToolCard key={relTool.slug} utility={relTool} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
