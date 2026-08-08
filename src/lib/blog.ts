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

export const blogPosts: BlogPost[] = [
  {
    slug: "mniej-administracji-wiecej-sportu",
    category: "Organizacja klubu",
    date: "12.09.2025",
    readTime: "5 min czytania",
    title: "Mniej administracji, więcej sportu. Od czego zacząć?",
    excerpt: "Sześć prostych obszarów, które warto uporządkować, zanim codzienna praca klubu zacznie zależeć od dziesiątek arkuszy i wiadomości.",
    accent: "lime",
    sections: [
      {
        heading: "Zacznij od codziennego rytmu",
        paragraphs: [
          "W klubie sportowym najwięcej czasu nie znika przy dużych projektach. Ucieka w drobnych czynnościach powtarzanych każdego dnia: sprawdzaniu list, przeklejaniu zmian i szukaniu ostatniej wersji informacji.",
          "Pierwszym krokiem nie musi być wielka transformacja. Wystarczy spisać, co dzieje się przed treningiem, w jego trakcie i po nim. Ten prosty obraz szybko pokazuje, gdzie klub traci najwięcej energii.",
        ],
      },
      {
        heading: "Jedno źródło prawdy",
        paragraphs: [
          "Harmonogram, obecności, płatności i komunikacja powinny być ze sobą połączone. Gdy każdy obszar żyje osobno, nawet niewielka zmiana wymaga dodatkowej pracy kilku osób.",
          "Dobre narzędzie nie dokłada kolejnego miejsca do obsługi. Porządkuje informacje tak, aby administrator, trener i rodzic widzieli dokładnie to, czego potrzebują.",
        ],
      },
      {
        heading: "Technologia ma oddawać czas",
        paragraphs: [
          "Celem cyfryzacji klubu nie jest więcej ekranów ani bardziej rozbudowane raporty. Chodzi o to, aby trener mógł skupić się na grupie, a administrator na rozwoju organizacji.",
        ],
      },
    ],
  },
  {
    slug: "jak-uporzadkowac-komunikacje-z-rodzicami",
    category: "Komunikacja",
    date: "05.09.2025",
    readTime: "4 min czytania",
    title: "Jak uporządkować komunikację z rodzicami?",
    excerpt: "Mniej wiadomości do odszukania, mniej pytań „czy coś się zmieniło?” i więcej spokoju po obu stronach.",
    accent: "graphite",
    sections: [
      {
        heading: "Informacja powinna mieć swoje miejsce",
        paragraphs: [
          "Rodzice nie potrzebują kolejnego kanału. Potrzebują pewności, gdzie znaleźć aktualny plan zajęć, wiadomość od trenera i informacje o płatnościach.",
          "Gdy ważne komunikaty trafiają jednocześnie do SMS-a, grupy i prywatnej wiadomości, rośnie ryzyko, że ktoś zobaczy starą wersję albo w ogóle ją przeoczy.",
        ],
      },
      {
        heading: "Rozdziel pilne od ważnego",
        paragraphs: [
          "Odwołany trening wymaga szybkiego powiadomienia. Informacja o zapisach na obóz może spokojnie poczekać na właściwy komunikat. Prosty podział pomaga trenerom pisać krócej i czytelniej.",
        ],
      },
      {
        heading: "Spokojniejszy klub zaczyna się od jasnych zasad",
        paragraphs: [
          "Warto ustalić, gdzie pojawiają się zmiany w harmonogramie, kto wysyła komunikaty i jak rodzic może zadać pytanie. Jasne reguły są ważniejsze niż liczba funkcji.",
        ],
      },
    ],
  },
  {
    slug: "obecnosci-bez-papieru-i-excela",
    category: "Praca trenera",
    date: "28.08.2025",
    readTime: "4 min czytania",
    title: "Obecności bez papieru i Excela",
    excerpt: "Dlaczego szybkie zaznaczanie obecności pomaga nie tylko trenerowi, ale całemu klubowi.",
    accent: "amber",
    sections: [
      {
        heading: "Kilka sekund robi różnicę",
        paragraphs: [
          "Lista obecności nie powinna być osobnym zadaniem po treningu. Jeśli trener może oznaczyć grupę prosto z telefonu, informacja jest aktualna wtedy, kiedy ma największą wartość.",
          "To mały krok, ale wykonywany wiele razy w tygodniu. W skali miesiąca oznacza mniej ręcznej pracy i mniej pomyłek przy rozliczeniach.",
        ],
      },
      {
        heading: "Dane pomagają podejmować decyzje",
        paragraphs: [
          "Regularność obecności pokazuje, które godziny i grupy działają dobrze. Pomaga też szybciej zauważyć, że zawodnik potrzebuje kontaktu albo że harmonogram wymaga korekty.",
        ],
      },
      {
        heading: "Najważniejsza jest prostota",
        paragraphs: [
          "Trener nie powinien uczyć się systemu zamiast prowadzić zajęcia. Najlepszy proces to taki, który zajmuje chwilę i nie wymaga późniejszego przepisywania informacji.",
        ],
      },
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
