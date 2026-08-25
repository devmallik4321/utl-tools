"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FaqItem } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FaqAccordionProps {
  items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="border border-border rounded-lg bg-card overflow-hidden transition-colors"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-medium text-foreground hover:bg-muted/40 transition-colors"
              aria-expanded={isOpen}
            >
              <span className="text-sm sm:text-base font-semibold">{item.question}</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0",
                  isOpen && "transform rotate-180 text-foreground"
                )}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-4 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-border/50">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
