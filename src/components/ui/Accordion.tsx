"use client";

import { useId, useState } from "react";
import { ChevronDownIcon } from "./Icons";
import { cn } from "@/lib/utils";
import type { FaqItem } from "@/types";

/** Accessible FAQ accordion. Keyboard operable, aria-expanded wired. */
export function Accordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  if (items.length === 0) return null;

  return (
    <div className="divide-y divide-navy/10 border-y border-navy/10">
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${baseId}-panel-${i}`;
        const buttonId = `${baseId}-button-${i}`;
        return (
          <div key={i}>
            <h3 className="m-0">
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left font-sans text-[15px] font-medium text-navy"
              >
                {item.question}
                <ChevronDownIcon
                  className={cn("shrink-0 text-amber transition-transform", isOpen && "rotate-180")}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="pb-5 text-sm font-light leading-relaxed text-navy/65"
            >
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
