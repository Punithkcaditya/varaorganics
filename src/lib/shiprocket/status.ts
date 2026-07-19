import type { FulfillmentStatus } from "@/types";

/**
 * Map Shiprocket's free-text status onto our fulfilment enum.
 *
 * Order matters: "undelivered" contains "delivered", so failure states are
 * checked before the success state. Returns null for statuses we don't act on.
 */
export function mapShiprocketStatus(raw: string): FulfillmentStatus | null {
  const s = raw.toLowerCase();

  // Failure states first — "undelivered" would otherwise match "delivered".
  if (
    s.includes("undelivered") ||
    s.includes("ndr") ||
    s.includes("rto") ||
    s.includes("failed") ||
    s.includes("lost")
  ) {
    return "failed";
  }
  if (s.includes("cancel")) return "cancelled";
  if (s.includes("delivered")) return "delivered";
  if (s.includes("out for delivery") || s.includes("in transit") || s.includes("shipped")) {
    return "shipped";
  }
  if (s.includes("pickup") || s.includes("processing") || s.includes("manifest")) {
    return "processing";
  }
  return null;
}
