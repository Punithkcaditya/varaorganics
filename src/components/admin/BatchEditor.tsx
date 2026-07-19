"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/forms/Field";
import type { LabStatus, Product } from "@/types";

interface ParamRow {
  name: string;
  result: string;
  status: LabStatus;
}

const BLANK: ParamRow = { name: "", result: "", status: "Pass" };

/**
 * Add / update a product batch and its lab parameters. Activating a batch makes
 * it the current one (the API deactivates the product's other batches).
 */
export function BatchEditor({ products }: { products: Product[] }) {
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [batchNumber, setBatchNumber] = useState("");
  const [mfgDate, setMfgDate] = useState("");
  const [bestBefore, setBestBefore] = useState("");
  const [labReportUrl, setLabReportUrl] = useState("");
  const [active, setActive] = useState(true);
  const [params, setParams] = useState<ParamRow[]>([{ ...BLANK }]);
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  function updateParam(i: number, patch: Partial<ParamRow>) {
    setParams((ps) => ps.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }

  async function save() {
    setStatus("saving");
    setMessage(null);
    try {
      const res = await fetch("/api/admin/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          batchNumber,
          mfgDate,
          bestBefore,
          labReportUrl,
          active,
          labParameters: params.filter((p) => p.name.trim() && p.result.trim()),
        }),
      });
      const data = await res.json();
      setStatus(data.ok ? "done" : "error");
      setMessage(
        data.ok ? `Saved batch ${batchNumber}.` : (data.message ?? "Could not save the batch."),
      );
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Product" htmlFor="productId" required>
          <select
            id="productId"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className={inputClass(false)}
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.productName}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Batch number" htmlFor="batchNumber" required>
          <input
            id="batchNumber"
            value={batchNumber}
            onChange={(e) => setBatchNumber(e.target.value)}
            placeholder="GHE-2026-001"
            className={inputClass(false)}
          />
        </Field>
        <Field label="Manufactured" htmlFor="mfgDate" required>
          <input
            id="mfgDate"
            type="date"
            value={mfgDate}
            onChange={(e) => setMfgDate(e.target.value)}
            className={inputClass(false)}
          />
        </Field>
        <Field label="Best before" htmlFor="bestBefore" required>
          <input
            id="bestBefore"
            type="date"
            value={bestBefore}
            onChange={(e) => setBestBefore(e.target.value)}
            className={inputClass(false)}
          />
        </Field>
        <Field label="Lab report PDF URL" htmlFor="labReportUrl" className="sm:col-span-2">
          <input
            id="labReportUrl"
            value={labReportUrl}
            onChange={(e) => setLabReportUrl(e.target.value)}
            placeholder="https://…/lab-report.pdf"
            className={inputClass(false)}
          />
        </Field>
      </div>

      <section aria-label="Lab parameters">
        <h2 className="mb-2 font-serif text-xl font-semibold text-navy">Lab parameters</h2>
        <div className="space-y-2">
          {params.map((p, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto]">
              <input
                aria-label={`Parameter ${i + 1} name`}
                placeholder="Moisture content"
                value={p.name}
                onChange={(e) => updateParam(i, { name: e.target.value })}
                className={inputClass(false)}
              />
              <input
                aria-label={`Parameter ${i + 1} result`}
                placeholder="0.12%"
                value={p.result}
                onChange={(e) => updateParam(i, { result: e.target.value })}
                className={inputClass(false)}
              />
              <select
                aria-label={`Parameter ${i + 1} status`}
                value={p.status}
                onChange={(e) => updateParam(i, { status: e.target.value as LabStatus })}
                className={inputClass(false)}
              >
                <option value="Pass">Pass</option>
                <option value="Premium">Premium</option>
                <option value="Fail">Fail</option>
              </select>
              <button
                type="button"
                onClick={() => setParams((ps) => ps.filter((_, idx) => idx !== i))}
                aria-label={`Remove parameter ${i + 1}`}
                className="rounded-[2px] border border-navy/15 px-3 text-sm text-navy/60 hover:border-danger hover:text-danger"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setParams((ps) => [...ps, { ...BLANK }])}
          className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-amber"
        >
          + Add parameter
        </button>
      </section>

      <label className="flex items-center gap-2 text-sm text-navy">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="accent-navy"
        />
        Make this the current batch (shown on the product page, stamped on new orders)
      </label>

      {message && (
        <p
          role="status"
          className={`rounded p-3 text-sm ${status === "error" ? "bg-danger/5 text-danger" : "bg-success/5 text-success"}`}
        >
          {message}
        </p>
      )}

      <button
        type="button"
        onClick={save}
        disabled={status === "saving" || !batchNumber || !mfgDate || !bestBefore}
        className="rounded-[2px] bg-navy px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-amber disabled:opacity-60"
      >
        {status === "saving" ? "Saving…" : "Save batch"}
      </button>
    </div>
  );
}
