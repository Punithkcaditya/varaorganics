import { SettingsEditor } from "@/components/admin/SettingsEditor";
import { getSiteSettings } from "@/features/settings/queries";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl font-semibold text-navy">Site settings</h1>
      <p className="mb-6 text-sm text-navy/60">
        Homepage copy and the announcement bar. Changes go live immediately.
      </p>
      <SettingsEditor settings={settings} />
    </div>
  );
}
