"use client";

import {
  Calendar,
  Check,
  CircleUserRound,
  Loader2,
  Mail,
  Sparkles,
  User,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";

import { createClient } from "../../lib/supabase/client";

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );
}

/*
  Shows the user's profile: id, email, name, avatar, account
  creation date and Gemini connection status. The display name is
  editable and stored in the user's own profiles row (RLS-scoped).
*/
export function AccountPanel({
  userId,
  email,
  name,
  username,
  avatarUrl,
  createdAt,
  geminiConfigured,
}: {
  userId: string;
  email: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  createdAt: string | null;
  geminiConfigured: boolean;
}) {
  const [displayName, setDisplayName] = useState(
    name ?? "",
  );
  const [inputUsername, setInputUsername] = useState(username ?? "");
  const [saving, setSaving] = useState(false);
  const [savingUsername, setSavingUsername] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<"idle" | "checking" | "available" | "taken">("idle");

  const saveName = async () => {
    setSaving(true);
    setError(null);
    setNotice(null);

    const supabase = createClient();

    const { error: updateError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          full_name: displayName.trim() || null,
        },
        { onConflict: "id" },
      );

    setSaving(false);

    if (updateError) {
      setError("Could not save your name. Please try again.");
      return;
    }

    setNotice("Profile updated.");
  };

  const checkUsernameAvailability = async (value: string) => {
    if (!value || value.length < 3) {
      setUsernameAvailable("idle");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameAvailable("idle");
      return;
    }
    if (value === username) {
      setUsernameAvailable("available");
      return;
    }

    setUsernameAvailable("checking");
    const supabase = createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", value.toLowerCase())
      .maybeSingle();

    if (error) {
      console.error("[AccountPanel] Username check error:", error);
    }
    setUsernameAvailable(data ? "taken" : "available");
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setInputUsername(value);
    checkUsernameAvailability(value);
  };

  const saveUsername = async () => {
    setSavingUsername(true);
    setError(null);
    setNotice(null);

    if (!inputUsername.trim()) {
      setError("Username cannot be empty.");
      setSavingUsername(false);
      return;
    }

    if (inputUsername.length < 3) {
      setError("Username must be at least 3 characters.");
      setSavingUsername(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(inputUsername)) {
      setError("Username can only contain letters, numbers, and underscores.");
      setSavingUsername(false);
      return;
    }

    if (usernameAvailable === "taken") {
      setError("This username is already taken.");
      setSavingUsername(false);
      return;
    }

    if (usernameAvailable === "checking") {
      setError("Please wait for username check to complete.");
      setSavingUsername(false);
      return;
    }

    const supabase = createClient();

    // Use update instead of upsert to avoid not-null constraint on email
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ username: inputUsername.trim().toLowerCase() })
      .eq("id", userId);

    setSavingUsername(false);

    if (updateError) {
      console.error("[AccountPanel] Username update error:", updateError);
      if (updateError.code === "23505") {
        setError("This username is already taken.");
      } else {
        setError(`Could not save username: ${updateError.message}`);
      }
      return;
    }

    setNotice("Username updated.");
  };

  const rowClass =
    "flex items-center justify-between gap-4 py-3.5 border-b border-slate-800/50 last:border-b-0";

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl">
      <div className="border-b border-slate-800/70 px-6 py-5">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              className="h-14 w-14 rounded-full border border-emerald-500/30 object-cover shadow-inner"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-950/40">
              <CircleUserRound className="h-7 w-7 text-emerald-400/80" />
            </div>
          )}

          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-400/80">
              Researcher Profile
            </div>
            <div className="mt-1 text-xl font-serif font-bold tracking-tight text-white">
              {displayName.trim() || "BioLayers Researcher"}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-2">
        <div className={rowClass}>
          <div className="flex items-center gap-2.5 text-sm text-slate-400">
            <Mail className="h-4 w-4 text-slate-500" />
            Email Address
          </div>
          <span className="max-w-[240px] truncate text-sm font-medium text-slate-200">
            {email || "—"}
          </span>
        </div>

        <div className={rowClass}>
          <div className="flex items-center gap-2.5 text-sm text-slate-400">
            <User className="h-4 w-4 text-slate-500" />
            Username
          </div>
          <span className="max-w-[240px] truncate text-sm font-mono text-emerald-300">
            @{username || "—"}
          </span>
        </div>

        <div className={rowClass}>
          <div className="flex items-center gap-2.5 text-sm text-slate-400">
            <Calendar className="h-4 w-4 text-slate-500" />
            Member Since
          </div>
          <span className="text-sm font-mono tabular-nums text-slate-300">
            {formatDate(createdAt)}
          </span>
        </div>

        <div className={rowClass}>
          <div className="flex items-center gap-2.5 text-sm text-slate-400">
            <Sparkles className="h-4 w-4 text-slate-500" />
            Gemini Engine
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
              geminiConfigured
                ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-300"
                : "bg-amber-500/10 border border-amber-500/25 text-amber-300"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                geminiConfigured
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  : "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
              }`}
            />
            {geminiConfigured
              ? "Key Connected"
              : "Key Required"}
          </span>
        </div>

        <div className="py-3">
          <div className="font-mono text-[9px] font-bold uppercase tracking-wider text-slate-500">
            User ID
          </div>
          <div className="mt-1 break-all font-mono text-xs text-slate-400">
            {userId}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800/70 px-6 py-5">
        <label htmlFor="display-name-input" className="block mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Display Name
        </label>
        <div className="flex gap-2">
          <input
            id="display-name-input"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name or affiliation"
            className="h-11 min-h-[44px] w-full rounded-xl border border-slate-700/80 bg-slate-950/60 px-3.5 text-base sm:text-sm text-white placeholder:text-slate-500 outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:border-emerald-500/40"
          />
          <button
            type="button"
            onClick={() => void saveName()}
            disabled={saving}
            className="flex h-11 min-h-[44px] shrink-0 items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Save
          </button>
        </div>

        {error && (
          <p className="mt-2 text-xs font-medium text-rose-300">{error}</p>
        )}
        {notice && (
          <p className="mt-2 text-xs font-medium text-emerald-300">{notice}</p>
        )}
      </div>

      <div className="border-t border-slate-800/70 px-6 py-5">
        <label htmlFor="username-input" className="block mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Public Username
        </label>
        <div className="flex flex-col gap-2">
          <div className="relative flex gap-2">
            <input
              id="username-input"
              type="text"
              value={inputUsername}
              onChange={handleUsernameChange}
              placeholder="username"
              className="h-11 min-h-[44px] w-full rounded-xl border border-slate-700/80 bg-slate-950/60 px-3.5 text-base sm:text-sm font-mono text-white placeholder:text-slate-500 outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:border-emerald-500/40 pr-20"
              maxLength={30}
            />
            <button
              type="button"
              onClick={() => void saveUsername()}
              disabled={savingUsername || usernameAvailable === "taken" || usernameAvailable === "checking" || !inputUsername.trim() || inputUsername.length < 3}
              className="flex h-11 min-h-[44px] shrink-0 items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              {savingUsername ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Save
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono" aria-live="polite">
            {usernameAvailable === "checking" && (
              <span className="text-amber-300">Checking availability…</span>
            )}
            {usernameAvailable === "available" && (
              <span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Username is available</span>
            )}
            {usernameAvailable === "taken" && (
              <span className="text-rose-400 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> This username is already taken</span>
            )}
            {usernameAvailable === "idle" && inputUsername.trim().length >= 3 && /^[a-zA-Z0-9_]+$/.test(inputUsername) && (
              <span className="text-slate-500">Enter username to check availability</span>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            3–30 characters. Letters, numbers, and underscores only. Used for your public library link (<span className="font-mono text-slate-400">/library/{inputUsername || "username"}</span>).
          </p>
        </div>

        {error && (
          <p className="mt-2 text-xs font-medium text-rose-300">{error}</p>
        )}
        {notice && (
          <p className="mt-2 text-xs font-medium text-emerald-300">{notice}</p>
        )}
      </div>
    </section>
  );
}