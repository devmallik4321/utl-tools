"use client";

import { useEffect } from "react";
import { trackCategoryView } from "@/lib/analytics";

interface CategoryViewTrackerProps {
  categoryId: string;
}

export function CategoryViewTracker({ categoryId }: CategoryViewTrackerProps) {
  useEffect(() => {
    trackCategoryView(categoryId);
  }, [categoryId]);

  return null;
}
