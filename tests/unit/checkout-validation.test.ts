import { describe, it, expect } from "vitest";
import { checkoutSchema, indianPhone, indianPin } from "@/lib/validation/checkout";

describe("Indian phone validation", () => {
  it.each(["9740835597", "+919740835597", "09740835597"])("accepts %s", (value) => {
    expect(indianPhone.safeParse(value).success).toBe(true);
  });
  it.each(["1234567890", "97408", "abcdefghij", "5740835597"])("rejects %s", (value) => {
    expect(indianPhone.safeParse(value).success).toBe(false);
  });
});

describe("Indian PIN validation", () => {
  it("accepts a valid 6-digit PIN", () => {
    expect(indianPin.safeParse("560023").success).toBe(true);
  });
  it.each(["012345", "56002", "5600233", "abcdef"])("rejects %s", (value) => {
    expect(indianPin.safeParse(value).success).toBe(false);
  });
});

describe("checkout schema", () => {
  const base = {
    fullName: "Test Buyer",
    email: "buyer@example.com",
    phone: "9740835597",
    addressLine1: "42, 13th Main",
    city: "Bengaluru",
    state: "Karnataka",
    postalCode: "560023",
    country: "India",
    paymentMethod: "upi",
  };

  it("accepts a complete valid payload", () => {
    expect(checkoutSchema.safeParse(base).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    expect(checkoutSchema.safeParse({ ...base, email: "nope" }).success).toBe(false);
  });

  it("rejects an unknown payment method", () => {
    expect(checkoutSchema.safeParse({ ...base, paymentMethod: "bitcoin" }).success).toBe(false);
  });
});
