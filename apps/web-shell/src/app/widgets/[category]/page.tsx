import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getAllWidgetCategories,
  getWidgetCategoryBySlug,
  getWidgetsByCategory,
  getRelatedUtilities,
  getAllUtilities,
} from "@/lib/registry";
import { WidgetCard } from "@/components/WidgetCard";
import { ToolCard } from "@/components/ToolCard";
import { WidgetCategoryViewTracker } from "@/components/WidgetCategoryViewTracker";
import { FaqAccordion } from "@/components/FaqAccordion";
import { ChevronRight, Monitor, ArrowRight, Zap, HelpCircle, ShieldCheck } from "lucide-react";

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export async function generateStaticParams() {
  const categories = getAllWidgetCategories();
  return categories.map((c) => ({
    category: c.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = getWidgetCategoryBySlug(params.category);
  if (!category) return { title: "Widget Category Not Found" };

  return {
    title: category.seoTitle,
    description: category.seoDescription,
    openGraph: {
      title: category.seoTitle,
      description: category.seoDescription,
      url: `https://utl.tools/widgets/${category.slug}`,
      type: "website",
    },
  };
}

export default function WidgetCategoryPage({ params }: CategoryPageProps) {
  const category = getWidgetCategoryBySlug(params.category);
  if (!category) notFound();

  const widgetsList = getWidgetsByCategory(category.slug);

  // Map category to related UTL web utilities
  const categoryMap: Record<string, string> = {
    clock: "fun",
    "system-monitoring": "network",
    network: "network",
    productivity: "business",
    developer: "developer",
    ai: "ai",
    weather: "network",
    calendar: "fun",
    finance: "finance",
    news: "business",
    education: "education",
    health: "health",
    security: "developer",
    media: "creative",
    business: "business",
    customization: "creative",
  };
  const utlCategory = categoryMap[category.slug] || "developer";
  const relatedUtilities = getAllUtilities().filter((u) => u.category === utlCategory).slice(0, 4);

  // Schema.org JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://utl.tools" },
          { "@type": "ListItem", "position": 2, "name": "Widgets Discovery", "item": "https://utl.tools/widgets" },
          { "@type": "ListItem", "position": 3, "name": category.name, "item": `https://utl.tools/widgets/${category.slug}` },
        ],
      },
      {
        "@type": "FAQPage",
        "mainEntity": category.faqs.map((faq) => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": { "@type": "Answer", "text": faq.answer },
        })),
      },
    ],
  };

  return (
    <>
      <WidgetCategoryViewTracker categorySlug={category.slug} />
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
          <span className="font-semibold text-foreground">{category.name}</span>
        </nav>

        {/* Category Hero Banner */}
        <div className="p-6 sm:p-8 bg-card border border-border rounded-2xl space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                  Windows {category.name} Widgets
                </h1>
                {category.badge && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {category.badge}
                  </span>
                )}
              </div>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
                {category.description}
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
              <span className="text-xs text-muted-foreground block font-medium">Curated Discoveries</span>
              <span className="text-2xl sm:text-3xl font-black font-mono text-foreground">
                {widgetsList.length} {widgetsList.length === 1 ? "Widget" : "Widgets"}
              </span>
            </div>
          </div>
        </div>

        {/* EDITORIAL EXPLANATION SECTIONS */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-card border border-border rounded-xl space-y-2 shadow-xs">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Monitor className="w-4 h-4 text-blue-500" />
              What are Windows {category.name} Widgets?
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {category.whatAreThey}
            </p>
          </div>

          <div className="p-6 bg-card border border-border rounded-xl space-y-2 shadow-xs">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500" />
              Why Use {category.name} Widgets?
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {category.whyUse}
            </p>
          </div>
        </section>

        {/* WIDGET DISCOVERIES GRID */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              Verified {category.name} Discoveries
            </h2>
            <span className="text-xs text-muted-foreground font-mono">
              {widgetsList.length} Verified Entries
            </span>
          </div>

          {widgetsList.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground p-8 border border-border rounded-xl bg-card">
              No widget discoveries currently cataloged in this category. Check back soon as our intelligence fabric updates.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {widgetsList.map((widget) => (
                <WidgetCard key={widget.slug} widget={widget} />
              ))}
            </div>
          )}
        </section>

        {/* CONTEXTUAL UTL.TOOLS WEB UTILITIES CROSS-LINK */}
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
                href={`/category/${utlCategory}`}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                All web tools <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedUtilities.map((tool) => (
                <ToolCard key={tool.slug} utility={tool} />
              ))}
            </div>
          </section>
        )}

        {/* FREQUENTLY ASKED QUESTIONS */}
        {category.faqs && category.faqs.length > 0 && (
          <section className="space-y-4 pt-6 border-t border-border">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-bold text-foreground">
                Frequently Asked Questions
              </h2>
            </div>
            <FaqAccordion
              items={category.faqs.map((f) => ({
                question: f.question,
                answer: f.answer,
              }))}
            />
          </section>
        )}
      </div>
    </>
  );
}
