"use client";

import { useEffect } from "react";
import { trackUtilityView } from "@/lib/analytics";

interface UtilityViewTrackerProps {
  utilityId: string;
  category: string;
}

export function UtilityViewTracker({ utilityId, category }: UtilityViewTrackerProps) {
  useEffect(() => {
    trackUtilityView(utilityId, category);
  }, [utilityId, category]);

  return null;
}
