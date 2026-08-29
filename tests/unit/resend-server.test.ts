// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  env: {} as Record<string, string | undefined>,
  emailsSend: vi.fn(),
  eventsSend: vi.fn(),
  contactsCreate: vi.fn(),
  segmentAdd: vi.fn(),
  safeError: vi.fn(),
  safeLog: vi.fn(),
}));

vi.mock("@/lib/validation/env", () => ({
  USE_MOCK_DATA: false,
  optionalServerEnv: (key: string) => mocks.env[key],
}));
vi.mock("@/lib/security/redact", () => ({
  safeError: mocks.safeError,
  safeLog: mocks.safeLog,
}));
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mocks.emailsSend };
    events = { send: mocks.eventsSend };
    contacts = {
      create: mocks.contactsCreate,
      segments: { add: mocks.segmentAdd },
    };
  },
}));

import { addContact, sendEmail, sendResendEvent } from "@/lib/resend/server";

describe("Resend server integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.env = {
      RESEND_API_KEY: "re_test",
      RESEND_SEGMENT_ID: "seg_newsletter",
      EMAIL_FROM: "Vara Organics <no-reply@updates.varaorganic.com>",
      EMAIL_REPLY_TO: "hello@varaorganic.com",
    };
    mocks.emailsSend.mockResolvedValue({ data: { id: "email_1" }, error: null });
    mocks.eventsSend.mockResolvedValue({ data: { id: "event_1" }, error: null });
    mocks.contactsCreate.mockResolvedValue({ data: { id: "contact_1" }, error: null });
    mocks.segmentAdd.mockResolvedValue({ data: { id: "contact_1" }, error: null });
  });

  it("sets the verified sender and a real reply-to address", async () => {
    const result = await sendEmail({
      to: "customer@example.com",
      subject: "Order confirmed",
      html: "<p>Thanks</p>",
    });

    expect(result).toEqual({ ok: true });
    expect(mocks.emailsSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Vara Organics <no-reply@updates.varaorganic.com>",
        replyTo: "hello@varaorganic.com",
      }),
    );
  });

  it("adds a newsletter signup to the current Resend Segment API", async () => {
    const result = await addContact({ email: "reader@example.com", firstName: "Reader" });

    expect(result).toEqual({ ok: true });
    expect(mocks.contactsCreate).toHaveBeenCalledWith({
      email: "reader@example.com",
      firstName: "Reader",
      unsubscribed: false,
      segments: [{ id: "seg_newsletter" }],
    });
  });

  it("keeps the existing production variable name as a Segment ID fallback", async () => {
    delete mocks.env.RESEND_SEGMENT_ID;
    mocks.env.RESEND_AUDIENCE_ID = "seg_legacy_name";

    await addContact({ email: "reader@example.com" });

    expect(mocks.contactsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ segments: [{ id: "seg_legacy_name" }] }),
    );
  });

  it("enrols an existing global contact into the newsletter segment", async () => {
    mocks.contactsCreate.mockResolvedValueOnce({
      data: null,
      error: { message: "Contact already exists" },
    });

    const result = await addContact({ email: "existing@example.com" });

    expect(result).toEqual({ ok: true });
    expect(mocks.segmentAdd).toHaveBeenCalledWith({
      email: "existing@example.com",
      segmentId: "seg_newsletter",
    });
  });

  it("reports missing production configuration instead of pretending an email sent", async () => {
    delete mocks.env.RESEND_API_KEY;

    const result = await sendEmail({
      to: "customer@example.com",
      subject: "Order confirmed",
      html: "<p>Thanks</p>",
    });

    expect(result).toEqual({ ok: false, reason: "not_configured" });
    expect(mocks.emailsSend).not.toHaveBeenCalled();
  });

  it("sends lifecycle events with their customer payload", async () => {
    const result = await sendResendEvent({
      event: "vara/newsletter.subscribed",
      email: "reader@example.com",
      payload: { first_name: "Reader" },
    });

    expect(result).toEqual({ ok: true });
    expect(mocks.eventsSend).toHaveBeenCalledWith({
      event: "vara/newsletter.subscribed",
      email: "reader@example.com",
      payload: { first_name: "Reader" },
    });
  });
});
