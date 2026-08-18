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

const recruitmentPoints: [string, string][] = [
  ["Każde wolne miejsce to comiesięczna strata", "Grupa, która mogła być pełna, przez cały sezon przynosi mniej niż powinna."],
  ["Rodzic bez szybkiej odpowiedzi zapisuje dziecko gdzie indziej", "Zgłoszenia z Messengera i telefonów gubią się między treningami."],
  ["Nie wiesz, ile miejsc realnie masz wolnych", "Listy w arkuszach rozjeżdżają się z tym, kto faktycznie trenuje."],
];

const systemPreviews: [string, string, string, [string, string][]][] = [
  [
    "Treningi i obecności",
    "Trener zaznacza obecność w kilka sekund, a Ty widzisz frekwencję każdej grupy.",
    "WTOREK · 17:00 · ORLIK A",
    [
      ["Obecni", "14"],
      ["Nieobecni", "2"],
      ["Frekwencja", "88%"],
    ],
  ],
  [
    "Składki i płatności",
    "Widzisz, kto zapłacił, kto zalega i ile pieniędzy brakuje w tym miesiącu.",
    "WRZESIEŃ · SKŁADKI",
    [
      ["Opłacone", "38"],
      ["Zaległe", "6"],
      ["Do odzyskania", "1 080 zł"],
    ],
  ],
  [
    "Komunikacja z rodzicami",
    "Rodzic ma płatności i informacje w telefonie, zamiast szukać ich w Messengerze.",
    "APLIKACJA RODZICA",
    [
      ["Płatności", "w telefonie"],
      ["Odwołane zajęcia", "powiadomienie"],
      ["Historia obecności", "zawsze pod ręką"],
    ],
  ],
];

