import "server-only";
import { Resend } from "resend";
import { optionalServerEnv, USE_MOCK_DATA } from "@/lib/validation/env";
import { safeError, safeLog } from "@/lib/security/redact";

/**
 * Resend email sender. No-op (logs only) in mock mode / when unconfigured, so
 * order flows and tests never fail on email. `to` and content are never logged
 * in full (redaction).
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean }> {
  const apiKey = optionalServerEnv("RESEND_API_KEY");
  const from = optionalServerEnv("EMAIL_FROM") ?? "Vara Organics <onboarding@resend.dev>";

  if (USE_MOCK_DATA || !apiKey) {
    safeLog("resend", "email suppressed (mock/unconfigured)", { subject: params.subject });
    return { ok: true };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    if (error) throw error;
    return { ok: true };
  } catch (err) {
    safeError("resend", "sendEmail failed", { err: String(err), subject: params.subject });
    return { ok: false };
  }
}

/** Notify the internal order/contact inbox (best-effort). */
export async function notifyInternal(subject: string, html: string): Promise<void> {
  const to = optionalServerEnv("ORDER_NOTIFICATION_EMAIL");
  if (!to) return;
  await sendEmail({ to, subject, html });
}

export type SubscribeResult = { ok: boolean; reason?: "not_configured" | "error" };

/**
 * Add an email to the Resend marketing Audience (newsletter signups). No-op
 * success in mock mode / when unconfigured so the form still works offline.
 * `already-subscribed` is treated as success — the visitor doesn't care.
 */
export async function addContact(params: {
  email: string;
  firstName?: string;
}): Promise<SubscribeResult> {
  const apiKey = optionalServerEnv("RESEND_API_KEY");
  const audienceId = optionalServerEnv("RESEND_AUDIENCE_ID");

  if (USE_MOCK_DATA || !apiKey || !audienceId) {
    safeLog("resend", "contact add suppressed (mock/unconfigured)");
    return { ok: true, reason: "not_configured" };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.contacts.create({
      audienceId,
      email: params.email,
      firstName: params.firstName,
      unsubscribed: false,
    });
    // Resend returns an error when the contact already exists — that's fine.
    if (error && !/already/i.test(error.message ?? "")) throw error;
    return { ok: true };
  } catch (err) {
    safeError("resend", "addContact failed", { err: String(err) });
    return { ok: false, reason: "error" };
  }
}
