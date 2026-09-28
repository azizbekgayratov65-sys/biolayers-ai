import Link from "next/link";
import type { Metadata } from "next";

import AuthShell from "../components/auth/AuthShell";
import LoginView from "../components/auth/LoginView";

export const metadata: Metadata = {
  title: "Sign In",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = params?.next ?? "/settings";
  const errorParam = params?.error;
  const error = errorParam
    ? "Sign-in could not be completed. The link may be expired or invalid. Please try again."
    : null;

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
            className="font-semibold text-emerald-400 transition hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-sm"
          >
            Create an account
          </Link>
        </>
      }
    >
      <LoginView next={next} error={error} />
    </AuthShell>
  );
}