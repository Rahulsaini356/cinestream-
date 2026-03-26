import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NextTopLoader from "nextjs-toploader";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CineStream | Movies & TV",
  description: "A premium movie streaming discovery app",
  verification: {
    google: "eBgT2koe6w9ks8rV2J55i1piuItGO6DTlCuLqmfVMf8",
  },
  other: {
    "google-adsense-account": "ca-pub-2523996128478722",
    "monetag": "a33aaf7d9ca5b9ed584dc220d4af745e",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col bg-[var(--color-background)] text-[var(--color-foreground)]" suppressHydrationWarning>
        <Script
          src="https://quge5.com/88/tag.min.js"
          data-zone="223594"
          strategy="afterInteractive"
          data-cfasync="false"
        />
        <NextTopLoader 
          color="#e11d48" 
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={true} 
          easing="ease"
          speed={200}
          shadow="0 0 10px #e11d48,0 0 5px #e11d48"
        />
        <AuthProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
