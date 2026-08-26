import Link from "next/link";
import Script from "next/script";
import { BrandLogo } from "../brand-logo";

export const preferredSourcesUrl = "https://www.google.com/preferences/source?q=www.easyclub.pl";

export function BlogHeader() {
  return (
    <header className="site-header blog-header">
      <Script
        id="google-preferred-sources"
        src="https://news.google.com/swg/js/v1/publisher.js"
        strategy="afterInteractive"
      />
      <BrandLogo href="/" />
      <nav className="nav-links">
          <Link href="/#why">Dlaczego EasyClub</Link>
          <Link href="/#features">Funkcje</Link>
          <Link href="/cennik">Cennik</Link>
          <Link href="/blog" aria-current="page">Blog</Link>
      </nav>
      <div className="preferred-source-badge" aria-label="Dodaj EasyClub do preferowanych źródeł Google">
        <div google-add-preferred-source-btn data-theme="dark" />
      </div>
      <Link className="button button-small header-cta" href="/pilot">Zgłoś klub <span>↗</span></Link>
    </header>
  );
}

export function PreferredSourcesLink() {
  return (
    <a className="preferred-source-link" href={preferredSourcesUrl} target="_blank" rel="noreferrer">
      Dodaj EasyClub do preferowanych źródeł Google <span>↗</span>
    </a>
  );
}

export function BlogFooter() {
  return (
    <footer className="site-footer blog-footer section-shell">
      <BrandLogo href="/" />
      <p>Jedno miejsce do zarządzania klubem sportowym.</p>
      <div className="footer-links"><Link href="mailto:hello@easyclub.pl">Kontakt</Link><Link href="/pilot">Pilotaż</Link><Link href="/cennik">Cennik</Link><Link href="/blog">Blog</Link></div>
      <small>© 2025 EasyClub</small>
    </footer>
  );
}
