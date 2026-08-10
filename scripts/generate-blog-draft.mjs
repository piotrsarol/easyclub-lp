import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const topic = process.env.TOPIC || process.argv[2];
const category = process.env.CATEGORY || process.argv[3] || "Organizacja klubu";
const keywords = process.env.KEYWORDS || process.argv[4] || "";
const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";

if (!topic) {
  throw new Error('Podaj temat: npm run blog:draft -- "Temat artykułu"');
}

if (!apiKey) {
  throw new Error("Brak GEMINI_API_KEY. Dodaj klucz Gemini API do środowiska.");
}

const prompt = `Jesteś redaktorem bloga EasyClub, polskiego narzędzia dla klubów sportowych, akademii i szkółek.
Przygotuj szkic artykułu po polsku na temat: "${topic}".
Kategoria: "${category}".
Słowa kluczowe lub intencje wyszukiwania: "${keywords || "dobierz samodzielnie"}".

Zasady:
- tekst ma być praktyczny, konkretny i pomocny dla administratorów klubów, trenerów lub rodziców;
- nie wymyślaj funkcji, statystyk, klientów ani obietnic EasyClub, których nie podano;
- nie upychaj słów kluczowych i nie pisz pod robota;
- przygotuj 700–1000 słów w 4–6 sekcjach;
- zacznij od krótkiej, bezpośredniej odpowiedzi na główne pytanie czytelnika;
- używaj jasnych nagłówków opisujących pytania lub zadania, które może wpisać użytkownik w wyszukiwarkę;
- dodaj praktyczny proces, checklistę albo kryteria decyzji, jeśli pasują do tematu;
- dodaj sekcję z najczęstszymi pytaniami i odpowiedziami, gdy temat ma więcej niż jedną naturalną intencję; pytania i odpowiedzi muszą być widoczne w tekście;
- podawaj konkretne przykłady dla małego klubu, ale nie przedstawiaj założeń jako faktów;
- używaj języka naturalnego, synonimów i krótkich akapitów zamiast sztucznego powtarzania fraz;
- tytuł ma jasno odpowiadać na intencję wyszukiwania;
- excerpt ma mieć maksymalnie 160 znaków;
- metaTitle ma mieć maksymalnie 60 znaków, a metaDescription maksymalnie 155 znaków;
- zakończ praktycznym wnioskiem, bez agresywnej sprzedaży.

Zwróć wyłącznie poprawny JSON w tym kształcie:
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
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    }),
  },
);

if (!response.ok) {
  const details = await response.text();
  throw new Error(`Gemini API zwróciło ${response.status}: ${details}`);
}

const data = await response.json();
const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
if (typeof text !== "string" || !text.trim()) {
  throw new Error("Gemini API nie zwróciło treści artykułu.");
}

const draft = JSON.parse(text.replace(/^```json\s*|\s*```$/g, "").trim());
validateDraft(draft);

const slug = slugify(draft.title);
const output = {
  status: "draft",
  generatedAt: new Date().toISOString(),
  input: { topic, category, keywords },
  seo: {
    metaTitle: draft.metaTitle,
    metaDescription: draft.metaDescription,
    primaryKeyword: draft.primaryKeyword,
    secondaryKeywords: draft.secondaryKeywords,
  },
  post: {
    slug,
    category,
    date: formatDate(new Date()),
    readTime: `${estimateReadTime(draft.sections)} min czytania`,
    title: draft.title,
    excerpt: draft.excerpt,
    accent: "lime",
    sections: draft.sections,
  },
};

const outputDirectory = join(process.cwd(), "content", "blog-drafts");
await mkdir(outputDirectory, { recursive: true });
const outputPath = join(outputDirectory, `${slug}.json`);
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Zapisano szkic: ${outputPath}`);

function validateDraft(value) {
  if (!value || typeof value !== "object") throw new Error("Nieprawidłowy JSON szkicu.");
  for (const field of ["title", "excerpt", "metaTitle", "metaDescription", "primaryKeyword"]) {
    if (typeof value[field] !== "string" || !value[field].trim()) {
      throw new Error(`Brak pola w szkicu: ${field}`);
    }
  }
  if (!Array.isArray(value.secondaryKeywords) || !Array.isArray(value.sections) || value.sections.length < 4) {
    throw new Error("Szkic musi zawierać słowa kluczowe i co najmniej 4 sekcje.");
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
