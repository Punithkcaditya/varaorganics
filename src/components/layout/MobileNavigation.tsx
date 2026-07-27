"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { primaryNav } from "@/config/nav";
import { CloseIcon } from "@/components/ui/Icons";

/** Full-screen mobile overlay. Traps focus, closes on Escape (a11y §19). */
export function MobileNavigation({
  open,
  onClose,
  cartCount,
}: {
  open: boolean;
  onClose: () => void;
  cartCount: number;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      className="fixed inset-0 z-[300] flex flex-col gap-2 bg-navy px-[8%] py-8"
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close menu"
        className="mb-6 self-end p-1 text-ivory/60 hover:text-ivory"
      >
        <CloseIcon width={28} height={28} />
      </button>
      {primaryNav.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onClose}
          className="border-b border-white/10 py-2.5 font-serif text-3xl font-semibold text-ivory/85 hover:text-gold-lt"
        >
          {link.label}
        </Link>
      ))}
      <Link
        href="/cart"
        onClick={onClose}
        className="mt-4 font-serif text-2xl font-semibold text-gold-lt"
      >
        View Cart ({cartCount})
      </Link>
    </div>,
    document.body,
  );
}
