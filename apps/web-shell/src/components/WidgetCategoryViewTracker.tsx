"use client";

import { useEffect } from "react";
import { trackWidgetCategoryView } from "@/lib/analytics";

interface WidgetCategoryViewTrackerProps {
  categorySlug: string;
}

export function WidgetCategoryViewTracker({ categorySlug }: WidgetCategoryViewTrackerProps) {
  useEffect(() => {
    trackWidgetCategoryView(categorySlug);
  }, [categorySlug]);

  return null;
}
