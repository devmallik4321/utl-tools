import React from "react";
import { Info, CheckCircle2, Compass, AlertTriangle, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ResultStateType = "informational" | "good" | "attention" | "warning" | "critical";

interface ResultStateProps {
  type?: ResultStateType;
  title: string;
  description?: string;
  value?: string | number;
  className?: string;
  children?: React.ReactNode;
}

const stateConfig: Record<
  ResultStateType,
  {
    icon: React.ComponentType<{ className?: string }>;
    cardClass: string;
    iconColor: string;
    badgeClass: string;
    badgeText: string;
  }
> = {
  informational: {
    icon: Info,
    cardClass: "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/50",
    iconColor: "text-blue-600 dark:text-blue-400",
    badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300",
    badgeText: "Info",
  },
  good: {
    icon: CheckCircle2,
    cardClass: "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300",
    badgeText: "Optimal / Good",
  },
  attention: {
    icon: Compass,
    cardClass: "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800",
    iconColor: "text-slate-600 dark:text-slate-400",
    badgeClass: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
    badgeText: "Notice",
  },
  warning: {
    icon: AlertTriangle,
    cardClass: "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50",
    iconColor: "text-amber-600 dark:text-amber-400",
    badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300",
    badgeText: "Attention",
  },
  critical: {
    icon: AlertOctagon,
    cardClass: "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/50",
    iconColor: "text-rose-600 dark:text-rose-400",
    badgeClass: "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300",
    badgeText: "Alert",
  },
};

export function ResultState({
  type = "informational",
  title,
  description,
  value,
  className,
  children,
}: ResultStateProps) {
  const config = stateConfig[type] || stateConfig.informational;
  const IconComponent = config.icon;

  return (
    <div className={cn("p-4 rounded-xl border transition-colors space-y-2", config.cardClass, className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <IconComponent className={cn("w-4 h-4 shrink-0 mt-0.5", config.iconColor)} />
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        </div>
        <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0", config.badgeClass)}>
          {config.badgeText}
        </span>
      </div>

      {value !== undefined && (
        <div className="text-xl sm:text-2xl font-bold font-mono text-foreground pt-0.5">
          {value}
        </div>
      )}

      {description && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}

      {children}
    </div>
  );
}
