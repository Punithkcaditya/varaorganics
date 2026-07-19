import { ButtonLink } from "@/components/ui/Button";

/** Navy verify CTA used on the Learn hub (Learn Brief §04). */
export function VerifyCTA() {
  return (
    <section className="rounded bg-navy px-6 py-10 text-center md:px-10" aria-label="Verify your batch">
      <h2 className="mb-3 font-serif text-2xl font-semibold text-ivory">
        Scan the QR on any Vara jar
      </h2>
      <p className="mx-auto mb-6 max-w-md text-sm font-light text-ivory/65">
        See the exact batch lab report for the product in your hand — not a generic certificate.
      </p>
      <ButtonLink href="/lab-reports" variant="gold">
        See lab reports
      </ButtonLink>
    </section>
  );
}
