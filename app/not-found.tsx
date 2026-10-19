import Link from "next/link";

import { btnPrimary, btnSecondary } from "./components/ui/styles";
import { AmbientGlow } from "./components/ui/Chrome";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="relative isolate mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 pt-24 text-center">
      <AmbientGlow />
      <h1 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">There is no page at this address</h1>
      <p className="mt-4 leading-relaxed text-graphite">
        The link may be old, or a mind map may have been deleted by its author.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className={btnPrimary}>
          Go to the homepage
        </Link>
        <Link href="/library" className={btnSecondary}>
          Browse the library
        </Link>
      </div>
    </div>
  );
}
