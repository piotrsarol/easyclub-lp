import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "../brand-logo";

export const metadata: Metadata = {
  title: "Regulamin programu Pilot 10 — EasyClub",
  description: "Zasady zgłoszenia do programu pilotażowego EasyClub Nabór.",
  alternates: { canonical: "/regulamin" },
};

export default function TermsPage() {
  return (
    <main className="article-page">
      <header className="site-header">
        <BrandLogo href="/" />
        <Link className="text-link" href="/nabor">Wróć do Nabór <span>↗</span></Link>
      </header>
      <article className="section-shell article-content">
        <div className="eyebrow">REGULAMIN PROGRAMU PILOT 10</div>
        <h1>Proste zasady<br /><em>testowania Nabór.</em></h1>
        <p className="article-lead">Pilot 10 to program dla pierwszych 10 klubów, które chcą sprawdzić EasyClub Nabór w codziennej pracy.</p>
        <h2>Kto może dołączyć?</h2>
        <p>Do programu może zgłosić się osoba prowadząca klub sportowy, akademię lub szkółkę. Zgłoszenie nie oznacza automatycznego przyjęcia — potwierdzimy udział po kontakcie.</p>
        <h2>Warunki programu</h2>
        <p>Udział obejmuje 30 dni bez opłat, pomoc we wdrożeniu i konfiguracji oraz następnie cenę 99 zł miesięcznie przez 12 miesięcy. Po okresie próbnym nie pobieramy opłaty automatycznie.</p>
        <h2>Rezygnacja</h2>
        <p>Możesz zrezygnować z udziału w dowolnym momencie, kontaktując się z nami. Po rezygnacji nie będziemy naliczać kolejnych opłat.</p>
        <h2>Ważne ograniczenie</h2>
        <p>EasyClub Nabór nie gwarantuje określonej liczby zgłoszeń, nowych zawodników ani wysokości przychodu. Narzędzie porządkuje proces i pomaga mierzyć wynik; pozyskanie zainteresowanych zależy od działań klubu.</p>
        <p className="article-note">Pytania dotyczące programu: <a href="mailto:kontakt@easyclub.pl">kontakt@easyclub.pl</a>.</p>
      </article>
    </main>
  );
}
