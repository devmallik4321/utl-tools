import Link from "next/link";
import { WidgetCategoryItem } from "@/lib/types";
import {
  Clock,
  Cpu,
  Wifi,
  CheckSquare,
  Code,
  Sparkles,
  CloudSun,
  Calendar,
  DollarSign,
  Newspaper,
  GraduationCap,
  Heart,
  ShieldCheck,
  Music,
  Briefcase,
  Palette,
  ArrowRight,
  Monitor,
} from "lucide-react";
import { getWidgetsByCategory } from "@/lib/registry";

interface WidgetCategoryCardProps {
  category: WidgetCategoryItem;
}

const iconMap: Record<string, any> = {
  Clock,
  Cpu,
  Wifi,
  CheckSquare,
  Code,
  Sparkles,
  CloudSun,
  Calendar,
  DollarSign,
  Newspaper,
  GraduationCap,
  Heart,
  ShieldCheck,
  Music,
  Briefcase,
  Palette,
};

export function WidgetCategoryCard({ category }: WidgetCategoryCardProps) {
  const IconComponent = iconMap[category.icon] || Monitor;
  const widgetCount = getWidgetsByCategory(category.slug).length;

  return (
    <Link
      href={`/widgets/${category.slug}`}
      className="group flex flex-col justify-between p-5 bg-card border border-border rounded-xl hover:border-slate-400 dark:hover:border-slate-600 transition-all shadow-xs"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
            <IconComponent className="w-5 h-5" />
          </div>
          <span className="text-xs font-mono font-semibold text-muted-foreground px-2 py-0.5 rounded bg-muted">
            {widgetCount} {widgetCount === 1 ? "Discovery" : "Discoveries"}
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {category.name}
            </h3>
            {category.badge && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-border">
                {category.badge}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {category.description}
          </p>
        </div>
      </div>

      <div className="pt-4 mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
        Explore {category.name} Widgets <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </Link>
  );
}
