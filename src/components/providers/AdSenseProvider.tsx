"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

export default function AdSenseProvider() {
  const pathname = usePathname();

  // Exclude AdSense from pages that do not contain original publisher text content,
  // or screens with video player embeds to comply with AdSense Publisher Policies.
  const excludedPrefixes = [
    "/login",
    "/signup",
    "/profile",
    "/watchlist",
    "/leaderboard",
    "/movie/",
    "/tv/",
    "/person/"
  ];

  const shouldExclude = excludedPrefixes.some((prefix) => pathname.startsWith(prefix) || pathname === prefix);

  if (shouldExclude) {
    return null;
  }

  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-2523996128478722";

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
