import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { BatchQr } from "./BatchQr";
import type { ProductBatch } from "@/types";

/** Current-batch panel with lab parameters, QR code and verify link (Dev Kit §08). */
export function BatchInfo({ batch }: { batch: ProductBatch }) {
  return (
    <section aria-label="Current batch information" className="rounded border border-navy/10 bg-paper/40 p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-2xl font-semibold text-navy">Current Batch</h2>
        <Link
          href={`/verify/${batch.batchNumber}`}
          className="text-xs font-medium uppercase tracking-[0.14em] text-amber underline-offset-4 hover:underline"
        >
          Verify this batch →
        </Link>
      </div>

      <dl className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-[11px] uppercase tracking-[0.1em] text-navy/45">Batch number</dt>
          <dd className="font-medium text-navy">{batch.batchNumber}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.1em] text-navy/45">Manufactured</dt>
          <dd className="font-medium text-navy">{formatDate(batch.mfgDate)}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.1em] text-navy/45">Best before</dt>
          <dd className="font-medium text-navy">{formatDate(batch.bestBefore)}</dd>
        </div>
      </dl>

      {batch.labParameters.length > 0 && (
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Lab parameters for batch {batch.batchNumber}</caption>
          <thead>
            <tr className="border-b border-navy/10 text-left text-[11px] uppercase tracking-[0.1em] text-navy/45">
              <th scope="col" className="py-2">Parameter</th>
              <th scope="col" className="py-2">Result</th>
              <th scope="col" className="py-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {batch.labParameters.map((p) => (
              <tr key={p.id} className="border-b border-navy/5 last:border-0">
                <td className="py-2.5 font-light text-navy/70">{p.name}</td>
                <td className="py-2.5 font-medium text-navy">{p.result}</td>
                <td className="py-2.5 text-right">
                  <Badge tone={p.status === "Premium" ? "premium" : "success"}>{p.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-5 flex flex-wrap items-start justify-between gap-5">
        <BatchQr batchNumber={batch.batchNumber} size={112} />
        <p className="max-w-xs text-xs font-light text-navy/50">
        {batch.labReportUrl ? (
          <a
            href={batch.labReportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber underline underline-offset-2"
          >
            View full NABL lab report (PDF)
          </a>
        ) : (
          "Full NABL lab report available on request — PDF link pending upload."
        )}
        </p>
      </div>
    </section>
  );
}
