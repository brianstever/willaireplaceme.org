import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { SkipLink } from "@/components/SkipLink";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  metadataBase: new URL("https://willaireplaceme.org"),
  title: {
    default: "Will AI Replace Me? - U.S. Labor Market Dashboard",
    template: "%s | Will AI Replace Me?",
  },
  description:
    "Explore U.S. job openings, unemployment, labor force participation, and AI keyword mentions in federal job announcements.",
  keywords: [
    "AI job loss",
    "AI impact",
    "job automation",
    "labor market",
    "employment trends",
    "AI workforce",
    "JOLTS",
    "BLS data",
  ],
  authors: [{ name: "Brian Stever", url: "https://github.com/brianstever" }],
  creator: "Brian Stever",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: "Will AI Replace Me?",
    description: "Explore U.S. labor market data and federal job announcements",
    url: "https://willaireplaceme.org",
    siteName: "Will AI Replace Me?",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Will AI Replace Me?",
    description: "Explore U.S. labor market data and federal job announcements",
  },
  alternates: {
    canonical: "https://willaireplaceme.org",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth">
      <head>
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body className="antialiased min-h-screen">
        <SkipLink />
        <ConvexClientProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </ConvexClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
