import "server-only";
import { cache } from "react";
import { getServerSupabase } from "@/lib/supabase/server";
import { USE_MOCK_DATA } from "@/lib/validation/env";
import { safeError } from "@/lib/security/redact";
import { defaultSiteSettings, type SiteSettings } from "@/data/site-settings";
import type { SiteSettingsRow } from "@/types/database";

/**
 * Site settings (announcement bar text, thresholds, editable copy). Merges the
 * `site_settings` key/value table over the typed defaults. Falls back to
 * defaults in mock mode or on error.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  if (USE_MOCK_DATA) return defaultSiteSettings;
  const sb = getServerSupabase();
  if (!sb) return defaultSiteSettings;
  try {
    const { data, error } = await sb.from("site_settings").select("*");
    if (error) throw error;
    const merged: SiteSettings = { ...defaultSiteSettings };
    for (const row of (data as SiteSettingsRow[]) ?? []) {
      if (row.key in merged && row.value != null) {
        (merged as unknown as Record<string, unknown>)[row.key] = row.value;
      }
    }
    return merged;
  } catch (err) {
    safeError("settings", "DATABASE READ FAILED — using default copy", { err: String(err) });
    return defaultSiteSettings;
  }
});
