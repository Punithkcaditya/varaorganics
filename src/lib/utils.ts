import { clsx, type ClassValue } from "clsx";

/** Merge conditional class names. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/** Format an integer rupee amount as ₹1,399. */
export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/**
 * Unit-price context, e.g. "₹2.80 / ml". Returns null when base is 0.
 * Kept as a string helper so product cards and PDPs render identically.
 */
export function unitPrice(price: number, base: number, unit: "ml" | "g"): string | null {
  if (!base) return null;
  const per = price / base;
  const rounded = per >= 10 ? Math.round(per) : Math.round(per * 100) / 100;
  return `₹${rounded.toLocaleString("en-IN")} / ${unit}`;
}

/** Percentage saved between a compare-at price and the actual price. */
export function discountPercent(price: number, compareAt: number | null): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

/** Estimate reading time (minutes) from markdown, ~200 wpm, min 1. */
export function estimateReadTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Format an ISO date as "12 Jan 2026". */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** Human category label. */
export function categoryLabel(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}
