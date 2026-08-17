import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CookieConsent } from "./cookie-consent";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.easyclub.pl"),
  title: "EasyClub — aplikacja do zarządzania klubem sportowym",
  description:
    "EasyClub to aplikacja do zarządzania klubem sportowym: harmonogram, obecności, zawodnicy, składki, płatności i komunikacja z rodzicami w jednym miejscu.",
  openGraph: {
    title: "EasyClub — aplikacja do zarządzania klubem sportowym",
    description: "System dla klubów sportowych, akademii i szkółek: organizacja zajęć, zawodników, płatności i komunikacji.",
    type: "website",
    locale: "pl_PL",
    url: "https://www.easyclub.pl/",
    images: [{ url: "/brand/og-image.png", width: 1200, height: 630, alt: "EasyClub" }],
  },
  alternates: { canonical: "/" },
  twitter: {
    card: "summary_large_image",
    title: "EasyClub — aplikacja do zarządzania klubem sportowym",
    description: "System dla klubów sportowych, akademii i szkółek: organizacja zajęć, zawodników, płatności i komunikacji.",
    images: ["/brand/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/brand/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/brand/favicon.svg", sizes: "32x32", type: "image/svg+xml" },
    ],
    apple: "/brand/apple-touch-icon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "EasyClub",
                alternateName: "EasyClub — aplikacja do zarządzania klubem sportowym",
                url: "https://www.easyclub.pl",
                logo: "https://www.easyclub.pl/brand/logo-horizontal-onDark.svg",
                email: "hello@easyclub.pl",
                description:
                  "EasyClub to polska aplikacja webowa do zarządzania klubem sportowym, akademią lub szkółką.",
                knowsAbout: [
                  "zarządzanie klubem sportowym",
                  "harmonogram treningów",
                  "obecności zawodników",
                  "składki i płatności",
                  "komunikacja z rodzicami",
                ],
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "EasyClub",
                url: "https://www.easyclub.pl",
                inLanguage: "pl-PL",
                description:
                  "EasyClub pomaga klubom sportowym organizować treningi, zawodników, obecności, płatności i komunikację.",
              },
              {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                name: "EasyClub",
                alternateName: "EasyClub — system do zarządzania klubem sportowym",
                applicationCategory: "BusinessApplication",
                applicationSubCategory: "Sports club management software",
                operatingSystem: "Web",
                url: "https://www.easyclub.pl",
                image: "https://www.easyclub.pl/brand/icon-192.svg",
                description:
                  "Aplikacja do zarządzania klubem sportowym, akademią i szkółką. Łączy harmonogram, obecności, zawodników, składki, płatności i komunikację z rodzicami.",
                featureList: [
                  "Harmonogram treningów",
                  "Obecności zawodników",
                  "Baza zawodników i grup",
                  "Składki i płatności",
                  "Komunikacja z rodzicami",
                  "Aplikacja webowa na telefon",
                ],
                provider: {
                  "@type": "Organization",
                  name: "EasyClub",
                  url: "https://www.easyclub.pl",
                },
              },
            ]),
          }}
        />
        {children}
        <CookieConsent />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
