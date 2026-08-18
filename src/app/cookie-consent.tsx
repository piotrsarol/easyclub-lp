"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";

const consentStorageKey = "easyclub-cookie-consent";
const consentCookieName = "easyclub-cookie-consent";
const metaPixelId = "1944773832878693";

type ConsentChoice = "accepted" | "declined";

export function CookieConsent() {
  const [choice, setChoice] = useState<ConsentChoice | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedChoice = window.localStorage.getItem(consentStorageKey);
    if (storedChoice === "accepted" || storedChoice === "declined") {
      setChoice(storedChoice);
      document.cookie = `${consentCookieName}=${storedChoice}; Max-Age=31536000; Path=/; SameSite=Lax`;
    }
    setIsReady(true);
  }, []);

  function saveChoice(nextChoice: ConsentChoice) {
    const hadAcceptedPixel = choice === "accepted";
    window.localStorage.setItem(consentStorageKey, nextChoice);
    document.cookie = `${consentCookieName}=${nextChoice}; Max-Age=31536000; Path=/; SameSite=Lax`;
    setChoice(nextChoice);

    if (hadAcceptedPixel && nextChoice === "declined") {
      for (const cookieName of ["_fbp", "_fbc"]) {
        document.cookie = `${cookieName}=; Max-Age=0; path=/`;
      }
      window.location.reload();
    }
  }

  return (
    <>
      {choice === "accepted" && (
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
            fbq('init', '${metaPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {isReady && choice === null && (
        <section className="cookie-banner" aria-label="Ustawienia plików cookies">
          <div>
            <strong>Szanujemy Twoją prywatność</strong>
            <p>
              Używamy opcjonalnych plików cookies, żeby mierzyć skuteczność strony i reklam.
              Możesz odmówić — podstawowe działanie strony pozostanie bez zmian.{" "}
              <Link href="/polityka-prywatnosci">Dowiedz się więcej</Link>
            </p>
          </div>
          <div className="cookie-actions">
            <button type="button" className="cookie-button cookie-button-secondary" onClick={() => saveChoice("declined")}>
              Odrzuć
            </button>
            <button type="button" className="cookie-button" onClick={() => saveChoice("accepted")}>
              Akceptuję
            </button>
          </div>
        </section>
      )}

      {isReady && choice !== null && (
        <button type="button" className="cookie-settings" onClick={() => setChoice(null)}>
          Ustawienia cookies
        </button>
      )}
    </>
  );
}
