export type BlogPost = {
  slug: string;
  category: string;
  date: string;
  readTime: string;
  title: string;
  excerpt: string;
  accent: string;
  sections: Array<{ heading: string; paragraphs: string[] }>;
};

export const blogPosts: BlogPost[] = [];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
