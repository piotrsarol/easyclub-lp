import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "../brand-logo";

export const metadata: Metadata = {
  title: "Polityka prywatności — EasyClub",
  description: "Informacje o przetwarzaniu danych w EasyClub.",
  alternates: { canonical: "/polityka-prywatnosci" },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="article-page">
      <header className="site-header">
        <BrandLogo href="/" />
        <Link className="text-link" href="/nabor">Wróć do Nabór <span>↗</span></Link>
      </header>
      <article className="section-shell article-content">
        <div className="eyebrow">POLITYKA PRYWATNOŚCI</div>
        <h1>Twoje dane nie są<br /><em>paliwem do reklam.</em></h1>
        <p className="article-lead">Poniżej wyjaśniamy, jakie dane otrzymujemy po wysłaniu formularza programu pilotażowego i do czego ich używamy.</p>
        <h2>Jakie dane zbieramy?</h2>
        <p>Możemy otrzymać nazwę klubu, imię i nazwisko, adres e-mail, numer telefonu, opcjonalną liczbę zawodników oraz informacje o źródle kontaktu, w tym parametry UTM.</p>
        <h2>Po co ich potrzebujemy?</h2>
        <p>Używamy ich, aby skontaktować się w sprawie programu Pilot 10, odpowiedzieć na pytania i przygotować wdrożenie. Nie sprzedajemy danych i nie przekazujemy ich w celach reklamowych innym firmom.</p>
        <h2>Jak długo je przechowujemy?</h2>
        <p>Przechowujemy dane tak długo, jak jest to potrzebne do obsługi zgłoszenia i kontaktu w sprawie pilotażu, a następnie usuwamy je lub anonimizujemy zgodnie z obowiązującymi przepisami.</p>
        <h2>Pliki cookies i pomiar reklam</h2>
        <p>Po wyrażeniu dobrowolnej zgody możemy używać Meta Pixel do pomiaru odwiedzin i skuteczności reklam EasyClub. Pixel może zapisywać opcjonalne pliki cookies. Zgodę możesz odrzucić lub zmienić w dowolnym momencie za pomocą ustawień cookies dostępnych na stronie.</p>
        <h2>Twoje prawa</h2>
        <p>Możesz poprosić o dostęp do danych, ich poprawienie, usunięcie lub ograniczenie przetwarzania. W tej sprawie napisz na <a href="mailto:kontakt@easyclub.pl">kontakt@easyclub.pl</a>.</p>
        <p className="article-note">Jeśli masz pytania dotyczące tej polityki, skontaktuj się z nami przed wysłaniem formularza.</p>
      </article>
    </main>
  );
}
