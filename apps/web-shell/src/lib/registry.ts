import utilitiesData from "../../../../registry/utilities.json";
import categoriesData from "../../../../registry/categories.json";
import rolesData from "../../../../registry/roles.json";
import { UtilityItem, CategoryItem, RoleItem } from "./types";

export const utilities: UtilityItem[] = utilitiesData as unknown as UtilityItem[];
export const categories: CategoryItem[] = categoriesData as unknown as CategoryItem[];
export const roles: RoleItem[] = rolesData as unknown as RoleItem[];

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
    
    // Fill remaining from same category
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
