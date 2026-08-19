"use client";

import { KeyRound, Loader2 } from "lucide-react";
import { useState } from "react";

import { createClient } from "../../lib/supabase/client";

const inputClass =
  "h-11 w-full rounded-[13px] border border-white/[0.09] bg-white/[0.025] px-3.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-teal-200/40 focus:bg-white/[0.045]";

/*
  Sets a new password after the Supabase "recovery" flow. Only
  reachable with a valid recovery session (the callback redirects
  here after exchanging the reset code).
*/
export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const updatePassword = async () => {
    setError(null);
    setNotice(null);

    if (password.length < 8) {
      setError("Your new password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setBusy(true);

    const supabase = createClient();

    const { error: updateError } =
      await supabase.auth.updateUser({
        password,
      });

    setBusy(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setNotice(
      "Your password has been updated. You can now sign in with it.",
    );

    setTimeout(() => {
      window.location.href = "/settings";
    }, 1200);
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
          htmlFor="reset-password"
          className="mb-1.5 block font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/35"
        >
          New password
        </label>
        <input
          id="reset-password"
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
          htmlFor="reset-confirm"
          className="mb-1.5 block font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/35"
        >
          Confirm new password
        </label>
        <input
          id="reset-confirm"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              void updatePassword();
            }
          }}
          placeholder="Repeat your new password"
          className={inputClass}
        />
      </div>

      <button
        type="button"
        onClick={() => void updatePassword()}
        disabled={busy}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-teal-200/25 bg-teal-300/[0.09] text-sm font-bold text-teal-50 transition duration-300 hover:border-teal-200/45 hover:bg-teal-300/[0.14] disabled:opacity-60"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <KeyRound className="h-4 w-4" />
        )}
        Update Password
      </button>
    </div>
  );
}