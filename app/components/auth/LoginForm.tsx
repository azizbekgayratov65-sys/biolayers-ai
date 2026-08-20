"use client";

import {
  ArrowLeft,
  Loader2,
  Mail,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import { createClient } from "../../lib/supabase/client";

type Mode = "password" | "magiclink" | "forgot";

const inputClass =
  "h-11 w-full rounded-[13px] border border-white/[0.09] bg-white/[0.025] px-3.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-teal-200/40 focus:bg-white/[0.045]";

export default function LoginForm({
  next,
  initialError,
}: {
  next: string;
  initialError?: string | null;
}) {
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [notice, setNotice] = useState<string | null>(null);

  const clearMessages = () => {
    setError(null);
    setNotice(null);
  };

  const friendlyMessage = (message: string): string => {
    const lower = message.toLowerCase();

    if (lower.includes("invalid login credentials")) {
      return "The email or password is incorrect.";
    }

    if (lower.includes("email not confirmed")) {
      return "This email has not been confirmed yet. Check your inbox and click the confirmation link, or sign in with a magic link.";
    }

    if (lower.includes("user already registered")) {
      return "An account with this email already exists. Sign in instead, or send a magic link.";
    }

    if (lower.includes("rate limit")) {
      return "Too many attempts. Please wait a moment and try again.";
    }

    return message;
  };

  const signInWithPassword = async () => {
    clearMessages();

    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    setBusy(true);

    const supabase = createClient();

    const { error: signInError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    setBusy(false);

    if (signInError) {
      setError(friendlyMessage(signInError.message));
      return;
    }

    window.location.href = next;
  };

  const sendMagicLink = async () => {
    clearMessages();

    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }

    setBusy(true);

    const supabase = createClient();

    const { error } =
      await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

    setBusy(false);

    if (error) {
      setError(friendlyMessage(error.message));
      return;
    }

    setNotice(
      "Magic link sent. Check your inbox and click the link to sign in.",
    );
  };

  const sendResetLink = async () => {
    clearMessages();

    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }

    setBusy(true);

    const supabase = createClient();

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/settings")}`,
        },
      );

    setBusy(false);

    if (error) {
      setError(friendlyMessage(error.message));
      return;
    }

    setNotice(
      "Password reset link sent. Check your inbox and click the link to set a new password.",
    );
  };

  return (
    <div className="space-y-5">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-300/15 bg-rose-400/[0.06] px-3.5 py-2.5 text-xs leading-relaxed text-rose-200/80"
        >
          {error}
        </div>
      )}

      {notice && (
        <div className="rounded-xl border border-teal-300/15 bg-teal-400/[0.06] px-3.5 py-2.5 text-xs leading-relaxed text-teal-200/80">
          {notice}
        </div>
      )}

      {mode === "password" && (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="mb-1.5 block font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/35"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="mb-1.5 block font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/35"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void signInWithPassword();
                }
              }}
              placeholder="••••••••••"
              className={inputClass}
            />
          </div>

          <button
            type="button"
            onClick={() => void signInWithPassword()}
            disabled={busy}
            className="group relative flex h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-teal-200/25 bg-teal-300/[0.09] text-sm font-bold text-teal-50 transition duration-300 hover:border-teal-200/45 hover:bg-teal-300/[0.14] disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Sign In
          </button>

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                clearMessages();
                setMode("magiclink");
              }}
              className="text-teal-200/60 transition hover:text-teal-100"
            >
              Send magic link
            </button>

            <button
              type="button"
              onClick={() => {
                clearMessages();
                setMode("forgot");
              }}
              className="text-white/40 transition hover:text-white/70"
            >
              Forgot password?
            </button>
          </div>
        </div>
      )}

      {mode === "magiclink" && (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="magic-email"
              className="mb-1.5 block font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/35"
            >
              Email
            </label>
            <input
              id="magic-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void sendMagicLink();
                }
              }}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>

          <button
            type="button"
            onClick={() => void sendMagicLink()}
            disabled={busy}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-teal-200/25 bg-teal-300/[0.09] text-sm font-bold text-teal-50 transition duration-300 hover:border-teal-200/45 hover:bg-teal-300/[0.14] disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            Send Magic Link
          </button>

          <button
            type="button"
            onClick={() => {
              clearMessages();
              setMode("password");
            }}
            className="flex items-center gap-1.5 text-xs text-white/40 transition hover:text-white/70"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to password sign-in
          </button>
        </div>
      )}

      {mode === "forgot" && (
        <div className="space-y-4">
          <p className="text-xs leading-relaxed text-white/45">
            Enter the email on your account and we will send you a
            link to reset your password.
          </p>

          <div>
            <label
              htmlFor="forgot-email"
              className="mb-1.5 block font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/35"
            >
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void sendResetLink();
                }
              }}
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>

          <button
            type="button"
            onClick={() => void sendResetLink()}
            disabled={busy}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-teal-200/25 bg-teal-300/[0.09] text-sm font-bold text-teal-50 transition duration-300 hover:border-teal-200/45 hover:bg-teal-300/[0.14] disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            Send Reset Link
          </button>

          <button
            type="button"
            onClick={() => {
              clearMessages();
              setMode("password");
            }}
            className="flex items-center gap-1.5 text-xs text-white/40 transition hover:text-white/70"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to sign-in
          </button>
        </div>
      )}
    </div>
  );
}