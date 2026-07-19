import type { Metadata } from "next";
import { site, canonical } from "@/config/site";
import { publicEnv } from "@/lib/validation/env";

interface BuildMetaArgs {
  title: string;
  description: string;
  /** Path (no domain) — canonical is derived without a trailing slash. */
  path: string;
  ogImage?: string;
  noindex?: boolean;
  type?: "website" | "article";
}

/**
 * Central metadata builder (Dev Kit §06). Ensures canonical URLs never have a
 * trailing slash, applies OG/Twitter, and threads Search Console verification.
 */
export function buildMetadata({
  title,
  description,
  path,
  ogImage,
  noindex = false,
  type = "website",
}: BuildMetaArgs): Metadata {
  const url = canonical(path);
  const image = ogImage ?? `${site.url}/placeholders/og-default.svg`;
  const fullTitle = title.includes(site.name) ? title : `${title} | ${site.name}`;
  const verification = publicEnv.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: site.name,
      locale: site.locale,
      type,
      images: [{ url: image, width: 1200, height: 630, alt: site.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
    ...(verification ? { verification: { google: verification } } : {}),
  };
}
