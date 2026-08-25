"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackBookmark } from "@/lib/analytics";

interface BookmarkButtonProps {
  slug: string;
  name: string;
  className?: string;
  showText?: boolean;
}

export function BookmarkButton({ slug, name, className, showText = true }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("utl_saved_tools") || "[]");
      setIsBookmarked(saved.includes(slug));
    } catch {
      setIsBookmarked(false);
    }
  }, [slug]);

  const toggleBookmark = () => {
    try {
      const saved: string[] = JSON.parse(localStorage.getItem("utl_saved_tools") || "[]");
      let updated: string[];
      if (saved.includes(slug)) {
        updated = saved.filter((s) => s !== slug);
        setIsBookmarked(false);
        trackBookmark(slug, "remove");
      } else {
        updated = [...saved, slug];
        setIsBookmarked(true);
        trackBookmark(slug, "add");
      }
      localStorage.setItem("utl_saved_tools", JSON.stringify(updated));
      window.dispatchEvent(new Event("utl_storage_update"));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleBookmark}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-all duration-150",
        isBookmarked
          ? "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700/60 shadow-sm"
          : "bg-background text-muted-foreground border-border hover:text-foreground hover:bg-muted/60",
        className
      )}
      title={isBookmarked ? `Remove ${name} from saved tools` : `Save ${name} to My UTL`}
      aria-label={isBookmarked ? `Remove ${name} from saved tools` : `Save ${name} to My UTL`}
    >
      <Star
        className={cn(
          "w-3.5 h-3.5 transition-transform duration-200",
          isBookmarked ? "fill-amber-400 text-amber-500 scale-110" : "text-muted-foreground"
        )}
      />
      {showText && <span>{isBookmarked ? "Saved" : "Save Tool"}</span>}
    </button>
  );
}
