import type { NextRequest } from "next/server";
import { z } from "zod";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { USE_MOCK_DATA } from "@/lib/validation/env";
import { indianPhone } from "@/lib/validation/checkout";
import { sendEmail, notifyInternal } from "@/lib/resend/server";
import { contactAckEmail } from "@/lib/resend/templates";
import { ok, fail, serverError } from "@/lib/api/respond";
import { checkRateLimit, clientIp } from "@/lib/security/rate-limit";
import { safeLog } from "@/lib/security/redact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email"),
  phone: indianPhone.optional().or(z.literal("")),
  message: z.string().trim().min(10, "Please enter a longer message").max(2000),
  // Honeypot spam field — must be empty (placeholder spam protection §15).
  company: z.string().max(0).optional(),
});

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const rl = checkRateLimit(`contact:${ip}`, 5, 60_000);
  if (!rl.success) return fail(429, "rate_limited", "Too many messages. Please wait a moment.");

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
  const { name, email, phone, message } = parsed.data;

  try {
    const sb = getAdminSupabase();
    if (!USE_MOCK_DATA && sb) {
      const { error } = await sb
        .from("contact_submissions")
        .insert({ name, email, phone: phone || null, message });
      if (error) throw error;
    } else {
      safeLog("contact", "submission stored (mock)", { hasEmail: Boolean(email) });
    }

    // Acknowledge the sender and notify the internal inbox.
    const ack = contactAckEmail(name);
    await sendEmail({ to: email, subject: ack.subject, html: ack.html });
    await notifyInternal(
      `New contact message from ${name}`,
      `<p>${name} (${email}${phone ? ", " + phone : ""}) wrote:</p><p>${message}</p>`,
    );

    return ok({ submitted: true });
  } catch (err) {
    return serverError("contact", err);
  }
}
