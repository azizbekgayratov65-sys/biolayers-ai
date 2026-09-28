import type { Metadata } from "next";

import { requireUser } from "../lib/auth/require-user";
import { getAiSettingsStatus } from "../lib/gemini/store";
import { listPapers } from "../lib/papers/store";
import { AccountPanel } from "../components/settings/AccountPanel";
import { AiSettingsPanel } from "../components/settings/AiSettingsPanel";
import { GeminiInstructions } from "../components/settings/GeminiInstructions";
import { SavedPapersPanel } from "../components/settings/SavedPapersPanel";

export const metadata: Metadata = {
  title: "Settings",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { supabase, user } =
    await requireUser();

  // Ensure a profile row exists (created automatically by the
  // database trigger for new signups, but be defensive for
  // accounts created before the migration).
  await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: user.email ?? "",
        full_name: user.fullName,
        avatar_url: user.avatarUrl,
      },
      { onConflict: "id", ignoreDuplicates: true },
    );

  const [
    { data: profile },
    aiStatus,
    papers,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url, username, created_at")
      .eq("id", user.id)
      .single(),
    getAiSettingsStatus(
      supabase,
      user.id,
    ),
    listPapers(
      supabase,
      user.id,
    ),
  ]);

  return (
    <div className="relative mx-auto w-full max-w-[1100px] px-4 pb-24 pt-28 sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-24 h-[360px] w-[560px] -translate-x-1/2 rounded-full bg-emerald-500/[0.04] blur-[150px]"
      />

      <div className="relative">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 backdrop-blur-md mb-3">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest">
              Account & Credentials
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-white">
            Researcher Profile & BYOK
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
            Manage your researcher identity, configure your Google Gemini API key securely,
            and review your analyzed oncology manuscripts.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-5">
            <AccountPanel
              userId={user.id}
              email={user.email ?? ""}
              name={
                (profile as { full_name?: string | null } | null)
                  ?.full_name ??
                user.fullName
              }
              username={
                (profile as { username?: string | null } | null)
                  ?.username ?? null
              }
              avatarUrl={
                (profile as { avatar_url?: string | null } | null)
                  ?.avatar_url ??
                user.avatarUrl
              }
              createdAt={user.createdAt}
              geminiConfigured={aiStatus.configured}
            />

            <AiSettingsPanel
              initialConfigured={aiStatus.configured}
              initialKeyMasked={aiStatus.keyMasked}
              initialKeyUpdatedAt={aiStatus.keyUpdatedAt}
            />

            <GeminiInstructions />
          </div>

          <SavedPapersPanel papers={papers} />
        </div>
      </div>
    </div>
  );
}