const onboardingSteps: [string, string, string][] = [
  ["01", "Rozmowa o Twoim klubie", "Pytamy o grupy, składki i to, co dziś zabiera najwięcej czasu."],
  ["02", "Konfigurujemy klub za Ciebie", "Zakładamy grupy, trenerów i plan treningów, żebyś nie zaczynał od pustego systemu."],
  ["03", "Szkolimy trenerów", "Pokazujemy, jak zaznaczać obecności i prowadzić grupę na telefonie."],
  ["04", "Klub pracuje w EasyClub", "Obecności, składki i komunikacja są w jednym miejscu od pierwszego tygodnia."],
];

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
  const [formInView, setFormInView] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setAttribution(readAttribution());
    track("pilot_landing_view");
    trackFunnelEvent("page_view", { form: "pilot", source: "pilot-landing" });
    trackMetaEvent("ViewContent");
    const form = formRef.current;
    if (!form) return;

    let reported = false;
    const observer = new IntersectionObserver(([entry]) => {
      setFormInView(entry.isIntersecting);
      if (entry.isIntersecting && !reported) {
        reported = true;
        trackFunnelEvent("form_view", { form: "pilot", source: "pilot-landing" });
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
        <nav className="pilot-landing-nav" aria-label="Nawigacja landing page">
          <Link href="/">EasyClub</Link>
          <Link href="/pilot" aria-current="page">Pilot 10</Link>
          <Link href="/nabor">Nabór</Link>
        </nav>
        <a className="button button-small pilot-landing-header-cta" href="#formularz" onClick={() => trackFunnelEvent("cta_click", { form: "pilot", source: "pilot-landing-header" })}>
          Zgłoś klub <span>↗</span>
        </a>
      </header>

      <section className="pilot-landing-hero">
        <div className="pilot-landing-copy">
          <div className="pilot-landing-eyebrow">
            <span className="pulse-dot" /> Pilot 10 · dla pierwszych klubów
          </div>
          <h1>Składki na czas. <em>Pełniejsze grupy.</em></h1>
          <p className="pilot-landing-hero-claim">Zobacz swój klub w EasyClub — bez opłat przez 30 dni.</p>
          <p className="pilot-landing-hero-explainer">
            EasyClub to jeden system do prowadzenia klubu — treningi, obecności,
            składki, nabór i komunikacja z rodzicami. Wszystko w jednym miejscu,
            żeby łatwiej prowadzić klub i zapełniać grupy.
          </p>
          <ul className="pilot-landing-benefits">
            <li><BrandMark dark /> Składki bez ręcznego pilnowania</li>
            <li><BrandMark dark /> Treningi, obecności i komunikacja w jednym miejscu</li>
            <li><BrandMark dark /> Więcej zapisów, mniej wolnych miejsc</li>
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
                <span>PILOT 10 · DLA 10 KLUBÓW</span>
                <strong>30 dni bez opłat</strong>
                <small>Potem 99 zł/mies. przez 12 miesięcy. Bez automatycznego obciążenia.</small>
              </div>
              <form ref={formRef} className="pilot-landing-form" onSubmit={handleSubmit} onInvalidCapture={() => trackFunnelEvent("validation_error", { form: "pilot", source: "pilot-landing" })}>
                <div className="pilot-landing-form-heading">
                  <h2>Zacznij bez zobowiązań.</h2>
                  <p>Wystarczą trzy informacje. Odezwiemy się i pokażemy kolejny krok.</p>
                </div>
                <label>
                  Nazwa klubu
                  <input name="clubName" placeholder="np. Akademia Orlik" required onFocus={handleFormStart} />
                </label>
                <label>
                  Imię
                  <input name="contactName" placeholder="Jan" required onFocus={handleFormStart} />
                </label>
                <label>
                  E-mail
                  <input name="email" type="email" placeholder="jan@klub.pl" required onFocus={handleFormStart} />
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
                  {loading ? "Wysyłamy…" : "Chcę sprawdzić EasyClub"} <span>↗</span>
                </button>
                <small className="pilot-landing-fineprint">Bez karty i bez automatycznej opłaty. Odpowiemy konkretnie.</small>
              </form>
            </>
          )}
        </div>
      </section>

      <section className="pilot-landing-recruit">
        <div className="pilot-landing-section-heading">
          <div className="pilot-landing-eyebrow">01 / Nabór i wolne miejsca</div>
          <h2>Pusty trening to koszt, <em>nie tylko wolne miejsce.</em></h2>
          <p>
            Zgłoszenia lecą w wiadomościach, listy żyją w arkuszach, a część chętnych
            po prostu nie wraca. EasyClub porządkuje zapisy i pokazuje, gdzie w klubie
            zostało jeszcze miejsce.
          </p>
        </div>
        <div className="pilot-landing-recruit-grid">
          {recruitmentPoints.map(([title, body], index) => (
            <article key={title}>
              <span>{`0${index + 1}`}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <Link
          className="pilot-landing-text-link"
          href="/nabor"
          onClick={() => trackFunnelEvent("cta_click", { form: "pilot", source: "pilot-landing-recruit" })}
        >
          Policz, ile tracisz na wolnych miejscach <span>↗</span>
        </Link>
      </section>

      <section className="pilot-landing-preview">
        <div className="pilot-landing-section-heading">
          <div className="pilot-landing-eyebrow">02 / Tak to wygląda w praktyce</div>
          <h2>Cały klub w jednym miejscu, <em>bez arkuszy i notatek.</em></h2>
        </div>
        <div className="pilot-landing-preview-grid">
          {systemPreviews.map(([title, body, label, rows]) => (
            <article key={title}>
              <div className="pilot-landing-screen">
                <span>{label}</span>
                {rows.map(([rowLabel, value]) => (
                  <div key={rowLabel}>
                    <small>{rowLabel}</small>
                    <b>{value}</b>
                  </div>
                ))}
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pilot-landing-onboarding">
        <div className="pilot-landing-section-heading">
          <div className="pilot-landing-eyebrow">03 / Wdrożenie po naszej stronie</div>
          <h2>Nie zostajesz sam <em>z konfiguracją systemu.</em></h2>
        </div>
        <ol className="pilot-landing-steps">
          {onboardingSteps.map(([number, title, body]) => (
            <li key={number}>
              <span>{number}</span>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="pilot-landing-final-cta">
          <div>
            <strong>30 dni bez opłat, potem 99 zł/mies. przez 12 miesięcy.</strong>
            <span>Bez karty i bez automatycznego obciążenia.</span>
          </div>
          <a
            className="button"
            href="#formularz"
            onClick={() => trackFunnelEvent("cta_click", { form: "pilot", source: "pilot-landing-final" })}
          >
            Chcę sprawdzić EasyClub <span>↗</span>
          </a>
        </div>
      </section>

      <footer className="pilot-landing-footer">
        <BrandLogo href="/" />
        <div>
          <a href="mailto:hello@easyclub.pl">Kontakt</a>
          <Link href="/cennik">Cennik</Link>
          <Link href="/polityka-prywatnosci">Polityka prywatności</Link>
          <Link href="/regulamin">Regulamin</Link>
        </div>
        <small>© 2025 EasyClub</small>
      </footer>

      {!submitted && !formInView && (
        <a
          className="pilot-landing-sticky-cta"
          href="#formularz"
          onClick={() => trackFunnelEvent("cta_click", { form: "pilot", source: "pilot-landing-sticky" })}
        >
          Chcę sprawdzić EasyClub <span>↗</span>
        </a>
      )}
    </main>
  );
}
