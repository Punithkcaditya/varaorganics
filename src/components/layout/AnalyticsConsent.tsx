"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { publicEnv } from "@/lib/validation/env";
import { trackPageView } from "@/lib/analytics/events";
import { Button } from "@/components/ui/Button";

const CONSENT_KEY = "vara-consent";
const gtmId = publicEnv.NEXT_PUBLIC_GTM_ID;
const gaId = publicEnv.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const pixelId = publicEnv.NEXT_PUBLIC_META_PIXEL_ID;
const clarityId = publicEnv.NEXT_PUBLIC_CLARITY_ID;

/**
 * Consent-gated tracking.
 *
 * Primary: a single **GTM container** — GA4, Meta Pixel, Clarity and Klaviyo
 * are all configured inside GTM (Tech Stack doc), so the marketer can change
 * tags without a deploy. Events reach GTM via `dataLayer` pushes.
 *
 * Fallback: if no GTM container is set, we load GA4 / Pixel / Clarity directly
 * so tracking still works.
 *
 * Nothing loads until the visitor accepts (§18 consent-ready structure).
 */
const hasAnything = Boolean(gtmId || gaId || pixelId || clarityId);

export function AnalyticsConsent() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<boolean | null>(null);

  useEffect(() => {
    // One-time read of persisted consent (external state) on mount.
    const stored = localStorage.getItem(CONSENT_KEY);
    const value = stored === "granted";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsent(stored ? value : false);
    (window as unknown as { __varaConsent?: boolean }).__varaConsent = value;
  }, []);

  // Fire page_view on client navigation once consent is granted.
  useEffect(() => {
    if (consent) trackPageView(window.location.href);
  }, [pathname, consent]);

  function accept() {
    localStorage.setItem(CONSENT_KEY, "granted");
    (window as unknown as { __varaConsent?: boolean }).__varaConsent = true;
    setConsent(true);
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, "denied");
    (window as unknown as { __varaConsent?: boolean }).__varaConsent = false;
    setConsent(false);
  }

  const load = consent === true;
  const useGtm = Boolean(gtmId);

  return (
    <>
      {/* ── Google Tag Manager (primary) ── */}
      {load && useGtm && (
        <>
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        </>
      )}

      {/* ── Direct fallbacks (only when GTM is not configured) ── */}
      {load && !useGtm && gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}',{send_page_view:false});`}
          </Script>
        </>
      )}
      {load && !useGtm && pixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`}
        </Script>
      )}
      {load && !useGtm && clarityId && (
        <Script id="ms-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarityId}");`}
        </Script>
      )}

      {hasAnything && consent === false && (
        <div
          role="region"
          aria-label="Cookie consent"
          className="fixed inset-x-0 bottom-0 z-[210] border-t border-navy/10 bg-ivory px-6 py-4 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] md:flex md:items-center md:justify-between md:gap-6"
        >
          <p className="mb-3 text-sm font-light text-navy/70 md:mb-0">
            We use analytics cookies to understand how the site is used. You can accept or decline.
          </p>
          <div className="flex shrink-0 gap-3">
            <Button variant="ghost" className="px-5 py-2.5" onClick={decline}>
              Decline
            </Button>
            <Button variant="primary" className="px-5 py-2.5" onClick={accept}>
              Accept
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
