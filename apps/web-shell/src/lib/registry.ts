import utilitiesData from "../../../../registry/utilities.json";
import categoriesData from "../../../../registry/categories.json";
import rolesData from "../../../../registry/roles.json";
import widgetsData from "../../../../registry/widgets.json";
import widgetCategoriesData from "../../../../registry/widgetCategories.json";

import {
  UtilityItem,
  CategoryItem,
  RoleItem,
  WidgetItem,
  WidgetCategoryItem,
} from "./types";

export const utilities: UtilityItem[] = utilitiesData as unknown as UtilityItem[];
export const categories: CategoryItem[] = categoriesData as unknown as CategoryItem[];
export const roles: RoleItem[] = rolesData as unknown as RoleItem[];
export const widgets: WidgetItem[] = widgetsData as unknown as WidgetItem[];
export const widgetCategories: WidgetCategoryItem[] = widgetCategoriesData as unknown as WidgetCategoryItem[];

export function getAllUtilities(): UtilityItem[] {
  return utilities;
}

export function getUtilityBySlug(slug: string): UtilityItem | undefined {
  return utilities.find((u) => u.slug === slug || u.id === slug);
}

export function getUtilitiesByCategory(categorySlug: string): UtilityItem[] {
  return utilities.filter((u) => u.category.toLowerCase() === categorySlug.toLowerCase());
}

export function getCategoryBySlug(slug: string): CategoryItem | undefined {
  return categories.find((c) => c.slug === slug || c.id === slug);
}

export function getAllCategories(): CategoryItem[] {
  return categories;
}

export function getPopularUtilities(limit: number = 8): UtilityItem[] {
  return utilities.filter((u) => u.badge === "Popular" || u.badge === "Essential").slice(0, limit);
}

export function getRecentUtilities(limit: number = 6): UtilityItem[] {
  return [...utilities].reverse().slice(0, limit);
}

export function getRelatedUtilities(slug: string, limit: number = 4): UtilityItem[] {
  const current = getUtilityBySlug(slug);
  if (!current) return [];

  if (current.related && current.related.length > 0) {
    const fromExplicit = current.related
      .map((relSlug) => getUtilityBySlug(relSlug))
      .filter((u): u is UtilityItem => u !== undefined);

    if (fromExplicit.length >= limit) {
      return fromExplicit.slice(0, limit);
    }

    const sameCat = utilities.filter(
      (u) => u.category === current.category && u.slug !== current.slug && !fromExplicit.some((e) => e.slug === u.slug)
    );
    return [...fromExplicit, ...sameCat].slice(0, limit);
  }

  return utilities
    .filter((u) => u.category === current.category && u.slug !== current.slug)
    .slice(0, limit);
}

export function searchUtilities(query: string): UtilityItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return utilities;

  return utilities.filter((u) => {
    const matchName = u.name.toLowerCase().includes(q);
    const matchDesc = u.description.toLowerCase().includes(q);
    const matchCategory = u.category.toLowerCase().includes(q);
    const matchKeywords = u.keywords.some((k) => k.toLowerCase().includes(q));
    const matchSlug = u.slug.toLowerCase().includes(q);
    return matchName || matchDesc || matchCategory || matchKeywords || matchSlug;
  });
}

// ==========================================
// WINDOWS WIDGET DISCOVERY REGISTRY HELPERS
// ==========================================

export function getAllWidgets(): WidgetItem[] {
  return widgets;
}

export function getWidgetBySlug(slug: string): WidgetItem | undefined {
  return widgets.find((w) => w.slug === slug || w.id === slug);
}

export function getWidgetsByCategory(categorySlug: string): WidgetItem[] {
  return widgets.filter((w) => w.category.toLowerCase() === categorySlug.toLowerCase());
}

export function getAllWidgetCategories(): WidgetCategoryItem[] {
  return widgetCategories;
}

export function getWidgetCategoryBySlug(slug: string): WidgetCategoryItem | undefined {
  return widgetCategories.find((wc) => wc.slug === slug || wc.id === slug);
}

export function getPopularWidgets(limit: number = 6): WidgetItem[] {
  return widgets
    .filter((w) => w.popularityStatus === "Popular" || w.popularityStatus === "Essential")
    .slice(0, limit);
}

export function getWidgetsByIntent(intentQuery: string): WidgetItem[] {
  const q = intentQuery.trim().toLowerCase();
  if (!q) return widgets;

  return widgets.filter((w) => {
    const matchIntent = w.userIntents.some((i) => i.toLowerCase().includes(q));
    const matchBestFor = w.bestFor.toLowerCase().includes(q);
    const matchCapabilities = w.capabilities.some((c) => c.toLowerCase().includes(q));
    return matchIntent || matchBestFor || matchCapabilities;
  });
}

export function searchWidgets(query: string): WidgetItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return widgets;

  return widgets.filter((w) => {
    const matchName = w.name.toLowerCase().includes(q);
    const matchShortDesc = w.shortDescription.toLowerCase().includes(q);
    const matchLongDesc = w.longDescription.toLowerCase().includes(q);
    const matchCategory = w.category.toLowerCase().includes(q);
    const matchPlatform = w.platformType.toLowerCase().includes(q);
    const matchBestFor = w.bestFor.toLowerCase().includes(q);
    const matchCapabilities = w.capabilities.some((c) => c.toLowerCase().includes(q));
    const matchKeywords = w.keywords.some((k) => k.toLowerCase().includes(q));
    const matchIntents = w.userIntents.some((i) => i.toLowerCase().includes(q));

    return (
      matchName ||
      matchShortDesc ||
      matchLongDesc ||
      matchCategory ||
      matchPlatform ||
      matchBestFor ||
      matchCapabilities ||
      matchKeywords ||
      matchIntents
    );
  });
}

export function getRelatedWidgetsForUtility(utilitySlug: string, limit: number = 3): WidgetItem[] {
  // 1. Direct matching via relatedUtilities array
  const explicit = widgets.filter((w) => w.relatedUtilities && w.relatedUtilities.includes(utilitySlug));
  if (explicit.length >= limit) return explicit.slice(0, limit);

  // 2. Category mapping fallback
  const utility = getUtilityBySlug(utilitySlug);
  if (!utility) return explicit;

  const categoryMap: Record<string, string> = {
    developer: "developer",
    finance: "finance",
    network: "network",
    fun: "clock",
    health: "health",
    creative: "customization",
    education: "education",
    business: "business",
    ai: "ai",
  };

  const mappedWidgetCat = categoryMap[utility.category] || "productivity";
  const sameCatWidgets = widgets.filter((w) => w.category === mappedWidgetCat && !explicit.some((e) => e.slug === w.slug));

  return [...explicit, ...sameCatWidgets].slice(0, limit);
}
