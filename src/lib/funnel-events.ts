import { createMarketingEventId } from "./marketing-events";

export const funnelEventNames = [
  "page_view",
  "form_view",
  "form_start",
  "form_submit",
  "validation_error",
  "submit_success",
  "submit_error",
  "lead",
  "cta_click",
] as const;

export type FunnelEventName = (typeof funnelEventNames)[number];
export type FunnelForm = "main" | "pilot" | "nabor";

const sessionStorageKey = "easyclub-funnel-session";
const attributionStorageKey = "easyclub-campaign-attribution";
const attributionKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

type FunnelEventOptions = {
  form?: FunnelForm;
  source?: string;
};

export function trackFunnelEvent(event: FunnelEventName, options: FunnelEventOptions = {}) {
  const payload = {
    event,
    eventId: createMarketingEventId(),
    sessionId: getSessionId(),
    path: window.location.pathname,
    referrer: getReferrerOrigin(),
    form: options.form,
    source: options.source || getAttribution().utm_source || "",
    utm_source: getAttribution().utm_source || "",
    utm_medium: getAttribution().utm_medium || "",
    utm_campaign: getAttribution().utm_campaign || "",
    utm_content: getAttribution().utm_content || "",
    utm_term: getAttribution().utm_term || "",
  };

  void fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => undefined);
}

function getSessionId() {
  const existing = window.sessionStorage.getItem(sessionStorageKey);
  if (existing) return existing;

  const sessionId = createMarketingEventId();
  window.sessionStorage.setItem(sessionStorageKey, sessionId);
  return sessionId;
}

function getAttribution() {
  const query = new URLSearchParams(window.location.search);
  const stored = window.sessionStorage.getItem(attributionStorageKey);
  let previous: Record<string, string> = {};

  try {
    previous = stored ? (JSON.parse(stored) as Record<string, string>) : {};
  } catch {
    window.sessionStorage.removeItem(attributionStorageKey);
  }

  const next = { ...previous };
  for (const key of attributionKeys) {
    const value = query.get(key);
    if (value) next[key] = value;
  }

  window.sessionStorage.setItem(attributionStorageKey, JSON.stringify(next));
  return next;
}

function getReferrerOrigin() {
  if (!document.referrer) return "";

  try {
    return new URL(document.referrer).origin;
  } catch {
    return "";
  }
}
