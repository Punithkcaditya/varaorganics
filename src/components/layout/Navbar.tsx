"use client";

import Link from "next/link";
import { useState } from "react";
import { primaryNav } from "@/config/nav";
import { useCart } from "@/features/cart/store";
import { cartCount } from "@/features/cart/selectors";
import { useHydrated } from "@/lib/useHydrated";
import { Logo } from "./Logo";
import { MobileNavigation } from "./MobileNavigation";
import { CartIcon, MenuIcon } from "@/components/ui/Icons";

/** Sticky navbar with cart count and accessible mobile overlay trigger. */
export function Navbar() {
  const items = useCart((s) => s.items);
  const hydrated = useHydrated();
  const [menuOpen, setMenuOpen] = useState(false);

  const count = hydrated ? cartCount(items) : 0;

  return (
    <header className="sticky top-0 z-[200] border-b border-navy/10 bg-ivory/95 backdrop-blur">
      <nav className="mx-auto flex h-[68px] max-w-[1200px] items-center justify-between px-6 md:px-[6%]" aria-label="Primary">
        <Logo />

        <ul className="hidden gap-8 md:flex">
          {primaryNav.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-[11.5px] font-medium uppercase tracking-[0.2em] text-navy/60 transition-colors hover:text-amber"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="hidden items-center gap-2 rounded-[2px] bg-navy px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-amber sm:inline-flex"
          >
            <CartIcon width={15} height={15} />
            Cart ({count})
          </Link>
          <Link
            href="/cart"
            aria-label={`Cart, ${count} items`}
            className="relative inline-flex rounded-[2px] p-2 text-navy sm:hidden"
          >
            <CartIcon />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber px-1 text-[9px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="inline-flex p-2 text-navy md:hidden"
          >
            <MenuIcon width={24} height={24} />
          </button>
        </div>
      </nav>

      <MobileNavigation open={menuOpen} onClose={() => setMenuOpen(false)} cartCount={count} />
    </header>
  );
}
