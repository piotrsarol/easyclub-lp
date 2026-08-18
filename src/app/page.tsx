"use client";

import { FormEvent, MouseEvent, useEffect, useState } from "react";
import Link from "next/link";
import { clubSizeOptions, leadSchema } from "@/lib/lead-schema";
import { createMarketingEventId } from "@/lib/marketing-events";
import { BrandLogo, BrandMark } from "./brand-logo";

const features = [
  ["01", "Harmonogram", "Tygodniowy i miesięczny widok zajęć, lokalizacji i trenerów — bez konfliktów w kalendarzu."],
  ["02", "Obecności", "Trener zaznacza obecność grupy w kilka sekund, prosto z telefonu."],
  ["03", "Zawodnicy", "Profile dzieci, grupy, lokalizacje i historia w jednym czytelnym miejscu."],
  ["04", "Składki i płatności", "Plany, należności, karnety i statusy bez ręcznego szukania w arkuszach."],
  ["05", "Komunikacja", "Wiadomości do rodziców i trenerów tam, gdzie każdy może je znaleźć."],
  ["06", "Role i dostęp", "Osobne widoki dla administratora, trenera i rodzica — każdy widzi to, czego potrzebuje."],
  ["07", "PWA / mobile", "EasyClub działa na telefonie i można go zainstalować jak aplikację."],
];

const featurePreviews = [
  ["Widok administratora", "Dobry tydzień zaczyna się od dobrego planu.", "KALENDARZ"],
  ["Widok trenera", "Obecność całej grupy w kilka sekund.", "OBECNOŚĆ"],
  ["Baza zawodników", "Każdy zawodnik ma swoje miejsce.", "ZAWODNICY"],
  ["Centrum finansów", "Płatności bez ręcznego szukania.", "PŁATNOŚCI"],
  ["Wiadomości", "Ważne informacje docierają na czas.", "KOMUNIKACJA"],
  ["Role i dostęp", "Każdy widzi dokładnie to, czego potrzebuje.", "DOSTĘP"],
  ["EasyClub w telefonie", "Klub zawsze pod ręką.", "MOBILE"],
] as const;

const people = [
  ["Administrator", "Spokojny obraz całej organizacji, finansów i zespołu.", "01"],
  ["Trener", "Harmonogram, grupy i obecności bez papierów.", "02"],
  ["Rodzic", "Zajęcia dzieci, płatności, wiadomości i lokalizacje w jednym miejscu.", "03"],
];

