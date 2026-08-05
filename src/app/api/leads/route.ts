import { NextResponse } from "next/server";
import { leadSchema } from "@/lib/lead-schema";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const result = leadSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: "Sprawdź zaznaczone pola i spróbuj ponownie." }, { status: 400 });
  }

  if (result.data.website) {
    return NextResponse.json({ ok: true });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const leadsTable = process.env.SUPABASE_LEADS_TABLE ?? "pilot_leads";

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Formularz nie jest jeszcze podłączony. Napisz do nas bezpośrednio: hello@easyclub.pl." },
      { status: 503 },
    );
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${leadsTable}`, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      club_name: result.data.clubName,
      contact_name: result.data.contactName,
      email: result.data.email,
      phone: result.data.phone || null,
      club_size: result.data.clubSize || null,
      organization_type: result.data.organizationType,
      message: result.data.message || null,
      consent: result.data.consent,
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Nie udało się zapisać zgłoszenia. Spróbuj ponownie." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
