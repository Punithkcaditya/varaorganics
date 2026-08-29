import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { BatchQr } from "./BatchQr";
import { LAB_REPORTS_PATH } from "@/config/routes";
import type { ProductBatch } from "@/types";

/** Current-batch panel with lab parameters, QR code and verify link (Dev Kit §08). */
export function BatchInfo({ batch }: { batch: ProductBatch }) {
  return (
    <section
      aria-label="Current batch information"
      className="border-navy/10 bg-paper/40 rounded border p-6"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-navy font-serif text-2xl font-semibold">Current Batch</h2>
        <Link
          href={`/verify/${batch.batchNumber}`}
          className="text-amber text-xs font-medium tracking-[0.14em] uppercase underline-offset-4 hover:underline"
        >
          Verify this batch →
        </Link>
      </div>

      <dl className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-navy/45 text-[11px] tracking-[0.1em] uppercase">Batch number</dt>
          <dd className="text-navy font-medium">{batch.batchNumber}</dd>
        </div>
        <div>
          <dt className="text-navy/45 text-[11px] tracking-[0.1em] uppercase">Manufactured</dt>
          <dd className="text-navy font-medium">{formatDate(batch.mfgDate)}</dd>
        </div>
        <div>
          <dt className="text-navy/45 text-[11px] tracking-[0.1em] uppercase">Best before</dt>
          <dd className="text-navy font-medium">{formatDate(batch.bestBefore)}</dd>
        </div>
      </dl>

      {batch.labParameters.length > 0 && (
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Lab parameters for batch {batch.batchNumber}</caption>
          <thead>
            <tr className="border-navy/10 text-navy/45 border-b text-left text-[11px] tracking-[0.1em] uppercase">
              <th scope="col" className="py-2">
                Parameter
              </th>
              <th scope="col" className="py-2">
                Result
              </th>
              <th scope="col" className="py-2 text-right">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {batch.labParameters.map((p) => (
              <tr key={p.id} className="border-navy/5 border-b last:border-0">
                <td className="text-navy/70 py-2.5 font-light">{p.name}</td>
                <td className="text-navy py-2.5 font-medium">{p.result}</td>
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
        <p className="text-navy/50 max-w-xs text-xs font-light">
          <Link
            href={batch.labReportUrl ?? LAB_REPORTS_PATH}
            target={batch.labReportUrl ? "_blank" : undefined}
            rel={batch.labReportUrl ? "noopener noreferrer" : undefined}
            className="text-amber underline underline-offset-2"
          >
            {batch.labReportUrl ? "View this batch report (PDF)" : "View available lab reports"}
          </Link>
        </p>
      </div>
    </section>
  );
}
