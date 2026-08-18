import { z } from "zod";

export const naborLeadSchema = z.object({
  clubName: z.string().trim().min(2, "Podaj nazwę klubu.").max(120),
  contactName: z.string().trim().min(2, "Podaj imię i nazwisko.").max(120),
  email: z.email("Podaj poprawny adres e-mail."),
  phone: z.string().trim().max(40).optional(),
  athleteCount: z.coerce.number().int().min(1).max(100000).optional(),
  consent: z.literal(true, "Zaznacz zgodę na kontakt."),
  website: z.string().max(0).optional(),
  source: z.literal("nabor"),
  utmSource: z.string().max(120).optional(),
  utmMedium: z.string().max(120).optional(),
  utmCampaign: z.string().max(120).optional(),
  utmContent: z.string().max(120).optional(),
  utmTerm: z.string().max(120).optional(),
  eventId: z.string().max(120).optional(),
  eventSourceUrl: z.url().max(500).optional(),
});

export type NaborLeadInput = z.infer<typeof naborLeadSchema>;
