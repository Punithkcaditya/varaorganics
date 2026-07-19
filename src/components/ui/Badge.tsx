import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "navy" | "amber" | "success" | "premium" | "muted";

const tones: Record<Tone, string> = {
  navy: "bg-navy text-ivory",
  amber: "bg-amber text-white",
  success: "bg-success/20 text-success",
  premium: "bg-gold/20 text-amber",
  muted: "bg-navy/5 text-navy/60",
};

export function Badge({
  children,
  tone = "navy",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[2px] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
