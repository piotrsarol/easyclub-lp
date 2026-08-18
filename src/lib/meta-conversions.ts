import { createHash } from "node:crypto";

type MetaLeadInput = {
  email: string;
  eventId: string;
  eventSourceUrl: string;
  phone?: string;
  request: Request;
};

const consentCookieName = "easyclub-cookie-consent";

export async function sendMetaLead({ email, eventId, eventSourceUrl, phone, request }: MetaLeadInput) {
  const accessToken =
    process.env.META_CONVERSIONS_API_ACCESS_TOKEN || process.env.META_CAPI_ACCESS_TOKEN;
  const pixelId = process.env.META_PIXEL_ID;

  if (!accessToken || !pixelId || getCookie(request, consentCookieName) !== "accepted") {
    return;
  }

  const userData: Record<string, string> = {
    em: hashValue(email.trim().toLowerCase()),
    client_user_agent: request.headers.get("user-agent") || "",
  };
  const normalizedPhone = phone ? phone.replace(/\D/g, "") : "";

  if (normalizedPhone) {
    userData.ph = hashValue(normalizedPhone);
  }

  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwardedFor) {
    userData.client_ip_address = forwardedFor;
  }

  const fbp = getCookie(request, "_fbp");
  const fbc = getCookie(request, "_fbc");

  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;

  const apiVersion = process.env.META_CAPI_API_VERSION || "v20.0";
  const response = await fetch(`https://graph.facebook.com/${apiVersion}/${pixelId}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      data: [
        {
          action_source: "website",
          event_id: eventId,
          event_name: "Lead",
          event_source_url: eventSourceUrl,
          event_time: Math.floor(Date.now() / 1000),
          user_data: userData,
        },
      ],
    }),
    signal: AbortSignal.timeout(3000),
  });

  if (!response.ok) {
    console.error("Meta Conversions API returned an error", response.status);
  }
}

function getCookie(request: Request, name: string) {
  const cookies = request.headers.get("cookie")?.split(";") || [];
  const cookie = cookies.find((value) => value.trim().startsWith(`${name}=`));
  return cookie?.split("=")[1];
}

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
