// Google Analytics 4 (GA4) Client-Side Helper
export const GA_MEASUREMENT_ID = "G-H2G4BK9Y36";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export function pageview(url: string) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
}

export function trackEvent(eventName: string, params?: Record<string, any>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params || {});
  }
}

export function trackUtilityView(utilityId: string, category: string) {
  trackEvent("utility_view", {
    utility_id: utilityId,
    category: category,
  });
}

export function trackUtilityInteraction(utilityId: string, interactionType: string) {
  trackEvent("utility_interaction", {
    utility_id: utilityId,
    interaction_type: interactionType,
  });
}

export function trackShare(utilityId: string, method: string = "button_click") {
  trackEvent("share", {
    utility_id: utilityId,
    method: method,
  });
}

export function trackBookmark(utilityId: string, action: "add" | "remove") {
  trackEvent("bookmark", {
    utility_id: utilityId,
    action: action,
  });
}

export function trackCategoryView(categoryId: string) {
  trackEvent("category_view", {
    category_id: categoryId,
  });
}

export function trackSearch(queryLength: number, resultsCount: number) {
  trackEvent("search", {
    query_length: queryLength,
    results_count: resultsCount,
  });
}

// WIDGET DISCOVERY LAYER ANALYTICS (Zero user payload transmission)

export function trackWidgetView(widgetSlug: string, category: string) {
  trackEvent("widget_view", {
    widget_slug: widgetSlug,
    category: category,
  });
}

export function trackWidgetCategoryView(categorySlug: string) {
  trackEvent("widget_category_view", {
    category_slug: categorySlug,
  });
}

export function trackWidgetSearch(queryLength: number, resultsCount: number) {
  trackEvent("widget_search", {
    query_length: queryLength,
    results_count: resultsCount,
  });
}

export function trackWidgetExternalClick(widgetSlug: string, urlType: "official" | "install") {
  trackEvent("widget_external_click", {
    widget_slug: widgetSlug,
    url_type: urlType,
  });
}

export function trackWidgetRelatedUtilityClick(widgetSlug: string, utilitySlug: string) {
  trackEvent("widget_related_utility_click", {
    widget_slug: widgetSlug,
    utility_slug: utilitySlug,
  });
}
