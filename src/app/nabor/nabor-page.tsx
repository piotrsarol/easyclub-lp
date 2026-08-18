"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { trackFunnelEvent } from "@/lib/funnel-events";
import { createMarketingEventId } from "@/lib/marketing-events";
import { BrandLogo } from "../brand-logo";
import styles from "./nabor-page.module.css";

const faqs = [
  ["Czy muszę znać się na marketingu?", "Nie. Nabór porządkuje osoby, które już do Ciebie trafiają. Nie prowadzimy za Ciebie reklam i nie wymagamy wiedzy marketingowej."],
  ["Czy EasyClub prowadzi reklamy za klub?", "Nie. Możesz pozyskiwać zainteresowanych z reklam, formularza, QR, telefonu albo Messengera, a potem prowadzić ich w jednym miejscu."],
  ["Ile trwa wdrożenie?", "Na początku pomagamy skonfigurować klub, grupy i pojemności. Czas zależy od liczby grup, ale zaczynasz od tych informacji, które już masz."],
  ["Co z danymi zawodników i RODO?", "Dane są przetwarzane w ramach EasyClub zgodnie z zasadami opisanymi w polityce prywatności. Nie wysyłaj nam danych zawodników w formularzu pilotażowym."],
  ["Czy mogę zrezygnować?", "Tak. Po 30 dniach nie ma automatycznego obciążenia. Jeśli nie chcesz kontynuować, po prostu dajesz nam znać."],
  ["Czy otrzymam gwarantowaną liczbę nowych zawodników?", "Nie. Nabór pomaga nie gubić zainteresowanych i widzieć wynik. Liczba zgłoszeń zależy od Twojej oferty, grup i źródeł ruchu."],
];

const currency = new Intl.NumberFormat("pl-PL");

function trackConversion(eventId: string) {
  const browserWindow = window as Window & {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  };

  browserWindow.fbq?.("track", "Lead", {}, { eventID: eventId });
  browserWindow.gtag?.("event", "generate_lead", { event_category: "nabor" });
}

