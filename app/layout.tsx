import React from 'react';
import type { Metadata } from "next";
import { Syne, Outfit, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/context/LanguageContext";
import { QueryProvider } from "@/lib/api/query-provider";

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
  title: "Purple Glow | AI Social Manager",
  description: "Liquid Intelligence for Mzansi Creators",
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
      </head>
      <body className="bg-void text-white antialiased font-body min-h-screen selection:bg-neon-grape selection:text-white">
        <QueryProvider>
          <LanguageProvider>
            {/* Global Ambient Effects */}
            <div className="fixed inset-0 pointer-events-none z-[-1]">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-neon-grape opacity-[0.08] blur-[150px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-joburg-teal opacity-[0.08] blur-[150px] rounded-full"></div>
            </div>
            {children}
          </LanguageProvider>
        </QueryProvider>
      </body>
    </html>
  );
}