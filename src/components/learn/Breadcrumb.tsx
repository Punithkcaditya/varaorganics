import Link from "next/link";
import type { Crumb } from "@/components/schema/builders";

/** Visual breadcrumb matching the BreadcrumbList schema. */
export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs font-light text-navy/55">
      <ol className="flex flex-wrap items-center gap-2">
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={c.path} className="flex items-center gap-2">
              {isLast ? (
                <span aria-current="page" className="text-navy/80">
                  {c.name}
                </span>
              ) : (
                <Link href={c.path} className="hover:text-amber">
                  {c.name}
                </Link>
              )}
              {!isLast && <span aria-hidden="true">›</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
