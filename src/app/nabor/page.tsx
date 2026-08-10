import type { Metadata } from "next";
import { NaborPage } from "./nabor-page";

export const metadata: Metadata = {
  title: "Nabór — zapełniaj wolne miejsca w klubie | EasyClub",
  description:
    "Sprawdź, ile kosztują Cię puste miejsca, nie gub zgłoszeń i zamieniaj zainteresowanych w nowych zawodników z EasyClub Nabór.",
  alternates: { canonical: "/nabor" },
  openGraph: {
    title: "Nabór — zapełniaj wolne miejsca w klubie | EasyClub",
    description:
      "Zobacz, ile tracisz na pustych miejscach i zgłoś klub do programu Pilot 10.",
    type: "website",
    locale: "pl_PL",
    url: "https://www.easyclub.pl/nabor",
    images: [{ url: "/brand/og-image.png", width: 1200, height: 630, alt: "EasyClub Nabór" }],
  },
};

export default function NaborRoute() {
  return <NaborPage />;
}
