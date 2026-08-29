// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  insert: vi.fn(),
  sendEmail: vi.fn(),
  notifyInternal: vi.fn(),
}));

vi.mock("@/lib/validation/env", () => ({
  USE_MOCK_DATA: false,
  SITE_URL: "https://www.varaorganic.com",
}));
vi.mock("@/lib/supabase/admin", () => ({
  getAdminSupabase: () => ({
    from: () => ({ insert: mocks.insert }),
  }),
}));
vi.mock("@/lib/resend/server", () => ({
  sendEmail: mocks.sendEmail,
  notifyInternal: mocks.notifyInternal,
}));
vi.mock("@/lib/security/rate-limit", () => ({
  checkRateLimit: () => ({ success: true }),
  clientIp: () => "127.0.0.1",
}));

import { POST } from "@/app/api/contact/route";

describe("POST /api/contact restock request", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.insert.mockResolvedValue({ error: null });
    mocks.sendEmail.mockResolvedValue({ ok: true });
    mocks.notifyInternal.mockResolvedValue({ ok: true });
  });

  it("stores the exact selection and emails both the customer and admin", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Anita Rao",
          email: "anita@example.com",
          phone: "9876543210",
          message: "Please let me know soon.",
          intent: "restock",
          productName: "A2 Gir Cow Bilona Ghee",
          variantName: "500ml",
          sku: "GHE-500",
          company: "",
        }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      submitted: true,
      restockRequested: true,
    });
    expect(mocks.insert).toHaveBeenCalledWith({
      name: "Anita Rao",
      email: "anita@example.com",
      phone: "9876543210",
      message:
        "BACK-IN-STOCK REQUEST\nProduct: A2 Gir Cow Bilona Ghee\nSelected size: 500ml\nSKU: GHE-500\nCustomer note: Please let me know soon.",
    });
    expect(mocks.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "anita@example.com",
        subject: expect.stringContaining("Restock request received"),
        html: expect.stringContaining("500ml"),
      }),
    );
    expect(mocks.notifyInternal).toHaveBeenCalledWith(
      "Restock request: A2 Gir Cow Bilona Ghee (500ml)",
      expect.stringContaining("GHE-500"),
      "anita@example.com",
    );
  });

  it("rejects a restock request without the selected size", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: "Anita Rao",
          email: "anita@example.com",
          message: "",
          intent: "restock",
          productName: "A2 Gir Cow Bilona Ghee",
          company: "",
        }),
      }),
    );

    expect(response.status).toBe(422);
    expect(mocks.insert).not.toHaveBeenCalled();
    expect(mocks.notifyInternal).not.toHaveBeenCalled();
  });
});