const dashboardNotifications = [
  ["✓", "Trener Marek oznaczył obecność — U-12", "teraz", "notification-green"],
  ["◒", "Wpłata otrzymana: Jan Kowalski — 180 zł", "2 min", "notification-lime"],
  ["!", "Trening U-10 przesunięty na 17:00", "5 min", "notification-amber"],
  ["♧", "Nowy zawodnik dołączył do grupy U-12", "8 min", "notification-lime"],
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const value = (name: string) => String(form.get(name) ?? "");
    const eventId = createMarketingEventId();
    const query = new URLSearchParams(window.location.search);
    const payload = {
      clubName: value("clubName"),
      contactName: value("contactName"),
      email: value("email"),
      phone: value("phone"),
      clubSize: value("clubSize"),
      organizationType: value("organizationType"),
      message: value("message"),
      consent: form.get("consent") === "on",
      website: value("website"),
      source: "main",
      utm_source: query.get("utm_source") || undefined,
      utm_medium: query.get("utm_medium") || undefined,
      utm_campaign: query.get("utm_campaign") || undefined,
      utm_content: query.get("utm_content") || undefined,
      utm_term: query.get("utm_term") || undefined,
      eventId,
      eventSourceUrl: window.location.href,
    };
    const validation = leadSchema.safeParse(payload);

    if (!validation.success) {
      const nextErrors: Record<string, string> = {};

      for (const issue of validation.error.issues) {
        const field = String(issue.path[0] ?? "form");
        nextErrors[field] ??= issue.message;
      }

      setFieldErrors(nextErrors);
      setError("Sprawdź zaznaczone pola i popraw wskazane wartości.");
      setLoading(false);

      const firstInvalidField = Object.keys(nextErrors).find((field) => field !== "form");
      if (firstInvalidField) {
        requestAnimationFrame(() => {
          formElement.querySelector<HTMLElement>(`[name="${firstInvalidField}"]`)?.focus();
        });
      }

      return;
    }

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { error?: string; fieldErrors?: Record<string, string> };
      if (data.fieldErrors) {
        setFieldErrors(data.fieldErrors);
        const firstInvalidField = Object.keys(data.fieldErrors).find((field) => field !== "form");
        if (firstInvalidField) {
          requestAnimationFrame(() => {
            formElement.querySelector<HTMLElement>(`[name="${firstInvalidField}"]`)?.focus();
          });
        }
      }
      if (!response.ok) throw new Error(data.error || "Coś poszło nie tak.");
      const browserWindow = window as Window & {
        fbq?: (...args: unknown[]) => void;
      };
      browserWindow.fbq?.("track", "Lead", {}, { eventID: eventId });
      setSubmitted(true);
      formElement.reset();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <header className="site-header">
        <BrandLogo href="#top" />
        <button className="menu-toggle" aria-label="Otwórz menu" onClick={() => setMenuOpen(!menuOpen)}>
          <span />
          <span />
        </button>
        <nav className={menuOpen ? "nav-links is-open" : "nav-links"}>
          <a href="#why" onClick={() => setMenuOpen(false)}>Dlaczego EasyClub</a>
          <a href="#features" onClick={() => setMenuOpen(false)}>Funkcje</a>
          <a href="#for-whom" onClick={() => setMenuOpen(false)}>Dla kogo</a>
          <Link href="/cennik" onClick={() => setMenuOpen(false)}>Cennik</Link>
          <Link href="/blog" onClick={() => setMenuOpen(false)}>Blog</Link>
          <a href="#pilot" onClick={() => setMenuOpen(false)}>Pilotaż</a>
        </nav>
        <a className="button button-small header-cta" href="#pilot">Zgłoś klub <span>↗</span></a>
      </header>

      <section className="hero section-shell" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse-dot" /> Program pilotażowy — zgłoszenia otwarte</div>
          <h1>Mniej administracji.<br /><em>Więcej sportu.</em></h1>
          <p className="hero-lead">EasyClub to aplikacja do zarządzania klubem sportowym. Łączy harmonogram, obecności, składki, zawodników i komunikację z rodzicami w jednym spokojnym systemie.</p>
          <div className="hero-actions">
            <a className="button" href="#pilot">Zgłoś klub do pilotażu <span>↗</span></a>
            <a className="text-link" href="#features">Zobacz, jak działa EasyClub <span>↓</span></a>
          </div>
          <div className="hero-benefits">
            <span><b>01</b> Dostęp przed premierą</span>
            <span><b>02</b> Pomoc we wdrożeniu</span>
            <span><b>03</b> Wpływ na rozwój produktu</span>
          </div>
        </div>
        <DashboardMockup />
      </section>

      <section className="trust-strip section-shell">
        <span>JEDEN SYSTEM DLA CAŁEGO KLUBU</span>
        <div className="strip-line" />
        <span>ADMINISTRATOR <i>·</i> TRENER <i>·</i> RODZIC</span>
      </section>

      <section className="contrast-section section-shell" id="why">
        <div className="section-intro">
          <div className="eyebrow">01 / Zamiast chaosu</div>
          <h2>Klub nie potrzebuje<br /><em>więcej narzędzi.</em></h2>
          <p>Potrzebuje jednego miejsca, które po prostu działa — i oddaje czas ludziom.</p>
        </div>
        <div className="compare-grid">
          <div className="compare-card old">
            <span className="card-label">BEZ JEDNEGO SYSTEMU</span>
            <h3>Wszystko jest „gdzieś”.</h3>
            <ul><li>Excel i kilka wersji list składek</li><li>Messenger, SMS-y i telefony</li><li>Ręczne sprawdzanie obecności</li><li>Niejasność, kto zapłacił</li></ul>
          </div>
          <div className="compare-arrow">→</div>
          <div className="compare-card new">
            <span className="card-label">Z EASYCLUB</span>
            <h3>Wszystko jest na miejscu.</h3>
            <ul><li>Jeden harmonogram dla zespołu</li><li>Obecność trenera w kilka sekund</li><li>Czytelne statusy płatności</li><li>Komunikacja z rodzicami w jednym miejscu</li></ul>
          </div>
        </div>
      </section>

      <section className="purpose-section section-shell">
        <div className="purpose-quote">„Technologia powinna oddawać czas klubowi, a nie tworzyć kolejne obowiązki.”</div>
        <div className="pillars">{[
          ["Mniej ręcznej pracy", "Automatyzuj powtarzalne zadania i odzyskaj godziny w tygodniu."],
          ["Pełny obraz klubu", "Decyzje podejmuj na podstawie aktualnych, czytelnych informacji."],
          ["Więcej przestrzeni na rozwój", "Skup się na zawodnikach, trenerach i tym, co ważne."],
        ].map(([title, body], index) => <div className="pillar" key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p></div>)}</div>
      </section>

      <section className="features-section section-shell" id="features">
        <div className="section-intro feature-heading"><div><div className="eyebrow">02 / Spokojne centrum dowodzenia</div><h2>Wszystko, czego<br />potrzebuje <em>klub.</em></h2></div><p>Proste narzędzia, które pracują razem. Bez przeklikiwania się przez pięć różnych systemów.</p></div>
        <div className="features-layout">
          <div className="feature-list">{features.map(([number, title, description], index) => <button type="button" className={index === activeFeature ? "feature-item active" : "feature-item"} key={title} onClick={() => setActiveFeature(index)} aria-pressed={index === activeFeature}><span>{number}</span><span className="feature-copy"><h3>{title}</h3><p>{description}</p></span><b>↗</b></button>)}</div>
          <FeaturePreview activeFeature={activeFeature} />
        </div>
      </section>

      <section className="people-section section-shell" id="for-whom">
        <div className="section-intro"><div className="eyebrow">03 / Dla całego zespołu</div><h2>Jedna platforma.<br /><em>Trzy perspektywy.</em></h2></div>
        <div className="people-grid">{people.map(([title, body, number]) => <div className="person-card" key={title}><div className="person-number">{number}</div><h3>{title}</h3><p>{body}</p><a href="#pilot">Dowiedz się więcej <span>↗</span></a></div>)}</div>
      </section>

      <section className="models-section section-shell"><div className="model-copy"><div className="eyebrow">04 / Elastyczność bez komplikowania</div><h2>Jeden system,<br /><em>różne modele pracy.</em></h2><p>EasyClub pasuje zarówno do tradycyjnych klubów z grupami i stałymi składami, jak i szkółek z zapisami na konkretne zajęcia.</p><a className="text-link" href="#pilot">Porozmawiajmy o Twoim klubie <span>↗</span></a></div><div className="model-graphic"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="model-center"><BrandMark dark /><strong>easyclub</strong></div><div className="orbit-label label-one">STAŁE GRUPY</div><div className="orbit-label label-two">ZAPISY NA ZAJĘCIA</div><div className="orbit-label label-three">OBÓZ / TURNIEJ</div></div></section>

      <section className="pilot-section section-shell" id="pilot">
        <div className="pilot-copy"><div className="eyebrow"><span className="pulse-dot" /> Program pilotażowy</div><h2>Zobacz EasyClub<br /><em>w swoim klubie.</em></h2><p>Dołącz do klubów, które pomagają nam zbudować najlepsze narzędzie do codziennej pracy.</p><div className="pilot-note"><span>→</span><div><strong>Bez zobowiązań na start.</strong><br />Porozmawiamy, pokażemy produkt i wspólnie ocenimy, czy to dobry moment.</div></div></div>
        <form className="lead-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <Field label="Nazwa klubu" name="clubName" error={fieldErrors.clubName}>
              <input name="clubName" placeholder="np. Akademia Orlik" aria-invalid={Boolean(fieldErrors.clubName)} aria-describedby={fieldErrors.clubName ? "clubName-error" : undefined} />
            </Field>
            <Field label="Imię i nazwisko" name="contactName" error={fieldErrors.contactName}>
              <input name="contactName" placeholder="Jan Kowalski" aria-invalid={Boolean(fieldErrors.contactName)} aria-describedby={fieldErrors.contactName ? "contactName-error" : undefined} />
            </Field>
          </div>
          <div className="form-row">
            <Field label="E-mail" name="email" error={fieldErrors.email}>
              <input type="email" name="email" placeholder="jan@klub.pl" aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? "email-error" : undefined} />
            </Field>
            <Field label={<>Telefon <span className="optional">opcjonalnie</span></>} name="phone" error={fieldErrors.phone}>
              <input name="phone" placeholder="+48 000 000 000" aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? "phone-error" : undefined} />
            </Field>
          </div>
          <div className="form-row">
            <Field label="Typ organizacji" name="organizationType" error={fieldErrors.organizationType}>
              <select name="organizationType" defaultValue="Klub sportowy" aria-invalid={Boolean(fieldErrors.organizationType)} aria-describedby={fieldErrors.organizationType ? "organizationType-error" : undefined}>
                <option>Klub sportowy</option>
                <option>Akademia</option>
                <option>Szkółka</option>
                <option>Inny</option>
              </select>
            </Field>
            <Field label="Rozmiar klubu" name="clubSize" error={fieldErrors.clubSize}>
              <select name="clubSize" defaultValue="" aria-invalid={Boolean(fieldErrors.clubSize)} aria-describedby={fieldErrors.clubSize ? "clubSize-error" : undefined}>
                <option value="" disabled>Wybierz rozmiar klubu…</option>
                {clubSizeOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </Field>
          </div>
          <Field label={<>Wiadomość <span className="optional">opcjonalnie</span></>} name="message" error={fieldErrors.message}>
            <textarea name="message" rows={3} placeholder="Napisz kilka słów o swoim klubie..." aria-invalid={Boolean(fieldErrors.message)} aria-describedby={fieldErrors.message ? "message-error" : undefined} />
          </Field>
          <input className="honeypot" name="website" tabIndex={-1} autoComplete="off" />
          <label className="consent">
            <input type="checkbox" name="consent" aria-invalid={Boolean(fieldErrors.consent)} aria-describedby={fieldErrors.consent ? "consent-error" : undefined} />
            <span>Wyrażam zgodę na kontakt w sprawie programu pilotażowego EasyClub.</span>
          </label>
          {fieldErrors.consent && <span id="consent-error" className="field-error">{fieldErrors.consent}</span>}
          {error && <p className="form-message error" role="alert">{error}</p>}
          {submitted ? <p className="form-message success">Dziękujemy — zgłoszenie dotarło. Odezwiemy się wkrótce.</p> : <button className="button form-button" disabled={loading}>{loading ? "Wysyłamy..." : "Zgłoś klub do pilotażu"} <span>↗</span></button>}
        </form>
      </section>

      <footer className="site-footer section-shell"><BrandLogo href="#top" /><p>Jedno miejsce do zarządzania klubem sportowym.</p><div className="footer-links"><a href="mailto:hello@easyclub.pl">Kontakt</a><Link href="/cennik">Cennik</Link><Link href="/blog">Blog</Link><a href="#pilot">Polityka prywatności</a><a href="#pilot">Regulamin</a></div><small>© 2025 EasyClub</small></footer>
    </main>
  );
}

