import Link from "next/link";
import { BrandLogo } from "../brand-logo";

export function BlogHeader() {
  return (
    <header className="site-header blog-header">
      <BrandLogo href="/" />
      <nav className="nav-links">
        <Link href="/#why">Dlaczego EasyClub</Link>
        <Link href="/#features">Funkcje</Link>
        <Link href="/blog" aria-current="page">Blog</Link>
      </nav>
      <Link className="button button-small header-cta" href="/#pilot">Zgłoś klub <span>↗</span></Link>
    </header>
  );
}

export function BlogFooter() {
  return (
    <footer className="site-footer blog-footer section-shell">
      <BrandLogo href="/" />
      <p>Jedno miejsce do zarządzania klubem sportowym.</p>
      <div className="footer-links"><Link href="mailto:hello@easyclub.pl">Kontakt</Link><Link href="/#pilot">Pilotaż</Link><Link href="/blog">Blog</Link></div>
      <small>© 2025 EasyClub</small>
    </footer>
  );
}
