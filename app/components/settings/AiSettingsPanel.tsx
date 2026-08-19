"use client";

import {
  CheckCircle2,
  ExternalLink,
  KeyRound,
  Loader2,
  PlugZap,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { useState } from "react";

const GEMINI_KEY_URL = "https://aistudio.google.com/app/apikey";

const inputClass =
  "h-11 w-full rounded-[13px] border border-white/[0.09] bg-white/[0.025] px-3.5 font-mono text-[13px] text-white placeholder:text-white/30 outline-none transition focus:border-teal-200/40 focus:bg-white/[0.045]";

/*
  AI Settings — manage the user's own Gemini API key.

  The key is sent to a secure server endpoint (/api/gemini/key) where
  it is validated and stored encrypted. It is never returned to the
  browser after it has been saved.
*/
export function AiSettingsPanel({
  initialConfigured,
  initialKeyMasked,
  initialKeyUpdatedAt,
}: {
  initialConfigured: boolean;
  initialKeyMasked: string | null;
  initialKeyUpdatedAt: string | null;
}) {
  const [configured, setConfigured] = useState(
    initialConfigured,
  );
  const [keyMasked, setKeyMasked] = useState(
    initialKeyMasked,
  );
  const [keyUpdatedAt, setKeyUpdatedAt] = useState(
    initialKeyUpdatedAt,
  );

  const [apiKey, setApiKey] = useState("");
  const [busy, setBusy] = useState<
    "save" | "test" | "remove" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const clearMessages = () => {
    setError(null);
    setNotice(null);
  };

  const handleSave = async () => {
    clearMessages();

    const key = apiKey.trim();

    if (!key) {
      setError("Paste your Gemini API key first.");
      return;
    }

    setBusy("save");

    try {
      const response = await fetch("/api/gemini/key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          apiKey: key,
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        setError(
          data.error ||
            "Could not save your Gemini API key.",
        );
        return;
      }

      setConfigured(true);
      setApiKey("");
      setKeyMasked(
        `••••••••••••••••${key.slice(-4)}`,
      );
      setKeyUpdatedAt(new Date().toISOString());
      setNotice(
        "Gemini API key connected. Your key was validated and stored securely.",
      );
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const handleTest = async () => {
    clearMessages();

    setBusy("test");

    try {
      const response = await fetch("/api/gemini/key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test",
          apiKey: apiKey.trim() || undefined,
        }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        setError(
          data.error ||
            "Your Gemini API key could not be verified.",
        );
        return;
      }

      setNotice("Your Gemini API key works.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const handleRemove = async () => {
    clearMessages();

    if (
      !window.confirm(
        "Remove your Gemini API key? AI features will stop working until you add a new key.",
      )
    ) {
      return;
    }

    setBusy("remove");

    try {
      const response = await fetch("/api/gemini/key", {
        method: "DELETE",
      });

      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        setError(
          data.error ||
            "Could not remove your Gemini API key.",
        );
        return;
      }

      setConfigured(false);
      setKeyMasked(null);
      setKeyUpdatedAt(null);
      setApiKey("");
      setNotice("Gemini API key removed.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section
      id="ai"
      className="scroll-mt-24 overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#050914]/80 backdrop-blur-xl"
    >
      <div className="border-b border-white/[0.06] px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-white/30">
              AI Settings
            </div>
            <div className="mt-1 flex items-center gap-2 text-lg font-semibold tracking-[-0.02em] text-white">
              <KeyRound className="h-4 w-4 text-teal-300/70" />
              Gemini API
            </div>
          </div>

          {configured ? (
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-400/[0.06] px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-300/90">
              <CheckCircle2 className="h-3 w-3" />
              Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-400/[0.06] px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-amber-300/90">
              <TriangleAlert className="h-3 w-3" />
              Key required
            </span>
          )}
        </div>
      </div>

      <div className="space-y-5 px-6 py-6">
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
          <div className="mb-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
            Status
          </div>

          {configured ? (
            <div className="rounded-[16px] border border-emerald-300/12 bg-emerald-400/[0.04] px-4 py-3.5">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-200/90">
                <CheckCircle2 className="h-4 w-4" />
                Gemini API key connected
              </div>
              <div className="mt-1.5 font-mono text-[13px] tracking-[0.08em] text-white/70">
                {keyMasked}
              </div>
              <div className="mt-2 text-xs text-white/40">
                {keyUpdatedAt
                  ? `Connected ${new Date(keyUpdatedAt).toLocaleString()}`
                  : ""}
              </div>
            </div>
          ) : (
            <div className="rounded-[16px] border border-amber-300/12 bg-amber-400/[0.04] px-4 py-3.5">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-200/90">
                <TriangleAlert className="h-4 w-4" />
                Gemini API key required
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-white/50">
                Connect your Gemini API key to use AI features.
              </p>
            </div>
          )}
        </div>

        <div>
          <div className="mb-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
            {configured
              ? "Replace API key"
              : "API key"}
          </div>
          <input
            type="password"
            autoComplete="off"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                void handleSave();
              }
            }}
            placeholder="Paste your Gemini API key"
            className={inputClass}
          />
          <p className="mt-2 text-xs leading-relaxed text-white/40">
            Your key is sent to a secure server endpoint, validated
            against the Gemini API, encrypted and stored. The full key
            is never shown again and is never exposed to your browser.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={busy !== null}
            className="flex h-11 items-center gap-2 rounded-[13px] border border-teal-200/25 bg-teal-300/[0.09] px-5 text-sm font-bold text-teal-50 transition hover:border-teal-200/45 hover:bg-teal-300/[0.14] disabled:opacity-60"
          >
            {busy === "save" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PlugZap className="h-4 w-4" />
            )}
            {configured ? "Replace Key" : "Save API Key"}
          </button>

          <button
            type="button"
            onClick={() => void handleTest()}
            disabled={busy !== null}
            className="flex h-11 items-center gap-2 rounded-[13px] border border-white/[0.09] bg-white/[0.03] px-4 text-xs font-semibold text-white/70 transition hover:border-white/[0.18] hover:bg-white/[0.06] disabled:opacity-60"
          >
            {busy === "test" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Test key
          </button>

          {configured && (
            <button
              type="button"
              onClick={() => void handleRemove()}
              disabled={busy !== null}
              className="flex h-11 items-center gap-2 rounded-[13px] border border-rose-300/15 bg-rose-400/[0.05] px-4 text-xs font-semibold text-rose-200/80 transition hover:border-rose-300/30 hover:bg-rose-400/[0.1] disabled:opacity-60"
            >
              {busy === "remove" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Remove key
            </button>
          )}
        </div>

        <div className="rounded-[16px] border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 text-xs leading-relaxed text-white/45">
          <span className="font-semibold text-white/70">
            Billing note:{" "}
          </span>
          Your Gemini usage is billed and managed through your own
          Google AI / Gemini account, not through this application.
          You can monitor usage and set limits in Google AI Studio.
        </div>
      </div>

      <div className="border-t border-white/[0.06] px-6 py-5">
        <a
          href={GEMINI_KEY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 text-xs font-semibold text-teal-200/70 transition hover:text-teal-100"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Get Gemini API Key — Google AI Studio
        </a>
      </div>
    </section>
  );
}