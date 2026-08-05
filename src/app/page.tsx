"use client";

import { FormEvent, useState } from "react";

const features = [
  ["01", "Harmonogram", "Tygodniowy i miesięczny widok zajęć, lokalizacji i trenerów — bez konfliktów w kalendarzu."],
  ["02", "Obecności", "Trener zaznacza obecność grupy w kilka sekund, prosto z telefonu."],
  ["03", "Zawodnicy", "Profile dzieci, grupy, lokalizacje i historia w jednym czytelnym miejscu."],
  ["04", "Składki i płatności", "Plany, należności, karnety i statusy bez ręcznego szukania w arkuszach."],
  ["05", "Komunikacja", "Wiadomości do rodziców i trenerów tam, gdzie każdy może je znaleźć."],
  ["06", "Role i dostęp", "Osobne widoki dla administratora, trenera i rodzica — każdy widzi to, czego potrzebuje."],
  ["07", "PWA / mobile", "EasyClub działa na telefonie i można go zainstalować jak aplikację."],
];

const people = [
  ["Administrator", "Spokojny obraz całej organizacji, finansów i zespołu.", "01"],
  ["Trener", "Harmonogram, grupy i obecności bez papierów.", "02"],
  ["Rodzic", "Zajęcia dzieci, płatności, wiadomości i lokalizacje w jednym miejscu.", "03"],
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    payload.consent = form.get("consent") === "on" ? "true" : "false";

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Coś poszło nie tak.");
      setSubmitted(true);
      event.currentTarget.reset();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Spróbuj ponownie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <header className="site-header">
        <a className="logo" href="#top" aria-label="EasyClub, strona główna">
          <span className="logo-mark">e</span>
          easy<span>club</span>
        </a>
        <button className="menu-toggle" aria-label="Otwórz menu" onClick={() => setMenuOpen(!menuOpen)}>
          <span />
          <span />
        </button>
        <nav className={menuOpen ? "nav-links is-open" : "nav-links"}>
          <a href="#why" onClick={() => setMenuOpen(false)}>Dlaczego EasyClub</a>
          <a href="#features" onClick={() => setMenuOpen(false)}>Funkcje</a>
          <a href="#for-whom" onClick={() => setMenuOpen(false)}>Dla kogo</a>
          <a href="#pilot" onClick={() => setMenuOpen(false)}>Pilotaż</a>
        </nav>
        <a className="button button-small header-cta" href="#pilot">Zgłoś klub <span>↗</span></a>
      </header>

      <section className="hero section-shell" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse-dot" /> Program pilotażowy — zgłoszenia otwarte</div>
          <h1>Mniej administracji.<br /><em>Więcej sportu.</em></h1>
          <p className="hero-lead">EasyClub łączy harmonogram, obecności, składki, zawodników i komunikację z rodzicami w jednym spokojnym systemie.</p>
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
          <div className="feature-list">{features.map(([number, title, description], index) => <div className={index === 0 ? "feature-item active" : "feature-item"} key={title}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div><b>↗</b></div>)}</div>
          <div className="feature-preview"><div className="preview-top"><span>Widok administratora</span><span className="live-dot">● Na żywo</span></div><h3>Dobry tydzień zaczyna się<br />od dobrego planu.</h3><div className="mini-calendar">{["PON 12", "WT 13", "ŚR 14", "CZW 15"].map((day, i) => <div key={day}><small>{day}</small><strong>{["14", "15", "16", "17"][i]}:00</strong><span className={i === 1 ? "session lime" : "session"}>{["Grupa U10", "Trening motoryczny", "Grupa U12", "Mecz domowy"][i]}</span><span className="session faint">{["Sala A", "Boisko 2", "Hala główna", "Boisko 1"][i]}</span></div>)}</div></div>
        </div>
      </section>

      <section className="people-section section-shell" id="for-whom">
        <div className="section-intro"><div className="eyebrow">03 / Dla całego zespołu</div><h2>Jedna platforma.<br /><em>Trzy perspektywy.</em></h2></div>
        <div className="people-grid">{people.map(([title, body, number]) => <div className="person-card" key={title}><div className="person-number">{number}</div><h3>{title}</h3><p>{body}</p><a href="#pilot">Dowiedz się więcej <span>↗</span></a></div>)}</div>
      </section>

      <section className="models-section section-shell"><div className="model-copy"><div className="eyebrow">04 / Elastyczność bez komplikowania</div><h2>Jeden system,<br /><em>różne modele pracy.</em></h2><p>EasyClub pasuje zarówno do tradycyjnych klubów z grupami i stałymi składami, jak i szkółek z zapisami na konkretne zajęcia.</p><a className="text-link" href="#pilot">Porozmawiajmy o Twoim klubie <span>↗</span></a></div><div className="model-graphic"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="model-center"><span className="logo-mark">e</span><strong>easyclub</strong></div><div className="orbit-label label-one">STAŁE GRUPY</div><div className="orbit-label label-two">ZAPISY NA ZAJĘCIA</div><div className="orbit-label label-three">OBÓZ / TURNIEJ</div></div></section>

      <section className="pilot-section section-shell" id="pilot">
        <div className="pilot-copy"><div className="eyebrow"><span className="pulse-dot" /> Program pilotażowy</div><h2>Zobacz EasyClub<br /><em>w swoim klubie.</em></h2><p>Dołącz do klubów, które pomagają nam zbudować najlepsze narzędzie do codziennej pracy.</p><div className="pilot-note"><span>→</span><div><strong>Bez zobowiązań na start.</strong><br />Porozmawiamy, pokażemy produkt i wspólnie ocenimy, czy to dobry moment.</div></div></div>
        <form className="lead-form" onSubmit={handleSubmit}><div className="form-row"><label>Nazwa klubu <input name="clubName" required placeholder="np. Akademia Orlik" /></label><label>Imię i nazwisko <input name="contactName" required placeholder="Jan Kowalski" /></label></div><div className="form-row"><label>E-mail <input type="email" name="email" required placeholder="jan@klub.pl" /></label><label>Telefon <span className="optional">opcjonalnie</span><input name="phone" placeholder="+48 000 000 000" /></label></div><div className="form-row"><label>Typ organizacji <select name="organizationType" defaultValue="Klub sportowy"><option>Klub sportowy</option><option>Akademia</option><option>Szkółka</option><option>Inny</option></select></label><label>Rozmiar klubu <span className="optional">opcjonalnie</span><input name="clubSize" placeholder="np. 120 zawodników" /></label></div><label>Wiadomość <textarea name="message" rows={3} placeholder="Napisz kilka słów o swoim klubie..." /></label><input className="honeypot" name="website" tabIndex={-1} autoComplete="off" /><label className="consent"><input type="checkbox" name="consent" required /> <span>Wyrażam zgodę na kontakt w sprawie programu pilotażowego EasyClub.</span></label>{error && <p className="form-message error">{error}</p>}{submitted ? <p className="form-message success">Dziękujemy — zgłoszenie dotarło. Odezwiemy się wkrótce.</p> : <button className="button form-button" disabled={loading}>{loading ? "Wysyłamy..." : "Zgłoś klub do pilotażu"} <span>↗</span></button>}</form>
      </section>

      <footer className="site-footer section-shell"><a className="logo" href="#top"><span className="logo-mark">e</span> easy<span>club</span></a><p>Jedno miejsce do zarządzania klubem sportowym.</p><div className="footer-links"><a href="mailto:hello@easyclub.pl">Kontakt</a><a href="#pilot">Polityka prywatności</a><a href="#pilot">Regulamin</a></div><small>© 2025 EasyClub</small></footer>
    </main>
  );
}

