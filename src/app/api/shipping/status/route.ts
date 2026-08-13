import type { NextRequest } from "next/server";
import { POST as handleShiprocketStatus } from "@/app/api/shiprocket/webhook/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public Shiprocket callback URL.
 * Shiprocket rejects webhook URLs containing reserved provider terms, so this
 * neutral external path delegates to the authenticated status handler.
 */
export async function POST(req: NextRequest) {
  return handleShiprocketStatus(req);
}
