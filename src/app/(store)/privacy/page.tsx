import type { Metadata } from "next";
import { ContentPage } from "@/components/ui/ContentPage";
import { buildMetadata } from "@/components/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: "How Vara Organics collects, uses and protects your personal data.",
  path: "privacy",
});

export default function PrivacyPage() {
  return (
    <ContentPage eyebrow="Legal" title="Privacy Policy" path="privacy">
      <p className="text-sm italic text-navy/50">
        Placeholder policy — to be reviewed and finalised by Varixa Global before launch.
      </p>
      <h2>Information we collect</h2>
      <p>
        We collect the details you provide at checkout and via our contact form — name, email,
        phone and delivery address — to process orders and respond to enquiries.
      </p>
      <h2>How we use it</h2>
      <p>
        Your data is used to fulfil orders, arrange delivery through our logistics partner, send
        transactional emails, and provide support. We do not sell your personal data.
      </p>
      <h2>Analytics &amp; cookies</h2>
      <p>
        With your consent, we use analytics cookies to understand site usage. You can decline these
        from the consent banner.
      </p>
      <h2>Contact</h2>
      <p>For any privacy questions, please <a href="/contact">contact us</a>.</p>
    </ContentPage>
  );
}
