"use client";

import { useSearchParams } from "next/navigation";
import OAuthButtons from "./OAuthButtons";
import LoginForm from "./LoginForm";

export default function LoginView() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/settings";
  const errorParam = searchParams.get("error");
  const error = errorParam
    ? "Sign-in could not be completed. The link may be expired or invalid. Please try again."
    : null;

  return (
    <>
      <OAuthButtons redirectTo={next} />

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/[0.06]" />
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">
          or continue with email
        </span>
        <div className="h-px flex-1 bg-white/[0.06]" />
      </div>

      <LoginForm next={next} initialError={error} />
    </>
  );
}
