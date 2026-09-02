import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";

import AuthShell from "../components/auth/AuthShell";
import LoginView from "../components/auth/LoginView";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to BioLayers"
      description="Sign in to summarize papers, build knowledge graphs and work with your own Gemini API key."
      footer={
        <>
          New to BioLayers?{" "}
          <Link
            href="/signup"
            className="font-semibold text-teal-200/80 transition hover:text-teal-100"
          >
            Create an account
          </Link>
        </>
      }
    >
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-white/[0.02]" />}>
        <LoginView />
      </Suspense>
    </AuthShell>
  );
}