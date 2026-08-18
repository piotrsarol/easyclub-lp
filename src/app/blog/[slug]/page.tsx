import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { BlogFooter, BlogHeader } from "../blog-chrome";
import { blogPosts, getBlogPost, getRelatedPosts } from "@/lib/blog";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  const url = `https://www.easyclub.pl/blog/${post.slug}`;
  return {
    title: `${post.title} — EasyClub`,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      title: `${post.title} — EasyClub`,
      description: post.excerpt,
      type: "article",
      url,
      publishedTime: toIsoDate(post.date),
      section: post.category,
      images: [{ url: "/brand/og-image.png", width: 1200, height: 630, alt: "EasyClub" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} — EasyClub`,
      description: post.excerpt,
      images: ["/brand/og-image.png"],
    },
  };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();
  const relatedPosts = getRelatedPosts(post);
  const articleUrl = `https://www.easyclub.pl/blog/${post.slug}`;

  return (
    <main className="blog-page">
      <BlogHeader />
      <article className="article-page section-shell">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: post.title,
              description: post.excerpt,
              url: articleUrl,
              datePublished: toIsoDate(post.date),
              author: { "@type": "Organization", name: "EasyClub", url: "https://www.easyclub.pl" },
              publisher: {
                "@type": "Organization",
                name: "EasyClub",
                url: "https://www.easyclub.pl",
                logo: { "@type": "ImageObject", url: "https://www.easyclub.pl/brand/logo-horizontal-onDark.svg" },
              },
              image: "https://www.easyclub.pl/brand/og-image.png",
              articleSection: post.category,
              inLanguage: "pl-PL",
            }),
          }}
        />
        <Link className="article-back" href="/blog">← Wróć do bloga</Link>
        <div className="article-kicker"><span>{post.category}</span><span>{post.date} · {post.readTime}</span></div>
        <h1>{post.title}</h1>
        <p className="article-lead">{post.excerpt}</p>
        <div className={`article-art article-art-${post.accent}`}><Image src="/brand/logo-horizontal.svg" alt="" width={272} height={64} /><b>01</b></div>
        <div className="article-content">
          {post.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}
        </div>
        <section className="article-related" aria-labelledby="related-posts-heading">
          <div className="eyebrow">Warto przeczytać dalej</div>
          <h2 id="related-posts-heading">Powiązane materiały dla Twojego klubu</h2>
          <div className="article-related-grid">
            {relatedPosts.map((relatedPost) => (
              <Link className="article-related-card" href={`/blog/${relatedPost.slug}`} key={relatedPost.slug}>
                <span>{relatedPost.category}</span>
                <h3>{relatedPost.title}</h3>
                <b>Czytaj artykuł ↗</b>
              </Link>
            ))}
          </div>
        </section>
        <div className="article-end">
          <span>To dopiero początek.</span>
          <Link className="text-link" href="/pilot">Porozmawiajmy o Twoim klubie <span>↗</span></Link>
        </div>
      </article>
      <BlogFooter />
    </main>
  );
}

function toIsoDate(date: string) {
  const [day, month, year] = date.split(".");
  return `${year}-${month}-${day}`;
}
