import { ButtonLink } from "@/components/ui/Button";
import { LAB_REPORTS_PATH } from "@/config/routes";

/** Navy verify CTA used on the Learn hub (Learn Brief §04). */
export function VerifyCTA() {
  return (
    <section
      className="bg-navy rounded px-6 py-10 text-center md:px-10"
      aria-label="Verify your batch"
    >
      <h2 className="text-ivory mb-3 font-serif text-2xl font-semibold">
        Scan the QR on any Vara jar
      </h2>
      <p className="text-ivory/65 mx-auto mb-6 max-w-md text-sm font-light">
        See the exact batch lab report for the product in your hand — not a generic certificate.
      </p>
      <ButtonLink href={LAB_REPORTS_PATH} variant="gold">
        See lab reports
      </ButtonLink>
    </section>
  );
}
