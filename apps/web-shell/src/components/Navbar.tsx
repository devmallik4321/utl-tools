"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Search,
  Sun,
  Moon,
  Star,
  Layers,
  Menu,
  X,
  ChevronDown,
  Wrench,
  AppWindow,
} from "lucide-react";
import { getAllCategories } from "@/lib/registry";
import { SearchModal } from "./SearchModal";

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const pathname = usePathname();
  const categories = getAllCategories();

  useEffect(() => {
    setMounted(true);

    const updateSavedCount = () => {
      try {
        const saved = JSON.parse(localStorage.getItem("utl_saved_tools") || "[]");
        setSavedCount(Array.isArray(saved) ? saved.length : 0);
      } catch {
        setSavedCount(0);
      }
    };

    updateSavedCount();
    window.addEventListener("utl_storage_update", updateSavedCount);
    window.addEventListener("storage", updateSavedCount);

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      window.removeEventListener("utl_storage_update", updateSavedCount);
      window.removeEventListener("storage", updateSavedCount);
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setCategoriesOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 flex items-center justify-center font-black text-sm tracking-tighter group-hover:scale-105 transition-transform">
                UTL
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-foreground leading-none">
                  UTL<span className="text-blue-600 dark:text-blue-400">.tools</span>
                </span>
                <span className="text-[10px] text-muted-foreground tracking-wide font-medium">
                  The Digital Toolbox
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Layers className="w-4 h-4" />
                  <span>Categories</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${categoriesOpen ? "rotate-180" : ""}`} />
                </button>

                {categoriesOpen && (
                  <div
                    className="absolute top-full left-0 mt-1 w-64 p-2 bg-card border border-border rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setCategoriesOpen(false)}
                  >
                    <div className="grid grid-cols-1 gap-0.5">
                      {categories.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/category/${c.slug}`}
                          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-foreground hover:bg-muted transition-colors"
                          onClick={() => setCategoriesOpen(false)}
                        >
                          <span>{c.name}</span>
                          {c.badge && (
                            <span className="text-[10px] text-muted-foreground uppercase font-bold">
                              {c.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/widgets"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <AppWindow className="w-4 h-4 text-blue-500" />
                <span>Widgets</span>
              </Link>

              <Link
                href="/saved"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Star className="w-4 h-4 text-amber-500 fill-amber-400/20" />
                <span>My Saved</span>
                {savedCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                    {savedCount}
                  </span>
                )}
              </Link>
            </nav>
          </div>

          {/* Quick Search Bar (Global trigger) */}
          <div className="flex-1 max-w-md hidden sm:block">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-muted-foreground bg-muted/60 hover:bg-muted border border-border rounded-lg transition-colors group"
            >
              <span className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
                <span>Search 47+ utilities...</span>
              </span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-card border border-border/80 rounded text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2">
            {/* Mobile Search button */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="p-2 sm:hidden rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
              aria-label="Search utilities"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Saved Tools Link on mobile */}
            <Link
              href="/saved"
              className="md:hidden relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
              aria-label="Saved utilities"
            >
              <Star className="w-4 h-4 text-amber-500" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </Link>

            {/* Theme Toggle (Light / Dark) */}
            {mounted && (
              <button
                type="button"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-colors"
                title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`}
                aria-label="Toggle theme"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-700" />
                )}
              </button>
            )}

            {/* Mobile Burger Menu */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
              Categories
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className="px-3 py-2 rounded-lg text-xs font-medium text-foreground bg-muted/40 hover:bg-muted transition-colors"
                >
                  {c.name}
                </Link>
              ))}
            </div>
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <Link
                href="/saved"
                className="flex items-center gap-2 text-xs font-semibold text-foreground px-2 py-1"
              >
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400/20" />
                <span>My Saved Utilities ({savedCount})</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
