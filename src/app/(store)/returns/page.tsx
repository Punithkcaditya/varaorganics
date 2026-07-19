import type { Metadata } from "next";
import { ContentPage } from "@/components/ui/ContentPage";
import { buildMetadata } from "@/components/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Returns Policy",
  description: "Vara Organics 7-day returns policy and how to request a return or refund.",
  path: "returns",
});

export default function ReturnsPage() {
  return (
    <ContentPage eyebrow="Help" title="Returns Policy" path="returns">
      <p className="text-sm italic text-navy/50">
        Placeholder policy — final terms to be confirmed by Varixa Global before launch.
      </p>
      <h2>7-day returns</h2>
      <p>If you&apos;re not satisfied, you can request a return within 7 days of delivery.</p>
      <h2>Eligibility</h2>
      <p>For food-safety reasons, returns are assessed case by case. Contact us and we&apos;ll make it right.</p>
      <h2>Refunds</h2>
      <p>Approved refunds are processed to your original payment method. COD refunds are made by bank transfer.</p>
      <h2>How to request</h2>
      <p>Please <a href="/contact">contact us</a> with your order number to start a return.</p>
    </ContentPage>
  );
}
