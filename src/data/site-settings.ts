/**
 * Default site settings (Dev Kit: AnnouncementBar text and other marketing copy
 * configurable from DB). These are the fallback values; the `site_settings`
 * table overrides them in production.
 */
export interface SiteSettings {
  announcement: string;
  freeShippingThreshold: number;
  heroHeadline: string;
  heroHeadlineEm: string;
  ourStory: string;
  /** Founder photo shown on Our Story (Fix #7). Empty until a photo is set. */
  founderPhotoUrl: string;
}

export const defaultSiteSettings: SiteSettings = {
  announcement:
    "Lab report on every batch · Free Bangalore delivery ₹999+ · Scan QR on any jar — see your exact test results",
  freeShippingThreshold: 999,
  heroHeadline: "The ghee your grandmother knew.",
  heroHeadlineEm: "Proved, not claimed.",
  ourStory:
    "Vara Organics brings pure A2 Bilona ghee, wood-pressed oils and raw wild honey from Indian farms to Bengaluru kitchens — traditional methods, small batches, nothing added, every batch lab-tested and QR-traceable.",
  founderPhotoUrl: "",
};
