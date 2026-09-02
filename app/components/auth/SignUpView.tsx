"use client";

import { useSearchParams } from "next/navigation";
import OAuthButtons from "./OAuthButtons";
import SignUpForm from "./SignUpForm";

export default function SignUpView() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/settings";

  return (
    <>
      <OAuthButtons redirectTo={next} />

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/[0.06]" />
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">
          or with email
        </span>
        <div className="h-px flex-1 bg-white/[0.06]" />
      </div>

      <SignUpForm next={next} />
    </>
  );
}
