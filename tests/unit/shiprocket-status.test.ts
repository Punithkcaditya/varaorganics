import { describe, it, expect } from "vitest";
import { mapShiprocketStatus } from "@/lib/shiprocket/status";

/**
 * The webhook drives customer notifications and NDR alerts off this mapping, so
 * a wrong match would email a customer that a failed delivery succeeded.
 */
describe("mapShiprocketStatus", () => {
  it("maps delivery success", () => {
    expect(mapShiprocketStatus("DELIVERED")).toBe("delivered");
    expect(mapShiprocketStatus("Delivered to consignee")).toBe("delivered");
  });

  it("treats 'undelivered' as a failure, not a delivery", () => {
    // "undelivered" contains "delivered" — the classic ordering bug.
    expect(mapShiprocketStatus("UNDELIVERED")).toBe("failed");
    expect(mapShiprocketStatus("Undelivered - customer not available")).toBe("failed");
  });

  it.each(["NDR raised", "RTO Initiated", "Pickup failed", "Shipment lost"])(
    "maps %s to failed",
    (status) => {
      expect(mapShiprocketStatus(status)).toBe("failed");
    },
  );

  it("maps in-transit states to shipped", () => {
    expect(mapShiprocketStatus("IN TRANSIT")).toBe("shipped");
    expect(mapShiprocketStatus("Out for delivery")).toBe("shipped");
    expect(mapShiprocketStatus("Shipped")).toBe("shipped");
  });

  it("maps early states to processing", () => {
    expect(mapShiprocketStatus("Pickup Scheduled")).toBe("processing");
    expect(mapShiprocketStatus("Manifested")).toBe("processing");
  });

  it("maps cancellation", () => {
    expect(mapShiprocketStatus("Canceled")).toBe("cancelled");
  });

  it("returns null for statuses we don't act on", () => {
    expect(mapShiprocketStatus("Some unknown label")).toBeNull();
    expect(mapShiprocketStatus("")).toBeNull();
  });
});
