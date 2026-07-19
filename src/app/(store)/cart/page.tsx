import type { Metadata } from "next";
import { Section } from "@/components/ui/layout-primitives";
import { CartView } from "@/components/cart/CartView";
import { getSiteSettings } from "@/features/settings/queries";
import { buildMetadata } from "@/components/seo/metadata";

export const metadata: Metadata = {
  ...buildMetadata({ title: "Your Cart", description: "Review your Vara Organics cart.", path: "cart" }),
  robots: { index: false, follow: true },
};

export default async function CartPage() {
  const settings = await getSiteSettings();
  return (
    <Section tone="ivory" ariaLabel="Your cart">
      <h1 className="mb-8 font-serif text-[clamp(2rem,4vw,3rem)] font-semibold text-navy">Your Cart</h1>
      <CartView freeThreshold={settings.freeShippingThreshold} />
    </Section>
  );
}
