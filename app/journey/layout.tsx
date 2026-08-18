import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Journey",
  description:
    "Follow the biological journey from paper to mechanism to hypothesis with the BioLayers research mentorship program.",
};

export default function JourneyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
