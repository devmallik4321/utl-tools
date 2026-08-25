"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { searchWidgets } from "@/lib/registry";
import { trackWidgetSearch } from "@/lib/analytics";
import { Search, Monitor, ArrowRight, X, Sparkles } from "lucide-react";

export function WidgetSearchModal() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    const matched = searchWidgets(q);
    if (q.length >= 2) {
      trackWidgetSearch(q.length, matched.length);
    }
    return matched;
  }, [query]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="w-5 h-5 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Search Windows widgets (e.g. "clock", "CPU", "speed meter", "sticky notes", "devtoys")...'
          className="w-full pl-11 pr-10 py-3.5 bg-card border border-border rounded-xl shadow-xs text-sm text-foreground focus:outline-none focus:border-blue-500 transition-all placeholder:text-muted-foreground/70"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Live Search Results Dropdown */}
      {query.trim().length > 0 && (
        <div className="p-3 bg-card border border-border rounded-xl shadow-md space-y-2 max-h-80 overflow-y-auto text-left">
          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground px-2 pb-1 border-b border-border">
            <span>Widget Discoveries ({results.length})</span>
            <span className="font-mono">Real-time Match</span>
          </div>

          {results.length === 0 ? (
            <p className="p-4 text-xs text-center text-muted-foreground">
              No matching Windows widget discoveries found. Try searching for "clock", "net speed", "CPU", or "sticky notes".
            </p>
          ) : (
            results.map((widget) => (
              <Link
                key={widget.slug}
                href={`/widgets/item/${widget.slug}`}
                onClick={() => setQuery("")}
                className="flex items-start justify-between p-2.5 rounded-lg hover:bg-muted/60 transition-colors group"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {widget.name}
                    </span>
                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-muted text-muted-foreground border">
                      {widget.platformType}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {widget.shortDescription}
                  </p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 mt-1" />
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
