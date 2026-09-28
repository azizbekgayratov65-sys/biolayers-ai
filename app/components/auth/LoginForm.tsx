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
  "h-11 min-h-[44px] w-full rounded-xl border border-slate-700/80 bg-slate-950/60 px-3.5 text-base sm:text-sm text-white placeholder:text-slate-500 outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:border-emerald-500/40";

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
          className="rounded-xl border border-rose-500/30 bg-rose-950/20 px-4 py-3 text-xs leading-relaxed text-rose-200"
        >
          {error}
        </div>
      )}

      {notice && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 text-xs leading-relaxed text-emerald-200">
          {notice}
        </div>
      )}

      {mode === "password" && (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400"
            >
              Email Address
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
              className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400"
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
              placeholder="••••••••••••"
              className={inputClass}
            />
          </div>

          <button
            type="button"
            onClick={() => void signInWithPassword()}
            disabled={busy}
            className="group relative flex h-11 min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500 text-slate-950 text-sm font-bold shadow-md transition-all hover:bg-emerald-400 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
            ) : (
              <Sparkles className="h-4 w-4 text-slate-950" />
            )}
            Sign In
          </button>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={() => {
                clearMessages();
                setMode("magiclink");
              }}
              className="min-h-[44px] inline-flex items-center text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-lg px-2 -ml-2"
            >
              Send magic link
            </button>

            <button
              type="button"
              onClick={() => {
                clearMessages();
                setMode("forgot");
              }}
              className="min-h-[44px] inline-flex items-center text-xs text-slate-400 hover:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-lg px-2 -mr-2"
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
              className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400"
            >
              Email Address
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
            className="flex h-11 min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500 text-slate-950 text-sm font-bold shadow-md transition-all hover:bg-emerald-400 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
            ) : (
              <Mail className="h-4 w-4 text-slate-950" />
            )}
            Send Magic Link
          </button>

          <button
            type="button"
            onClick={() => {
              clearMessages();
              setMode("password");
            }}
            className="min-h-[44px] inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-lg px-2 -ml-2"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to password sign-in
          </button>
        </div>
      )}

      {mode === "forgot" && (
        <div className="space-y-4">
          <p className="text-xs leading-relaxed text-slate-400">
            Enter the email address registered with your account and we will send you a secure link to reset your password.
          </p>

          <div>
            <label
              htmlFor="forgot-email"
              className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400"
            >
              Email Address
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
            className="flex h-11 min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500 text-slate-950 text-sm font-bold shadow-md transition-all hover:bg-emerald-400 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
            ) : (
              <Mail className="h-4 w-4 text-slate-950" />
            )}
            Send Reset Link
          </button>

          <button
            type="button"
            onClick={() => {
              clearMessages();
              setMode("password");
            }}
            className="min-h-[44px] inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-lg px-2 -ml-2"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to sign-in
          </button>
        </div>
      )}
    </div>
  );
}