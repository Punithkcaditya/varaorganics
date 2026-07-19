import { Section, Eyebrow } from "@/components/ui/layout-primitives";

const steps = [
  {
    title: "Farm Sourcing",
    body: "A2 Gir cows at source farms in Rajasthan. Milk collected at dawn from known animals on known land.",
  },
  {
    title: "Bilona Method",
    body: "Curd churned by hand into butter. Butter slow-cooked on wood fire into ghee. No machines. No shortcuts.",
  },
  {
    title: "NABL Lab Testing",
    body: "Every batch tested across many parameters. Released only on full clearance — nothing waived, nothing skipped.",
  },
  {
    title: "Delivered to You",
    body: "Bottled fresh under Vara Organics. QR on every jar. Bengaluru delivery in 48 hours.",
  },
];

/** 4-step farm-to-kitchen process (design). */
export function Process() {
  return (
    <Section tone="white" ariaLabel="From farm to kitchen">
      <Eyebrow>From Farm to Kitchen</Eyebrow>
      <h2 className="font-serif text-[clamp(1.75rem,3.5vw,2.875rem)] font-semibold leading-tight text-navy">
        Rajasthan to your <em className="italic text-amber">Bengaluru table</em>
      </h2>
      <ol className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
        {steps.map((step, i) => (
          <li key={i} className="text-center">
            <span className="mx-auto mb-4 flex h-13 w-13 items-center justify-center rounded-full border-[1.5px] border-amber bg-white font-serif text-[17px] font-semibold text-amber [block-size:3.25rem] [inline-size:3.25rem]">
              {i + 1}
            </span>
            <h3 className="mb-1.5 font-serif text-[15px] font-semibold text-navy">{step.title}</h3>
            <p className="text-[12.5px] font-light leading-relaxed text-navy/55">{step.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
