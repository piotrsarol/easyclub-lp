import { describe, expect, it } from "vitest";
import { funnelEventSchema } from "./funnel-event-schema";

describe("funnelEventSchema", () => {
  it("accepts an attributed event without personal data", () => {
    expect(
      funnelEventSchema.safeParse({
        event: "form_start",
        eventId: "event-1",
        sessionId: "session-1",
        path: "/pilot",
        form: "pilot",
        source: "pilot-landing",
        utm_source: "facebook",
      }).success,
    ).toBe(true);
  });

  it("rejects unknown event names and oversized values", () => {
    expect(
      funnelEventSchema.safeParse({
        event: "email_submitted",
        eventId: "event-1",
        sessionId: "session-1",
        path: "/pilot",
      }).success,
    ).toBe(false);
    expect(
      funnelEventSchema.safeParse({
        event: "page_view",
        eventId: "event-1",
        sessionId: "session-1",
        path: "/".repeat(301),
      }).success,
    ).toBe(false);
  });
});
