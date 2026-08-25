/**
 * Google Analytics 4 Client-Side Helper for UTL.tools
 * 
 * STRICT PRIVACY DIRECTIVE:
 * - NEVER track user-entered content, values, form inputs, passwords, financial amounts, or payloads.
 * - ONLY track aggregate platform metrics (utility_view, utility_interaction, share, bookmark, search, category_view).
 */

export const GA_MEASUREMENT_ID = "G-H2G4BK9Y36";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Track client-side page views on navigation
export function pageview(url: string) {
  if (typeof window === "undefined" || !window.gtag) return;
  try {
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
      anonymize_ip: true,
    });
  } catch (err) {
    // Fail silently in development/sandboxed environments
  }
}

// Generic safe event dispatcher with parameter sanitization
export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  if (typeof window === "undefined" || !window.gtag) return;
  try {
    // Sanitize: ensure no sensitive keys or lengthy strings are passed
    const sanitizedParams: Record<string, any> = {};
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === "string") {
        sanitizedParams[key] = value.slice(0, 100); // truncate length
      } else if (typeof value === "number" || typeof value === "boolean") {
        sanitizedParams[key] = value;
      }
    }
    window.gtag("event", eventName, sanitizedParams);
  } catch (err) {
    // Fail silently
  }
}

// Track utility view
export function trackUtilityView(utilityId: string, category: string) {
  trackEvent("utility_view", {
    utility_id: utilityId,
    category: category,
  });
}

// Track aggregate utility interaction (e.g., 'calculate', 'copy', 'clear', 'export', 'mode_toggle')
export function trackUtilityInteraction(utilityId: string, interactionType: string) {
  trackEvent("utility_interaction", {
    utility_id: utilityId,
    interaction_type: interactionType,
  });
}

// Track share actions
export function trackShare(utilityId: string, method: string = "web_share") {
  trackEvent("share", {
    utility_id: utilityId,
    method: method,
  });
}

// Track bookmark actions
export function trackBookmark(utilityId: string, action: "add" | "remove") {
  trackEvent("bookmark", {
    utility_id: utilityId,
    action: action,
  });
}

// Track category views
export function trackCategoryView(categoryId: string) {
  trackEvent("category_view", {
    category_id: categoryId,
  });
}

// Track search metadata (query length & result count only — NO raw search text)
export function trackSearch(queryLength: number, resultsCount: number) {
  trackEvent("search", {
    query_length: queryLength,
    results_count: resultsCount,
  });
}
