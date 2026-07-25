import type { ComponentType } from "react";
import { Section, Eyebrow } from "@/components/ui/layout-primitives";
import { SproutIcon, LogIcon, FlaskIcon, QrIcon } from "@/components/ui/Icons";
import type { Product } from "@/types";

type Icon = ComponentType<{ width?: number; height?: number; className?: string }>;

const features: { Icon: Icon; title: string; body: string }[] = [
  {
    Icon: SproutIcon,
    title: "Direct from source farms",
    body: "Own-herd A2 Gir cows in Rajasthan. No brokers, no aggregators — a name behind every litre.",
  },
  {
    Icon: LogIcon,
    title: "Ghani-pressed, not cold-pressed",
    body: "Our oils use the traditional wooden ghani method. The wood absorbs heat and friction differently, preserving flavour compounds machines destroy.",
  },
  {
    Icon: FlaskIcon,
    title: "NABL testing, every batch",
    body: "Every batch tested across many parameters — antibiotics, heavy metals, adulteration. We publish the report on the jar.",
  },
  {
    Icon: QrIcon,
    title: "QR-traced to this exact batch",
    body: "Scan the QR on any Vara jar and see the lab report for that specific batch — not a generic certificate.",
  },
];

/** Dark "Why Vara" section with a sample lab card built from real batch data. */
export function WhyVara({ product }: { product: Product }) {
  const batch = product.currentBatch;
  return (
    <Section tone="dark" ariaLabel="Why Vara Organics">
      <Eyebrow light>Why Vara</Eyebrow>
      <h2 className="font-serif text-[clamp(1.75rem,3.5vw,2.875rem)] font-semibold leading-tight text-ivory">
        The difference is in <em className="italic text-gold-lt">what we don&apos;t do</em>
      </h2>
      <p className="mt-3 max-w-[540px] text-base font-light leading-relaxed text-ivory/60">
        Pure by nature. Traditional by method. Small-batch by choice. Nothing added, ever.
      </p>

      <div className="mt-12 grid items-start gap-12 md:grid-cols-2 md:gap-16">
        <ul>
          {features.map((f) => (
            <li
              key={f.title}
              className="flex gap-4 border-b border-ivory/10 pb-7 pt-7 first:pt-0 last:border-0 last:pb-0"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold-lt">
                <f.Icon width={20} height={20} />
              </span>
              <div>
                <h3 className="mb-1.5 font-serif text-lg font-semibold text-gold-lt">{f.title}</h3>
                <p className="text-sm font-light leading-relaxed text-ivory/50">{f.body}</p>
              </div>
            </li>
          ))}
        </ul>

        {batch && (
          <div className="rounded-md border border-gold-lt/15 bg-white/[0.04] p-8">
            <h3 className="mb-1 font-serif text-xl font-semibold text-gold-lt">Sample Lab Report</h3>
            <p className="mb-6 text-[11px] font-light text-ivory/35">
              {product.productName} · {batch.batchNumber}
            </p>
            {batch.labParameters.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between border-b border-white/5 py-2 text-[13px] last:border-0"
              >
                <span className="font-light text-ivory/50">{p.name}</span>
                <span className="font-medium text-gold-lt">{p.result}</span>
                <span
                  className={`rounded-[2px] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] ${
                    p.status === "Premium" ? "bg-gold/20 text-gold" : "bg-success/20 text-success-lt"
                  }`}
                >
                  {p.status}
                </span>
              </div>
            ))}
            <p className="mt-4 border-t border-white/5 pt-3.5 text-[11px] font-light leading-relaxed text-ivory/30">
              NABL-accredited laboratory · Full report accessible by scanning the QR on each product ·
              Batch-specific, not generic.
            </p>
          </div>
        )}
      </div>
    </Section>
  );
}
