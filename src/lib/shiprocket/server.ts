import "server-only";
import { optionalServerEnv, USE_MOCK_DATA } from "@/lib/validation/env";
import { safeError, safeLog } from "@/lib/security/redact";
import type { Order } from "@/types";

/**
 * Typed Shiprocket service. Server-only. Handles auth with an in-memory token
 * cache, shipment creation, and structured errors with sensitive fields
 * redacted. In mock mode returns a simulated shipment so orders complete
 * offline. Pickup location comes from env — never hardcode an unconfirmed
 * address (Dev Kit §09).
 */

const BASE = "https://apiv2.shiprocket.in/v1/external";

interface TokenCache {
  token: string;
  expiresAt: number;
}
let tokenCache: TokenCache | null = null;

async function authenticate(): Promise<string | null> {
  if (USE_MOCK_DATA) return null;
  const email = optionalServerEnv("SHIPROCKET_EMAIL");
  const password = optionalServerEnv("SHIPROCKET_PASSWORD");
  if (!email || !password) return null;

  if (tokenCache && tokenCache.expiresAt > Date.now()) return tokenCache.token;

  try {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(`auth ${res.status}`);
    const data = (await res.json()) as { token?: string };
    if (!data.token) throw new Error("no token");
    // Shiprocket tokens last ~10 days; cache for 9 to be safe.
    tokenCache = { token: data.token, expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000 };
    return data.token;
  } catch (err) {
    safeError("shiprocket", "authenticate failed", { err: String(err) });
    return null;
  }
}

export interface ShipmentResult {
  ok: boolean;
  shipmentId: string | null;
  awb: string | null;
  courier: string | null;
  trackingUrl: string | null;
  error?: string;
}

const FAILED: ShipmentResult = {
  ok: false,
  shipmentId: null,
  awb: null,
  courier: null,
  trackingUrl: null,
  error: "shiprocket_unavailable",
};

/** Create a shipment for a paid order. Never throws — returns a status. */
export async function createShipment(order: Order): Promise<ShipmentResult> {
  if (USE_MOCK_DATA) {
    return {
      ok: true,
      shipmentId: `SHIP-MOCK-${order.orderNumber}`,
      awb: `AWB${Math.floor(Math.random() * 1e10)}`,
      courier: "Mock Courier",
      trackingUrl: `https://shiprocket.co/tracking/AWBMOCK`,
    };
  }

  const token = await authenticate();
  const pickup = optionalServerEnv("SHIPROCKET_PICKUP_LOCATION");
  if (!token || !pickup) {
    safeLog("shiprocket", "createShipment skipped — not configured");
    return FAILED;
  }

  try {
    const payload = {
      order_id: order.orderNumber,
      order_date: order.createdAt.slice(0, 10),
      pickup_location: pickup,
      billing_customer_name: order.address.fullName,
      billing_last_name: "",
      billing_address: order.address.addressLine1,
      billing_address_2: order.address.addressLine2 ?? "",
      billing_city: order.address.city,
      billing_pincode: order.address.postalCode,
      billing_state: order.address.state,
      billing_country: order.address.country,
      billing_email: order.email,
      billing_phone: order.address.phone,
      shipping_is_billing: true,
      order_items: order.items.map((i) => ({
        name: `${i.productName} ${i.size}`,
        sku: i.sku,
        units: i.quantity,
        selling_price: i.unitPrice,
      })),
      payment_method: order.paymentMethod === "cod" ? "COD" : "Prepaid",
      sub_total: order.subtotal,
      length: 15,
      breadth: 15,
      height: 15,
      weight: 1,
    };

    const res = await fetch(`${BASE}/orders/create/adhoc`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`create ${res.status}`);
    const data = (await res.json()) as {
      shipment_id?: number;
      awb_code?: string;
      courier_name?: string;
    };
    const awb = data.awb_code ?? null;
    return {
      ok: true,
      shipmentId: data.shipment_id ? String(data.shipment_id) : null,
      awb,
      courier: data.courier_name ?? null,
      trackingUrl: awb ? `https://shiprocket.co/tracking/${awb}` : null,
    };
  } catch (err) {
    safeError("shiprocket", "createShipment failed", { err: String(err), order: order.orderNumber });
    return FAILED;
  }
}
