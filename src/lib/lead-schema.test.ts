import { describe, expect, it } from "vitest";
import { leadSchema } from "./lead-schema";

const validLead = {
  clubName: "Akademia Orlik",
  contactName: "Jan Kowalski",
  email: "jan@orlik.pl",
  organizationType: "Akademia" as const,
  clubSize: "51–150 zawodników" as const,
  consent: true as const,
  website: "",
};

describe("leadSchema", () => {
  it("accepts a valid pilot application", () => {
    expect(leadSchema.safeParse(validLead).success).toBe(true);
  });

  it("rejects incomplete or invalid contact details", () => {
    expect(leadSchema.safeParse({ ...validLead, email: "nie-email" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...validLead, clubSize: "" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...validLead, consent: false }).success).toBe(false);
  });
});
