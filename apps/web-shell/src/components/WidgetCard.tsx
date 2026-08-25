import Link from "next/link";
import { WidgetItem } from "@/lib/types";
import { Star, ShieldCheck, Download, ExternalLink, ArrowRight, Monitor, AppWindow, Cpu, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface WidgetCardProps {
  widget: WidgetItem;
}

const platformBadges: Record<string, { label: string; class: string }> = {
  WINDOWS_WIDGET: { label: "Windows 11 Widget", class: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
  EDGE_SIDEBAR: { label: "Edge Sidebar", class: "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800" },
  PWA: { label: "PWA Web App", class: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800" },
  DESKTOP_WIDGET: { label: "Desktop Widget", class: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
  TRAY_UTILITY: { label: "System Tray Tool", class: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
  DESKTOP_APPLICATION: { label: "Desktop App", class: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800" },
  WEB_UTILITY: { label: "Web Utility", class: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800" },
  OTHER: { label: "Desktop Utility", class: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700" },
};

export function WidgetCard({ widget }: WidgetCardProps) {
  const platform = platformBadges[widget.platformType] || platformBadges.OTHER;

  return (
    <div className="group flex flex-col justify-between p-5 bg-card border border-border rounded-xl hover:border-slate-400 dark:hover:border-slate-600 transition-all shadow-xs">
      <div className="space-y-3">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border", platform.class)}>
            {platform.label}
          </span>
          <div className="flex items-center gap-1 text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{widget.usefulnessScore.toFixed(1)}</span>
            <span className="text-[10px] text-muted-foreground font-normal">/10</span>
          </div>
        </div>

        {/* Title & Short Description */}
        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            <Link href={`/widgets/item/${widget.slug}`}>
              {widget.name}
            </Link>
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {widget.shortDescription}
          </p>
        </div>

        {/* Key Attributes Tags */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-medium text-muted-foreground">
          <span className="px-2 py-0.5 bg-muted rounded border border-border">
            {widget.isFree ? "Free" : widget.pricing}
          </span>
          <span className="px-2 py-0.5 bg-muted rounded border border-border">
            {widget.installationDifficulty} Install
          </span>
          <span className="px-2 py-0.5 bg-muted rounded border border-border">
            {widget.resourceUsage} RAM
          </span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-4 mt-3 border-t border-border/60 flex items-center justify-between text-xs">
        <span className="text-[11px] text-muted-foreground font-medium truncate max-w-[140px]">
          By {widget.provider}
        </span>
        <Link
          href={`/widgets/item/${widget.slug}`}
          className="font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
        >
          View Widget <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
