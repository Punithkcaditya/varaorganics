import type { Metadata } from "next";
import { ContentPage } from "@/components/ui/ContentPage";
import { buildMetadata } from "@/components/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Our Story",
  description:
    "Vara Organics by Varixa Global brings pure A2 Bilona ghee, wood-pressed oils and raw wild honey from Indian farms to Bengaluru kitchens.",
  path: "our-story",
});

export default function OurStoryPage() {
  return (
    <ContentPage eyebrow="Our Story" title="Traditional food, honestly made" path="our-story">
      <p>
        Vara Organics is a direct-to-consumer brand by Varixa Global, bringing pure A2 Gir cow Bilona
        ghee, wood-pressed oils and raw wild forest honey from Indian farms to Bengaluru kitchens.
      </p>
      <h2>Why we started</h2>
      <p>
        Too many &ldquo;pure&rdquo; foods are anything but. Ghee blended with cheaper fats, oils run
        through steel machines and sold as traditional, honey cut with syrup. The label says one
        thing; the lab says another — and you never see the lab.
      </p>
      <h2>What we do differently</h2>
      <p>
        We work with traditional methods — hand-churned bilona ghee, wooden-ghani-pressed oils — in
        small batches. Every batch is independently NABL lab-tested before it ships, and every jar
        carries a QR code linking to the report for that exact batch.
      </p>
      <h2>Our promise</h2>
      <p>
        We&apos;re a new brand and we won&apos;t pretend to have hundreds of reviews yet. What we do
        have is verified supply, published lab reports, and a simple promise: if it isn&apos;t the
        best you&apos;ve had, we&apos;ll make it right.
      </p>
      <p className="text-sm italic text-navy/50">
        Farm and sourcing details are being finalised and will be confirmed here before launch.
      </p>
    </ContentPage>
  );
}
