import type { Metadata } from "next";

export const dynamic = "force-dynamic";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NextTopLoader from "nextjs-toploader";

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
    google: "DYO8goukVOSqBS-7I5txsw0B8Lk5LRo5lFIyv9m-wz8",
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
    >
      <body className="min-h-full flex flex-col bg-[var(--color-background)] text-[var(--color-foreground)]" suppressHydrationWarning>
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
