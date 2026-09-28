import Link from "next/link";
import type { Metadata } from "next";

import AuthShell from "../components/auth/AuthShell";
import SignUpView from "../components/auth/SignUpView";

export const metadata: Metadata = {
  title: "Create Account",
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = params?.next ?? "/settings";

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
            className="font-semibold text-emerald-400 transition hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-sm"
          >
            Sign in
          </Link>
        </>
      }
    >
      <SignUpView next={next} />
    </AuthShell>
  );
}