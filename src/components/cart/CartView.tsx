"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/features/cart/store";
import { computeTotals } from "@/features/cart/selectors";
import { useHydrated } from "@/lib/useHydrated";
import { formatPrice } from "@/lib/utils";
import { MinusIcon, PlusIcon, CloseIcon } from "@/components/ui/Icons";
import { ButtonLink } from "@/components/ui/Button";

/** Cart page contents. Reads the persisted store; guards hydration. */
export function CartView({ freeThreshold }: { freeThreshold: number }) {
  const { items, updateQuantity, removeItem } = useCart();
  const hydrated = useHydrated();

  if (!hydrated) {
    return <p className="py-16 text-navy/50">Loading your cart…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="mb-6 text-lg font-light text-navy/60">Your cart is empty.</p>
        <ButtonLink href="/shop">Shop products</ButtonLink>
      </div>
    );
  }

  const totals = computeTotals(items, freeThreshold);
  const remaining = freeThreshold - totals.subtotal;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <ul className="divide-y divide-navy/10 border-y border-navy/10">
        {items.map((item) => (
          <li key={item.variantId} className="flex gap-4 py-5">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded border border-navy/10 bg-ivory">
              {item.image && (
                <Image src={item.image} alt={item.productName} fill sizes="96px" className="object-cover" />
              )}
            </div>
            <div className="flex flex-1 flex-col">
              <div className="flex justify-between gap-3">
                <div>
                  <h2 className="font-serif text-lg font-semibold text-navy">{item.productName}</h2>
                  <p className="text-sm font-light text-navy/55">{item.size}</p>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${item.productName} from cart`}
                  onClick={() => removeItem(item.variantId)}
                  className="h-fit p-1 text-navy/40 hover:text-danger"
                >
                  <CloseIcon width={18} height={18} />
                </button>
              </div>
              <div className="mt-auto flex items-center justify-between pt-3">
                <div className="flex items-center overflow-hidden rounded-[2px] border border-navy/15">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                    className="flex h-9 w-9 items-center justify-center text-navy hover:bg-navy/5"
                  >
                    <MinusIcon width={15} height={15} />
                  </button>
                  <span className="flex h-9 w-10 items-center justify-center text-sm text-navy">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    className="flex h-9 w-9 items-center justify-center text-navy hover:bg-navy/5"
                  >
                    <PlusIcon width={15} height={15} />
                  </button>
                </div>
                <p className="font-medium text-navy">{formatPrice(item.price * item.quantity)}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit rounded border border-navy/10 bg-paper/40 p-6">
        <h2 className="mb-4 font-serif text-xl font-semibold text-navy">Order Summary</h2>
        {remaining > 0 && (
          <p className="mb-4 rounded bg-white p-3 text-xs font-light text-navy/60">
            Add {formatPrice(remaining)} more for free Bengaluru delivery.
          </p>
        )}
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-navy/60">Subtotal</dt>
            <dd className="font-medium text-navy">{formatPrice(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-navy/60">Shipping</dt>
            <dd className="font-medium text-navy">
              {totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}
            </dd>
          </div>
          <div className="flex justify-between border-t border-navy/10 pt-3 text-base">
            <dt className="font-medium text-navy">Total</dt>
            <dd className="font-serif text-xl font-semibold text-navy">{formatPrice(totals.total)}</dd>
          </div>
        </dl>
        <ButtonLink href="/checkout" className="mt-6 w-full">
          Proceed to Checkout
        </ButtonLink>
        <Link href="/shop" className="mt-3 block text-center text-xs text-navy/50 hover:text-amber">
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
