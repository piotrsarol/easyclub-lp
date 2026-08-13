import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { CookieConsent } from "./cookie-consent";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.easyclub.pl"),
  title: "EasyClub — mniej administracji, więcej sportu",
  description:
    "EasyClub łączy harmonogram, obecności, składki, zawodników i komunikację z rodzicami w jednym spokojnym systemie.",
  openGraph: {
    title: "EasyClub — mniej administracji, więcej sportu",
    description: "Jedno miejsce do zarządzania klubem sportowym.",
    type: "website",
    locale: "pl_PL",
    url: "https://www.easyclub.pl/",
    images: [{ url: "/brand/og-image.png", width: 1200, height: 630, alt: "EasyClub" }],
  },
  alternates: { canonical: "/" },
  twitter: {
    card: "summary_large_image",
    title: "EasyClub — mniej administracji, więcej sportu",
    description: "Jedno miejsce do zarządzania klubem sportowym.",
    images: ["/brand/og-image.png"],
  },
  icons: {
    icon: "/brand/favicon.svg",
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
                url: "https://www.easyclub.pl",
                logo: "https://www.easyclub.pl/brand/logo-horizontal-onDark.svg",
                email: "hello@easyclub.pl",
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "EasyClub",
                url: "https://www.easyclub.pl",
                inLanguage: "pl-PL",
              },
            ]),
          }}
        />
        {children}
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
