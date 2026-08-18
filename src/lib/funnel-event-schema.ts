import { z } from "zod";
import { funnelEventNames } from "./funnel-events";

export const funnelEventSchema = z.object({
  event: z.enum(funnelEventNames),
  eventId: z.string().trim().min(1).max(120),
  sessionId: z.string().trim().min(1).max(120),
  path: z.string().trim().max(300),
  referrer: z.string().trim().max(300).optional(),
  form: z.enum(["main", "pilot", "nabor"]).optional(),
  source: z.string().trim().max(120).optional(),
  utm_source: z.string().trim().max(120).optional(),
  utm_medium: z.string().trim().max(120).optional(),
  utm_campaign: z.string().trim().max(120).optional(),
  utm_content: z.string().trim().max(120).optional(),
  utm_term: z.string().trim().max(120).optional(),
});

export type FunnelEventInput = z.infer<typeof funnelEventSchema>;
