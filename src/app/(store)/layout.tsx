import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartAnnouncer } from "@/components/cart/CartAnnouncer";
import { getSiteSettings } from "@/features/settings/queries";

/**
 * Storefront chrome (nav + footer). Ad landing pages under /lp live OUTSIDE
 * this group so they render without navigation (§14).
 */
export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  return (
    <>
      <AnnouncementBar text={settings.announcement} />
      <Navbar />
      <CartAnnouncer />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
