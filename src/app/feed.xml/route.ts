import { blogPosts } from "@/lib/blog";

const siteUrl = "https://www.easyclub.pl";

export const revalidate = 3600;

export function GET() {
  const items = [...blogPosts]
    .sort((left, right) => toIsoDate(right.date).localeCompare(toIsoDate(left.date)))
    .map(
      (post) => `<item>
      <title>${escapeXml(post.title)}</title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <pubDate>${new Date(`${toIsoDate(post.date)}T09:00:00+00:00`).toUTCString()}</pubDate>
      <category>${escapeXml(post.category)}</category>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Blog EasyClub</title>
    <link>${siteUrl}/blog</link>
    <description>Praktyczne wskazówki dla klubów sportowych, trenerów i akademii.</description>
    <language>pl-PL</language>
    <managingEditor>hello@easyclub.pl (EasyClub)</managingEditor>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}

function toIsoDate(date: string) {
  const [day, month, year] = date.split(".");
  return `${year}-${month}-${day}`;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
