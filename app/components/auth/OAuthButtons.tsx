"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { createClient } from "../../lib/supabase/client";

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.79-.07-1.55-.2-2.27H12v4.51h6.45a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.1 3.57-5.18 3.57-8.86Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.93-2.87l-3.88-3c-1.08.72-2.46 1.15-4.05 1.15-3.12 0-5.76-2.1-6.7-4.94H1.28v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 14.34a7.2 7.2 0 0 1 0-4.68v-3.1H1.28a12 12 0 0 0 0 10.88l4.02-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.72c1.76 0 3.35.61 4.6 1.8l3.44-3.44C17.96 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.56l4.02 3.1C6.24 6.82 8.88 4.72 12 4.72Z"
      />
    </svg>
  );
}

/*
  "Continue with Google" button. Each button opens the Supabase OAuth
  flow and returns to /auth/callback.
*/
export default function OAuthButtons({
  redirectTo = "/settings",
}: {
  redirectTo?: string;
}) {
  const [pending, setPending] = useState<boolean>(
    false,
  );
  const [error, setError] = useState<string | null>(null);

  const signInWithProvider = async () => {
    setPending(true);
    setError(null);

    const supabase = createClient();

    const { data, error: signInError } =
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        },
      });

    if (signInError) {
      setPending(false);
      setError(
        "Could not start sign-in. If this keeps happening, check that the provider is enabled in Supabase.",
      );
      return;
    }

    if (!data.url) {
      setPending(false);
      setError("Sign-in did not return a redirect URL. Please try again.");
    }
    // When data.url exists the browser is redirected automatically.
  };

  const baseClass =
    "group relative flex h-11 w-full items-center justify-center gap-2.5 rounded-[14px] border text-sm font-semibold transition duration-300 disabled:opacity-60";

  return (
    <div className="space-y-2.5">
      {error && (
        <div className="rounded-xl border border-rose-300/15 bg-rose-400/[0.06] px-3.5 py-2.5 text-xs leading-relaxed text-rose-200/80">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={() => signInWithProvider()}
        disabled={pending}
        className={`${baseClass} border-white/[0.1] bg-white/[0.035] text-white/85 hover:border-white/[0.18] hover:bg-white/[0.07]`}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        Continue with Google
      </button>
    </div>
  );
}