import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "../brand-logo";

export const metadata: Metadata = {
  title: "Cennik — EasyClub",
  description: "Prosty cennik EasyClub dla klubów sportowych, akademii i szkółek.",
  alternates: { canonical: "/cennik" },
  openGraph: {
    title: "Cennik — EasyClub",
    description: "Wybierz plan dopasowany do skali swojego klubu.",
    type: "website",
    locale: "pl_PL",
    url: "https://easyclub.pl/cennik",
    images: [{ url: "/brand/og-image.png", width: 1200, height: 630, alt: "EasyClub" }],
  },
};

const plans = [
  { name: "Starter", price: "129", players: "60", coaches: "4", groups: "6", ai: "30" },
  { name: "Growth", price: "199", players: "120", coaches: "9", groups: "12", ai: "75", recommended: true },
  { name: "Pro", price: "299", players: "200", coaches: "15", groups: "25", ai: "150" },
  { name: "Business", price: "449", players: "bez limitu", coaches: "bez limitu", groups: "bez limitu", ai: "500" },
];

const limits = [
  ["Zawodnicy", "players"],
  ["Trenerzy", "coaches"],
  ["Grupy", "groups"],
  ["AI / mies.", "ai"],
] as const;

export default function PricingPage() {
  return (
    <main className="pricing-page">
      <header className="site-header pricing-header">
        <BrandLogo href="/" />
        <nav className="nav-links">
          <Link href="/#why">Dlaczego EasyClub</Link>
          <Link href="/#features">Funkcje</Link>
          <Link href="/cennik" aria-current="page">Cennik</Link>
          <Link href="/blog">Blog</Link>
        </nav>
        <Link className="button button-small header-cta" href="/#pilot">Zgłoś klub <span>↗</span></Link>
      </header>

      <section className="pricing-hero section-shell">
        <div className="eyebrow">04 / Prosto i przejrzyście</div>
        <h1>Plan dopasowany<br /><em>do Twojego klubu.</em></h1>
        <p>Wybierz poziom, który odpowiada skali organizacji. Gdy klub rośnie, możesz przejść na kolejny plan bez zmiany narzędzia.</p>
      </section>

      <section className="pricing-list section-shell" aria-label="Plany cenowe">
        <div className="pricing-grid">
          {plans.map((plan) => (
            <article className={plan.recommended ? "pricing-card is-recommended" : "pricing-card"} key={plan.name}>
              {plan.recommended && <div className="pricing-badge">Dla rozwijających się klubów</div>}
              <div className="pricing-card-top">
                <span className="pricing-plan-number">0{plans.indexOf(plan) + 1}</span>
                <h2>{plan.name}</h2>
                <p>miesięcznie</p>
                <div className="pricing-price"><strong>{plan.price}</strong><span>zł</span></div>
              </div>
              <div className="pricing-limits">
                {limits.map(([label, key]) => (
                  <div key={key}><span>{label}</span><strong>{plan[key]}</strong></div>
                ))}
              </div>
              <Link className={plan.recommended ? "button pricing-button" : "text-link pricing-button"} href="/#pilot">
                {plan.recommended ? "Wybierz Growth" : "Porozmawiajmy"} <span>↗</span>
              </Link>
            </article>
          ))}
        </div>
        <p className="pricing-note">Potrzebujesz innego układu? Porozmawiajmy o specyfice Twojego klubu.</p>
      </section>

      <section className="pricing-cta section-shell">
        <div>
          <div className="eyebrow">Nie wiesz, który plan wybrać?</div>
          <h2>Zacznijmy od<br /><em>Twojego klubu.</em></h2>
        </div>
        <Link className="button" href="/#pilot">Zgłoś klub do pilotażu <span>↗</span></Link>
      </section>

      <footer className="site-footer section-shell">
        <BrandLogo href="/" />
        <p>Jedno miejsce do zarządzania klubem sportowym.</p>
        <div className="footer-links">
          <a href="mailto:hello@easyclub.pl">Kontakt</a>
          <Link href="/cennik">Cennik</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/#pilot">Pilotaż</Link>
        </div>
        <small>© 2025 EasyClub</small>
      </footer>
    </main>
  );
}
