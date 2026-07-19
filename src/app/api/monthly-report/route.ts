import type { NextRequest } from "next/server";
import { getMonthlyReport } from "@/features/reports/service";
import { optionalServerEnv, USE_MOCK_DATA } from "@/lib/validation/env";
import { ok, fail, serverError } from "@/lib/api/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Monthly P&L data source (`/api/monthly-report?month=YYYY-MM`), consumed by
 * the Google Sheet via Apps Script. Contains business revenue data, so it is
 * protected by the admin secret header — never public.
 */
export async function GET(req: NextRequest) {
  const secret = optionalServerEnv("REVALIDATE_SECRET");
  if (!USE_MOCK_DATA && req.headers.get("x-admin-secret") !== secret) {
    return fail(401, "unauthorized", "Not authorized");
  }

  const month =
    req.nextUrl.searchParams.get("month") ?? new Date().toISOString().slice(0, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    return fail(422, "invalid_month", "Use month=YYYY-MM");
  }

  try {
    return ok(await getMonthlyReport(month));
  } catch (err) {
    return serverError("monthly-report", err);
  }
}
