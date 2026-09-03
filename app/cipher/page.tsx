import { Suspense } from "react";
import type { Metadata } from "next";
import CipherWorkspace from "../components/cipher/CipherWorkspace";

export const metadata: Metadata = {
  title: "Project Cipher — Interactive Cause ➔ Effect Cancer Networks",
  description:
    "An initiative by NXT × BioLayers AI to make cancer research papers readable for students through interactive visual cause-and-effect knowledge graphs.",
};

export default function CipherPage() {
  return (
    /* Adjust pt-[102px] below to change distance from the top of the screen */
    <main className="relative h-screen max-h-screen w-full overflow-hidden bg-[#04070a] pt-[102px]">
      <Suspense
        fallback={
          <div className="flex h-full flex-col items-center justify-center bg-[#04070a] p-8 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-300/20 border-t-teal-300" />
            <p className="mt-4 font-mono text-xs uppercase tracking-widest text-teal-200/70">
              Loading Project Cipher…
            </p>
          </div>
        }
      >
        <CipherWorkspace />
      </Suspense>
    </main>
  );
}
