import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform",
  description:
    "Explore the BioLayers mechanism pipeline, interactive demos, scientific data infrastructure, and AI research copilot.",
};

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
