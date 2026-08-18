"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { createMarketingEventId } from "@/lib/marketing-events";
import { trackFunnelEvent } from "@/lib/funnel-events";
import { BrandLogo, BrandMark } from "../brand-logo";

const attributionStorageKey = "easyclub-campaign-attribution";
const attributionKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

type Attribution = Partial<Record<(typeof attributionKeys)[number], string>>;

function trackMetaEvent(eventName: string, custom = false) {
  const browserWindow = window as Window & {
    fbq?: (...args: unknown[]) => void;
  };

  if (custom) {
    browserWindow.fbq?.("trackCustom", eventName);
  } else {
    browserWindow.fbq?.("track", eventName);
  }
}

function trackMetaLead(eventId: string) {
  const browserWindow = window as Window & {
    fbq?: (...args: unknown[]) => void;
  };

  browserWindow.fbq?.("track", "Lead", {}, { eventID: eventId });
}

function readAttribution(): Attribution {
  const query = new URLSearchParams(window.location.search);
  const stored = window.sessionStorage.getItem(attributionStorageKey);
  let previous: Attribution = {};

  try {
    previous = stored ? (JSON.parse(stored) as Attribution) : {};
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

export function PilotLanding() {
  const [attribution, setAttribution] = useState<Attribution>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setAttribution(readAttribution());
    track("pilot_landing_view");
    trackFunnelEvent("page_view", { form: "pilot", source: "pilot-landing" });
    trackMetaEvent("ViewContent");
    const form = formRef.current;
    if (!form) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        trackFunnelEvent("form_view", { form: "pilot", source: "pilot-landing" });
        observer.disconnect();
      }
    });
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  function handleFormStart() {
    if (started) return;
    setStarted(true);
    track("pilot_form_start");
    trackFunnelEvent("form_start", { form: "pilot", source: "pilot-landing" });
    trackMetaEvent("PilotFormStart", true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    track("pilot_form_submit");
    trackFunnelEvent("form_submit", { form: "pilot", source: "pilot-landing" });
    trackMetaEvent("PilotFormSubmit", true);

    const form = new FormData(event.currentTarget);
    const eventId = createMarketingEventId();
    const payload = {
      clubName: String(form.get("clubName") ?? ""),
      contactName: String(form.get("contactName") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      consent: form.get("consent") === "on",
      website: String(form.get("website") ?? ""),
      source: "pilot-landing",
      eventId,
      eventSourceUrl: window.location.href,
      ...attribution,
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) throw new Error(data.error || "Nie udało się wysłać zgłoszenia.");

      track("pilot_form_success");
      trackMetaLead(eventId);
      trackFunnelEvent("submit_success", { form: "pilot", source: "pilot-landing" });
      trackFunnelEvent("lead", { form: "pilot", source: "pilot-landing" });
      setSubmitted(true);
      formRef.current?.reset();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Spróbuj ponownie.");
      track("pilot_form_error");
      trackFunnelEvent("submit_error", { form: "pilot", source: "pilot-landing" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="pilot-landing-page">
      <header className="pilot-landing-header">
        <BrandLogo href="/" />
        <Link className="pilot-landing-header-link" href="/" onClick={() => trackFunnelEvent("cta_click", { form: "pilot", source: "pilot-landing" })}>
          Wróć na stronę główną <span>↗</span>
        </Link>
      </header>

      <section className="pilot-landing-hero">
        <div className="pilot-landing-copy">
          <div className="pilot-landing-eyebrow">
            <span className="pulse-dot" /> Program pilotażowy EasyClub
          </div>
          <h1>Więcej porządku w klubie. <em>Więcej kontroli nad przychodem.</em></h1>
          <p>
            Wypróbuj system, który pilnuje składek, porządkuje treningi, zawodników i komunikację
            oraz pomaga nie gubić osób zainteresowanych dołączeniem do klubu.
          </p>
          <ul className="pilot-landing-benefits">
            <li><BrandMark dark /> Składki i płatności pod kontrolą</li>
            <li><BrandMark dark /> Treningi, zawodnicy i komunikacja w jednym miejscu</li>
            <li><BrandMark dark /> Mniej ręcznej pracy i mniej utraconego przychodu</li>
          </ul>
        </div>

        <div className="pilot-landing-card" id="formularz">
          {submitted ? (
            <div className="pilot-landing-success" role="status">
              <span className="pilot-landing-success-mark">✓</span>
              <h2>Zgłoszenie dotarło.</h2>
              <p>Odezwiemy się, żeby ustalić kolejny krok dla Twojego klubu.</p>
            </div>
          ) : (
            <>
              <div className="pilot-landing-offer">
                <span>PILOT 10</span>
                <strong>30 dni bez opłat</strong>
                <small>Bez automatycznego obciążenia po okresie próbnym.</small>
              </div>
              <form ref={formRef} className="pilot-landing-form" onSubmit={handleSubmit} onInvalidCapture={() => trackFunnelEvent("validation_error", { form: "pilot", source: "pilot-landing" })}>
                <div className="pilot-landing-form-heading">
                  <h2>Sprawdź EasyClub w swoim klubie.</h2>
                  <p>Zostaw kontakt. Wrócimy z konkretnym kolejnym krokiem.</p>
                </div>
                <label>
                  Nazwa klubu
                  <input name="clubName" placeholder="np. Akademia Orlik" required onFocus={handleFormStart} />
                </label>
                <label>
                  Imię i nazwisko
                  <input name="contactName" placeholder="Jan Kowalski" required onFocus={handleFormStart} />
                </label>
                <label>
                  E-mail
                  <input name="email" type="email" placeholder="jan@klub.pl" required onFocus={handleFormStart} />
                </label>
                <label>
                  Telefon <span className="pilot-landing-optional">opcjonalnie</span>
                  <input name="phone" type="tel" placeholder="+48 000 000 000" onFocus={handleFormStart} />
                </label>
                <input className="honeypot" name="website" tabIndex={-1} autoComplete="off" />
                <label className="pilot-landing-consent">
                  <input name="consent" type="checkbox" required onFocus={handleFormStart} />
                  <span>
                    Zgadzam się na kontakt w sprawie programu pilotażowego i akceptuję{" "}
                    <Link href="/polityka-prywatnosci">politykę prywatności</Link>.
                  </span>
                </label>
                {error && <p className="pilot-landing-error" role="alert">{error}</p>}
                <button className="button pilot-landing-submit" type="submit" disabled={loading}>
                  {loading ? "Wysyłamy…" : "Dołącz do programu pilotażowego"} <span>↗</span>
                </button>
                <small className="pilot-landing-fineprint">Bez zobowiązań. Odpowiemy, nie zasypiemy Cię wiadomościami.</small>
              </form>
            </>
          )}
        </div>
      </section>

      <section className="pilot-landing-proof">
        <span>JEDEN SYSTEM DLA CAŁEGO KLUBU</span>
        <span>ADMINISTRATOR <i>·</i> TRENER <i>·</i> RODZIC</span>
        <span>SKŁADKI <i>·</i> TRENINGI <i>·</i> KOMUNIKACJA</span>
      </section>
    </main>
  );
}