function DashboardMockup() {
  return <div className="dashboard-wrap"><div className="dashboard-glow" /><div className="dashboard"><div className="dashboard-bar"><span className="window-dots">● ● ●</span><span>easyclub / harmonogram</span><span>•••</span></div><div className="dashboard-body"><aside><div className="side-logo"><span className="logo-mark">e</span> easyclub</div>{["Przegląd", "Harmonogram", "Zawodnicy", "Płatności", "Wiadomości"].map((item, i) => <div className={i === 1 ? "side-item selected" : "side-item"} key={item}><span>{["◈", "▦", "♧", "◒", "◌"][i]}</span>{item}</div>)}<div className="side-bottom">⚙ Ustawienia</div></aside><div className="dash-main"><div className="dash-heading"><div><small>WTOREK, 13 SIERPNIA</small><h3>Dobry dzień, Ania.</h3></div><span className="avatar">AK</span></div><div className="dash-stats"><div><small>ZAJĘCIA DZISIAJ</small><strong>08</strong><span>↗ +2 vs. wczoraj</span></div><div><small>OBECNOŚĆ</small><strong>94<span>%</span></strong><span>↗ +6% w tym tygodniu</span></div><div><small>DO OPŁACENIA</small><strong>12</strong><span className="warn">● wymaga uwagi</span></div></div><div className="dash-schedule"><div className="schedule-head"><strong>Dzisiejszy harmonogram</strong><span>Zobacz wszystko →</span></div>{[["16:00", "Grupa U10", "Boisko 2", "18 / 20"], ["17:30", "Grupa U12", "Hala główna", "16 / 18"], ["19:00", "Trening motoryczny", "Sala A", "12 / 12"]].map(([time, title, place, count], i) => <div className="dash-session" key={title}><strong>{time}</strong><div className={i === 1 ? "session-icon green" : "session-icon"}>✣</div><div><b>{title}</b><small>{place}</small></div><span className="attendees">{count}</span><i>•••</i></div>)}</div></div></div></div></div>;
}
