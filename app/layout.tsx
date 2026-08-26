import type {
  Metadata,
  Viewport,
} from "next";

import {
  Instrument_Sans,
  Spectral,
  IBM_Plex_Mono,
} from "next/font/google";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "./globals.css";

import Navbar from "./components/Navbar";

const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  preload: false,
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

  icons: {
    icon: [
      { url: "/branding/biolayers-logo.png", sizes: "32x32", type: "image/png" },
      { url: "/branding/biolayers-logo.png", sizes: "16x16", type: "image/png" },
      { url: "/branding/biolayers-logo.png", sizes: "48x48", type: "image/png" },
      { url: "/branding/biolayers-logo.png", sizes: "64x64", type: "image/png" },
      { url: "/branding/biolayers-logo.png", sizes: "96x96", type: "image/png" },
      { url: "/branding/biolayers-logo.png", sizes: "128x128", type: "image/png" },
      { url: "/branding/biolayers-logo.png", sizes: "192x192", type: "image/png" },
      { url: "/branding/biolayers-logo.png", sizes: "256x256", type: "image/png" },
      { url: "/branding/biolayers-logo.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/branding/biolayers-logo.png",
    apple: "/branding/biolayers-logo.png",
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
  themeColor: "#04070a",
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
        ${spectral.variable}
        ${instrument.variable}
        ${plexMono.variable}
        h-full
        bg-[#04070a]
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
        suppressHydrationWarning
      >
        <a
          href="#main-content"
          className="
            absolute
            left-4
            top-4
            z-[200]
            -translate-y-24
            rounded-lg
            border
            border-teal-200/25
            bg-[#0a1118]
            px-4
            py-2
            text-sm
            font-semibold
            text-teal-50
            transition-transform
            focus:translate-y-0
          "
        >
          Skip to content
        </a>

        <Navbar />

        <link
          rel="preload"
          as="image"
          href="/branding/biolayers-logo.png"
          fetchPriority="high"
        />

        <main
          id="main-content"
          tabIndex={-1}
          className="
            relative
            min-h-screen
            bg-[#04070a]
            text-slate-100
          "
          style={{
            overflowX: "clip",
          }}
        >
          {children}
        </main>

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}