"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, Trash2, ArrowRight, Sparkles, Layers, CheckCircle } from "lucide-react";
import { getAllUtilities } from "@/lib/registry";
import { UtilityItem } from "@/lib/types";
import { ToolCard } from "@/components/ToolCard";

export default function SavedToolsPage() {
  const [savedSlugs, setSavedSlugs] = useState<string[]>([]);
  const [mounted, setMounted] = useState<boolean>(false);
  const allUtilities = getAllUtilities();

  const loadSaved = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("utl_saved_tools") || "[]");
      setSavedSlugs(Array.isArray(saved) ? saved : []);
    } catch {
      setSavedSlugs([]);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadSaved();
    window.addEventListener("utl_storage_update", loadSaved);
    return () => window.removeEventListener("utl_storage_update", loadSaved);
  }, []);

  const clearAllSaved = () => {
    localStorage.removeItem("utl_saved_tools");
    setSavedSlugs([]);
    window.dispatchEvent(new Event("utl_storage_update"));
  };

  const savedTools = allUtilities.filter((u) => savedSlugs.includes(u.slug));

  if (!mounted) return null;

  return (
    <div className="space-y-10 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 bg-card border border-border rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500 fill-amber-400/20" />
            <h1 className="text-2xl sm:text-3xl font-black text-foreground">
              My Saved Utilities
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
            Your personal pinned toolbox. Stored 100% locally on this device with zero account requirements.
          </p>
        </div>

        {savedTools.length > 0 && (
          <button
            type="button"
            onClick={clearAllSaved}
            className="px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All Saved</span>
          </button>
        )}
      </div>

      {/* Tools Grid */}
      {savedTools.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card/40 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
            <Star className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">No Utilities Saved Yet</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Click the star icon (Save Tool) on any utility to pin it here for instant 1-click access anytime you return.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            <span>Explore All Utilities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedTools.map((tool) => (
            <ToolCard key={tool.slug} utility={tool} />
          ))}
        </div>
      )}

      {/* Future "My UTL" Preview Banner */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-900 space-y-4">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Roadmap Preview — "My UTL" Productivity Platform (Phase 3)</span>
        </div>

        <h3 className="text-xl font-bold text-foreground">
          Turn UTL.tools into your custom personal digital workstation
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-muted-foreground pt-2">
          <div className="space-y-1">
            <span className="font-bold text-foreground block">📦 Productivity Packs</span>
            <p>1-click bundles for Developers, Founders, Students, Designers, and Network Engineers.</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-foreground block">🖥️ Split-Screen Canvas</span>
            <p>Pin up to 4 utilities side-by-side on a single live multitasking workspace.</p>
          </div>
          <div className="space-y-1">
            <span className="font-bold text-foreground block">🔄 Tool Pipelines</span>
            <p>Pipe outputs directly from one utility into another with automatic transformations.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
