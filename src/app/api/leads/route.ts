import { NextResponse } from "next/server";
import { leadSchema } from "@/lib/lead-schema";
import { sendMetaLead } from "@/lib/meta-conversions";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const result = leadSchema.safeParse(body);

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

  let response: Response;

  try {
    response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: webhookSecret,
        submittedAt: new Date().toISOString(),
        clubName: result.data.clubName,
        contactName: result.data.contactName,
        email: result.data.email,
        phone: result.data.phone || "",
        clubSize: result.data.clubSize || "",
        organizationType: result.data.organizationType,
        message: result.data.message || "",
        consent: result.data.consent,
        source: result.data.source || "",
        utm_source: result.data.utm_source || "",
        utm_medium: result.data.utm_medium || "",
        utm_campaign: result.data.utm_campaign || "",
        utm_content: result.data.utm_content || "",
        utm_term: result.data.utm_term || "",
        eventId: result.data.eventId || "",
        eventSourceUrl: result.data.eventSourceUrl || "",
      }),
    });
  } catch {
    return NextResponse.json({ error: "Nie udało się zapisać zgłoszenia. Spróbuj ponownie." }, { status: 502 });
  }

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
