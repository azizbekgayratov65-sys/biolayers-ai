"use client";

import { Loader2, UserPlus, User, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";

import { createClient } from "../../lib/supabase/client";

const inputClass =
  "h-11 min-h-[44px] w-full rounded-xl border border-slate-700/80 bg-slate-950/60 px-3.5 text-base sm:text-sm text-white placeholder:text-slate-500 outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:border-emerald-500/40";

export default function SignUpForm({
  next,
}: {
  next: string;
}) {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<"idle" | "checking" | "available" | "taken">("idle");

  const checkUsernameAvailability = async (value: string) => {
    if (!value || value.length < 3) {
      setUsernameAvailable("idle");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameAvailable("idle");
      return;
    }

    setUsernameAvailable("checking");
    const supabase = createClient();

    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", value.toLowerCase())
      .maybeSingle();

    setUsernameAvailable(data ? "taken" : "available");
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(value);
    checkUsernameAvailability(value);
  };

  const signUp = async () => {
    setError(null);
    setNotice(null);

    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    if (!username.trim()) {
      setError("Choose a username.");
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Username can only contain letters, numbers, and underscores.");
      return;
    }

    if (usernameAvailable === "taken") {
      setError("This username is already taken.");
      return;
    }

    if (usernameAvailable === "checking") {
      setError("Please wait for username check to complete.");
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
            username: username.trim().toLowerCase(),
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

      <div>
        <label
          htmlFor="signup-name"
          className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400"
        >
          Full Name (optional)
        </label>
        <input
          id="signup-name"
          type="text"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Dr. Rosalind Franklin"
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="signup-username"
          className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400"
        >
          Public Username
        </label>
        <div className="relative">
          <input
            id="signup-username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={handleUsernameChange}
            placeholder="r_franklin"
            className={`${inputClass} pr-24`}
            maxLength={30}
          />
          {usernameAvailable === "checking" && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-amber-300" aria-live="polite">
              Checking…
            </span>
          )}
          {usernameAvailable === "available" && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-emerald-400 flex items-center gap-1" aria-live="polite">
              <CheckCircle className="h-3 w-3" /> Available
            </span>
          )}
          {usernameAvailable === "taken" && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-rose-400 flex items-center gap-1" aria-live="polite">
              <AlertCircle className="h-3 w-3" /> Taken
            </span>
          )}
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          3–30 characters. Letters, numbers, and underscores only.
        </p>
      </div>

      <div>
        <label
          htmlFor="signup-email"
          className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400"
        >
          Institutional / Personal Email
        </label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="franklin@lab.org"
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="signup-password"
          className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400"
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
          className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400"
        >
          Confirm Password
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
        className="flex h-11 min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500 text-slate-950 text-sm font-bold shadow-md transition-all hover:bg-emerald-400 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 mt-2"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
        ) : (
          <UserPlus className="h-4 w-4 text-slate-950" />
        )}
        Create Account
      </button>
    </div>
  );
}