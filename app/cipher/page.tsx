import { Suspense } from "react";
import type { Metadata } from "next";
import CipherWorkspace from "../components/cipher/CipherWorkspace";

export const metadata: Metadata = {
  title: "Project Cipher: cause-and-effect cancer maps",
  description:
    "NXT × BioLayers AI. Cancer mechanisms turned into interactive cause-and-effect maps for students, with a peer-reviewed source behind every arrow.",
};

export default function CipherPage() {
  return (
    // Full-height workspace on large screens; on phones the page scrolls normally.
    <div className="relative w-full bg-transparent pt-[94px] lg:h-screen lg:max-h-screen lg:overflow-hidden">
      <Suspense
        fallback={
          <div className="flex h-[60vh] flex-col items-center justify-center p-8 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-teal-300/20 border-t-teal-300" />
            <p className="mt-4 text-sm text-teal-200/70">Loading Project Cipher</p>
          </div>
        }
      >
        <CipherWorkspace />
      </Suspense>
    </div>
  );
}
