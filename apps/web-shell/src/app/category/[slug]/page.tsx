import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getAllCategories,
  getCategoryBySlug,
  getUtilitiesByCategory,
} from "@/lib/registry";
import { ToolCard } from "@/components/ToolCard";
import { CategoryViewTracker } from "@/components/CategoryViewTracker";
import { getCategoryTheme } from "@/lib/categoryThemes";
import {
  Dice5,
  Globe,
  Code2,
  Briefcase,
  DollarSign,
  HeartPulse,
  GraduationCap,
  Palette,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

const iconMap: Record<string, any> = {
  Dice5,
  Globe,
  Code2,
  Briefcase,
  DollarSign,
  HeartPulse,
  GraduationCap,
  Palette,
  Sparkles,
};

export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = getCategoryBySlug(params.slug);
  if (!category) return { title: "Category Not Found" };

  return {
    title: `${category.name} Utilities — Free Online Tools`,
    description: `Explore all ${category.name} online utilities on UTL.tools. ${category.description} Free, fast, client-side execution.`,
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = getCategoryBySlug(params.slug);
  if (!category) notFound();

  const tools = getUtilitiesByCategory(category.slug);
  const IconComponent = iconMap[category.icon] || Globe;
  const theme = getCategoryTheme(category.slug);

  return (
    <>
      <CategoryViewTracker categoryId={category.slug} />
      <div className="space-y-10 py-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-muted-foreground">Categories</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-foreground">{category.name}</span>
        </nav>

        {/* Category Header Hero */}
        <div className="p-6 sm:p-8 bg-card border border-border rounded-2xl space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner shrink-0",
                  theme.iconBgClass,
                  theme.iconColorClass
                )}
              >
                <IconComponent className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                    {category.name}
                  </h1>
                  {category.badge && (
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                        theme.badgeClass
                      )}
                    >
                      {category.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
                  {category.description}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
              <span className="text-xs text-muted-foreground block font-medium">Collection Size</span>
              <span className="text-2xl sm:text-3xl font-black font-mono text-foreground">
                {tools.length} {tools.length === 1 ? "Utility" : "Utilities"}
              </span>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              Available {category.name} Utilities
            </h2>
            <span className="text-xs text-muted-foreground font-mono">
              {tools.length} of {getAllCategories().reduce((acc, c) => acc + getUtilitiesByCategory(c.slug).length, 0)} total
            </span>
          </div>

          {tools.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground p-8 border border-border rounded-xl bg-card">
              No tools currently registered in this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map((tool) => (
                <ToolCard key={tool.slug} utility={tool} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
