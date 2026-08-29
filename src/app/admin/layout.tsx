import type { Metadata } from "next";
import Link from "next/link";
import { getAdminUser } from "@/lib/supabase/auth";
import { USE_MOCK_DATA } from "@/lib/validation/env";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

export const metadata: Metadata = {
  title: "Admin · Vara Organics",
  robots: { index: false, follow: false },
};

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/combos", label: "Combos" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/batches", label: "Batches" },
  { href: "/admin/batch-lookup", label: "Batch lookup" },
  { href: "/admin/learn", label: "Articles" },
  { href: "/admin/landing-pages", label: "Landing pages" },
  { href: "/admin/settings", label: "Settings" },
];

/** Admin shell. Auth is enforced by middleware; this renders the chrome. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();

  return (
    <div className="flex min-h-screen flex-col bg-paper/40">
      <header className="border-b border-navy/10 bg-navy">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-6 py-3">
          <Link href="/admin" className="font-serif text-xl font-semibold text-ivory">
            Vara<span className="text-gold">.</span>{" "}
            <span className="text-[11px] uppercase tracking-[0.2em] text-gold-lt">Admin</span>
          </Link>
          <nav aria-label="Admin" className="flex flex-wrap gap-4">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[12px] font-medium uppercase tracking-[0.12em] text-ivory/70 hover:text-gold-lt"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-[12px] text-ivory/55">
            <span>{user?.email}</span>
            <Link href="/" className="text-gold-lt hover:underline">
              View site →
            </Link>
            <AdminLogoutButton />
          </div>
        </div>
      </header>

      {USE_MOCK_DATA && (
        <p className="bg-warning/15 px-6 py-2 text-center text-xs text-warning">
          Mock mode — showing seeded data. Connect Supabase for live orders and authentication.
        </p>
      )}

      <main id="main" className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  );
}
