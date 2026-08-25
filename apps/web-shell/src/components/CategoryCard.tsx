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
import { getCategoryTheme } from "@/lib/categoryThemes";
import { cn } from "@/lib/utils";

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
  const theme = getCategoryTheme(category.slug);

  return (
    <Link
      href={`/category/${category.slug}`}
      className={cn(
        "group relative flex flex-col justify-between p-5 rounded-xl border border-border bg-card hover:shadow-md transition-all duration-200",
        theme.borderHoverClass
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105",
              theme.iconBgClass,
              theme.iconColorClass
            )}
          >
            <IconComponent className="w-5 h-5" />
          </div>
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

        <h3 className="font-bold text-lg text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">
          {category.name}
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {category.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium">
          {count} {count === 1 ? "utility" : "utilities"}
        </span>
        <span className="inline-flex items-center gap-1 font-semibold group-hover:translate-x-0.5 transition-transform text-foreground">
          Explore <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}
