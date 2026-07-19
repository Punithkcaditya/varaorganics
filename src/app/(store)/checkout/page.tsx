import type { Metadata } from "next";
import { Suspense } from "react";
import { Section } from "@/components/ui/layout-primitives";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { getSiteSettings } from "@/features/settings/queries";
import { buildMetadata } from "@/components/seo/metadata";

export const metadata: Metadata = {
  ...buildMetadata({ title: "Checkout", description: "Complete your Vara Organics order.", path: "checkout" }),
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const settings = await getSiteSettings();
  return (
    <Section tone="ivory" ariaLabel="Checkout">
      <h1 className="mb-8 font-serif text-[clamp(2rem,4vw,3rem)] font-semibold text-navy">Checkout</h1>
      <Suspense fallback={<p className="text-navy/50">Loading checkout…</p>}>
        <CheckoutForm freeThreshold={settings.freeShippingThreshold} />
      </Suspense>
    </Section>
  );
}
