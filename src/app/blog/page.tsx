import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — EasyClub",
  description: "Praktyczne wskazówki dla klubów sportowych, trenerów i akademii.",
};

export default function BlogPage() {
  return (
    <main className="blog-page">
      <BlogHeader />
      <section className="blog-hero section-shell">
        <div className="eyebrow"><span className="pulse-dot" /> Wiedza dla klubów sportowych</div>
        <h1>Spokojniejszy klub<br /><em>zaczyna się tutaj.</em></h1>
        <p>Praktyczne spojrzenie na organizację klubu, pracę trenerów i komunikację z rodzicami.</p>
      </section>
      <section className="blog-list section-shell">
        <div className="blog-list-heading">
          <div className="eyebrow">Najnowsze wpisy</div>
          <p>Bez branżowego żargonu. Tylko rzeczy, które można zastosować w codziennej pracy.</p>
        </div>
        <div className="blog-grid">
          {blogPosts.map((post, index) => (
            <Link className={`blog-card blog-card-${post.accent}`} href={`/blog/${post.slug}`} key={post.slug}>
              <div className="blog-card-art"><span>0{index + 1}</span><i>{post.category}</i><strong>easyclub</strong></div>
              <div className="blog-card-body">
                <div className="blog-meta"><span>{post.date}</span><span>{post.readTime}</span></div>
                <h2>{post.title}</h2>
                <p>{post.excerpt}</p>
                <span className="blog-read">Czytaj artykuł <b>↗</b></span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="blog-cta section-shell">
        <div>
          <div className="eyebrow">EasyClub dla Twojego klubu</div>
          <h2>Mniej szukania.<br /><em>Więcej działania.</em></h2>
        </div>
        <Link className="button" href="/#pilot">Zgłoś klub do pilotażu <span>↗</span></Link>
      </section>
      <BlogFooter />
    </main>
  );
}

export function BlogHeader() {
  return (
    <header className="site-header blog-header">
      <Link className="logo" href="/" aria-label="EasyClub, strona główna">
        <span className="logo-mark">e</span>
        easy<span>club</span>
      </Link>
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
      <Link className="logo" href="/"><span className="logo-mark">e</span> easy<span>club</span></Link>
      <p>Jedno miejsce do zarządzania klubem sportowym.</p>
      <div className="footer-links"><Link href="mailto:hello@easyclub.pl">Kontakt</Link><Link href="/#pilot">Pilotaż</Link><Link href="/blog">Blog</Link></div>
      <small>© 2025 EasyClub</small>
    </footer>
  );
}
