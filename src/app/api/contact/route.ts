import type { NextRequest } from "next/server";
import { z } from "zod";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { USE_MOCK_DATA } from "@/lib/validation/env";
import { indianPhone } from "@/lib/validation/checkout";
import { sendEmail, notifyInternal } from "@/lib/resend/server";
import {
  contactAckEmail,
  b2bAckEmail,
  restockRequestAckEmail,
  restockRequestAdminEmail,
} from "@/lib/resend/templates";
import { ok, fail, serverError } from "@/lib/api/respond";
import { checkRateLimit, clientIp } from "@/lib/security/rate-limit";
import { safeLog } from "@/lib/security/redact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z
  .object({
    name: z.string().trim().min(2, "Please enter your name").max(100),
    email: z.string().trim().email("Enter a valid email"),
    phone: indianPhone.optional().or(z.literal("")),
    message: z.string().trim().max(2000),
    // Honeypot spam field — must be empty (placeholder spam protection §15).
    company: z.string().max(0).optional(),
    // Distinguishes a B2B/export enquiry so it gets the trade acknowledgement.
    kind: z.enum(["contact", "b2b"]).optional(),
    companyName: z.string().trim().max(120).optional(),
    intent: z.enum(["contact", "restock"]).optional(),
    productName: z.string().trim().max(160).optional(),
    variantName: z.string().trim().max(80).optional(),
    sku: z.string().trim().max(80).optional(),
  })
  .superRefine((values, ctx) => {
    if (values.intent === "restock") {
      if (!values.productName) {
        ctx.addIssue({ code: "custom", path: ["productName"], message: "Product is required" });
      }
      if (!values.variantName) {
        ctx.addIssue({ code: "custom", path: ["variantName"], message: "Size is required" });
      }
    } else if (values.message.length < 10) {
      ctx.addIssue({
        code: "custom",
        path: ["message"],
        message: "Please enter a longer message",
      });
    }
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
  const { name, email, phone, message, kind, companyName, intent, productName, variantName, sku } =
    parsed.data;
  const isB2B = kind === "b2b";
  const isRestock = intent === "restock";
  const storedMessage = isRestock
    ? [
        "BACK-IN-STOCK REQUEST",
        `Product: ${productName}`,
        `Selected size: ${variantName}`,
        sku ? `SKU: ${sku}` : null,
        `Customer note: ${message || "None"}`,
      ]
        .filter(Boolean)
        .join("\n")
    : message;

  try {
    const sb = getAdminSupabase();
    if (!USE_MOCK_DATA && sb) {
      const { error } = await sb
        .from("contact_submissions")
        .insert({ name, email, phone: phone || null, message: storedMessage });
      if (error) throw error;
    } else {
      safeLog("contact", "submission stored (mock)", { hasEmail: Boolean(email) });
    }

    // Acknowledge the sender and notify the internal inbox.
    const ack = isRestock
      ? restockRequestAckEmail(name, productName!, variantName!)
      : isB2B
        ? b2bAckEmail(name, companyName)
        : contactAckEmail(name);
    await sendEmail({ to: email, subject: ack.subject, html: ack.html });

    if (isRestock) {
      const adminEmail = restockRequestAdminEmail({
        name,
        email,
        phone: phone || undefined,
        productName: productName!,
        variantName: variantName!,
        sku,
        message: message || undefined,
      });
      await notifyInternal(adminEmail.subject, adminEmail.html, email);
      return ok({ submitted: true, restockRequested: true });
    }

    await notifyInternal(
      isB2B
        ? `New B2B / export enquiry from ${companyName ?? name}`
        : `New contact message from ${name}`,
      `<p>${name} (${email}${phone ? ", " + phone : ""}) wrote:</p><p>${message}</p>`,
      email,
    );

    return ok({ submitted: true });
  } catch (err) {
    return serverError("contact", err);
  }
}
