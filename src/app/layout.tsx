import type { Metadata } from "next";
import "./globals.css";
import { cormorant, jost } from "@/config/fonts";
import { site } from "@/config/site";
import { SITE_URL } from "@/lib/validation/env";
import { AnalyticsConsent } from "@/components/layout/AnalyticsConsent";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
        <AnalyticsConsent />
      </body>
    </html>
  );
}
