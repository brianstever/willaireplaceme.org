import type { Metadata } from "next";
import AboutPageClient from "./AboutPageClient";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about the JOLTS data, unemployment rate, labor force participation, and AI skills tracking on this labor market dashboard.",
  openGraph: {
    title: "About | Will AI Replace Me?",
    description:
      "How this labor market dashboard works and where the data comes from.",
  },
};

export default function AboutPage() {
  return <AboutPageClient />;
}
