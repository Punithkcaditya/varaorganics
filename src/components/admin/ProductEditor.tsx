"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/forms/Field";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types";

/**
 * Product copy + variant price/stock editor.
 *
 * Slugs and SKUs are intentionally read-only: slugs are fixed by the SEO URL
 * structure, and SKUs are referenced by historical orders.
 */
export function ProductEditor({ product }: { product: Product }) {
  const [shortDescription, setShortDescription] = useState(product.shortDescription);
  const [longDescription, setLongDescription] = useState(product.longDescription);
  const [metaTitle, setMetaTitle] = useState(product.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(product.metaDescription ?? "");
  const [active, setActive] = useState(product.active);
  const [featured, setFeatured] = useState(product.featured);
  const [variants, setVariants] = useState(
    product.variants.map((v) => ({ id: v.id, sku: v.sku, size: v.size, price: v.price, stock: v.stock, active: v.active })),
  );
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  function updateVariant(id: string, patch: Partial<(typeof variants)[number]>) {
    setVariants((vs) => vs.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }

  async function save() {
    setStatus("saving");
    setMessage(null);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          shortDescription,
          longDescription,
          metaTitle,
          metaDescription,
          active,
          featured,
          variants: variants.map((v) => ({
            id: v.id,
            price: Number(v.price),
            stock: Number(v.stock),
            active: v.active,
          })),
        }),
      });
      const data = await res.json();
      setStatus(data.ok ? "done" : "error");
      setMessage(data.ok ? "Saved. Live pages refreshed." : (data.message ?? "Could not save."));
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="space-y-5">
      <Field label="Short description (above the fold)" htmlFor="shortDescription" required>
        <textarea
          id="shortDescription"
          rows={2}
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          className={inputClass(false)}
        />
      </Field>

      <Field label="Long description (Markdown)" htmlFor="longDescription" required>
        <textarea
          id="longDescription"
          rows={10}
          value={longDescription}
          onChange={(e) => setLongDescription(e.target.value)}
          className={`${inputClass(false)} font-mono text-xs`}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Meta title (SEO)" htmlFor="metaTitle">
          <input
            id="metaTitle"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            className={inputClass(false)}
          />
        </Field>
        <Field label="Meta description (SEO)" htmlFor="metaDescription">
          <input
            id="metaDescription"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            className={inputClass(false)}
          />
        </Field>
      </div>

      <section aria-label="Variants">
        <h2 className="mb-2 font-serif text-xl font-semibold text-navy">Sizes, price & stock</h2>
        <div className="overflow-x-auto rounded border border-navy/10 bg-white">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-navy/10 text-left text-[11px] uppercase tracking-[0.1em] text-navy/45">
                <th scope="col" className="px-3 py-2">Size</th>
                <th scope="col" className="px-3 py-2">SKU</th>
                <th scope="col" className="px-3 py-2">Price (₹)</th>
                <th scope="col" className="px-3 py-2">Stock</th>
                <th scope="col" className="px-3 py-2">Sellable</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v.id} className="border-b border-navy/5 last:border-0">
                  <td className="px-3 py-2 font-medium text-navy">{v.size}</td>
                  <td className="px-3 py-2 font-mono text-xs text-navy/55">{v.sku}</td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      aria-label={`Price for ${v.size}`}
                      value={v.price}
                      onChange={(e) => updateVariant(v.id, { price: Number(e.target.value) })}
                      className="w-28 rounded-[2px] border border-navy/15 px-2 py-1.5 text-sm"
                    />
                    <span className="ml-2 text-xs text-navy/45">{formatPrice(v.price)}</span>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      aria-label={`Stock for ${v.size}`}
                      value={v.stock}
                      onChange={(e) => updateVariant(v.id, { stock: Number(e.target.value) })}
                      className="w-24 rounded-[2px] border border-navy/15 px-2 py-1.5 text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      aria-label={`${v.size} sellable`}
                      checked={v.active}
                      onChange={(e) => updateVariant(v.id, { active: e.target.checked })}
                      className="accent-navy"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-navy">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-navy" />
          Visible on the site
        </label>
        <label className="flex items-center gap-2 text-sm text-navy">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="accent-navy" />
          Featured (homepage hero)
        </label>
      </div>

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
        disabled={status === "saving"}
        className="rounded-[2px] bg-navy px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-amber disabled:opacity-60"
      >
        {status === "saving" ? "Saving…" : "Save product"}
      </button>
    </div>
  );
}
