import { NextResponse } from "next/server";
import { naborLeadSchema } from "@/lib/nabor-schema";
import { sendMetaLead } from "@/lib/meta-conversions";

const attempts = new Map<string, { count: number; resetAt: number }>();
const rateLimitWindow = 10 * 60 * 1000;
const rateLimitCount = 5;

function getClientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function isRateLimited(key: string) {
  const now = Date.now();
  const current = attempts.get(key);

  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + rateLimitWindow });
    return false;
  }

  current.count += 1;
  return current.count > rateLimitCount;
}

export async function POST(request: Request) {
  const clientKey = getClientKey(request);

  if (isRateLimited(clientKey)) {
    return NextResponse.json(
      { error: "Zbyt wiele prób. Odczekaj chwilę i spróbuj ponownie." },
      { status: 429 },
    );
  }

  const body: unknown = await request.json().catch(() => null);
  const result = naborLeadSchema.safeParse(body);

  if (!result.success) {
    const fieldErrors: Record<string, string> = {};

    for (const issue of result.error.issues) {
      const field = String(issue.path[0] ?? "form");
      fieldErrors[field] ??= issue.message;
    }

    return NextResponse.json(
      { error: "Sprawdź zaznaczone pola i spróbuj ponownie.", fieldErrors },
      { status: 400 },
    );
  }

  if (result.data.website) {
    return NextResponse.json({ ok: true });
  }

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const webhookSecret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;

  if (!webhookUrl || !webhookSecret) {
    return NextResponse.json(
      { error: "Formularz nie jest jeszcze podłączony. Napisz do nas bezpośrednio: hello@easyclub.pl." },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: webhookSecret,
        submittedAt: new Date().toISOString(),
        clubName: result.data.clubName,
        contactName: result.data.contactName,
        email: result.data.email,
        phone: result.data.phone,
        clubSize: result.data.athleteCount ? `${result.data.athleteCount} zawodników` : "",
        organizationType: "Klub sportowy",
        message: "Źródło: Nabór",
        consent: result.data.consent,
        source: result.data.source,
        athleteCount: result.data.athleteCount || "",
        utmSource: result.data.utmSource || "",
        utmMedium: result.data.utmMedium || "",
        utmCampaign: result.data.utmCampaign || "",
        utmContent: result.data.utmContent || "",
        utmTerm: result.data.utmTerm || "",
        eventId: result.data.eventId || "",
        eventSourceUrl: result.data.eventSourceUrl || "",
      }),
    });

    const webhookBody = await response.text();
    let webhookResult: { ok?: boolean } | null = null;

    try {
      webhookResult = JSON.parse(webhookBody) as { ok?: boolean };
    } catch {
      webhookResult = null;
    }

    if (!response.ok || webhookResult?.ok === false) {
      return NextResponse.json({ error: "Nie udało się zapisać zgłoszenia. Spróbuj ponownie." }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ error: "Nie udało się zapisać zgłoszenia. Spróbuj ponownie." }, { status: 502 });
  }

  if (result.data.eventId && result.data.eventSourceUrl) {
    try {
      await sendMetaLead({
        email: result.data.email,
        eventId: result.data.eventId,
        eventSourceUrl: result.data.eventSourceUrl,
        phone: result.data.phone,
        request,
      });
    } catch {
      console.error("Meta Conversions API request failed");
    }
  }

  return NextResponse.json({ ok: true });
}
