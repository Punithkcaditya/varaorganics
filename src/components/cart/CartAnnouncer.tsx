"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/features/cart/store";
import { cartCount } from "@/features/cart/selectors";

/** Visually-hidden aria-live region announcing cart changes (a11y §19). */
export function CartAnnouncer() {
  const items = useCart((s) => s.items);
  const [message, setMessage] = useState("");
  const prev = useRef<number | null>(null);

  useEffect(() => {
    const count = cartCount(items);
    if (prev.current !== null && count !== prev.current) {
      setMessage(count === 0 ? "Cart is empty" : `Cart updated — ${count} item${count === 1 ? "" : "s"}`);
    }
    prev.current = count;
  }, [items]);

  return (
    <div aria-live="polite" role="status" className="sr-only">
      {message}
    </div>
  );
}
