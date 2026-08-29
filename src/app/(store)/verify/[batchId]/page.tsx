import type { Metadata } from "next";
import Link from "next/link";
import { LAB_REPORTS_PATH } from "@/config/routes";
import { Container } from "@/components/ui/layout-primitives";
import { Breadcrumb } from "@/components/learn/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { JsonLd } from "@/components/schema/JsonLd";
import { batchProductSchema, breadcrumbSchema } from "@/components/schema/builders";
import { buildMetadata } from "@/components/seo/metadata";
import { BatchQr } from "@/components/product/BatchQr";
import { lookupBatch } from "@/features/batches/queries";
import { formatDate } from "@/lib/utils";

// Batch is scanned live — always reflect DB truth, including inactive/unknown.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ batchId: string }>;
}): Promise<Metadata> {
  const { batchId } = await params;
  return buildMetadata({
    title: `Verify batch ${batchId}`,
    description: "Verify your Vara Organics batch and view its lab report.",
    path: `verify/${batchId}`,
    noindex: true,
  });
}

function Shell({ children, batchId }: { children: React.ReactNode; batchId: string }) {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Verify", path: `/verify/${batchId}` },
  ];
  return (
    <Container className="py-10 md:py-16">
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumb crumbs={crumbs} />
      <div className="mx-auto mt-6 max-w-[680px]">{children}</div>
    </Container>
  );
}

function HelpCta() {
  return (
    <p className="text-navy/60 mt-8 text-sm">
      Something look wrong?{" "}
      <Link href="/contact" className="text-amber underline">
        Contact us
      </Link>{" "}
      and we&apos;ll help verify your product.
    </p>
  );
}

export default async function VerifyPage({ params }: { params: Promise<{ batchId: string }> }) {
  const { batchId } = await params;
  const result = await lookupBatch(batchId);

  if (result.state === "error") {
    return (
      <Shell batchId={batchId}>
        <h1 className="text-navy mb-3 font-serif text-3xl font-semibold">
          Verification unavailable
        </h1>
        <p className="text-navy/70">
          We couldn&apos;t verify this batch right now. Please try again shortly.
        </p>
        <HelpCta />
      </Shell>
    );
  }

  if (result.state === "unknown") {
    return (
      <Shell batchId={batchId}>
        <h1 className="text-navy mb-3 font-serif text-3xl font-semibold">Batch not found</h1>
        <p className="text-navy/70">
          We couldn&apos;t find a batch matching <strong>{batchId}</strong>. Check the code on your
          jar and try again.
        </p>
        <HelpCta />
      </Shell>
    );
  }

  const { batch, product } = result;
  const inactive = result.state === "inactive";

  return (
    <Shell batchId={batchId}>
      <JsonLd data={batchProductSchema(product, batch, `verify/${batchId}`)} />

      <div className="mb-4 flex items-center gap-3">
        <Badge tone={inactive ? "muted" : "success"}>
          {inactive ? "Archived batch" : "Verified batch"}
        </Badge>
      </div>
      <h1 className="text-navy mb-1 font-serif text-3xl font-semibold">{product.productName}</h1>
      <p className="text-navy/60 mb-6">Batch {batch.batchNumber}</p>

      {inactive && (
        <p className="border-warning/30 bg-warning/5 text-warning mb-6 rounded border p-4 text-sm">
          This batch is no longer in active distribution. The lab results below remain on record.
        </p>
      )}

      <div className="mb-8 flex flex-wrap items-start gap-6">
        <BatchQr batchNumber={batch.batchNumber} size={120} />
        <p className="text-navy/60 max-w-sm text-sm leading-relaxed font-light">
          This code is printed on your jar. Scanning it always returns the report for this exact
          batch — not a generic certificate.
        </p>
      </div>

      <dl className="mb-8 grid grid-cols-2 gap-4">
        <div>
          <dt className="text-navy/45 text-[11px] tracking-[0.1em] uppercase">Manufactured</dt>
          <dd className="text-navy font-medium">{formatDate(batch.mfgDate)}</dd>
        </div>
        <div>
          <dt className="text-navy/45 text-[11px] tracking-[0.1em] uppercase">Best before</dt>
          <dd className="text-navy font-medium">{formatDate(batch.bestBefore)}</dd>
        </div>
      </dl>

      {batch.labParameters.length > 0 ? (
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Lab results for batch {batch.batchNumber}</caption>
          <thead>
            <tr className="border-navy/10 text-navy/45 border-b text-left text-[11px] tracking-[0.1em] uppercase">
              <th scope="col" className="py-2">
                Parameter
              </th>
              <th scope="col" className="py-2">
                Result
              </th>
              <th scope="col" className="py-2 text-right">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {batch.labParameters.map((p) => (
              <tr key={p.id} className="border-navy/5 border-b last:border-0">
                <td className="text-navy/70 py-2.5 font-light">{p.name}</td>
                <td className="text-navy py-2.5 font-medium">{p.result}</td>
                <td className="py-2.5 text-right">
                  <Badge tone={p.status === "Premium" ? "premium" : "success"}>{p.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-navy/60">Lab parameters for this batch are being uploaded.</p>
      )}

      <p className="mt-6 text-sm">
        <Link
          href={batch.labReportUrl ?? LAB_REPORTS_PATH}
          target={batch.labReportUrl ? "_blank" : undefined}
          rel={batch.labReportUrl ? "noopener noreferrer" : undefined}
          className="text-amber underline"
        >
          {batch.labReportUrl ? "View this batch report (PDF) →" : "View available lab reports →"}
        </Link>
      </p>

      <p className="mt-6 text-sm">
        <Link
          href={`/${product.routePrefix}/${product.variants.find((v) => v.routeSlug)?.routeSlug ?? ""}`}
          className="text-amber underline"
        >
          View this product →
        </Link>
      </p>
      <HelpCta />
    </Shell>
  );
}
