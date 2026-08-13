import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
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
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1944773832878693');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          {/* Meta's fallback requires a plain image inside noscript. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1944773832878693&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
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
        <Analytics />
      </body>
    </html>
  );
}
