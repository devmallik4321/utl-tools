import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getAllCategories,
  getCategoryBySlug,
  getUtilitiesByCategory,
} from "@/lib/registry";
import { ToolCard } from "@/components/ToolCard";
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

  return (
    <div className="space-y-10 py-4">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="hover:text-foreground">Categories</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-semibold text-foreground">{category.name}</span>
      </nav>

      {/* Category Header Hero */}
      <div className="p-8 bg-card border border-border rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-muted text-foreground flex items-center justify-center shadow-inner">
              <IconComponent className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-foreground">
                  {category.name}
                </h1>
                {category.badge && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {category.badge}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
                {category.description}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-muted-foreground block">Collection Size</span>
            <span className="text-2xl font-black font-mono text-foreground">
              {tools.length} {tools.length === 1 ? "Tool" : "Tools"}
            </span>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">
          Available {category.name} Utilities
        </h2>

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
  );
}
