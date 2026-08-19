import Link from "next/link";
import type { Metadata } from "next";

import AuthShell from "../components/auth/AuthShell";
import OAuthButtons from "../components/auth/OAuthButtons";
import SignUpForm from "../components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Create Account",
};

export const dynamic = "force-dynamic";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string;
  }>;
}) {
  const params = await searchParams;
  const next = params.next ?? "/settings";

  return (
    <AuthShell
      eyebrow="Get started"
      title="Create your account"
      description="Every account brings your own Google Gemini API key — your AI usage is billed through your own Google account."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-teal-200/80 transition hover:text-teal-100"
          >
            Sign in
          </Link>
        </>
      }
    >
      <OAuthButtons redirectTo={next} />

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/[0.06]" />
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">
          or with email
        </span>
        <div className="h-px flex-1 bg-white/[0.06]" />
      </div>

      <SignUpForm next={next} />
    </AuthShell>
  );
}