export function NaborPage() {
  const [emptyPlaces, setEmptyPlaces] = useState(5);
  const [fee, setFee] = useState(200);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [attribution, setAttribution] = useState<Record<string, string>>({});
  const [formStarted, setFormStarted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const keys = ["utmSource", "utmMedium", "utmCampaign", "utmContent", "utmTerm"];
    const nextAttribution: Record<string, string> = {};

    for (const key of keys) {
      const queryKey = key.replace(/^utm/, "utm_").toLowerCase();
      const value = params.get(queryKey);
      if (value) nextAttribution[key] = value;
    }

    setAttribution(nextAttribution);
    trackFunnelEvent("page_view", { form: "nabor", source: "nabor" });
    const form = formRef.current;
    if (!form) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        trackFunnelEvent("form_view", { form: "nabor", source: "nabor" });
        observer.disconnect();
      }
    });
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  function handleFormStart() {
    if (formStarted) return;
    setFormStarted(true);
    trackFunnelEvent("form_start", { form: "nabor", source: "nabor" });
  }

  const monthlyLoss = emptyPlaces * fee;
  const annualLoss = monthlyLoss * 12;
  const formattedMonthlyLoss = `${currency.format(monthlyLoss)} zł`;
  const formattedAnnualLoss = `${currency.format(annualLoss)} zł`;
  const calculatorSummary = useMemo(
    () => `${emptyPlaces} wolnych miejsc × ${currency.format(fee)} zł składki`,
    [emptyPlaces, fee],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});
    trackFunnelEvent("form_submit", { form: "nabor", source: "nabor" });
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const eventId = createMarketingEventId();
    const athleteCountValue = String(form.get("athleteCount") ?? "").trim();
    const payload = {
      clubName: String(form.get("clubName") ?? ""),
      contactName: String(form.get("contactName") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      athleteCount: athleteCountValue ? Number(athleteCountValue) : undefined,
      consent: form.get("consent") === "on",
      website: String(form.get("website") ?? ""),
      source: "nabor" as const,
      eventId,
      eventSourceUrl: window.location.href,
      ...attribution,
    };

    try {
      const response = await fetch("/api/nabor-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { error?: string; fieldErrors?: Record<string, string> };

      if (data.fieldErrors) setFieldErrors(data.fieldErrors);
      if (!response.ok) throw new Error(data.error || "Coś poszło nie tak.");

      setSubmitted(true);
      formElement.reset();
      trackConversion(eventId);
      trackFunnelEvent("submit_success", { form: "nabor", source: "nabor" });
      trackFunnelEvent("lead", { form: "nabor", source: "nabor" });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Spróbuj ponownie.");
      trackFunnelEvent("submit_error", { form: "nabor", source: "nabor" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <BrandLogo href="#top" />
        <nav className={styles.nav} aria-label="Nawigacja landing page">
          <a href="#kalkulator">Kalkulator</a>
          <a href="#jak-dziala">Jak działa</a>
          <a href="#pilot">Pilot 10</a>
          <a href="#faq">FAQ</a>
        </nav>
        <a className={styles.headerButton} href="#formularz" onClick={() => trackFunnelEvent("cta_click", { form: "nabor", source: "nabor" })}>Zgłoś klub <span>↗</span></a>
      </header>

      <section className={styles.hero} id="top">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span /> EASYCLUB / NABÓR</p>
          <h1>Masz wolne miejsca w grupach? <em>Sprawdź, ile Cię kosztują.</em></h1>
          <p className={styles.heroLead}>
            Nabór pomaga zobaczyć koszt pustych miejsc, zebrać wszystkie zgłoszenia w jednym miejscu
            i zamienić zainteresowanych w nowych zawodników.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="#formularz" onClick={() => trackFunnelEvent("cta_click", { form: "nabor", source: "nabor" })}>Zgłoś klub do programu pilotażowego <span>↗</span></a>
            <span className={styles.heroNote}>Pilot 10 · 30 dni bez opłat</span>
          </div>
        </div>
        <div className={styles.heroCard} aria-label="Przykład utraconego przychodu">
          <div className={styles.cardTop}><span>WOLNE MIEJSCA / GRUPA U-12</span><b>● AKTYWNE</b></div>
          <div className={styles.capacity}><strong>11</strong><span>/ 16 zawodników</span></div>
          <div className={styles.capacityBar}><i style={{ width: "69%" }} /></div>
          <div className={styles.lossCard}>
            <span>Wolne miejsce w grupie</span>
            <strong>− 1 000 zł <small>/ mies.</small></strong>
            <em>5 wolnych miejsc × 200 zł</em>
          </div>
          <div className={styles.lossYear}><span>Rocznie</span><strong>− 12 000 zł</strong></div>
        </div>
      </section>

      <section className={styles.calculatorSection} id="kalkulator">
        <div className={styles.sectionLabel}>01 / POLICZ TO W MINUTĘ</div>
        <div className={styles.calculatorGrid}>
          <div>
            <h2>Puste miejsce to nie abstrakcja. <em>To konkretna kwota.</em></h2>
            <p>Ustaw liczbę wolnych miejsc i miesięczną składkę. Zobacz, ile nie wpływa na konto klubu.</p>
          </div>
          <div className={styles.calculator}>
            <div className={styles.calculatorField}>
              <label htmlFor="empty-places">Wolne miejsca</label>
              <output>{emptyPlaces}</output>
              <input id="empty-places" type="range" min="1" max="30" value={emptyPlaces} onChange={(event) => setEmptyPlaces(Number(event.target.value))} />
            </div>
            <div className={styles.calculatorField}>
              <label htmlFor="fee">Składka miesięczna</label>
              <output>{fee} zł</output>
              <input id="fee" type="range" min="50" max="500" step="10" value={fee} onChange={(event) => setFee(Number(event.target.value))} />
            </div>
            <p className={styles.calculatorSummary}>{calculatorSummary}</p>
            <div className={styles.calculatorResult}>
              <span>Klub traci potencjalnie</span>
              <strong>{formattedMonthlyLoss} <small>/ mies.</small></strong>
              <b>{formattedAnnualLoss} rocznie</b>
            </div>
            <a className={styles.primaryButton} href="#formularz" onClick={() => trackFunnelEvent("cta_click", { form: "nabor", source: "nabor" })}>Chcę zapełnić te miejsca <span>↗</span></a>
          </div>
        </div>
      </section>

      <section className={styles.problemSection}>
        <div className={styles.sectionLabel}>02 / ZNASZ TO?</div>
        <h2>Grupa jest niepełna.<br /><em>A zgłoszenia żyją własnym życiem.</em></h2>
        <div className={styles.problemGrid}>
          {[
            ["01", "„Ktoś pisał na Messengerze.”", "Tylko nie pamiętasz już, w której rozmowie i czy ktoś mu odpisał."],
            ["02", "„Był na treningu próbnym.”", "Nikt nie wrócił do rodzica. Zainteresowanie wygasło, a miejsce nadal jest puste."],
            ["03", "„Mamy jeszcze kilka miejsc.”", "Wiesz to, ale nie wiesz, ile pieniędzy co miesiąc zostaje poza klubem."],
            ["04", "„Nie mam czasu na marketing.”", "Nie musisz go studiować. Najpierw przestań gubić osoby, które już się zgłosiły."],
          ].map(([number, title, description]) => (
            <article className={styles.problemCard} key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.stepsSection} id="jak-dziala">
        <div className={styles.sectionLabel}>03 / PROSTY PROCES</div>
        <div className={styles.sectionHeading}>
          <h2>Od wolnego miejsca<br /><em>do nowego zawodnika.</em></h2>
          <p>Bez osobnego systemu, przeklejania danych i szukania informacji w pięciu miejscach.</p>
        </div>
        <div className={styles.steps}>
          {[
            ["01", "Ustawiasz pojemność grup", "Widzisz, ile miejsc jest wolnych i które grupy mogą przyjąć nowych zawodników."],
            ["02", "Zbierasz zgłoszenia", "Formularz, QR, telefon albo Messenger — wszystko trafia na jedną listę."],
            ["03", "Prowadzisz kontakt", "Masz przed sobą historię rozmowy, status i kolejny krok, także po treningu próbnym."],
            ["04", "Zapisujesz jednym kliknięciem", "Zainteresowany staje się zawodnikiem, rodzicem, grupą i składką w EasyClub."],
            ["05", "Widzisz wynik", "Sprawdzasz nowych zawodników i zmianę miesięcznego przychodu."],
          ].map(([number, title, description]) => (
            <article className={styles.step} key={number}>
              <span>{number}</span><div><h3>{title}</h3><p>{description}</p></div><b>↗</b>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.outcomeSection}>
        <div className={styles.sectionLabel}>04 / WYNIK, NIE KOLEJNA TABELA</div>
        <h2>Więcej pełnych grup.<br /><em>Mniej rzeczy do pilnowania.</em></h2>
        <div className={styles.outcomeGrid}>
          {[
            ["01", "Nowi zawodnicy", "Nie pozwalasz, żeby zainteresowanie kończyło się po treningu próbnym."],
            ["02", "Wyższy przychód", "Wiesz, ile dają Ci pełniejsze grupy — nie tylko ile osób doszło."],
            ["03", "Mniej administracji", "Nie przepisujesz danych z telefonu do arkusza, a potem do systemu."],
          ].map(([number, title, description]) => (
            <article key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>
          ))}
        </div>
      </section>

      <section className={styles.systemSection}>
        <div>
          <div className={styles.sectionLabel}>05 / NABÓR JEST CZĘŚCIĄ EASYCLUB</div>
          <h2>Jedno miejsce dla klubu, <em>nie kolejny obowiązek.</em></h2>
        </div>
        <p>Gdy ktoś dołącza, nie kończysz w kolejnym arkuszu. EasyClub łączy Nabór z harmonogramem, obecnościami, zawodnikami, składkami, płatnościami i komunikacją z rodzicami.</p>
        <div className={styles.systemTags}><span>Harmonogram</span><span>Obecności</span><span>Zawodnicy</span><span>Składki</span><span>Komunikacja</span><span>Aplikacja na telefon</span></div>
      </section>

      <section className={styles.pilotSection} id="pilot">
        <div className={styles.pilotCopy}>
          <div className={styles.sectionLabel}>06 / PROGRAM PILOTOWY</div>
          <h2>Pierwsze 10 klubów testuje <em>Nabór na swoich zasadach.</em></h2>
          <ul>
            <li><b>30 dni</b> bez opłat</li>
            <li>Pomoc we wdrożeniu i konfiguracji klubu</li>
            <li>Potem <b>99 zł/mies.</b> przez 12 miesięcy</li>
            <li>Brak automatycznego obciążenia po okresie próbnym</li>
          </ul>
        </div>
        <div className={styles.formCard} id="formularz">
          {submitted ? (
            <div className={styles.success} role="status">
              <span>✓</span>
              <h3>Zgłoszenie wysłane.</h3>
              <p>Odezwiemy się, żeby porozmawiać o Twoim klubie i pierwszych grupach.</p>
              <button className={styles.secondaryButton} onClick={() => setSubmitted(false)}>Wyślij kolejne zgłoszenie</button>
            </div>
          ) : (
            <form ref={formRef} onSubmit={handleSubmit} onFocus={handleFormStart} onInvalidCapture={() => trackFunnelEvent("validation_error", { form: "nabor", source: "nabor" })}>
              <h3>Zgłoś klub do Pilot 10</h3>
              <p>Zostaw kontakt. Wrócimy z kolejnym krokiem, bez zobowiązań.</p>
              <div className={styles.formField}><label htmlFor="clubName">Nazwa klubu</label><input id="clubName" name="clubName" required /></div>
              {fieldErrors.clubName && <small className={styles.error}>{fieldErrors.clubName}</small>}
              <div className={styles.formField}><label htmlFor="contactName">Imię i nazwisko</label><input id="contactName" name="contactName" required /></div>
              {fieldErrors.contactName && <small className={styles.error}>{fieldErrors.contactName}</small>}
              <div className={styles.formTwo}><div className={styles.formField}><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" required /></div><div className={styles.formField}><label htmlFor="phone">Telefon</label><input id="phone" name="phone" type="tel" required /></div></div>
              {fieldErrors.email && <small className={styles.error}>{fieldErrors.email}</small>}
              <div className={styles.formField}><label htmlFor="athleteCount">Liczba zawodników <span>(opcjonalnie)</span></label><input id="athleteCount" name="athleteCount" type="number" min="1" /></div>
              <label className={styles.consent}><input name="consent" type="checkbox" required /><span>Wyrażam zgodę na kontakt w sprawie programu pilotażowego i akceptuję <Link href="/polityka-prywatnosci">politykę prywatności</Link>.</span></label>
              <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className={styles.honeypot} />
              {error && <p className={styles.formError} role="alert">{error}</p>}
              <button className={styles.primaryButton} type="submit" disabled={loading}>{loading ? "Wysyłanie…" : "Zgłoś klub do programu pilotażowego"} <span>↗</span></button>
              <small className={styles.formFineprint}>Bez automatycznego obciążenia. Odpowiemy na kontakt, nie na spam.</small>
            </form>
          )}
        </div>
      </section>

      <section className={styles.faqSection} id="faq">
        <div className={styles.sectionLabel}>07 / FAQ</div>
        <h2>Najpierw konkrety.</h2>
        <div className={styles.faqList}>
          {faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}
        </div>
      </section>

      <footer className={styles.footer}>
        <BrandLogo href="/" />
        <p>Mniej administracji. Więcej sportu.</p>
        <div><a href="mailto:kontakt@easyclub.pl">kontakt@easyclub.pl</a><Link href="/polityka-prywatnosci">Polityka prywatności</Link><Link href="/regulamin">Regulamin</Link></div>
        <small>© 2026 EasyClub</small>
      </footer>
    </main>
  );
}
