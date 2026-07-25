import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/ui/layout-primitives";
import { Breadcrumb } from "@/components/learn/Breadcrumb";
import { B2BEnquiryForm } from "@/components/forms/B2BEnquiryForm";
import { JsonLd } from "@/components/schema/JsonLd";
import { breadcrumbSchema } from "@/components/schema/builders";
import { buildMetadata } from "@/components/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "B2B & Export",
  description:
    "Varixa Global supplies Vara Organics ghee, oils and honey for wholesale, HoReCa and export. Minimum order quantities, markets served, and an enquiry form.",
  path: "b2b",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "B2B / Export", path: "/b2b" },
];

const moq = [
  { label: "Ghee — India wholesale", value: "50 L per order" },
  { label: "Honey — India wholesale", value: "25 kg per order" },
  { label: "Wood Pressed Oils — India wholesale", value: "50 L per order" },
  { label: "Export (UAE / EU)", value: "200 L ghee or 100 kg honey per shipment" },
];

export default function B2BPage() {
  return (
    <Section tone="ivory" ariaLabel="B2B and export">
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumb crumbs={crumbs} />

      <div className="mt-4 max-w-[760px]">
        <Eyebrow>For Business</Eyebrow>
        <h1 className="mb-6 font-serif text-[clamp(2rem,4vw,3rem)] font-semibold leading-tight text-navy">
          B2B &amp; Export enquiries
        </h1>
        <p className="text-[15px] font-light leading-relaxed text-navy/75">
          Varixa Global is the B2B and export arm behind Vara Organics. We supply lab-tested,
          batch-traced ghee, wood-pressed oils and raw honey for wholesale, retail, HoReCa and
          export — with full NABL lab documentation and traceability on every batch.
        </p>
        {/* Markets served (Website Changes §06). */}
        <p className="mt-4 text-[15px] font-medium text-navy">
          Currently supplying: India (wholesale and retail) · UAE (export) · EU (export —
          documentation in progress).
        </p>
      </div>

      {/* Minimum order quantities */}
      <div className="mt-12 max-w-[760px]">
        <h2 className="mb-4 font-serif text-2xl font-semibold text-navy">Minimum Order Quantities</h2>
        <div className="overflow-hidden rounded border border-navy/10 bg-white">
          <table className="w-full border-collapse text-sm">
            <tbody>
              {moq.map((row) => (
                <tr key={row.label} className="border-b border-navy/5 last:border-0">
                  <td className="px-5 py-3.5 font-medium text-navy">{row.label}</td>
                  <td className="px-5 py-3.5 text-right text-navy/70">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inline enquiry form */}
      <div className="mt-12 max-w-[760px]">
        <h2 className="mb-2 font-serif text-2xl font-semibold text-navy">Send an enquiry</h2>
        <p className="mb-6 text-sm font-light text-navy/65">
          Tell us what you need and we&apos;ll respond with pricing and availability.
        </p>
        <B2BEnquiryForm />
      </div>
    </Section>
  );
}
