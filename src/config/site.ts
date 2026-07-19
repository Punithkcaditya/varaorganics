import { SITE_URL } from "@/lib/validation/env";

/**
 * Static brand / organization configuration. Marketing-editable copy that is
 * not per-product lives in the `site_settings` DB table; this holds structural
 * constants (name, domain, socials) used across metadata and schema.
 */
export const site = {
  name: "Vara Organics",
  legalName: "Varixa Global",
  tagline: "Nature's Finest Gift",
  description:
    "Pure A2 Gir Cow Bilona ghee, wood-pressed oils and raw wild forest honey from Indian farms. Traditional methods, small batches, NABL lab-tested, nothing added.",
  url: SITE_URL,
  locale: "en_IN",
  // FSSAI licence shown in the footer. Empty until confirmed — never fabricate.
  // (Design shows "apply pending".) Set via site_settings when issued.
  fssaiLicence: "",
  social: {
    instagram: "https://www.instagram.com/varaorganics",
    facebook: "https://www.facebook.com/varaorganics",
  },
} as const;

/** Absolute canonical URL for a path, guaranteed without a trailing slash. */
export function canonical(path = "/"): string {
  const clean = path === "/" ? "" : `/${path.replace(/^\/+|\/+$/g, "")}`;
  return `${site.url}${clean}`;
}
