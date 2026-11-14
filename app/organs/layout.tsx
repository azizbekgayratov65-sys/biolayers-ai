import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organ atlas",
  description:
    "Living, layered 3D models of organs affected by cancer. Peel back tissue, airways and vessels, fly into the tumour and follow treatment over time.",
};

export default function OrgansLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
