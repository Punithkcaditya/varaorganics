import type { NextRequest } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { LAB_REPORTS_PATH } from "@/config/routes";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/supabase/auth";
import { USE_MOCK_DATA } from "@/lib/validation/env";
import { ok, fail, serverError } from "@/lib/api/respond";
import { safeLog } from "@/lib/security/redact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Create or update a product batch and its lab parameters.
 *
 * Activating a batch deactivates the product's other batches — only one batch
 * is "current" at a time, and that's the one stamped onto new orders.
 */
const schema = z.object({
  productId: z.string().min(1),
  batchNumber: z.string().trim().min(3).max(60),
  mfgDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  bestBefore: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  labReportUrl: z.string().url().optional().or(z.literal("")),
  active: z.boolean(),
  labParameters: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(120),
        result: z.string().trim().min(1).max(120),
        status: z.enum(["Pass", "Premium", "Fail"]),
      }),
    )
    .default([]),
});

export async function POST(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return fail(401, "unauthorized", "Sign in to continue");

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
  const b = parsed.data;

  if (b.bestBefore < b.mfgDate) {
    return fail(422, "invalid_dates", "Best-before must be on or after the manufacturing date.");
  }

  const sb = getAdminSupabase();
  if (USE_MOCK_DATA || !sb) {
    return fail(
      503,
      "not_configured",
      "Saving needs a Supabase connection. Set NEXT_PUBLIC_USE_MOCK_DATA=false and add your Supabase keys.",
    );
  }

  try {
    const { data, error } = await sb
      .from("product_batches")
      .upsert(
        {
          product_id: b.productId,
          batch_number: b.batchNumber,
          mfg_date: b.mfgDate,
          best_before: b.bestBefore,
          lab_report_url: b.labReportUrl || null,
          active: b.active,
        },
        { onConflict: "batch_number" },
      )
      .select("id")
      .single();
    if (error) throw error;

    const batchId = (data as { id: string }).id;

    // Only one active batch per product.
    if (b.active) {
      const { error: deactivateError } = await sb
        .from("product_batches")
        .update({ active: false })
        .eq("product_id", b.productId)
        .neq("id", batchId);
      if (deactivateError) throw deactivateError;
    }

    // Replace lab parameters for this batch.
    await sb.from("lab_parameters").delete().eq("batch_id", batchId);
    if (b.labParameters.length > 0) {
      const { error: paramError } = await sb.from("lab_parameters").insert(
        b.labParameters.map((p, i) => ({
          batch_id: batchId,
          name: p.name,
          result: p.result,
          status: p.status,
          position: i,
        })),
      );
      if (paramError) throw paramError;
    }

    revalidatePath(LAB_REPORTS_PATH);
    revalidatePath(`/verify/${b.batchNumber}`);
    revalidatePath("/");

    safeLog("admin/batches", "saved", { batchNumber: b.batchNumber, active: b.active });
    return ok({ saved: true, batchId });
  } catch (err) {
    return serverError("admin/batches", err);
  }
}
