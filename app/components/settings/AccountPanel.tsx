"use client";

import {
  Calendar,
  Check,
  CircleUserRound,
  Loader2,
  Mail,
  Sparkles,
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
  avatarUrl,
  createdAt,
  geminiConfigured,
}: {
  userId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: string | null;
  geminiConfigured: boolean;
}) {
  const [displayName, setDisplayName] = useState(
    name ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const rowClass =
    "flex items-center justify-between gap-4 py-3";

  return (
    <section className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#070b10]/80 backdrop-blur-xl">
      <div className="border-b border-white/[0.06] px-6 py-5">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              className="h-14 w-14 rounded-2xl border border-white/10 object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-200/15 bg-teal-300/[0.06]">
              <CircleUserRound className="h-7 w-7 text-teal-200/60" />
            </div>
          )}

          <div>
            <div className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-white/30">
              Profile
            </div>
            <div className="mt-1 text-lg font-semibold tracking-[-0.02em] text-white">
              {displayName.trim() || "BioLayers user"}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6">
        <div className={rowClass}>
          <div className="flex items-center gap-2 text-sm text-white/50">
            <Mail className="h-4 w-4 text-white/25" />
            Email
          </div>
          <span className="max-w-[220px] truncate text-sm text-white/85">
            {email || "—"}
          </span>
        </div>

        <div className={rowClass}>
          <div className="flex items-center gap-2 text-sm text-white/50">
            <Calendar className="h-4 w-4 text-white/25" />
            Member since
          </div>
          <span className="text-sm text-white/85">
            {formatDate(createdAt)}
          </span>
        </div>

        <div className={rowClass}>
          <div className="flex items-center gap-2 text-sm text-white/50">
            <Sparkles className="h-4 w-4 text-white/25" />
            Gemini API
          </div>
          <span
            className={`flex items-center gap-1.5 text-xs font-semibold ${
              geminiConfigured
                ? "text-emerald-300/90"
                : "text-amber-300/90"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                geminiConfigured
                  ? "bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,.8)]"
                  : "bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,.8)]"
              }`}
            />
            {geminiConfigured
              ? "Connected"
              : "Key required"}
          </span>
        </div>

        <div className="border-t border-white/[0.06] py-3">
          <div className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/25">
            User ID
          </div>
          <div className="mt-1 break-all font-mono text-[11px] text-white/45">
            {userId}
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.06] px-6 py-5">
        <div className="mb-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
          Display name
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="h-11 w-full rounded-[13px] border border-white/[0.09] bg-white/[0.025] px-3.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-teal-200/40 focus:bg-white/[0.045]"
          />
          <button
            type="button"
            onClick={() => void saveName()}
            disabled={saving}
            className="flex h-11 shrink-0 items-center gap-2 rounded-[13px] border border-teal-200/20 bg-teal-300/[0.07] px-4 text-xs font-bold text-teal-50 transition hover:border-teal-200/35 hover:bg-teal-300/[0.11] disabled:opacity-60"
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
          <p className="mt-2 text-xs text-rose-300/80">{error}</p>
        )}
        {notice && (
          <p className="mt-2 text-xs text-teal-300/80">{notice}</p>
        )}
      </div>
    </section>
  );
}