"use client";

import { KeyRound, Loader2 } from "lucide-react";
import { useState } from "react";

import { createClient } from "../../lib/supabase/client";

const inputClass =
  "h-11 min-h-[44px] w-full rounded-xl border border-slate-700/80 bg-slate-950/60 px-3.5 text-base sm:text-sm text-white placeholder:text-slate-500 outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:border-emerald-500/40";

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
          htmlFor="reset-password"
          className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400"
        >
          New Password
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
          className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400"
        >
          Confirm New Password
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
        className="flex h-11 min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500 text-slate-950 text-sm font-bold shadow-md transition-all hover:bg-emerald-400 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 mt-2"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
        ) : (
          <KeyRound className="h-4 w-4 text-slate-950" />
        )}
        Update Password
      </button>
    </div>
  );
}