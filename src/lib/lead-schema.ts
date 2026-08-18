import { z } from "zod";

export const clubSizeOptions = [
  "Do 50 zawodników",
  "51–150 zawodników",
  "151–300 zawodników",
  "301–500 zawodników",
  "Ponad 500 zawodników",
] as const;

export const leadSchema = z.object({
  clubName: z.string().trim().min(2, "Podaj nazwę klubu.").max(120),
  contactName: z.string().trim().min(2, "Podaj imię i nazwisko.").max(120),
  email: z.email("Podaj poprawny adres e-mail."),
  phone: z.string().trim().max(40).optional(),
  clubSize: z.enum(clubSizeOptions, "Wybierz rozmiar klubu.").optional(),
  organizationType: z.enum(["Klub sportowy", "Akademia", "Szkółka", "Inny"]).optional(),
  message: z.string().trim().max(1000).optional(),
  consent: z.literal(true, "Zaznacz zgodę na kontakt."),
  website: z.string().max(0).optional(),
  source: z.string().trim().max(120).optional(),
  utm_source: z.string().trim().max(120).optional(),
  utm_medium: z.string().trim().max(120).optional(),
  utm_campaign: z.string().trim().max(120).optional(),
  utm_content: z.string().trim().max(120).optional(),
  utm_term: z.string().trim().max(120).optional(),
  eventId: z.string().trim().max(120).optional(),
  eventSourceUrl: z.url().max(500).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
