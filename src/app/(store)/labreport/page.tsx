import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Section, Eyebrow } from "@/components/ui/layout-primitives";
import { Breadcrumb } from "@/components/learn/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { JsonLd } from "@/components/schema/JsonLd";
import { breadcrumbSchema } from "@/components/schema/builders";
import { buildMetadata } from "@/components/seo/metadata";
import { getAllActiveBatches } from "@/features/batches/queries";
import { LAB_REPORTS_PATH } from "@/config/routes";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = buildMetadata({
  title: "Lab Reports & Accreditation",
  description:
    "View the currently supplied ghee laboratory test report, the testing laboratory's NABL accreditation certificate, and Vara Organics batch records.",
  path: LAB_REPORTS_PATH.slice(1),
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Lab Reports", path: LAB_REPORTS_PATH },
];

const REPORTS = [
  {
    title: "Ghee laboratory test report — 2026",
    type: "Product test report",
    description:
      "Equity Food Testing Laboratories report EL/RJK/2512066 for a ghee sample, issued to Gawdee Organic Pvt. Ltd. on 2 January 2026. The document records the batch number as NM (not mentioned).",
    pdf: "/lab-reports/ghee-lab-test-2026.pdf",
    pages: [
      "/lab-reports/ghee-lab-test-2026-page-1.png",
      "/lab-reports/ghee-lab-test-2026-page-2.png",
    ],
    aspect: "aspect-[548/792]",
  },
  {
    title: "NABL accreditation certificate",
    type: "Laboratory accreditation",
    description:
      "Certificate NABLT0626GJ18263 for Equity Food Testing Laboratories Private Limited, issued 10 June 2026 and shown as valid until 9 June 2030.",
    pdf: "/lab-reports/equity-food-testing-nabl-accreditation.pdf",
    pages: ["/lab-reports/equity-food-testing-nabl-accreditation-page-1.png"],
    aspect: "aspect-[595/842]",
  },
] as const;

export default async function LabReportPage() {
  const batches = await getAllActiveBatches();

  return (
    <Section tone="ivory" ariaLabel="Lab reports and accreditation">
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumb crumbs={crumbs} />

      <div className="mt-4 max-w-[780px]">
        <Eyebrow>Documents you can inspect</Eyebrow>
        <h1 className="text-navy mb-4 font-serif text-[clamp(2rem,4vw,3rem)] font-semibold">
          Lab reports & accreditation
        </h1>
        <p className="text-navy/65 text-base leading-relaxed font-light">
          These are the supporting laboratory documents currently supplied to Vara Organics. We
          publish the names, dates and report details exactly as they appear in the original files.
        </p>
        <p className="border-amber/30 bg-amber/5 text-navy/65 mt-5 rounded border p-4 text-sm leading-relaxed">
          The attached ghee report is issued to Gawdee Organic Pvt. Ltd. and does not state a batch
          number. It should not be read as a batch-specific Vara certificate. Vara batch records are
          listed separately below.
        </p>
      </div>

      <div className="mt-10 space-y-10">
        {REPORTS.map((report) => (
          <article
            key={report.pdf}
            className="border-navy/10 overflow-hidden rounded-xl border bg-white"
          >
            <div className="border-navy/10 flex flex-wrap items-start justify-between gap-5 border-b p-5 md:p-7">
              <div className="max-w-3xl">
                <Badge tone="success">{report.type}</Badge>
                <h2 className="text-navy mt-3 font-serif text-2xl font-semibold">{report.title}</h2>
                <p className="text-navy/60 mt-2 text-sm leading-relaxed font-light">
                  {report.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={report.pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-navy text-ivory hover:bg-amber rounded-[2px] px-5 py-3 text-[11px] font-semibold tracking-[0.12em] uppercase transition-colors"
                >
                  Open PDF
                </a>
                <a
                  href={report.pdf}
                  download
                  className="border-navy/20 text-navy hover:border-amber hover:text-amber rounded-[2px] border px-5 py-3 text-[11px] font-semibold tracking-[0.12em] uppercase transition-colors"
                >
                  Download
                </a>
              </div>
            </div>

            <div
              className={`bg-paper grid gap-4 p-3 sm:p-5 ${report.pages.length > 1 ? "lg:grid-cols-2" : ""}`}
            >
              {report.pages.map((page, index) => (
                <div
                  key={page}
                  className={`border-navy/10 relative mx-auto w-full max-w-[760px] overflow-hidden rounded border bg-white shadow-sm ${report.aspect}`}
                >
                  <Image
                    src={page}
                    alt={`${report.title}, page ${index + 1}`}
                    fill
                    sizes={
                      report.pages.length > 1
                        ? "(max-width: 1023px) calc(100vw - 48px), 42vw"
                        : "(max-width: 819px) calc(100vw - 48px), 760px"
                    }
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>

      {batches.length > 0 && (
        <section className="mt-16" aria-labelledby="batch-records-title">
          <Eyebrow>Product records</Eyebrow>
          <h2 id="batch-records-title" className="text-navy font-serif text-3xl font-semibold">
            Verify a Vara batch
          </h2>
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {batches.map(({ product, batch }) => (
              <div key={batch.id} className="border-navy/10 rounded border bg-white p-6">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h3 className="text-navy font-serif text-lg font-semibold">
                    {product.productName}
                  </h3>
                  <Badge tone="success">Recorded</Badge>
                </div>
                <p className="text-navy/60 mb-4 text-sm">
                  Batch {batch.batchNumber} · Best before {formatDate(batch.bestBefore)}
                </p>
                <Link
                  href={`/verify/${batch.batchNumber}`}
                  className="text-amber text-sm font-medium tracking-[0.12em] uppercase"
                >
                  View batch results →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </Section>
  );
}
