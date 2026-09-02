import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";

import AuthShell from "../components/auth/AuthShell";
import SignUpView from "../components/auth/SignUpView";

export const metadata: Metadata = {
  title: "Create Account",
};

export default function SignUpPage() {
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
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white/[0.02]" />}>
        <SignUpView />
      </Suspense>
    </AuthShell>
  );
}