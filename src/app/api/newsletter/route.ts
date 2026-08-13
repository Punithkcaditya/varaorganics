import type { NextRequest } from "next/server";
import { z } from "zod";
import { addContact } from "@/lib/resend/server";
import { ok, fail, serverError } from "@/lib/api/respond";
import { checkRateLimit, clientIp } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Newsletter signup — adds the email to the Resend marketing Audience.
 * Public endpoint: rate-limited + honeypot. Never reveals whether an address is
 * already subscribed (privacy + no enumeration).
 */
const schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  firstName: z.string().trim().max(100).optional(),
  // Honeypot — bots fill hidden fields; real users leave it empty.
  company: z.string().max(0).optional(),
});

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const rl = checkRateLimit(`newsletter:${ip}`, 5, 60_000);
  if (!rl.success) return fail(429, "rate_limited", "Too many attempts. Please wait a moment.");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail(400, "invalid_json", "Malformed request body.");
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return fail(422, "validation_error", parsed.error.issues[0]?.message ?? "Invalid input");
  }

  try {
    const result = await addContact({ email: parsed.data.email, firstName: parsed.data.firstName });
    if (!result.ok) return fail(502, "provider_error", "Could not subscribe right now. Please try again.");
    return ok({ subscribed: true });
  } catch (err) {
    return serverError("newsletter", err);
  }
}
