import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ButtonLink } from "@/components/ui/Button";
import { defaultSiteSettings } from "@/data/site-settings";

/** Branded 404 with navigation back to /shop (Dev Kit §06). */
export default function NotFound() {
  return (
    <>
      <AnnouncementBar text={defaultSiteSettings.announcement} />
      <Navbar />
      <main id="main" className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <p className="mb-3 font-serif text-6xl font-semibold text-amber">404</p>
        <h1 className="mb-3 font-serif text-3xl font-semibold text-navy">Page not found</h1>
        <p className="mb-8 max-w-md text-navy/60">
          The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back to
          something good.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <ButtonLink href="/shop">Shop products</ButtonLink>
          <ButtonLink href="/" variant="ghost">
            Back to home
          </ButtonLink>
        </div>
      </main>
      <Footer />
    </>
  );
}
