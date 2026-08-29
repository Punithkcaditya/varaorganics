import type { Metadata } from "next";
import { Section, Eyebrow } from "@/components/ui/layout-primitives";
import { Breadcrumb } from "@/components/learn/Breadcrumb";
import { ContactForm } from "@/components/forms/ContactForm";
import { JsonLd } from "@/components/schema/JsonLd";
import { breadcrumbSchema } from "@/components/schema/builders";
import { buildMetadata } from "@/components/seo/metadata";
import { PhoneIcon, MapPinIcon } from "@/components/ui/Icons";
import { contactLocations } from "@/config/contact";

export const metadata: Metadata = buildMetadata({
  title: "Contact Us",
  description:
    "Get in touch with Vara Organics in Bengaluru — call, message or find us on the map.",
  path: "contact",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Contact", path: "/contact" },
];

function firstParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : (value?.[0] ?? "");
}

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const query = await searchParams;
  const productName = firstParam(query.product).trim().slice(0, 160);
  const variantName = firstParam(query.size).trim().slice(0, 80);
  const sku = firstParam(query.sku).trim().slice(0, 80);
  const restock =
    firstParam(query.intent) === "restock" && productName && variantName
      ? { productName, variantName, sku }
      : undefined;
  const locations = contactLocations.filter((l) => l.active);
  return (
    <Section tone="ivory" ariaLabel="Contact us">
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumb crumbs={crumbs} />
      <div className="mt-4">
        <Eyebrow>Get in touch</Eyebrow>
        <h1 className="text-navy mb-8 font-serif text-[clamp(2rem,4vw,3rem)] font-semibold">
          We&apos;d love to hear from you
        </h1>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
        <div>
          <h2 className="text-navy mb-4 font-serif text-xl font-semibold">
            {restock ? "Request a restock notification" : "Send a message"}
          </h2>
          <ContactForm
            key={
              restock ? `${restock.productName}:${restock.variantName}:${restock.sku}` : "contact"
            }
            restock={restock}
          />
        </div>

        <div>
          <h2 className="text-navy mb-4 font-serif text-xl font-semibold">Our locations</h2>
          <div className="space-y-5">
            {locations.map((loc) => (
              <div key={loc.phone} className="border-navy/10 rounded border bg-white p-5">
                <h3 className="text-navy mb-2 font-serif text-lg font-semibold">{loc.label}</h3>
                <p className="text-navy/70 mb-3 flex items-start gap-2 text-sm font-light">
                  <MapPinIcon width={16} height={16} className="text-amber mt-0.5 shrink-0" />
                  <span>
                    {loc.addressLines.join(", ")}, {loc.city}, {loc.state} {loc.postalCode},{" "}
                    {loc.country}
                  </span>
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <a href={`tel:${loc.phone}`} className="text-amber flex items-center gap-1.5">
                    <PhoneIcon width={15} height={15} /> {loc.phone}
                  </a>
                  <a
                    href={loc.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber flex items-center gap-1.5"
                  >
                    <MapPinIcon width={15} height={15} /> Directions
                  </a>
                </div>
                {loc.needsConfirmation && (
                  <p className="text-navy/40 mt-3 text-[11px] font-light italic">
                    Address pending business confirmation before launch.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
