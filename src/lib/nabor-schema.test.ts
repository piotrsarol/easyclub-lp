import { describe, expect, it } from "vitest";
import { naborLeadSchema } from "./nabor-schema";

const validNaborLead = {
  clubName: "Klub Sportowy",
  contactName: "Jan Kowalski",
  email: "jan@example.com",
  phone: "500 600 700",
  athleteCount: "42",
  consent: true,
  website: "",
  source: "nabor" as const,
  utmSource: "meta",
  utmCampaign: "pilot",
};

describe("naborLeadSchema", () => {
  it("accepts a valid campaign submission and coerces athlete count", () => {
    const result = naborLeadSchema.safeParse(validNaborLead);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.athleteCount).toBe(42);
      expect(result.data.utmSource).toBe("meta");
    }
  });

  it("requires the campaign source and consent", () => {
    expect(naborLeadSchema.safeParse({ ...validNaborLead, source: "main" }).success).toBe(false);
    expect(naborLeadSchema.safeParse({ ...validNaborLead, consent: false }).success).toBe(false);
  });
});
