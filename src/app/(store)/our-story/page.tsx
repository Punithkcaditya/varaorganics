import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/ui/layout-primitives";
import { Breadcrumb } from "@/components/learn/Breadcrumb";
import { JsonLd } from "@/components/schema/JsonLd";
import { breadcrumbSchema } from "@/components/schema/builders";
import { buildMetadata } from "@/components/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Our Story",
  description:
    "I couldn't find ghee I could trust, so I built it. The founder story behind Vara Organics — verified supply, published lab reports, nothing hidden.",
  path: "our-story",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Our Story", path: "/our-story" },
];

/**
 * Founder-story restructure (Website Changes §03). Four sections; the sourcing
 * section deliberately omits confidential detail (addresses, licence numbers,
 * legal entity) — those live on the physical label only.
 */
export default function OurStoryPage() {
  return (
    <Section tone="ivory" ariaLabel="Our story">
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumb crumbs={crumbs} />

      {/* Section 1 — hero */}
      <div className="mx-auto mt-4 max-w-[720px]">
        <Eyebrow>Founded in Bengaluru · Our Story</Eyebrow>
        <h1 className="mb-8 font-serif text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-tight text-navy">
          I couldn&apos;t find ghee I could trust. So I built it.
        </h1>

        {/* Founder photo placeholder — real photo to be supplied. */}
        <figure className="mb-8 flex items-center gap-4">
          <span
            aria-hidden="true"
            className="h-[120px] w-[120px] shrink-0 rounded-full border border-navy/15 bg-paper"
          />
          <figcaption className="text-sm italic text-navy/55">Founder, Vara Organics</figcaption>
        </figure>

        <div className="space-y-4 text-[15px] font-light leading-relaxed text-navy/75">
          <p>
            When I was pregnant, I started paying attention to everything I ate. Not obsessively —
            just carefully. Ghee was the one thing every doctor, every elder, every article agreed
            on. Good ghee, made the right way, is genuinely nourishing. So I went looking for it.
          </p>
          <p>
            What I found was labels. Pure A2. Bilona method. Farm fresh. All of it printed with
            confidence, none of it verifiable. I asked brands for lab reports. Most didn&apos;t have
            them. I asked where the cows were. Nobody could tell me. I visited stores in Bengaluru,
            ordered online, read every ingredient panel — and I still couldn&apos;t answer the most
            basic question: is what&apos;s on this label actually in the jar?
          </p>
          <p className="font-medium text-navy">That question stayed with me.</p>
        </div>

        {/* Section 2 */}
        <h2 className="mb-4 mt-12 font-serif text-2xl font-semibold text-navy">
          What I did about it
        </h2>
        <div className="space-y-4 text-[15px] font-light leading-relaxed text-navy/75">
          <p>
            After my daughter was born, I started tracing the supply chain myself. I found farms in
            Rajasthan raising Gir cows the traditional way. I found a 5,000-year-old wooden pressing
            method for oils that most brands had quietly replaced with steel machines. I found a
            government-approved laboratory in Jaipur that could test every batch across 70+
            parameters — antibiotics, heavy metals, adulteration, fatty acid profile — everything.
          </p>
          <p>
            I asked one question to every supplier: will you let me publish the lab report on the
            jar? The ones who said yes became Vara&apos;s supply chain.
          </p>
        </div>

        {/* Section 3 */}
        <h2 className="mb-4 mt-12 font-serif text-2xl font-semibold text-navy">What Vara is</h2>
        <div className="space-y-4 text-[15px] font-light leading-relaxed text-navy/75">
          <p>
            Vara means gift in Sanskrit. It started as a gift to my daughter — the certainty that
            what she was eating was exactly what the label said. It became a brand because I
            wasn&apos;t the only one asking the question.
          </p>
          <p>
            We are not the cheapest ghee. We are not the most famous. What we are is the most
            verifiable — every batch independently tested, every result visible on the jar, every
            claim checkable before you buy.
          </p>
          <p>
            We&apos;re a new brand. We won&apos;t pretend to have hundreds of reviews yet. What we
            have is verified supply, published lab reports, and a promise: if it isn&apos;t the best
            ghee you&apos;ve had, we&apos;ll make it right.
          </p>
        </div>
      </div>

      {/* Section 4 — sourcing, on a distinct paper background */}
      <div className="mt-14 rounded-lg border border-navy/10 bg-paper/60 p-8 md:p-12">
        <div className="mx-auto max-w-[720px]">
          <h2 className="mb-6 font-serif text-2xl font-semibold text-navy">
            Where our products come from
          </h2>

          <h3 className="mb-2 font-serif text-lg font-semibold text-navy">Ghee and Honey</h3>
          <p className="mb-6 text-[15px] font-light leading-relaxed text-navy/75">
            Sourced from a family-owned farm in Kota, Rajasthan — operating since 2017 under a valid
            FSSAI State Manufacturing Licence. The farm raises Gir, Sahiwal, and Marwadi cows on 10
            hectares of land in the Ladpura region. All ghee is produced using the traditional
            Bilona method. The farm is currently in organic conversion under India&apos;s National
            Programme for Organic Production Standards (NPOP), certified by the Rajasthan State
            Organic Certification Agency (RSOCA).
          </p>

          <h3 className="mb-2 font-serif text-lg font-semibold text-navy">Wood Pressed Oils</h3>
          <p className="mb-6 text-[15px] font-light leading-relaxed text-navy/75">
            Sourced from a traditional wooden ghani pressing facility in Bengaluru, Karnataka. Sesame
            and groundnut oils are extracted using the 5,000-year-old wooden ghani method — no steel
            machines, no chemical refining, no additives.
          </p>

          <h3 className="mb-2 font-serif text-lg font-semibold text-navy">
            How every batch is tested
          </h3>
          <p className="mb-6 text-[15px] font-light leading-relaxed text-navy/75">
            Every batch of every Vara product is independently tested before it ships — by Jagdamba
            Laboratories (OPC) Pvt. Ltd., Jaipur, a Government-approved, ISO 9001:2015 and
            GLP-certified laboratory. Testing covers 70+ parameters including chemical composition,
            heavy metals, antibiotics, pesticide residues, adulteration markers, and fatty acid
            profile — as per FSSR 2011 standards. The full report for every batch is accessible by
            scanning the QR code on the product label.
          </p>

          <p className="text-sm italic text-navy/55">
            Full supplier documentation is available to B2B buyers and importers on request via our
            B2B enquiry page.
          </p>
        </div>
      </div>
    </Section>
  );
}
