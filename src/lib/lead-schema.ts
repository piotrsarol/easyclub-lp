import { z } from "zod";

export const leadSchema = z.object({
  clubName: z.string().trim().min(2, "Podaj nazwę klubu.").max(120),
  contactName: z.string().trim().min(2, "Podaj imię i nazwisko.").max(120),
  email: z.email("Podaj poprawny adres e-mail."),
  phone: z.string().trim().max(40).optional(),
  clubSize: z.string().trim().max(40).optional(),
  organizationType: z.enum(["Klub sportowy", "Akademia", "Szkółka", "Inny"]),
  message: z.string().trim().max(1000).optional(),
  consent: z.literal(true, "Zaznacz zgodę na kontakt."),
  website: z.string().max(0).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
