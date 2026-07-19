import type { NextConfig } from "next";

/**
 * Derive the Supabase storage hostname (if configured) so next/image can
 * optimize remote product / article images without allowing arbitrary hosts.
 */
function supabaseHostname(): string | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return undefined;
  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];
const sbHost = supabaseHostname();
if (sbHost) {
  remotePatterns.push({
    protocol: "https",
    hostname: sbHost,
    pathname: "/storage/v1/object/public/**",
  });
}

// Content Security Policy — starter configuration. Razorpay + analytics hosts
// are allowlisted; tighten `unsafe-inline` once nonce-based scripts are wired.
// React's dev build requires 'unsafe-eval'; production does not, so it is only
// added outside production.
const devEval = process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${devEval} https://checkout.razorpay.com https://www.googletagmanager.com https://connect.facebook.net https://www.clarity.ms https://static.klaviyo.com https://static-tracking.klaviyo.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' https://fonts.gstatic.com data:",
  "connect-src 'self' https://*.supabase.co https://lumberjack.razorpay.com https://api.razorpay.com https://www.google-analytics.com https://region1.google-analytics.com https://*.clarity.ms https://a.klaviyo.com https://www.googletagmanager.com",
  "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://www.googletagmanager.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns,
    // Placeholder product art ships as our own trusted SVGs. Real photography
    // (JP/PNG/WebP) will be optimized normally. The sandbox + CSP below keep
    // SVG rendering safe.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    // Future-proofing: /products/* → /shop/* (Dev Kit §06 URL rules).
    // The negative-lookahead excludes any path containing a "." so static
    // assets under /public/products (e.g. /products/foo.jpg) are still served
    // and not swallowed by the redirect.
    return [
      { source: "/products/:path((?!.*\\.).*)", destination: "/shop/:path", permanent: true },
    ];
  },
};

export default nextConfig;
