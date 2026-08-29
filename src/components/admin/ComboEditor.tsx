"use client";

import { useMemo, useState } from "react";
import { Field, inputClass } from "@/components/forms/Field";
import { formatPrice } from "@/lib/utils";
import type { AdminCombo } from "@/features/combos/queries";
import type { ComboContentItem, Product } from "@/types";

type SaveStatus = "idle" | "saving" | "done" | "error";

function optionValue(productSlug: string, variant: string) {
  return `${productSlug}|||${variant}`;
}

export function ComboEditor({ combo, products }: { combo: AdminCombo; products: Product[] }) {
  const [names, setNames] = useState({
    english: combo.names.english,
    kannada: combo.names.kannada,
    hindi: combo.names.hindi,
    telugu: combo.names.telugu,
    tamil: combo.names.tamil,
    malayalam: combo.nameMalayalam,
  });
  const [tagline, setTagline] = useState(combo.tagline);
  const [contents, setContents] = useState(combo.contents);
  const [mrpIndividual, setMrpIndividual] = useState(combo.mrpIndividual);
  const [comboPrice, setComboPrice] = useState(combo.comboPrice);
  const [badgeText, setBadgeText] = useState(combo.badgeText ?? "");
  const [badgeColor, setBadgeColor] = useState(combo.badgeColor);
  const [ctaText, setCtaText] = useState(combo.ctaText);
  const [isGiftWrapped, setGiftWrapped] = useState(combo.isGiftWrapped);
  const [isExport, setExport] = useState(combo.isExport);
  const [sortOrder, setSortOrder] = useState(combo.sortOrder);
  const [published, setPublished] = useState(combo.published);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const productOptions = useMemo(
    () =>
      products.flatMap((product) =>
        product.variants.map((variant) => ({
          value: optionValue(product.slug, variant.size),
          productSlug: product.slug,
          productName: product.productName,
          variant: variant.size,
          label: `${product.productName} · ${variant.size}${variant.active ? "" : " (hidden)"}`,
        })),
      ),
    [products],
  );

  const extras = [
    {
      value: optionValue("gift-wrap", "1"),
      productSlug: "gift-wrap",
      productName: "Gift wrapping",
      variant: "1",
      label: "Gift wrapping",
    },
    {
      value: optionValue("gift-card", "1"),
      productSlug: "gift-card",
      productName: "Handwritten card",
      variant: "1",
      label: "Handwritten card",
    },
  ];
  const allOptions = [...productOptions, ...extras];
  const saving = Math.max(0, mrpIndividual - comboPrice);

  function setName(key: keyof typeof names, value: string) {
    setNames((current) => ({ ...current, [key]: value }));
  }

  function updateContent(index: number, patch: Partial<ComboContentItem>) {
    setContents((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    );
  }

  function selectContent(index: number, value: string) {
    const selected = allOptions.find((option) => option.value === value);
    if (!selected) return;
    updateContent(index, {
      productSlug: selected.productSlug,
      productName: selected.productName,
      variant: selected.variant,
    });
  }

  async function save() {
    setStatus("saving");
    setMessage(null);
    try {
      const res = await fetch("/api/admin/combos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: combo.id,
          checkoutSku: combo.checkout.sku,
          nameEnglish: names.english,
          nameKannada: names.kannada,
          nameHindi: names.hindi,
          nameTelugu: names.telugu,
          nameTamil: names.tamil,
          nameMalayalam: names.malayalam,
          tagline,
          contents,
          mrpIndividual: Number(mrpIndividual),
          comboPrice: Number(comboPrice),
          badgeText,
          badgeColor,
          ctaText,
          isGiftWrapped,
          isExport,
          sortOrder: Number(sortOrder),
          published,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      setStatus(data.ok ? "done" : "error");
      setMessage(
        data.ok
          ? "Combo saved. Homepage and combo page refreshed."
          : (data.message ?? "Could not save combo."),
      );
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="space-y-7">
      <section className="border-navy/10 rounded border bg-white p-5">
        <h2 className="text-navy mb-4 font-serif text-xl font-semibold">Names</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {(Object.keys(names) as (keyof typeof names)[]).map((key) => (
            <Field
              key={key}
              label={key.charAt(0).toUpperCase() + key.slice(1)}
              htmlFor={`name-${key}`}
              required={key === "english"}
            >
              <input
                id={`name-${key}`}
                value={names[key]}
                onChange={(event) => setName(key, event.target.value)}
                className={inputClass(false)}
              />
            </Field>
          ))}
        </div>
        <Field label="Tagline" htmlFor="tagline" required className="mt-4">
          <textarea
            id="tagline"
            rows={3}
            value={tagline}
            onChange={(event) => setTagline(event.target.value)}
            className={inputClass(false)}
          />
        </Field>
      </section>

      <section className="border-navy/10 rounded border bg-white p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-navy font-serif text-xl font-semibold">Products inside</h2>
            <p className="text-navy/50 mt-1 text-xs">
              Stock for these exact sizes is checked before payment and reduced after a successful
              order.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setContents((current) => [
                ...current,
                {
                  productSlug: products[0]?.slug ?? "",
                  productName: products[0]?.productName ?? "",
                  variant: products[0]?.variants[0]?.size ?? "1",
                  qty: 1,
                },
              ])
            }
            className="text-amber shrink-0 text-xs font-semibold hover:underline"
          >
            + Add item
          </button>
        </div>
        <div className="space-y-3">
          {contents.map((item, index) => (
            <div
              key={`${index}-${item.productSlug}-${item.variant}`}
              className="bg-paper/50 grid gap-3 rounded p-3 sm:grid-cols-[1fr_90px_auto] sm:items-end"
            >
              <Field label={`Item ${index + 1}`} htmlFor={`content-${index}`}>
                <select
                  id={`content-${index}`}
                  value={optionValue(item.productSlug, item.variant)}
                  onChange={(event) => selectContent(index, event.target.value)}
                  className={inputClass(false)}
                >
                  {!allOptions.some(
                    (option) => option.value === optionValue(item.productSlug, item.variant),
                  ) && (
                    <option value={optionValue(item.productSlug, item.variant)}>
                      {item.productName} · {item.variant}
                    </option>
                  )}
                  {allOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Qty" htmlFor={`qty-${index}`}>
                <input
                  id={`qty-${index}`}
                  type="number"
                  min={1}
                  max={20}
                  value={item.qty}
                  onChange={(event) => updateContent(index, { qty: Number(event.target.value) })}
                  className={inputClass(false)}
                />
              </Field>
              <button
                type="button"
                onClick={() =>
                  setContents((current) => current.filter((_, itemIndex) => itemIndex !== index))
                }
                disabled={contents.length === 1}
                className="text-danger h-10 px-2 text-xs font-semibold disabled:opacity-30"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="border-navy/10 rounded border bg-white p-5">
        <h2 className="text-navy mb-4 font-serif text-xl font-semibold">Price and presentation</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Individual MRP total (₹)" htmlFor="mrp" required>
            <input
              id="mrp"
              type="number"
              min={1}
              value={mrpIndividual}
              onChange={(event) => setMrpIndividual(Number(event.target.value))}
              className={inputClass(false)}
            />
          </Field>
          <Field label="Combo price (₹)" htmlFor="combo-price" required>
            <input
              id="combo-price"
              type="number"
              min={1}
              value={comboPrice}
              onChange={(event) => setComboPrice(Number(event.target.value))}
              className={inputClass(false)}
            />
          </Field>
          <Field label="Saving (automatic)" htmlFor="saving">
            <input
              id="saving"
              readOnly
              value={`${formatPrice(saving)}`}
              className={`${inputClass(false)} bg-paper/60`}
            />
          </Field>
          <Field label="Order" htmlFor="sort-order">
            <input
              id="sort-order"
              type="number"
              min={0}
              value={sortOrder}
              onChange={(event) => setSortOrder(Number(event.target.value))}
              className={inputClass(false)}
            />
          </Field>
          <Field label="Badge text" htmlFor="badge-text">
            <input
              id="badge-text"
              value={badgeText}
              onChange={(event) => setBadgeText(event.target.value)}
              className={inputClass(false)}
            />
          </Field>
          <Field label="Badge colour" htmlFor="badge-color">
            <select
              id="badge-color"
              value={badgeColor}
              onChange={(event) => setBadgeColor(event.target.value as typeof badgeColor)}
              className={inputClass(false)}
            >
              <option value="amber">Amber</option>
              <option value="green">Green</option>
              <option value="gold">Gold</option>
              <option value="blue">Blue</option>
            </select>
          </Field>
          <Field label="Button text" htmlFor="cta-text">
            <input
              id="cta-text"
              value={ctaText}
              onChange={(event) => setCtaText(event.target.value)}
              className={inputClass(false)}
            />
          </Field>
          <Field label="Checkout SKU (fixed)" htmlFor="checkout-sku">
            <input
              id="checkout-sku"
              readOnly
              value={combo.checkout.sku}
              className={`${inputClass(false)} bg-paper/60 font-mono`}
            />
          </Field>
        </div>
      </section>

      <div className="border-navy/10 flex flex-wrap gap-6 rounded border bg-white p-5">
        <label className="text-navy flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={published}
            onChange={(event) => setPublished(event.target.checked)}
            className="accent-navy"
          />{" "}
          Published on site
        </label>
        <label className="text-navy flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isGiftWrapped}
            onChange={(event) => setGiftWrapped(event.target.checked)}
            className="accent-navy"
          />{" "}
          Gift wrapped
        </label>
        <label className="text-navy flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isExport}
            onChange={(event) => setExport(event.target.checked)}
            className="accent-navy"
          />{" "}
          Export special
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
        className="bg-navy text-ivory hover:bg-amber rounded-[2px] px-8 py-3.5 text-xs font-semibold tracking-[0.16em] uppercase transition-colors disabled:opacity-60"
      >
        {status === "saving" ? "Saving…" : "Save combo"}
      </button>
    </div>
  );
}
