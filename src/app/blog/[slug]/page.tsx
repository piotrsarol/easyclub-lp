import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogFooter, BlogHeader } from "@/app/blog/page";
import { blogPosts, getBlogPost } from "@/lib/blog";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  return post ? { title: `${post.title} — EasyClub`, description: post.excerpt } : {};
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <main className="blog-page">
      <BlogHeader />
      <article className="article-page section-shell">
        <Link className="article-back" href="/blog">← Wróć do bloga</Link>
        <div className="article-kicker"><span>{post.category}</span><span>{post.date} · {post.readTime}</span></div>
        <h1>{post.title}</h1>
        <p className="article-lead">{post.excerpt}</p>
        <div className={`article-art article-art-${post.accent}`}><span>easyclub</span><b>01</b></div>
        <div className="article-content">
          {post.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}
        </div>
        <div className="article-end">
          <span>To dopiero początek.</span>
          <Link className="text-link" href="/#pilot">Porozmawiajmy o Twoim klubie <span>↗</span></Link>
        </div>
      </article>
      <BlogFooter />
    </main>
  );
}
