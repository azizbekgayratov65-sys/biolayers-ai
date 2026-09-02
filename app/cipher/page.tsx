import type { Metadata } from "next";
import CipherWorkspace from "../components/cipher/CipherWorkspace";

export const metadata: Metadata = {
  title: "Project Cipher — Interactive Cause ➔ Effect Cancer Networks",
  description:
    "An initiative by NXT × BioLayers AI to make cancer research papers readable for students through interactive visual cause-and-effect knowledge graphs.",
};

export default function CipherPage() {
  return (
    <main className="relative min-h-screen bg-[#04070a] pt-16">
      <CipherWorkspace />
    </main>
  );
}
