import type {
  Metadata,
  Viewport,
} from "next";

import {
  Geist,
  Geist_Mono,
  Manrope,
} from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BioLayers AI",
    template: "%s | BioLayers AI",
  },

  description:
    "AI-driven computational oncology platform for biological mechanism mapping, evidence synthesis, precision oncology research, and hypothesis generation.",

  applicationName: "BioLayers AI",

  keywords: [
    "BioLayers AI",
    "computational oncology",
    "precision oncology",
    "precision medicine",
    "cancer research",
    "biological knowledge graph",
    "mechanism mapping",
    "cancer genomics",
    "PubMed",
    "biomedical AI",
    "research copilot",
  ],

  creator: "BioLayers AI",
  publisher: "BioLayers AI",
  category: "science",

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    title: "BioLayers AI",
    description:
      "AI-driven computational oncology for evidence-linked biological mechanism mapping.",
    siteName: "BioLayers AI",
  },

  twitter: {
    card: "summary_large_image",
    title: "BioLayers AI",
    description:
      "AI-driven computational oncology for evidence-linked biological mechanism mapping.",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#06111a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`
        ${geistSans.variable}
        ${geistMono.variable}
        ${manrope.variable}
        h-full
        bg-[#06111a]
        antialiased
      `}
      suppressHydrationWarning
    >
      <body
        className="
          min-h-full
          bg-[var(--background)]
          text-[var(--foreground)]
        "
      >
        {children}
      </body>
    </html>
  );
}