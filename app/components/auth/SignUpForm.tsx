"use client";

import { Loader2, UserPlus } from "lucide-react";
import { useState } from "react";

import { createClient } from "../../lib/supabase/client";

const inputClass =
  "h-11 w-full rounded-[13px] border border-white/[0.09] bg-white/[0.025] px-3.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-teal-200/40 focus:bg-white/[0.045]";

export default function SignUpForm({
  next,
}: {
  next: string;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const signUp = async () => {
    setError(null);
    setNotice(null);

    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setBusy(true);

    const supabase = createClient();

    const { data, error: signUpError } =
      await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim() || undefined,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

    setBusy(false);

    if (signUpError) {
      const lower = signUpError.message.toLowerCase();

      if (lower.includes("user already registered")) {
        setError(
          "An account with this email already exists. Sign in instead.",
        );
        return;
      }

      if (lower.includes("weak password")) {
        setError(
          "That password is too weak. Use at least 8 characters including letters and numbers.",
        );
        return;
      }

      setError(signUpError.message);
      return;
    }

    // If the project requires email confirmation, no session is
    // created yet.
    const confirmationPending =
      !data.session &&
      data.user &&
      !data.user.email_confirmed_at;

    if (confirmationPending) {
      setNotice(
        "Almost done! We sent a confirmation link to your email. Click it to activate your account, then sign in.",
      );
      return;
    }

    window.location.href = next;
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border border-rose-300/15 bg-rose-400/[0.06] px-3.5 py-2.5 text-xs leading-relaxed text-rose-200/80">
          {error}
        </div>
      )}

      {notice && (
        <div className="rounded-xl border border-teal-300/15 bg-teal-400/[0.06] px-3.5 py-2.5 text-xs leading-relaxed text-teal-200/80">
          {notice}
        </div>
      )}

      <div>
        <label
          htmlFor="signup-name"
          className="mb-1.5 block font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/35"
        >
          Full name (optional)
        </label>
        <input
          id="signup-name"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Ada Lovelace"
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="signup-email"
          className="mb-1.5 block font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/35"
        >
          Email
        </label>
        <input
          id="signup-email"
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
          htmlFor="signup-password"
          className="mb-1.5 block font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/35"
        >
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="signup-confirm"
          className="mb-1.5 block font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/35"
        >
          Confirm password
        </label>
        <input
          id="signup-confirm"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              void signUp();
            }
          }}
          placeholder="Repeat your password"
          className={inputClass}
        />
      </div>

      <button
        type="button"
        onClick={() => void signUp()}
        disabled={busy}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-teal-200/25 bg-teal-300/[0.09] text-sm font-bold text-teal-50 transition duration-300 hover:border-teal-200/45 hover:bg-teal-300/[0.14] disabled:opacity-60"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UserPlus className="h-4 w-4" />
        )}
        Create Account
      </button>
    </div>
  );
}