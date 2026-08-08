import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const topicsPath = join(process.cwd(), "content", "seo-topics.json");
const blogPath = join(process.cwd(), "src", "lib", "blog.ts");

if (!apiKey) {
  throw new Error("Brak GEMINI_API_KEY. Dodaj klucz Gemini API do środowiska.");
}

const topics = JSON.parse(await readFile(topicsPath, "utf8"));
const blogSource = await readFile(blogPath, "utf8");
const topic = topics
  .filter((candidate) => candidate.publishedAt === undefined)
  .sort((left, right) => left.priority - right.priority)[0];

if (!topic) {
  throw new Error("Brak nieopublikowanych tematów w content/seo-topics.json.");
}

const prompt = `Jesteś redaktorem bloga EasyClub, polskiego narzędzia dla klubów sportowych.
Przygotuj gotowy do publikacji artykuł po polsku.

Temat: "${topic.topic}"
Kategoria: "${topic.category}"
Główna fraza: "${topic.primaryKeyword}"
Frazy pomocnicze: ${topic.secondaryKeywords.join(", ")}
Intencja: "${topic.intent}"
Brief: ${topic.brief}

Zasady:
- artykuł ma odpowiadać na realny problem administratora klubu, trenera lub osoby zakładającej akademię;
- napisz 700–1000 słów w 4–6 sekcjach;
- nie wymyślaj statystyk, klientów, funkcji EasyClub, cen, wymogów prawnych ani wyników;
- jeśli temat dotyczy prawa, podatków lub finansów, zaznacz potrzebę konsultacji ze specjalistą;
- nie używaj agresywnej sprzedaży ani nie porównuj EasyClub z konkurencją bez źródeł;
- excerpt: maksymalnie 160 znaków;
- metaTitle: maksymalnie 60 znaków;
- metaDescription: maksymalnie 155 znaków;
- zakończ praktycznym podsumowaniem i delikatnym CTA do kontaktu z EasyClub;
- zwróć wyłącznie poprawny JSON.

Format:
{
  "title": "string",
  "excerpt": "string",
  "metaTitle": "string",
  "metaDescription": "string",
  "primaryKeyword": "string",
  "secondaryKeywords": ["string"],
  "sections": [
    { "heading": "string", "paragraphs": ["string", "string"] }
  ]
}`;

const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.55,
        responseMimeType: "application/json",
      },
    }),
  },
);

if (!response.ok) {
  throw new Error(`Gemini API zwróciło ${response.status}: ${await response.text()}`);
}

const data = await response.json();
const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
if (typeof text !== "string" || !text.trim()) {
  throw new Error("Gemini API nie zwróciło treści artykułu.");
}

const draft = JSON.parse(text.replace(/^```json\s*|\s*```$/g, "").trim());
validateDraft(draft);

const slug = slugify(draft.title);
if (blogSource.includes(`slug: "${slug}"`) || blogSource.includes(`title: "${escapeForSearch(draft.title)}"`)) {
  throw new Error(`Artykuł o podobnym tytule już istnieje: ${slug}`);
}

const post = {
  slug,
  category: topic.category,
  date: formatDate(new Date()),
  readTime: `${estimateReadTime(draft.sections)} min czytania`,
  title: draft.title,
  excerpt: draft.excerpt,
  accent: "lime",
  sections: draft.sections,
};

const insertion = `  ${serialize(post)},\n`;
const marker = "\n];\n\nexport function getBlogPost";
const markerIndex = blogSource.indexOf(marker);
if (markerIndex === -1) {
  throw new Error("Nie znaleziono bezpiecznego miejsca do publikacji w src/lib/blog.ts.");
}

const updatedBlogSource =
  blogSource.slice(0, markerIndex) + `\n${insertion}` + blogSource.slice(markerIndex);
await writeFile(blogPath, updatedBlogSource);

topic.publishedAt = new Date().toISOString();
topic.publishedSlug = slug;
topic.publishedTitle = draft.title;
await writeFile(topicsPath, `${JSON.stringify(topics, null, 2)}\n`);

console.log(`Opublikowano artykuł: /blog/${slug}`);

function validateDraft(value) {
  if (!value || typeof value !== "object") throw new Error("Nieprawidłowy JSON artykułu.");
  for (const field of ["title", "excerpt", "metaTitle", "metaDescription", "primaryKeyword"]) {
    if (typeof value[field] !== "string" || !value[field].trim()) {
      throw new Error(`Brak pola w artykule: ${field}`);
    }
  }
  if (
    !Array.isArray(value.secondaryKeywords) ||
    !Array.isArray(value.sections) ||
    value.sections.length < 4 ||
    value.sections.length > 6
  ) {
    throw new Error("Artykuł musi zawierać 4–6 sekcji i słowa kluczowe.");
  }
  if (value.excerpt.length > 160 || value.metaTitle.length > 60 || value.metaDescription.length > 155) {
    throw new Error("Pola SEO przekraczają dozwolony limit znaków.");
  }
  for (const section of value.sections) {
    if (typeof section?.heading !== "string" || !Array.isArray(section.paragraphs) || section.paragraphs.length === 0) {
      throw new Error("Każda sekcja musi mieć nagłówek i akapity.");
    }
  }
}

function estimateReadTime(sections) {
  const words = sections.flatMap((section) => section.paragraphs).join(" ").split(/\s+/).length;
  return Math.max(3, Math.round(words / 200));
}

function formatDate(date) {
  return new Intl.DateTimeFormat("pl-PL").format(date);
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function escapeForSearch(value) {
  return value.replaceAll('"', '\\"');
}

function serialize(value, indent = 2) {
  return JSON.stringify(value, null, indent)
    .replace(/"([^"]+)":/g, "$1:")
    .replace(/"([^"]+)"/g, (_, text) => `"${text.replaceAll('"', '\\"')}"`);
}
