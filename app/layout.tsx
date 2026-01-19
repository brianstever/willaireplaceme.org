import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { SkipLink } from "@/components/SkipLink";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "Will AI Replace Me? - Job Loss & AI Impact Tracker",
  description:
    "Track job losses and labor market shifts in the age of AI. Interactive visualization of employment data and AI's impact on the workforce.",
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
  metadataBase: new URL("https://willaireplaceme.org"),
  openGraph: {
    title: "Will AI Replace Me?",
    description: "Track job losses and AI's impact on the workforce",
    url: "https://willaireplaceme.org",
    siteName: "Will AI Replace Me?",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Will AI Replace Me?",
    description: "Track job losses and AI's impact on the workforce",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
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
