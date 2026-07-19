import type { NextRequest } from "next/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/supabase/auth";
import { USE_MOCK_DATA } from "@/lib/validation/env";
import { estimateReadTime } from "@/lib/utils";
import { ok, fail, serverError } from "@/lib/api/respond";
import { safeLog } from "@/lib/security/redact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const articleSchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase words separated by hyphens"),
  title: z.string().trim().min(3).max(200),
  excerpt: z.string().trim().min(10).max(500),
  category: z.enum(["ghee", "honey", "oils"]),
  coverImage: z.string().trim().optional().or(z.literal("")),
  bodyMarkdown: z.string().trim().min(20),
  metaTitle: z.string().trim().max(200).optional().or(z.literal("")),
  metaDescription: z.string().trim().max(320).optional().or(z.literal("")),
  relatedProduct: z.string().trim().optional().or(z.literal("")),
  published: z.boolean(),
  enableHowtoSchema: z.boolean(),
  faqs: z
    .array(z.object({ question: z.string().trim().min(3), answer: z.string().trim().min(3) }))
    .default([]),
});

/**
 * Create/update a Learn article from the admin editor. Auth-gated, validated,
 * and revalidates the affected pages so the change is live immediately.
 */
export async function POST(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return fail(401, "unauthorized", "Sign in to continue");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail(400, "invalid_json", "Malformed request body.");
  }

  const parsed = articleSchema.safeParse(body);
  if (!parsed.success) {
    return fail(422, "validation_error", parsed.error.issues[0]?.message ?? "Invalid input");
  }
  const a = parsed.data;

  const sb = getAdminSupabase();
  if (USE_MOCK_DATA || !sb) {
    // Mock mode has no writable store — report clearly rather than pretending.
    return fail(
      503,
      "not_configured",
      "Article saving needs a Supabase connection. Set NEXT_PUBLIC_USE_MOCK_DATA=false and add your Supabase keys.",
    );
  }

  try {
    const { error } = await sb.from("learn_content").upsert(
      {
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        category: a.category,
        cover_image: a.coverImage || null,
        body_markdown: a.bodyMarkdown,
        faqs: a.faqs,
        meta_title: a.metaTitle || null,
        meta_description: a.metaDescription || null,
        read_time: estimateReadTime(a.bodyMarkdown),
        related_product: a.relatedProduct || null,
        published: a.published,
        enable_howto_schema: a.enableHowtoSchema,
      },
      { onConflict: "slug" },
    );
    if (error) throw error;

    revalidatePath("/learn");
    revalidatePath(`/learn/${a.slug}`);
    safeLog("admin/articles", "saved", { slug: a.slug, published: a.published });
    return ok({ saved: true, slug: a.slug });
  } catch (err) {
    return serverError("admin/articles", err);
  }
}