function Field({
  label,
  name,
  error,
  children,
}: {
  label: React.ReactNode;
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      {label}
      {children}
      {error && <span id={`${name}-error`} className="field-error">{error}</span>}
    </label>
  );
}

function DashboardMockup() {
  const [notificationIndex, setNotificationIndex] = useState(0);
  const [tilt, setTilt] = useState({ x: -5, y: 2 });

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNotificationIndex((index) => (index + 1) % dashboardNotifications.length);
    }, 2800);

    return () => window.clearInterval(interval);
  }, []);

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 10;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * -7;
    setTilt({ x: -5 + x, y: 2 + y });
  }

  return <div className="dashboard-wrap" onMouseMove={handleMouseMove} onMouseLeave={() => setTilt({ x: -5, y: 2 })} style={{ transform: `perspective(1100px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)` }}><div className="dashboard-glow" /><div className="dashboard dashboard-reveal"><div className="dashboard-bar"><span className="window-dots">● ● ●</span><span>easyclub / harmonogram</span><span className="dashboard-live"><i /> na żywo</span></div><div className="dashboard-body"><aside><div className="side-logo"><BrandMark /> easyclub</div>{["Przegląd", "Harmonogram", "Zawodnicy", "Płatności", "Wiadomości"].map((item, i) => <div className={i === 1 ? "side-item selected" : "side-item"} key={item}><span>{["◈", "▦", "♧", "◒", "◌"][i]}</span>{item}</div>)}<div className="side-bottom">⚙ Ustawienia</div></aside><div className="dash-main"><div className="dash-heading"><div><small>WTOREK, 13 SIERPNIA</small><h3>Dzień dobry, Aniu.</h3></div><span className="avatar">AK</span></div><div className="dash-stats"><div className="stat-card-animated"><small>ZAJĘCIA DZISIAJ</small><strong>08</strong><span>↗ +2 vs. wczoraj</span></div><div className="stat-card-animated"><small>OBECNOŚĆ</small><strong>94<span>%</span></strong><span>↗ +6% w tym tygodniu</span></div><div className="stat-card-animated"><small>DO OPŁACENIA</small><strong>12</strong><span className="warn">● wymaga uwagi</span></div></div><div className="dash-schedule"><div className="schedule-head"><strong>Dzisiejszy harmonogram</strong><span>Zobacz wszystko →</span></div>{[["16:00", "Grupa U10", "Boisko 2", "18 / 20"], ["17:30", "Grupa U12", "Hala główna", "16 / 18"], ["19:00", "Trening motoryczny", "Sala A", "12 / 12"]].map(([time, title, place, count], i) => <div className="dash-session" key={title}><strong>{time}</strong><div className={i === 1 ? "session-icon green" : "session-icon"}>✣</div><div><b>{title}</b><small>{place}</small></div><span className="attendees">{count}</span><i>•••</i></div>)}</div></div></div></div><div className={`dashboard-notification ${dashboardNotifications[notificationIndex][3]}`} key={notificationIndex} aria-live="polite"><span className="notification-icon">{dashboardNotifications[notificationIndex][0]}</span><span><b>{dashboardNotifications[notificationIndex][1]}</b><small>{dashboardNotifications[notificationIndex][2]}</small></span></div></div>;
}

