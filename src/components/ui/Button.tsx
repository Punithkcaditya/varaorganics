import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "ghostInverse" | "gold";

const base =
  "inline-flex items-center justify-center rounded-[2px] font-sans font-semibold uppercase tracking-[0.16em] text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary: "bg-navy text-ivory px-10 py-4 hover:bg-amber",
  gold: "bg-gold text-navy-deep font-bold px-10 py-4 hover:bg-gold-lt",
  ghost:
    "bg-transparent text-navy border border-navy/20 px-7 py-4 font-medium tracking-[0.14em] hover:border-amber hover:text-amber",
  ghostInverse:
    "bg-transparent text-ivory border border-ivory/30 px-7 py-3 font-medium tracking-[0.14em] hover:border-gold-lt",
};

interface CommonProps {
  variant?: Variant;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: CommonProps & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  className,
  children,
  href,
  ...props
}: CommonProps & Omit<ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link href={href} className={cn(base, variants[variant], className)} {...props}>
      {children}
    </Link>
  );
}
