import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { blogPosts } from "@/lib/blog";
import { BlogFooter, BlogHeader } from "./blog-chrome";

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
              <div className="blog-card-art"><span>0{index + 1}</span><i>{post.category}</i><Image src="/brand/logo-horizontal.svg" alt="" width={272} height={64} /></div>
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