function FeaturePreview({ activeFeature }: { activeFeature: number }) {
  const [label, headline, kind] = featurePreviews[activeFeature];

  return <div className="feature-preview" key={activeFeature}><div className="preview-top"><span>{label}</span><span className="live-dot">● Na żywo</span></div><h3>{headline}</h3><div className="preview-content">{kind === "KALENDARZ" && <div className="mini-calendar">{["PON 12", "WT 13", "ŚR 14", "CZW 15"].map((day, i) => <div key={day}><small>{day}</small><strong>{["14", "15", "16", "17"][i]}:00</strong><span className={i === 1 ? "session lime" : "session"}>{["Grupa U10", "Trening motoryczny", "Grupa U12", "Mecz domowy"][i]}</span><span className="session faint">{["Sala A", "Boisko 2", "Hala główna", "Boisko 1"][i]}</span></div>)}</div>}{kind === "OBECNOŚĆ" && <div className="preview-rows">{[["Jan Kowalski", "obecny"], ["Kacper Wójcik", "obecny"], ["Bartosz Lewandowski", "nieobecny"], ["Olek Nowak", "obecny"]].map(([name, status]) => <div className="preview-row" key={name}><span className="preview-avatar">{name[0]}</span><b>{name}</b><span className={status === "obecny" ? "status-present" : "status-absent"}>{status === "obecny" ? "✓ obecny" : "× nieobecny"}</span></div>)}</div>}{kind === "ZAWODNICY" && <div className="athlete-preview"><div className="athlete-card"><span className="large-avatar">JK</span><div><small>PROFIL ZAWODNIKA</small><b>Jan Kowalski</b><span>Grupa U-12 · napastnik</span></div></div><div className="athlete-meta"><span><small>OBECNOŚĆ</small><b>96%</b></span><span><small>GRUPA</small><b>U-12</b></span><span><small>DOŁĄCZYŁ</small><b>2023</b></span></div></div>}{kind === "PŁATNOŚCI" && <div className="preview-rows">{[["Karnet — Jan Kowalski", "180 zł", "Opłacone"], ["Składka — U-12", "240 zł", "Oczekuje"], ["Obóz letni", "850 zł", "Opłacone"], ["Karnet — Maja Wiśniewska", "180 zł", "Opłacone"]].map(([name, amount, status]) => <div className="preview-row payment-row" key={name}><span><b>{name}</b><small>{amount}</small></span><span className={status === "Opłacone" ? "status-present" : "status-pending"}>{status}</span></div>)}</div>}{kind === "KOMUNIKACJA" && <div className="message-preview"><div className="message-head"><span className="preview-avatar">AK</span><span><b>Anna Kowalska</b><small>Administrator · 2 min temu</small></span></div><p>Przypominamy o sobotnim turnieju. Zbiórka o 8:30 przy wejściu głównym.</p><div className="message-replies"><span>U-12 · 24 odbiorców</span><b>Wyślij wiadomość ↗</b></div></div>}{kind === "DOSTĘP" && <div className="role-preview">{[["Administrator", "Pełny dostęp", "role-admin"], ["Trener", "Grupy i obecności", "role-coach"], ["Rodzic", "Dzieci i płatności", "role-parent"]].map(([role, access, className]) => <div className="role-row" key={role}><span className={`role-icon ${className}`}>{role[0]}</span><span><b>{role}</b><small>{access}</small></span><i>✓</i></div>)}</div>}{kind === "MOBILE" && <div className="mobile-preview"><div className="phone-shell"><div className="phone-notch" /><div className="phone-status"><span>9:41</span><span>◒ ◒ ▰</span></div><div className="phone-appbar"><span className="phone-brand"><BrandMark /> easyclub</span><span className="phone-avatar">AK</span></div><div className="phone-greeting"><small>WTOREK, 13 SIERPNIA</small><strong>Dzień dobry, Aniu.</strong></div><div className="phone-alert"><span>●</span><span><b>Masz 1 nową wiadomość</b><small>Anna z klubu · 2 min temu</small></span><i>›</i></div><div className="phone-section-head"><b>Najbliższe zajęcia</b><span>Wszystkie</span></div><div className="phone-card phone-session"><div className="phone-card-icon">✣</div><span><small>DZISIAJ · 17:30</small><strong>Grupa U-12</strong><em>Hala główna · Trener Marek</em></span><i>›</i></div><div className="phone-section-head"><b>Szybki status</b><span>U-12</span></div><div className="phone-card phone-attendance"><span><small>OBECNOŚĆ GRUPY</small><strong>22 <em>/ 24</em></strong></span><b>✓</b></div><div className="phone-nav"><span className="active"><i>⌂</i>Start</span><span><i>▦</i>Kalendarz</span><span><i>♧</i>Grupy</span><span><i>◌</i>Więcej</span></div></div></div>}</div></div>;
}
