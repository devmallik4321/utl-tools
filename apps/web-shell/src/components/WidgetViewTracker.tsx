"use client";

import { useEffect } from "react";
import { trackWidgetView } from "@/lib/analytics";

interface WidgetViewTrackerProps {
  widgetSlug: string;
  category: string;
}

export function WidgetViewTracker({ widgetSlug, category }: WidgetViewTrackerProps) {
  useEffect(() => {
    trackWidgetView(widgetSlug, category);
  }, [widgetSlug, category]);

  return null;
}
