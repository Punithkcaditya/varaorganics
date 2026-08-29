import { Section, Eyebrow } from "@/components/ui/layout-primitives";
import { ButtonLink } from "@/components/ui/Button";
import { LAB_REPORTS_PATH } from "@/config/routes";

const steps = [
  {
    title: "Receive your Vara jar",
    body: "Every jar has a unique QR code on the label — not a generic brand QR, a batch-specific one tied to the product you're holding.",
  },
  {
    title: "Scan and see your exact report",
    body: "Lab parameters from an NABL-accredited lab for that specific batch. Antibiotics, heavy metals, adulteration, fatty-acid profile — all visible, nothing hidden.",
  },
  {
    title: "Keep us accountable, always",
    body: "If a batch ever fails, it never ships. The QR shows only passing batches. Unlike most promises in food, this one is checkable.",
  },
];

/** QR proof section (design). Static, links to /verify. */
export function QRProof() {
  return (
    <Section tone="paper" ariaLabel="Transparency you can verify">
      <Eyebrow>Transparency you can verify</Eyebrow>
      <h2 className="text-navy font-serif text-[clamp(1.75rem,3.5vw,2.875rem)] leading-tight font-semibold">
        Scan before you buy. <em className="text-amber italic">Trust, then purchase.</em>
      </h2>

      <div className="mt-12 grid items-center gap-12 md:grid-cols-2 md:gap-16">
        <div className="border-navy/10 flex flex-col items-center gap-5 rounded-lg border bg-white p-8">
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Sample QR code linking to a batch lab report"
          >
            <rect width="120" height="120" fill="#15284C" rx="8" />
            <rect
              x="10"
              y="10"
              width="40"
              height="40"
              fill="none"
              stroke="#F4BE45"
              strokeWidth="4"
              rx="3"
            />
            <rect x="18" y="18" width="24" height="24" fill="#F4BE45" rx="1" />
            <rect
              x="70"
              y="10"
              width="40"
              height="40"
              fill="none"
              stroke="#F4BE45"
              strokeWidth="4"
              rx="3"
            />
            <rect x="78" y="18" width="24" height="24" fill="#F4BE45" rx="1" />
            <rect
              x="10"
              y="70"
              width="40"
              height="40"
              fill="none"
              stroke="#F4BE45"
              strokeWidth="4"
              rx="3"
            />
            <rect x="18" y="78" width="24" height="24" fill="#F4BE45" rx="1" />
            <rect x="70" y="70" width="8" height="8" fill="#F4BE45" rx="1" />
            <rect x="82" y="70" width="8" height="8" fill="#F4BE45" rx="1" />
            <rect x="70" y="82" width="8" height="8" fill="#F4BE45" rx="1" />
            <rect x="94" y="70" width="16" height="8" fill="#F4BE45" rx="1" />
            <rect x="56" y="10" width="8" height="8" fill="#F4BE45" rx="1" />
            <rect x="56" y="38" width="8" height="8" fill="#F4BE45" rx="1" />
            <rect x="10" y="56" width="8" height="8" fill="#F4BE45" rx="1" />
            <rect x="38" y="56" width="8" height="8" fill="#F4BE45" rx="1" />
          </svg>
          <p className="text-navy/65 text-center text-sm font-light">
            <strong className="text-navy mb-1 block text-[15px]">Scan a live batch report</strong>
            Every Vara jar ships with its own QR code.
          </p>
          <ButtonLink href={LAB_REPORTS_PATH} variant="ghost">
            See lab reports
          </ButtonLink>
        </div>

        <ol className="flex flex-col gap-5">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-4">
              <span className="bg-navy text-ivory flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-serif text-[15px] font-semibold">
                {i + 1}
              </span>
              <div>
                <h3 className="text-navy mb-1 font-serif text-[17px] font-semibold">
                  {step.title}
                </h3>
                <p className="text-navy/60 text-[13.5px] leading-relaxed font-light">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
