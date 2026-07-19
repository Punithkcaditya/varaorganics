import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { CheckIcon } from "@/components/ui/Icons";
import type {
  ComparisonRow,
  FaqItem,
  PainPointPair,
  ProcessStep,
  ProductBatch,
} from "@/types";

/** Batch lab-report card — reuses the homepage hero card treatment. */
export function LabCard({ batch, productName }: { batch: ProductBatch; productName: string }) {
  return (
    <div className="rounded-lg border border-gold-lt/20 bg-white/[0.06] p-6">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-lt/80">
        Live batch report · {batch.batchNumber}
      </p>
      <p className="mb-5 text-xs font-light text-ivory/45">{productName}</p>
      {batch.labParameters.map((p) => (
        <div
          key={p.id}
          className="flex items-center justify-between gap-3 border-b border-white/5 py-2 text-[13px] last:border-0"
        >
          <span className="font-light text-ivory/55">{p.name}</span>
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
      <p className="mt-4 border-t border-white/5 pt-3 text-[11px] font-light leading-relaxed text-ivory/35">
        NABL-accredited laboratory · Full report accessible by scanning the QR on your jar.
      </p>
    </div>
  );
}

/** Price comparison table. Figures are marketing claims — see data file note. */
export function ComparisonTable({ rows }: { rows: ComparisonRow[] }) {
  if (rows.length === 0) return null;
  return (
    <section className="bg-white px-6 py-16 md:px-[8%]" aria-label="How Vara compares">
      <div className="mx-auto max-w-[900px]">
        <h2 className="mb-8 text-center font-serif text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold text-navy">
          How Vara compares
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-navy/15 text-left text-[11px] uppercase tracking-[0.1em] text-navy/50">
                <th scope="col" className="py-3 pr-4">Brand</th>
                <th scope="col" className="py-3 pr-4">Price per litre</th>
                <th scope="col" className="py-3">Lab tested</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.brand}
                  className={`border-b border-navy/5 ${row.isUs ? "bg-gold-lt/10" : ""}`}
                >
                  <td className={`py-3 pr-4 ${row.isUs ? "font-semibold text-navy" : "text-navy/75"}`}>
                    {row.brand}
                  </td>
                  <td className="py-3 pr-4 font-medium text-navy">{row.price}</td>
                  <td className="py-3 text-navy/70">{row.labTested}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-center text-sm italic text-navy/55">
          Every brand claims pure. Only Vara shows the proof.
        </p>
      </div>
    </section>
  );
}

/** Two-column problem → answer comparison. */
export function PainPointColumns({ pairs }: { pairs: PainPointPair[] }) {
  if (pairs.length === 0) return null;
  return (
    <section className="bg-ivory px-6 py-16 md:px-[8%]" aria-label="What most brands do versus Vara">
      <div className="mx-auto grid max-w-[900px] gap-5 md:grid-cols-2">
        <div className="rounded border border-danger/20 bg-danger/[0.03] p-7">
          <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-danger">
            What most brands do
          </h2>
          <ul className="space-y-3.5">
            {pairs.map((p) => (
              <li key={p.problem} className="flex gap-2.5 text-[14px] font-light text-navy/70">
                <span aria-hidden="true" className="text-danger">✗</span>
                {p.problem}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded border border-success/20 bg-success/[0.03] p-7">
          <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-success">
            What Vara does
          </h2>
          <ul className="space-y-3.5">
            {pairs.map((p) => (
              <li key={p.answer} className="flex gap-2.5 text-[14px] font-light text-navy/70">
                <span aria-hidden="true" className="text-success">✓</span>
                {p.answer}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** Founder story block. */
export function StorySection({
  heading,
  copy,
  attribution,
}: {
  heading: string;
  copy: string;
  attribution: string | null;
}) {
  return (
    <section className="bg-ivory px-6 py-16 md:px-[8%]" aria-label={heading}>
      <div className="mx-auto max-w-[520px]">
        <h2 className="mb-6 font-serif text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold text-navy">
          {heading}
        </h2>
        {copy.split("\n\n").map((para) => (
          <p key={para.slice(0, 32)} className="mb-4 text-[15px] font-light leading-relaxed text-navy/75">
            {para}
          </p>
        ))}
        {attribution && (
          <div className="mt-6 flex items-center gap-3">
            {/* Founder photo placeholder until a real image is supplied. */}
            <span
              aria-hidden="true"
              className="h-12 w-12 shrink-0 rounded-full border border-navy/15 bg-paper"
            />
            <p className="text-sm italic text-navy/55">{attribution}</p>
          </div>
        )}
      </div>
    </section>
  );
}

/** 4-step how-it-works. */
export function ProcessSteps({ steps }: { steps: ProcessStep[] }) {
  if (steps.length === 0) return null;
  return (
    <section className="bg-paper px-6 py-16 md:px-[8%]" aria-label="How it works">
      <div className="mx-auto max-w-[1000px]">
        <h2 className="mb-10 text-center font-serif text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold text-navy">
          How it works
        </h2>
        <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="text-center">
              <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border-[1.5px] border-amber bg-white font-serif text-lg font-semibold text-amber">
                {i + 1}
              </span>
              <h3 className="mb-2 font-serif text-base font-semibold text-navy">{step.title}</h3>
              <p className="text-[13px] font-light leading-relaxed text-navy/60">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Honest "we're new" block. */
export function HonestSection({ copy }: { copy: string }) {
  return (
    <section className="bg-white px-6 py-16 md:px-[8%]" aria-label="An honest note">
      <div className="mx-auto max-w-[520px] text-center">
        {copy.split("\n\n").map((para, i) => (
          <p
            key={para.slice(0, 32)}
            className={
              i === 0
                ? "mb-4 font-serif text-2xl font-semibold text-navy"
                : "mb-4 text-[15px] font-light leading-relaxed text-navy/70"
            }
          >
            {para}
          </p>
        ))}
      </div>
    </section>
  );
}

/** Trust strip (3 items). */
export function LpTrustStrip({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="border-y border-navy/[0.07] bg-paper px-6 py-5">
      <ul className="mx-auto flex max-w-[900px] flex-wrap items-center justify-center gap-x-8 gap-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.1em] text-navy/65"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckIcon width={10} height={10} />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Landing-page FAQ (plain details/summary — no schema, page is noindex). */
export function LpFaq({ faqs }: { faqs: FaqItem[] }) {
  if (faqs.length === 0) return null;
  return (
    <section className="bg-ivory px-6 py-16 md:px-[8%]" aria-label="Questions">
      <div className="mx-auto max-w-[680px]">
        <h2 className="mb-6 font-serif text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold text-navy">
          Questions, answered
        </h2>
        <div className="divide-y divide-navy/10 border-y border-navy/10">
          {faqs.map((faq) => (
            <details key={faq.question} className="group py-4">
              <summary className="cursor-pointer list-none font-sans text-[15px] font-medium text-navy marker:hidden">
                {faq.question}
              </summary>
              <p className="pt-3 text-sm font-light leading-relaxed text-navy/65">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Optional hero image slot. */
export function LpHeroImage({ src, alt }: { src: string | null; alt: string }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-lg border border-gold-lt/20">
      {src ? (
        <Image src={src} alt={alt} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center bg-white/5">
          <Badge tone="muted">Image</Badge>
        </div>
      )}
    </div>
  );
}
