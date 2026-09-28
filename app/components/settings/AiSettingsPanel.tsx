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
  "h-11 min-h-[44px] w-full rounded-xl border border-slate-700/80 bg-slate-950/60 px-3.5 font-mono text-base sm:text-xs text-white placeholder:text-slate-500 outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:border-emerald-500/40";

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
      className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl"
    >
      <div className="border-b border-slate-800/70 px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-400/80">
              AI Engine Settings
            </div>
            <div className="mt-1 flex items-center gap-2 text-xl font-serif font-bold tracking-tight text-white">
              <KeyRound className="h-5 w-5 text-emerald-400" />
              Google Gemini BYOK
            </div>
          </div>

          {configured ? (
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-amber-300">
              <TriangleAlert className="h-3.5 w-3.5 text-amber-400" />
              Key Required
            </span>
          )}
        </div>
      </div>

      <div className="space-y-5 px-6 py-6">
        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 px-4 py-3 text-xs leading-relaxed text-rose-200">
            {error}
          </div>
        )}

        {notice && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 text-xs leading-relaxed text-emerald-200">
            {notice}
          </div>
        )}

        <div>
          <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Engine Status
          </div>

          {configured ? (
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-4 py-3.5">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                Gemini API Key Connected
              </div>
              <div className="mt-1.5 font-mono text-xs tracking-wider text-slate-300">
                {keyMasked}
              </div>
              <div className="mt-2 text-xs font-mono text-slate-500 tabular-nums">
                {keyUpdatedAt
                  ? `Connected: ${new Date(keyUpdatedAt).toLocaleString()}`
                  : ""}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3.5">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
                <TriangleAlert className="h-4 w-4" />
                Gemini API Key Required
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                Connect your personal Gemini API key to activate AI-driven manuscript mind maps and concept extraction.
              </p>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="gemini-key-input" className="block mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {configured ? "Replace Gemini API Key" : "Paste Gemini API Key"}
          </label>
          <input
            id="gemini-key-input"
            type="password"
            autoComplete="off"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                void handleSave();
              }
            }}
            placeholder="AIzaSy..."
            className={inputClass}
          />
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            Your key is transmitted to a secure server-side endpoint, verified with Google Gemini, encrypted with AES-256-GCM, and stored safely. The raw key is never exposed to the client or returned to the browser.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={busy !== null}
            className="flex h-11 min-h-[44px] items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
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
            className="flex h-11 min-h-[44px] items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {busy === "test" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Test Key Connection
          </button>

          {configured && (
            <button
              type="button"
              onClick={() => void handleRemove()}
              disabled={busy !== null}
              className="flex h-11 min-h-[44px] items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              {busy === "remove" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Remove Key
            </button>
          )}
        </div>

        <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 px-4 py-3.5 text-xs leading-relaxed text-slate-400">
          <span className="font-semibold text-slate-200">
            Billing Notice:{" "}
          </span>
          Your Gemini usage is billed and managed through your own Google Cloud / Google AI Studio account, never through BioLayers. Free tier keys from Google AI Studio are fully supported.
        </div>
      </div>

      <div className="border-t border-slate-800/70 px-6 py-4">
        <a
          href={GEMINI_KEY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-lg"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Get Free Gemini API Key — Google AI Studio
        </a>
      </div>
    </section>
  );
}