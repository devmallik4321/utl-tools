"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Command, ArrowRight, CornerDownLeft, Sparkles } from "lucide-react";
import { searchUtilities, getAllUtilities } from "@/lib/registry";
import { UtilityItem } from "@/lib/types";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UtilityItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults(getAllUtilities().slice(0, 10));
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const res = searchUtilities(query);
    setResults(res.slice(0, 12));
    setSelectedIndex(0);
  }, [query, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
          e.preventDefault();
          onClose(); // Will be toggled by parent if needed
        }
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < results.length ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : results.length - 1));
      } else if (e.key === "Enter" && results[selectedIndex]) {
        e.preventDefault();
        navigateToTool(results[selectedIndex].slug);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  const navigateToTool = (slug: string) => {
    onClose();
    router.push(`/tools/${slug}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a tool name, format, or task (e.g. 'json', 'ip', 'qr', 'password')..."
            className="w-full bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-muted-foreground hover:text-foreground rounded-md mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 bg-muted rounded border border-border text-muted-foreground hover:text-foreground"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-border/30">
          {results.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-sm">No utilities found matching "{query}"</p>
              <p className="text-xs mt-1 text-muted-foreground/80">
                Try searching for general keywords like "calculate", "convert", "generate", or "format".
              </p>
            </div>
          ) : (
            results.map((tool, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={tool.slug}
                  onClick={() => navigateToTool(tool.slug)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-slate-100 dark:bg-slate-800 text-foreground"
                      : "hover:bg-muted/50 text-foreground"
                  }`}
                >
                  <div className="flex flex-col min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate">{tool.name}</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                        {tool.category}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {tool.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected && (
                      <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
                        Select <CornerDownLeft className="w-3 h-3" />
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-60 group-hover:opacity-100" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-muted/40 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">Navigate: <kbd className="px-1 py-0.5 bg-card border rounded">↑</kbd> <kbd className="px-1 py-0.5 bg-card border rounded">↓</kbd></span>
            <span>Select: <kbd className="px-1 py-0.5 bg-card border rounded">↵</kbd></span>
            <span>Close: <kbd className="px-1 py-0.5 bg-card border rounded">ESC</kbd></span>
          </div>
          <span className="flex items-center gap-1 font-medium">
            <Sparkles className="w-3 h-3 text-blue-500" />
            {getAllUtilities().length} tools available
          </span>
        </div>
      </div>
    </div>
  );
}
