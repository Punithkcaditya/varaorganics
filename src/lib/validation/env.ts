import { z } from "zod";

/**
 * Runtime environment validation.
 *
 * Two layers:
 *  - `publicEnv`  — NEXT_PUBLIC_* values safe for the browser bundle.
 *  - `serverEnv`  — server-only secrets, validated lazily on first server use.
 *
 * In mock mode (NEXT_PUBLIC_USE_MOCK_DATA="true") secrets are optional so the
 * app builds/runs/tests offline. In production mock mode is off and the
 * required secrets must be present, or the accessor throws a clear error.
 */

const isMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

const publicSchema = z.object({
  // NOTE: never hardcode credentials here — this module is imported by client
  // components, so any literal in it can end up in the browser bundle.
  // All real values come from .env.local / the host's environment variables.
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_USE_MOCK_DATA: z.enum(["true", "false"]).default("false"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().or(z.literal("")),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().optional().or(z.literal("")),
  NEXT_PUBLIC_GTM_ID: z.string().optional().or(z.literal("")),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional().or(z.literal("")),
  NEXT_PUBLIC_META_PIXEL_ID: z.string().optional().or(z.literal("")),
  NEXT_PUBLIC_CLARITY_ID: z.string().optional().or(z.literal("")),
  NEXT_PUBLIC_KLAVIYO_COMPANY_ID: z.string().optional().or(z.literal("")),
  NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: z.string().optional().or(z.literal("")),
});

// NEXT_PUBLIC_* vars must be referenced statically for Next.js inlining.
const parsedPublic = publicSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_USE_MOCK_DATA: process.env.NEXT_PUBLIC_USE_MOCK_DATA,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID,
  NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  NEXT_PUBLIC_META_PIXEL_ID: process.env.NEXT_PUBLIC_META_PIXEL_ID,
  NEXT_PUBLIC_CLARITY_ID: process.env.NEXT_PUBLIC_CLARITY_ID,
  NEXT_PUBLIC_KLAVIYO_COMPANY_ID: process.env.NEXT_PUBLIC_KLAVIYO_COMPANY_ID,
  NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
});

if (!parsedPublic.success) {
  // Fail fast at import time — misconfiguration should never reach users.
  const issues = parsedPublic.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`);
  throw new Error(`Invalid public environment variables:\n${issues.join("\n")}`);
}

export const publicEnv = parsedPublic.data;
export const USE_MOCK_DATA = isMock || publicEnv.NEXT_PUBLIC_USE_MOCK_DATA === "true";

/** Absolute site origin without a trailing slash. */
export const SITE_URL = publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  SHIPROCKET_EMAIL: z.string().optional(),
  SHIPROCKET_PASSWORD: z.string().optional(),
  SHIPROCKET_PICKUP_LOCATION: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_AUDIENCE_ID: z.string().optional(),
  ORDER_NOTIFICATION_EMAIL: z.string().email().optional().or(z.literal("")),
  EMAIL_FROM: z.string().optional(),
  REVALIDATE_SECRET: z.string().optional(),
  KLAVIYO_API_KEY: z.string().optional(),
  WATI_API_TOKEN: z.string().optional(),
  WATI_API_ENDPOINT: z.string().optional(),
  SHIPROCKET_WEBHOOK_SECRET: z.string().optional(),
  ADMIN_ALERT_PHONE: z.string().optional(),
});

type ServerEnv = z.infer<typeof serverSchema>;
let cachedServerEnv: ServerEnv | null = null;

function loadServerEnv(): ServerEnv {
  if (cachedServerEnv) return cachedServerEnv;
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`);
    throw new Error(`Invalid server environment variables:\n${issues.join("\n")}`);
  }
  cachedServerEnv = parsed.data;
  return cachedServerEnv;
}

/**
 * Read a server secret. Throws a clear error in non-mock (production) mode when
 * the value is missing, so a misconfigured deploy fails loudly instead of
 * silently mis-charging or losing orders.
 */
export function requireServerEnv<K extends keyof ServerEnv>(key: K): string {
  const value = loadServerEnv()[key];
  if (!value) {
    if (USE_MOCK_DATA) return `mock-${String(key).toLowerCase()}`;
    throw new Error(
      `Missing required server environment variable: ${String(key)}. ` +
        `Set it in the deployment environment (see ENVIRONMENT.md).`,
    );
  }
  return value;
}

/** Optional server secret; returns undefined if unset. */
export function optionalServerEnv<K extends keyof ServerEnv>(key: K): string | undefined {
  return loadServerEnv()[key] || undefined;
}
