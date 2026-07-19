import Link from "next/link";

/**
 * Wordmark logo. No official SVG was supplied (see ASSUMPTIONS §A) — rebuilt as
 * an accessible text wordmark matching the design ("Vara." + "Organics").
 */
export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Vara Organics — home">
      <span className="leading-none">
        <span
          className={`font-serif text-2xl font-semibold ${inverse ? "text-ivory" : "text-navy"}`}
        >
          Vara<span className="text-amber">.</span>
        </span>
        <span className="mt-px block text-[9.5px] font-medium uppercase tracking-[0.3em] text-amber">
          Organics
        </span>
      </span>
    </Link>
  );
}
