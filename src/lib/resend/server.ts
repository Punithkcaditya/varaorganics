import "server-only";
import { Resend } from "resend";
import { optionalServerEnv, USE_MOCK_DATA } from "@/lib/validation/env";
import { safeError, safeLog } from "@/lib/security/redact";

const DEFAULT_FROM = "Vara Organics <no-reply@updates.varaorganic.com>";
const DEFAULT_REPLY_TO = "hello@varaorganic.com";

export type ResendResult = {
  ok: boolean;
  reason?: "not_configured" | "provider_error";
};

/**
 * Resend email sender. No-op (logs only) in mock mode, so order flows and tests
 * stay offline. Missing production configuration returns an explicit failure.
 * `to` and content are never logged in full (redaction).
 */
export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<ResendResult> {
  const apiKey = optionalServerEnv("RESEND_API_KEY");
  const from = optionalServerEnv("EMAIL_FROM") ?? DEFAULT_FROM;
  const replyTo = params.replyTo ?? optionalServerEnv("EMAIL_REPLY_TO") ?? DEFAULT_REPLY_TO;

  if (USE_MOCK_DATA) {
    safeLog("resend", "email suppressed (mock)", { subject: params.subject });
    return { ok: true };
  }
  if (!apiKey) {
    safeError("resend", "email suppressed because RESEND_API_KEY is missing", {
      subject: params.subject,
    });
    return { ok: false, reason: "not_configured" };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      replyTo,
    });
    if (error) throw error;
    return { ok: true };
  } catch (err) {
    safeError("resend", "sendEmail failed", { err: String(err), subject: params.subject });
    return { ok: false, reason: "provider_error" };
  }
}

/** Notify the internal order/contact inbox (best-effort). */
export async function notifyInternal(
  subject: string,
  html: string,
  replyTo?: string,
): Promise<void> {
  const to = optionalServerEnv("ORDER_NOTIFICATION_EMAIL");
  if (!to) {
    safeLog("resend", "internal email suppressed because ORDER_NOTIFICATION_EMAIL is missing", {
      subject,
    });
    return;
  }
  await sendEmail({ to, subject, html, replyTo });
}

/**
 * Fire a Resend custom event to trigger an Automation (delayed lifecycle
 * sequences — farm story, review request, reorder nudge). Server-only so the
 * event can't be lost by the browser. Never throws; reports configuration or
 * provider failures to its caller.
 * The Automation and its delay/email steps are built in the Resend dashboard.
 */
export async function sendResendEvent(params: {
  event: string;
  email: string;
  payload?: Record<string, unknown>;
}): Promise<{ ok: boolean }> {
  const apiKey = optionalServerEnv("RESEND_API_KEY");
  if (USE_MOCK_DATA) {
    safeLog("resend", "event suppressed (mock)", { event: params.event });
    return { ok: true };
  }
  if (!apiKey) {
    safeError("resend", "event suppressed because RESEND_API_KEY is missing", {
      event: params.event,
    });
    return { ok: false };
  }
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.events.send({
      event: params.event,
      email: params.email,
      payload: params.payload,
    });
    if (error) throw error;
    return { ok: true };
  } catch (err) {
    safeError("resend", "sendResendEvent failed", { err: String(err), event: params.event });
    return { ok: false };
  }
}

export type SubscribeResult = { ok: boolean; reason?: "not_configured" | "error" };

/**
 * Add an email to the Resend marketing Segment (newsletter signups). No-op
 * success in mock mode so the form still works offline. Existing contacts are
 * explicitly enrolled into the segment, and already-enrolled is a success.
 */
export async function addContact(params: {
  email: string;
  firstName?: string;
}): Promise<SubscribeResult> {
  const apiKey = optionalServerEnv("RESEND_API_KEY");
  const segmentId =
    optionalServerEnv("RESEND_SEGMENT_ID") ?? optionalServerEnv("RESEND_AUDIENCE_ID");

  if (USE_MOCK_DATA) {
    safeLog("resend", "contact add suppressed (mock)");
    return { ok: true, reason: "not_configured" };
  }
  if (!apiKey || !segmentId) {
    safeError("resend", "contact add suppressed because Resend is not configured", {
      hasApiKey: Boolean(apiKey),
      hasSegmentId: Boolean(segmentId),
    });
    return { ok: false, reason: "not_configured" };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.contacts.create({
      email: params.email,
      firstName: params.firstName,
      unsubscribed: false,
      segments: [{ id: segmentId }],
    });
    if (error && /already/i.test(error.message ?? "")) {
      // Existing global contacts still need to be enrolled into this segment.
      const { error: segmentError } = await resend.contacts.segments.add({
        email: params.email,
        segmentId,
      });
      if (segmentError && !/already/i.test(segmentError.message ?? "")) throw segmentError;
    } else if (error) {
      throw error;
    }
    return { ok: true };
  } catch (err) {
    safeError("resend", "addContact failed", { err: String(err) });
    return { ok: false, reason: "error" };
  }
}
