import type { ReactNode } from "react";
import { Section, Eyebrow } from "@/components/ui/layout-primitives";
import { Breadcrumb } from "@/components/learn/Breadcrumb";
import { JsonLd } from "@/components/schema/JsonLd";
import { breadcrumbSchema } from "@/components/schema/builders";

/** Standard prose content page with breadcrumb + schema (policies, story, b2b). */
export function ContentPage({
  eyebrow,
  title,
  path,
  children,
}: {
  eyebrow: string;
  title: string;
  path: string;
  children: ReactNode;
}) {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: title, path: `/${path}` },
  ];
  return (
    <Section tone="ivory" ariaLabel={title}>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumb crumbs={crumbs} />
      <div className="mt-4 max-w-[760px]">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mb-6 font-serif text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight text-navy">
          {title}
        </h1>
        <div className="space-y-4 text-[15px] font-light leading-relaxed text-navy/75 [&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-navy [&_a]:text-amber [&_a]:underline">
          {children}
        </div>
      </div>
    </Section>
  );
}
