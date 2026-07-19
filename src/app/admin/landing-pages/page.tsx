import { LandingPageEditor } from "@/components/admin/LandingPageEditor";
import { landingPages } from "@/data/landing-pages";

export const dynamic = "force-dynamic";

export default function AdminLandingPagesPage() {
  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl font-semibold text-navy">Landing pages</h1>
      <p className="mb-6 text-sm text-navy/60">
        Build a campaign page by toggling sections on and off. Every landing page is noindex.
      </p>
      <LandingPageEditor existing={landingPages} />
    </div>
  );
}
