"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, inputClass } from "@/components/forms/Field";

export function CreateProductForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, price: Number(values.price), stock: Number(values.stock) }),
      });
      const data = await response.json();
      if (!data.ok) {
        setMessage(data.message ?? "Could not add the product.");
        setBusy(false);
        return;
      }
      router.push(`/admin/products/${data.slug}`);
      router.refresh();
    } catch {
      setMessage("Network error. Please try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded border border-navy/10 bg-white p-5 sm:grid-cols-2">
      <Field label="Product name" htmlFor="new-product-name" required>
        <input id="new-product-name" name="productName" required className={inputClass(false)} />
      </Field>
      <Field label="Category" htmlFor="new-product-category" required>
        <select id="new-product-category" name="category" className={inputClass(false)}>
          <option value="ghee">Ghee</option><option value="honey">Honey</option><option value="oils">Oils</option>
        </select>
      </Field>
      <Field label="Size" htmlFor="new-product-size" required>
        <input id="new-product-size" name="size" required placeholder="e.g. 100ml" className={inputClass(false)} />
      </Field>
      <Field label="SKU" htmlFor="new-product-sku" required>
        <input id="new-product-sku" name="sku" required placeholder="e.g. TEST-GHEE-100" className={inputClass(false)} />
      </Field>
      <Field label="Price (₹)" htmlFor="new-product-price" required>
        <input id="new-product-price" name="price" type="number" min={1} step={1} defaultValue={1} required className={inputClass(false)} />
      </Field>
      <Field label="Stock" htmlFor="new-product-stock" required>
        <input id="new-product-stock" name="stock" type="number" min={0} step={1} defaultValue={10} required className={inputClass(false)} />
      </Field>
      <Field label="Image URL (optional)" htmlFor="new-product-image" className="sm:col-span-2">
        <input id="new-product-image" name="imageUrl" placeholder="/products/ghee.jpg" className={inputClass(false)} />
      </Field>
      {message && <p role="alert" className="text-sm text-danger sm:col-span-2">{message}</p>}
      <button disabled={busy} className="rounded-[2px] bg-navy px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-ivory disabled:opacity-50 sm:col-span-2">
        {busy ? "Adding…" : "Add product"}
      </button>
    </form>
  );
}