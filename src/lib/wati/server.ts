import "server-only";
import { optionalServerEnv, USE_MOCK_DATA } from "@/lib/validation/env";
import { safeError, safeLog } from "@/lib/security/redact";

/**
 * WATI WhatsApp Business messaging. Server-only — the API token never reaches
 * the browser. Message *templates* are configured in the WATI dashboard by the
 * marketer; we only trigger them with parameters.
 *
 * Never throws: WhatsApp is a notification channel, so a failure must not break
 * order processing. No-ops (logs only) in mock mode / when unconfigured.
 */

/** Normalize an Indian number to WATI's expected format (91XXXXXXXXXX). */
export function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return digits;
}

export async function sendWhatsAppTemplate(params: {
  phone: string;
  templateName: string;
  parameters?: { name: string; value: string }[];
}): Promise<{ ok: boolean }> {
  const token = optionalServerEnv("WATI_API_TOKEN");
  const endpoint = optionalServerEnv("WATI_API_ENDPOINT");

  if (USE_MOCK_DATA || !token || !endpoint) {
    safeLog("wati", "WhatsApp suppressed (mock/unconfigured)", {
      template: params.templateName,
    });
    return { ok: true };
  }

  const to = toWhatsAppNumber(params.phone);
  try {
    const url = `${endpoint.replace(/\/$/, "")}/api/v1/sendTemplateMessage?whatsappNumber=${to}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
      },
      body: JSON.stringify({
        template_name: params.templateName,
        broadcast_name: params.templateName,
        parameters: params.parameters ?? [],
      }),
    });
    if (!res.ok) throw new Error(`wati ${res.status}`);
    return { ok: true };
  } catch (err) {
    safeError("wati", "sendWhatsAppTemplate failed", {
      err: String(err),
      template: params.templateName,
    });
    return { ok: false };
  }
}

/** Internal alert to the operator's own WhatsApp (NDR, low stock). */
export async function alertOperator(templateName: string, message: string): Promise<void> {
  const phone = optionalServerEnv("ADMIN_ALERT_PHONE");
  if (!phone) return;
  await sendWhatsAppTemplate({
    phone,
    templateName,
    parameters: [{ name: "message", value: message }],
  });
}
