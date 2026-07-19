import type { MetadataRoute } from "next";
import { site } from "@/config/site";

/** robots.txt (§16). Disallows API + private routes; points to the sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/order-confirmed/",
          "/order/",
          "/cart",
          "/checkout",
          "/lp/",
        ],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
