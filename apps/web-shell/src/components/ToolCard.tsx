import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { UtilityItem } from "@/lib/types";
import { BookmarkButton } from "./BookmarkButton";

interface ToolCardProps {
  utility: UtilityItem;
  showBookmark?: boolean;
}

export function ToolCard({ utility, showBookmark = true }: ToolCardProps) {
  return (
    <div className="group relative flex flex-col justify-between p-5 rounded-xl border border-border bg-card hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-sm transition-all duration-200">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {utility.category}
          </span>
          <div className="flex items-center gap-1">
            {utility.badge && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                {utility.badge}
              </span>
            )}
            {showBookmark && (
              <BookmarkButton
                slug={utility.slug}
                name={utility.name}
                showText={false}
                className="p-1 border-0 hover:bg-muted/80"
              />
            )}
          </div>
        </div>

        <Link href={`/tools/${utility.slug}`} className="block focus:outline-none">
          <h3 className="text-base font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center justify-between">
            <span>{utility.name}</span>
            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {utility.description}
          </p>
        </Link>
      </div>

      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="truncate max-w-[150px]">{utility.technology.split("(")[0]}</span>
        <span className="font-medium text-foreground/80">{utility.type}</span>
      </div>
    </div>
  );
}
