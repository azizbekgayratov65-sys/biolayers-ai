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
import BackgroundVideo from "./components/BackgroundVideo";

const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  preload: true,
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
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
    icon: "/biolayers-logo.svg",
    shortcut: "/biolayers-logo.svg",
    apple: "/biolayers-logo.svg",
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
      data-scroll-behavior="smooth"
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
      <head>
        <link rel="icon" href="/biolayers-logo.svg" type="image/svg+xml" />
        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
          <>
            <link
              rel="preconnect"
              href={process.env.NEXT_PUBLIC_SUPABASE_URL}
              crossOrigin="anonymous"
            />
            <link
              rel="dns-prefetch"
              href={process.env.NEXT_PUBLIC_SUPABASE_URL}
            />
          </>
        )}
      </head>
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

        <BackgroundVideo />

        <main
          id="main-content"
          tabIndex={-1}
          className="
            relative
            min-h-screen
            bg-transparent
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