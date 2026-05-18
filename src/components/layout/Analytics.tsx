"use client";

// Google Analytics loader that skips admin paths.
//
// gtag fires a page_view on every script-load + on every URL change.
// Mounting it inside a client component lets us read the current
// pathname and bail when the user is in /admin — keeps mom's daily
// console activity out of analytics and avoids paying for it.

import Script from "next/script";
import { usePathname } from "next/navigation";

export default function Analytics({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script
        id="ga-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`,
        }}
      />
    </>
  );
}
