import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Constrained content width with responsive horizontal padding. */
export function Container({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  return <Tag className={cn("mx-auto w-full max-w-[1200px] px-6 md:px-[8%]", className)}>{children}</Tag>;
}

type SectionTone = "ivory" | "white" | "paper" | "dark";

const tones: Record<SectionTone, string> = {
  ivory: "bg-ivory text-navy",
  white: "bg-white text-navy",
  paper: "bg-paper text-navy",
  dark: "bg-gradient-to-b from-navy-mid to-navy-deep text-ivory",
};

/** Vertical section wrapper matching the design's 96px block rhythm. */
export function Section({
  children,
  tone = "ivory",
  className,
  id,
  ariaLabel,
}: {
  children: ReactNode;
  tone?: SectionTone;
  className?: string;
  id?: string;
  ariaLabel?: string;
}) {
  return (
    <section id={id} aria-label={ariaLabel} className={cn("py-16 md:py-24", tones[tone])}>
      <Container className={className}>{children}</Container>
    </section>
  );
}

/** Eyebrow label with the leading gold rule (design `.eyebrow`). */
export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <div
      className={cn(
        "mb-3.5 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.3em]",
        light ? "text-gold-lt" : "text-amber",
      )}
    >
      <span className="h-px w-6 bg-current" aria-hidden="true" />
      {children}
    </div>
  );
}
