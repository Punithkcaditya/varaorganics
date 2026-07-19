import type { Metadata } from "next";
import { ContentPage } from "@/components/ui/ContentPage";
import { buildMetadata } from "@/components/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "B2B & Export",
  description:
    "Varixa Global supplies Vara Organics ghee, oils and honey for wholesale, HoReCa and export. Get in touch for bulk enquiries.",
  path: "b2b",
});

export default function B2BPage() {
  return (
    <ContentPage eyebrow="For Business" title="B2B & Export enquiries" path="b2b">
      <p>
        Varixa Global is the B2B and export arm behind Vara Organics. We supply lab-tested,
        batch-traced ghee, wood-pressed oils and raw honey for wholesale, retail, HoReCa and export.
      </p>
      <h2>What we offer</h2>
      <p>
        Consistent small-batch quality with full NABL lab documentation, private-label options, and
        traceability on every batch. Bulk pricing available on request.
      </p>
      <h2>Get in touch</h2>
      <p>
        For wholesale or export enquiries, please{" "}
        <a href="/contact">contact us</a> with your requirements and we&apos;ll respond with pricing
        and availability.
      </p>
      <p className="text-sm italic text-navy/50">
        Export documentation and certifications will be listed here once confirmed.
      </p>
    </ContentPage>
  );
}
