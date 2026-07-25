import type { Metadata } from "next";
import Link from "next/link";
import { Section, Eyebrow } from "@/components/ui/layout-primitives";
import { Breadcrumb } from "@/components/learn/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { JsonLd } from "@/components/schema/JsonLd";
import { breadcrumbSchema } from "@/components/schema/builders";
import { buildMetadata } from "@/components/seo/metadata";
import { getAllActiveBatches } from "@/features/batches/queries";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "Lab Reports & Batch Verification",
  description:
    "Every Vara Organics batch is independently NABL lab-tested. Browse current batches and verify the product in your hand.",
  path: "lab-reports",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Lab Reports", path: "/lab-reports" },
];

export default async function LabReportsPage() {
  const batches = await getAllActiveBatches();
  return (
    <Section tone="ivory" ariaLabel="Lab reports">
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumb crumbs={crumbs} />
      <div className="mt-4 max-w-[720px]">
        <Eyebrow>Transparency you can verify</Eyebrow>
        <h1 className="mb-4 font-serif text-[clamp(2rem,4vw,3rem)] font-semibold text-navy">
          Lab reports & batch verification
        </h1>
        <p className="text-base font-light leading-relaxed text-navy/65">
          Every batch is independently tested before it ships. Scan the QR on any jar — or find your
          batch below — to see its exact results. All testing is conducted by Jagdamba Laboratories
          (OPC) Pvt. Ltd., Jaipur — a Government-approved, ISO 9001:2015 and GLP-certified
          laboratory.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {batches.map(({ product, batch }) => (
          <div key={batch.id} className="rounded border border-navy/10 bg-white p-6">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="font-serif text-lg font-semibold text-navy">{product.productName}</h2>
              <Badge tone="success">Verified</Badge>
            </div>
            <p className="mb-4 text-sm text-navy/60">
              Batch {batch.batchNumber} · Best before {formatDate(batch.bestBefore)}
            </p>
            <Link
              href={`/verify/${batch.batchNumber}`}
              className="text-sm font-medium uppercase tracking-[0.12em] text-amber"
            >
              View batch results →
            </Link>
          </div>
        ))}
      </div>
    </Section>
  );
}
