// @vitest-environment node
import { describe, it, expect } from "vitest";
import QRCode from "qrcode";
import { toWhatsAppNumber } from "@/lib/wati/server";
import { canonical } from "@/config/site";

describe("toWhatsAppNumber", () => {
  it("adds the country code to a bare 10-digit mobile", () => {
    expect(toWhatsAppNumber("9740835597")).toBe("919740835597");
  });

  it("keeps an already-prefixed number", () => {
    expect(toWhatsAppNumber("+919740835597")).toBe("919740835597");
    expect(toWhatsAppNumber("919740835597")).toBe("919740835597");
  });

  it("strips a leading 0 and formatting characters", () => {
    expect(toWhatsAppNumber("09740835597")).toBe("919740835597");
    expect(toWhatsAppNumber("+91 97408-35597")).toBe("919740835597");
  });
});

describe("batch QR code", () => {
  it("encodes the canonical verify URL for the batch", async () => {
    const batch = "GHE-2024-047";
    const url = canonical(`verify/${batch}`);
    const svg = await QRCode.toString(url, { type: "svg", margin: 1 });

    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain("path");
    // The verify URL must have no trailing slash (canonical rule).
    expect(url).toMatch(/\/verify\/GHE-2024-047$/);
  });
});
