import type { Metadata } from "next";
import { ContentPage } from "@/components/ui/ContentPage";
import { buildMetadata } from "@/components/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Shipping Policy",
  description: "Vara Organics shipping timelines, charges and coverage across India.",
  path: "shipping",
});

export default function ShippingPage() {
  return (
    <ContentPage eyebrow="Help" title="Shipping Policy" path="shipping">
      <p className="text-sm italic text-navy/50">
        Placeholder policy — final timelines and charges to be confirmed before launch.
      </p>
      <h2>Coverage</h2>
      <p>We ship across India via our logistics partner, which assigns the best available courier per order.</p>
      <h2>Timelines</h2>
      <p>Bengaluru orders typically ship within 48 hours. Delivery times elsewhere depend on the destination.</p>
      <h2>Charges</h2>
      <p>Free delivery in Bengaluru on orders above &#8377;999. Charges for other orders are shown at checkout.</p>
      <h2>Tracking</h2>
      <p>You&apos;ll receive a tracking link by email once your order ships.</p>
    </ContentPage>
  );
}
