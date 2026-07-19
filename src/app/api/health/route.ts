import { ok } from "@/lib/api/respond";
import { USE_MOCK_DATA } from "@/lib/validation/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Lightweight health check for uptime monitoring / deploy verification. */
export function GET() {
  return ok({ status: "healthy", mock: USE_MOCK_DATA, time: new Date().toISOString() });
}
