import React from 'react';
import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/context/LanguageContext";
import { QueryProvider } from "@/lib/api/query-provider";
import CookieConsentBanner from "@/components/cookie-consent-banner";

// Font Configuration


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "700"],
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"], 
  variable: "--font-space", 
  display: "swap",
});

export const metadata: Metadata = {
  title: "Posta | Just Posta. AI Writes Your Posts.",
  description: "South Africa's social media assistant. AI writes posts in all 11 languages. Just Posta and approve.",
  openGraph: {
    title: "Posta | Just Posta. AI Writes Your Posts.",
    description: "South Africa's social media assistant. AI writes posts in all 11 languages. Just Posta and approve.",
    siteName: "Posta",
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Posta | Just Posta. AI Writes Your Posts.",
    description: "South Africa's social media assistant. AI writes posts in all 11 languages. Just Posta and approve.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <head>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet" />
        <script src="https://js.puter.com/v2/" defer></script>
      </head>
      <body className="bg-[var(--posta-paper)] text-[var(--posta-ink)] antialiased font-body min-h-screen selection:bg-[var(--posta-clay)] selection:text-[var(--posta-cream)]">
        <QueryProvider>
          <LanguageProvider>
            {children}
            <CookieConsentBanner />
          </LanguageProvider>
        </QueryProvider>
      </body>
    </html>
  );
}