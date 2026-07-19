import { Section, Eyebrow } from "@/components/ui/layout-primitives";

const rows = [
  {
    problem: {
      icon: "🏭",
      title: "Adulterated & mislabelled",
      body: '"Pure" ghee blended with cheaper fats. "Cold-pressed" oil that went through steel machines. Honey cut with syrup. The label says one thing; the lab says another — but you never see the lab.',
    },
    answer: {
      icon: "🔬",
      title: "NABL lab tested, every batch",
      body: "Every single batch — independently tested across many parameters before it leaves the farm. Antibiotics, heavy metals, adulteration, fatty-acid profile. You see the actual report for your exact batch.",
    },
  },
  {
    problem: {
      icon: "⚙️",
      title: "Industrial shortcuts",
      body: "Cream separated by centrifuge, not hand-churning. Oils extracted in steel presses at high heat. Faster methods that strip the nutrients, flavour and tradition that made these foods worth eating.",
    },
    answer: {
      icon: "🪵",
      title: "Bilona & wooden ghani — always",
      body: "Curd hand-churned into butter, then slow-cooked on wood fire. Oils extracted on wooden ghanis — a traditional method the wood treats differently than any machine. Small batches only.",
    },
  },
];

/** Two problem→answer rows (design). Static content. */
export function PainPoints() {
  return (
    <Section tone="white" ariaLabel="Why the pantry has a trust problem">
      <Eyebrow>What you&apos;re actually buying elsewhere</Eyebrow>
      <h2 className="font-serif text-[clamp(1.75rem,3.5vw,2.875rem)] font-semibold leading-tight text-navy">
        The pantry has a <em className="italic text-amber">trust problem.</em>
      </h2>
      <p className="mt-3.5 max-w-[540px] text-base font-light leading-relaxed text-navy/65">
        Every label says &ldquo;pure&rdquo;. Most aren&apos;t. Here&apos;s what&apos;s really going
        on — and how Vara fixes it at the source.
      </p>

      <div className="mt-12 space-y-3.5">
        {rows.map((row, i) => (
          <div key={i} className="grid overflow-hidden rounded border border-navy/10 md:grid-cols-[1fr_auto_1fr]">
            <div className="border-b border-navy/10 bg-danger/[0.03] p-7 md:border-b-0">
              <p className="mb-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-danger">
                What most brands do
              </p>
              <span className="mb-3 block text-3xl" aria-hidden="true">
                {row.problem.icon}
              </span>
              <h3 className="mb-2 font-serif text-lg font-semibold text-navy">{row.problem.title}</h3>
              <p className="text-sm font-light leading-relaxed text-navy/60">{row.problem.body}</p>
            </div>
            <div
              className="hidden items-center justify-center bg-amber/[0.04] px-4 text-2xl text-amber md:flex"
              aria-hidden="true"
            >
              →
            </div>
            <div className="bg-success/[0.03] p-7">
              <p className="mb-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-success">
                What Vara does
              </p>
              <span className="mb-3 block text-3xl" aria-hidden="true">
                {row.answer.icon}
              </span>
              <h3 className="mb-2 font-serif text-lg font-semibold text-navy">{row.answer.title}</h3>
              <p className="text-sm font-light leading-relaxed text-navy/60">{row.answer.body}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
