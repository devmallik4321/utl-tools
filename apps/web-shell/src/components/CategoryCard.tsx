import Link from "next/link";
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
  ArrowRight,
} from "lucide-react";
import { CategoryItem } from "@/lib/types";
import { getUtilitiesByCategory } from "@/lib/registry";

interface CategoryCardProps {
  category: CategoryItem;
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

export function CategoryCard({ category }: CategoryCardProps) {
  const IconComponent = iconMap[category.icon] || Globe;
  const count = getUtilitiesByCategory(category.slug).length;

  return (
    <Link
      href={`/category/${category.slug}`}
      className="group relative flex flex-col justify-between p-5 rounded-xl border border-border bg-card hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-md transition-all duration-200"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-muted/80 text-foreground group-hover:scale-105 transition-transform">
            <IconComponent className="w-5 h-5" />
          </div>
          {category.badge && (
            <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              {category.badge}
            </span>
          )}
        </div>

        <h3 className="font-semibold text-base text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {category.name}
        </h3>
        <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {category.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
        <span>{count} {count === 1 ? "utility" : "utilities"}</span>
        <span className="inline-flex items-center gap-1 font-medium group-hover:translate-x-0.5 transition-transform text-foreground">
          Explore <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}
