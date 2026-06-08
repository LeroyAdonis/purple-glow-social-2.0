import React from 'react';
import type { Metadata } from "next";
import { Syne, Outfit, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/context/LanguageContext";
import { QueryProvider } from "@/lib/api/query-provider";
import CookieConsentBanner from "@/components/cookie-consent-banner";

// Font Configuration
const syne = Syne({ 
  subsets: ["latin"], 
  variable: "--font-syne",
  display: "swap",
});

const outfit = Outfit({ 
  subsets: ["latin"], 
  variable: "--font-outfit", 
  display: "swap",
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
    <html lang="en" className={`${syne.variable} ${outfit.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet" />
        <script src="https://js.puter.com/v2/" defer></script>
      </head>
      <body className="bg-deep-charcoal text-white antialiased font-body min-h-screen selection:bg-posta-orange selection:text-white">
        <QueryProvider>
          <LanguageProvider>
            {/* Global Ambient Effects */}
            <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-posta-orange opacity-[0.08] blur-[150px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-surge-teal opacity-[0.08] blur-[150px] rounded-full"></div>
            </div>
            {children}
            <CookieConsentBanner />
          </LanguageProvider>
        </QueryProvider>
      </body>
    </html>
  );
}