import type { Metadata } from "next";
import { PilotLanding } from "./pilot-landing";

export const metadata: Metadata = {
  title: "Program pilotażowy — EasyClub",
  description:
    "Sprawdź EasyClub w swoim klubie sportowym. Dołącz do programu pilotażowego i uporządkuj treningi, zawodników, składki oraz komunikację.",
  alternates: { canonical: "/pilot" },
  openGraph: {
    title: "Program pilotażowy — EasyClub",
    description:
      "Dołącz do programu pilotażowego EasyClub i sprawdź system w codziennej pracy klubu.",
    type: "website",
    url: "https://www.easyclub.pl/pilot",
    images: [{ url: "/brand/og-image.png", width: 1200, height: 630, alt: "EasyClub" }],
  },
};

export default function PilotPage() {
  return <PilotLanding />;
}
