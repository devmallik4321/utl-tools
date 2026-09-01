/**
 * Semantic Category Color System for UTL.tools
 * Restrained, high-contrast, WCAG AA compliant accents.
 * NO oversized gradients, NO rainbow UI, NO black headers.
 */

export interface CategoryTheme {
  slug: string;
  badgeClass: string;
  iconBgClass: string;
  iconColorClass: string;
  borderHoverClass: string;
  accentTextClass: string;
}

export const categoryThemes: Record<string, CategoryTheme> = {
  developer: {
    slug: "developer",
    badgeClass: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/40",
    iconBgClass: "bg-indigo-50 dark:bg-indigo-950/50",
    iconColorClass: "text-indigo-600 dark:text-indigo-400",
    borderHoverClass: "hover:border-indigo-300 dark:hover:border-indigo-700",
    accentTextClass: "text-indigo-600 dark:text-indigo-400",
  },
  finance: {
    slug: "finance",
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40",
    iconBgClass: "bg-emerald-50 dark:bg-emerald-950/50",
    iconColorClass: "text-emerald-600 dark:text-emerald-400",
    borderHoverClass: "hover:border-emerald-300 dark:hover:border-emerald-700",
    accentTextClass: "text-emerald-600 dark:text-emerald-400",
  },
  network: {
    slug: "network",
    badgeClass: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/40",
    iconBgClass: "bg-cyan-50 dark:bg-cyan-950/50",
    iconColorClass: "text-cyan-600 dark:text-cyan-400",
    borderHoverClass: "hover:border-cyan-300 dark:hover:border-cyan-700",
    accentTextClass: "text-cyan-600 dark:text-cyan-400",
  },
  fun: {
    slug: "fun",
    badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/40",
    iconBgClass: "bg-amber-50 dark:bg-amber-950/50",
    iconColorClass: "text-amber-600 dark:text-amber-400",
    borderHoverClass: "hover:border-amber-300 dark:hover:border-amber-700",
    accentTextClass: "text-amber-600 dark:text-amber-400",
  },
  health: {
    slug: "health",
    badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/40",
    iconBgClass: "bg-rose-50 dark:bg-rose-950/50",
    iconColorClass: "text-rose-600 dark:text-rose-400",
    borderHoverClass: "hover:border-rose-300 dark:hover:border-rose-700",
    accentTextClass: "text-rose-600 dark:text-rose-400",
  },
  creative: {
    slug: "creative",
    badgeClass: "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border-violet-200 dark:border-violet-800/40",
    iconBgClass: "bg-violet-50 dark:bg-violet-950/50",
    iconColorClass: "text-violet-600 dark:text-violet-400",
    borderHoverClass: "hover:border-violet-300 dark:hover:border-violet-700",
    accentTextClass: "text-violet-600 dark:text-violet-400",
  },
  education: {
    slug: "education",
    badgeClass: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800/40",
    iconBgClass: "bg-sky-50 dark:bg-sky-950/50",
    iconColorClass: "text-sky-600 dark:text-sky-400",
    borderHoverClass: "hover:border-sky-300 dark:hover:border-sky-700",
    accentTextClass: "text-sky-600 dark:text-sky-400",
  },
  business: {
    slug: "business",
    badgeClass: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    iconBgClass: "bg-slate-100 dark:bg-slate-800",
    iconColorClass: "text-slate-700 dark:text-slate-300",
    borderHoverClass: "hover:border-slate-400 dark:hover:border-slate-600",
    accentTextClass: "text-slate-700 dark:text-slate-300",
  },
  ai: {
    slug: "ai",
    badgeClass: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/40",
    iconBgClass: "bg-purple-50 dark:bg-purple-950/50",
    iconColorClass: "text-purple-600 dark:text-purple-400",
    borderHoverClass: "hover:border-purple-300 dark:hover:border-purple-700",
    accentTextClass: "text-purple-600 dark:text-purple-400",
  },
  hardware: {
    slug: "hardware",
    badgeClass: "bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800/40",
    iconBgClass: "bg-orange-50 dark:bg-orange-950/50",
    iconColorClass: "text-orange-600 dark:text-orange-400",
    borderHoverClass: "hover:border-orange-300 dark:hover:border-orange-700",
    accentTextClass: "text-orange-600 dark:text-orange-400",
  },
  everyday: {
    slug: "everyday",
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40",
    iconBgClass: "bg-emerald-50 dark:bg-emerald-950/50",
    iconColorClass: "text-emerald-600 dark:text-emerald-400",
    borderHoverClass: "hover:border-emerald-300 dark:hover:border-emerald-700",
    accentTextClass: "text-emerald-600 dark:text-emerald-400",
  },
};

export function getCategoryTheme(slug: string): CategoryTheme {
  const normalized = (slug || "").toLowerCase();
  return (
    categoryThemes[normalized] || {
      slug: normalized,
      badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/40",
      iconBgClass: "bg-blue-50 dark:bg-blue-950/50",
      iconColorClass: "text-blue-600 dark:text-blue-400",
      borderHoverClass: "hover:border-blue-300 dark:hover:border-blue-700",
      accentTextClass: "text-blue-600 dark:text-blue-400",
    }
  );
}
