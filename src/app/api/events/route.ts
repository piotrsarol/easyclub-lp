import { NextResponse } from "next/server";
import { funnelEventSchema } from "@/lib/funnel-event-schema";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const result = funnelEventSchema.safeParse(body);

  if (!result.success) {
    return new NextResponse(null, { status: 204 });
  }

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const webhookSecret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;

  if (!webhookUrl || !webhookSecret) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: webhookSecret,
        eventType: result.data.event,
        eventId: result.data.eventId,
        sessionId: result.data.sessionId,
        path: result.data.path,
        referrer: result.data.referrer || "",
        form: result.data.form || "",
        source: result.data.source || "",
        utmSource: result.data.utm_source || "",
        utmMedium: result.data.utm_medium || "",
        utmCampaign: result.data.utm_campaign || "",
        utmContent: result.data.utm_content || "",
        utmTerm: result.data.utm_term || "",
        occurredAt: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  return new NextResponse(null, { status: 204 });
}
