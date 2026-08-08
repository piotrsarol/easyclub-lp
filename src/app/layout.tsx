import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://easyclub.pl"),
  title: "EasyClub — mniej administracji, więcej sportu",
  description:
    "EasyClub łączy harmonogram, obecności, składki, zawodników i komunikację z rodzicami w jednym spokojnym systemie.",
  openGraph: {
    title: "EasyClub — mniej administracji, więcej sportu",
    description: "Jedno miejsce do zarządzania klubem sportowym.",
    type: "website",
    locale: "pl_PL",
    images: [{ url: "/brand/og-image.png", width: 1200, height: 630, alt: "EasyClub" }],
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
        {children}
        <Analytics />
      </body>
    </html>
  );
}
