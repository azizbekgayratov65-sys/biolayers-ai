"use client";

import {
  useCallback,
  useEffect,
  useState,
  Suspense,
} from "react";

import {
  Check,
  FileText,
  KeyRound,
  Sparkles,
  Loader2,
  Activity,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

import type {
  MindMapResponse,
} from "../lib/mindmapTypes";
import { MAX_TEXT_LENGTH } from "../lib/mindmapTypes";
import {
  CLIENT_DOCX_MAX_BYTES,
  extractTextInBrowser,
  isClientExtractable,
} from "../lib/extractTextClient";

import MindMapUploader from "../components/mindmap/MindMapUploader";

const MindMapDocument = dynamic(
  () => import("../components/mindmap/MindMapDocument"),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-[300px]" role="status" aria-label="Loading document viewer">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-300" aria-hidden="true" />
        <span className="sr-only">Loading document viewer…</span>
      </div>
    ),
    ssr: false,
  }
);

type Phase =
  | "upload"
  | "loading"
  | "ready";

type ProgressStep = {
  step: number;
  label: string;
  message: string;
  ts: number;
};

type ModelInfo = {
  configured?: boolean;
  provider: string;
  model: string | null;
  preferred: string;
  fallback: string;
};

type StreamEvent = {
  type: string;
  step?: number;
  label?: string;
  message?: string;
  ts?: number;
  error?: string;
  code?: string;
};

export default function MindMapPage() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [response, setResponse] = useState<MindMapResponse | null>(null);
  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [needsKey, setNeedsKey] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/mindmap/model")
      .then((res) =>
        res.ok
          ? res.json()
          : Promise.reject(
              new Error(
                `Model resolution failed (HTTP ${res.status}).`,
              ),
            ),
      )
      .then((data: ModelInfo) => {
        if (cancelled) return;

        setModelInfo(data);

        if (data.configured === false) {
          setNeedsKey(true);
          return;
        }

        if (data.model) {
          console.info(
            `[mindmap] Effective AI model: "${data.model}" (${data.provider})${data.model !== data.preferred ? ` · preferred "${data.preferred}" unavailable, fallback chain: ${data.fallback}…` : ""}.`,
          );
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.error("[mindmap] Could not resolve AI model:", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleFileSelected = useCallback(
    async (file: File) => {
      setError(null);
      setFileName(file.name);

      const extension =
        file.name
          .toLowerCase()
          .split(".")
          .pop() ?? "";

      if (
        extension === "docx" &&
        file.size > CLIENT_DOCX_MAX_BYTES
      ) {
        setError(
          "Word documents are limited to 4 MB. Export the paper as a PDF and try again.",
        );
        setPhase("upload");
        return;
      }

      setPhase("loading");
      setProgressSteps([]);

      console.info(
        `[mindmap] Uploading "${file.name}" (${(file.size / 1024 / 1024).toFixed(2)} MB)…`,
      );

      try {
        let fetchResponse: Response;

        if (isClientExtractable(file.name)) {
          // Extract the text locally so the raw file never has to
          // cross the serverless request-body size limit.
          setProgressSteps([
            {
              step: 0,
              label: "Extracting text locally",
              message: `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB`,
              ts: 0,
            },
          ]);

          const extracted = await extractTextInBrowser(file);

          if (extracted.text.trim().length < 50) {
            throw new Error(
              "Not enough readable text could be extracted from this document. It may be a scanned or image-based PDF. Try a text-based document.",
            );
          }

          if (extracted.text.length > MAX_TEXT_LENGTH) {
            throw new Error(
              "The extracted text is longer than the current processing limit of 500,000 characters. Upload a shorter paper.",
            );
          }

          console.info(
            `[mindmap] Extracted ${extracted.text.length.toLocaleString()} characters${extracted.pages > 0 ? ` from ${extracted.pages} pages` : ""} locally.`,
          );

          fetchResponse = await fetch("/api/mindmap", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fileName: file.name,
              text: extracted.text,
            }),
          });
        } else {
          const formData = new FormData();
          formData.append("file", file);

          fetchResponse = await fetch("/api/mindmap", {
            method: "POST",
            body: formData,
          });
        }

        if (!fetchResponse.ok) {
          let detail = "";

          try {
            const raw = await fetchResponse.text();
            for (const line of raw.split("\n")) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              try {
                const event = JSON.parse(trimmed) as StreamEvent;
                if (event.message) {
                  detail = event.message;
                  break;
                }
              } catch {
                detail = trimmed;
                break;
              }
            }
          } catch {
            // No readable body
          }

          if (!detail) {
            if (fetchResponse.status === 413) {
              detail = "This paper is too large to process in one request. Try a shorter document.";
            } else if (fetchResponse.status === 401 || fetchResponse.status === 403) {
              detail = "Your session has expired. Sign in again and retry.";
            } else if (fetchResponse.status === 429) {
              detail = "Too many requests — please wait a few minutes and try again.";
            } else {
              detail = `The server could not process this upload (HTTP ${fetchResponse.status}).`;
            }
          }

          throw new Error(detail);
        }

        if (!fetchResponse.body) {
          throw new Error("The server returned no response stream.");
        }

        const reader = fetchResponse.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let result: MindMapResponse | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;

            let event: StreamEvent;
            try {
              event = JSON.parse(line) as StreamEvent;
            } catch {
              throw new Error(
                "The server returned an unexpected response while generating the mind map.",
              );
            }

            if (event.type === "progress") {
              const entry: ProgressStep = {
                step: event.step ?? 0,
                label: event.label ?? "",
                message: event.message ?? "",
                ts: event.ts ?? 0,
              };

              console.info(`[mindmap] ${entry.label}: ${entry.message}`);
              setProgressSteps((current) => [...current, entry]);
            }

            if (event.type === "error") {
              const streamError = new Error(
                event.error || event.message || "Could not generate the mind map.",
              );

              if (event.code === "GEMINI_KEY_REQUIRED") {
                (streamError as Error & { code?: string }).code = "GEMINI_KEY_REQUIRED";
              }

              throw streamError;
            }

            if (event.type === "result") {
              result = event as unknown as MindMapResponse;
              break;
            }
          }

          if (result) break;
        }

        if (!result) {
          throw new Error("The server closed the stream without a result.");
        }

        if (
          !result.mindmap ||
          !Array.isArray(result.mindmap.nodes) ||
          result.mindmap.nodes.length < 2
        ) {
          throw new Error("The AI could not produce a usable mind map from this paper.");
        }

        console.info(
          `[mindmap] Received mind map: ${result.mindmap.nodes.length} nodes, ${result.mindmap.links.length} links (${result.meta.provider} ${result.meta.model}).`,
        );

        setResponse(result);
        setPhase("ready");
      } catch (caught) {
        const message =
          caught instanceof Error
            ? caught.message
            : "Could not generate the mind map.";

        const code = (caught as Error & { code?: string })?.code;
        if (code === "GEMINI_KEY_REQUIRED") {
          setNeedsKey(true);
        }

        console.error(`[mindmap] Failed: ${message}`);
        setError(message);
        setPhase("upload");
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setResponse(null);
    setError(null);
    setFileName("");
    setPhase("upload");
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Dark-field background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(43,255,136,0.06),transparent_65%)]"
      />

      <div className="relative z-10 px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        {phase !== "ready" && (
          <div className="mx-auto max-w-3xl">
            {/* Header section */}
            <div className="mb-8 text-center animate-fade-up">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200/20 bg-teal-300/[0.06] px-3.5 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-teal-200">
                <Sparkles className="h-3 w-3 text-emerald-300" aria-hidden="true" />
                AI Research Paper Mind Map
              </div>

              <h1 className="text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl">
                Turn research literature into a{" "}
                <span className="bg-gradient-to-r from-emerald-200 via-teal-200 to-sky-300 bg-clip-text text-transparent">
                  mind map
                </span>
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-300/85">
                Upload a research paper and BioLayers compresses it into a compact,
                interactive reading document — every biological relationship preserved,
                every idea anchored to its verbatim manuscript quote.
              </p>
            </div>

            {/* BYOK Warning Banner */}
            {needsKey && (
              <div
                role="status"
                className="mb-6 flex flex-col items-center justify-between gap-4 rounded-[20px] border border-amber-300/20 bg-amber-400/[0.06] p-5 backdrop-blur-xl sm:flex-row"
              >
                <div className="flex items-start gap-3">
                  <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-bold text-amber-100">
                      Connect your Gemini API key to activate AI mind map generation.
                    </p>
                    <p className="mt-0.5 text-xs text-amber-200/70">
                      Your key powers the AI analysis and is encrypted with AES-256-GCM.
                    </p>
                  </div>
                </div>

                <Link
                  href="/settings#ai"
                  className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-[12px] border border-amber-300/30 bg-amber-300/[0.12] px-4 py-2 text-xs font-bold text-amber-50 transition hover:border-amber-300/50 hover:bg-amber-300/[0.2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffc53d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04070a]"
                >
                  <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Open AI Settings</span>
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              </div>
            )}

            {/* Stage 1: Document Upload */}
            <MindMapUploader
              busy={phase === "loading"}
              error={error}
              onFileSelected={handleFileSelected}
            />

            {/* Capacity status cards (Concentric nested geometry) */}
            <div className="mx-auto mt-6 grid max-w-2xl gap-3 sm:grid-cols-3">
              <CapacityCard
                label="File Size & Storage"
                value="Any size · Read locally"
                subtext="PDFs bypass Vercel 4.5MB limit"
              />
              <CapacityCard
                label="Processing Capacity"
                value="Up to 500,000 chars"
                subtext="Complete multi-section papers"
              />
              <CapacityCard
                label="Active AI Engine"
                value={
                  needsKey
                    ? "Key required"
                    : (modelInfo?.model ?? "Resolving model…")
                }
                subtext={modelInfo?.provider ? `Provider: ${modelInfo.provider}` : "Gemini BYOK"}
              />
            </div>

            {/* =========================================================================
                STAGE 2: Streaming Progress Timeline
                NDJSON event stream with pulsing active step, checkmarks, tabular-nums
                ========================================================================= */}
            {phase === "loading" && (
              <div
                className="mx-auto mt-6 max-w-2xl animate-fade-up"
                role="region"
                aria-label="Document processing timeline"
                aria-live="polite"
              >
                <div className="overflow-hidden rounded-[24px] border border-emerald-400/25 bg-[#0a0f14]/90 backdrop-blur-xl shadow-[0_16px_50px_rgba(0,0,0,0.5)]">
                  {/* Timeline Header */}
                  <div className="flex items-center justify-between border-b border-emerald-400/15 bg-emerald-400/[0.04] px-5 py-3.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
                      <span className="truncate text-xs font-bold text-white">
                        {fileName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                      </span>
                      <span>Processing Stream</span>
                    </div>
                  </div>

                  {/* Ordered event stream list */}
                  <ol className="divide-y divide-white/[0.04] px-5 py-3">
                    {progressSteps.map((entry, index) => {
                      const isLast = index === progressSteps.length - 1;

                      return (
                        <li
                          key={`${entry.step}-${entry.ts}-${index}`}
                          className="flex items-start gap-3.5 py-3"
                        >
                          {/* Fluorophore beacon / checkmark marker */}
                          <div
                            className={`
                              mt-0.5
                              flex
                              h-6
                              w-6
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              border
                              transition-colors
                              ${
                                isLast
                                  ? "border-emerald-300/50 bg-emerald-400/15 text-emerald-200 shadow-[0_0_12px_rgba(43,255,136,0.3)]"
                                  : "border-teal-300/30 bg-teal-400/[0.08] text-teal-200"
                              }
                            `}
                          >
                            {isLast ? (
                              <span className="h-2 w-2 animate-pulse rounded-full bg-[#2bff88]" />
                            ) : (
                              <Check className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-3">
                              <p className="text-xs font-bold text-white">
                                {entry.label}
                              </p>
                              <span className="shrink-0 font-mono text-[10px] font-bold tabular-nums text-emerald-300/90 bg-emerald-400/[0.08] px-2 py-0.5 rounded-[4px] border border-emerald-400/15">
                                {(entry.ts / 1000).toFixed(2)}s
                              </span>
                            </div>
                            <p className="mt-0.5 truncate text-[11px] text-slate-400">
                              {entry.message}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stage 3: Interactive Reading Document Viewer */}
        {phase === "ready" && response && (
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[300px]" role="status">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-300" aria-hidden="true" />
                <span className="sr-only">Rendering document viewer…</span>
              </div>
            }
          >
            <MindMapDocument response={response} onReset={reset} />
          </Suspense>
        )}
      </div>
    </div>
  );
}

function CapacityCard({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string;
  subtext: string;
}) {
  return (
    <div className="rounded-[16px] border border-teal-100/[0.08] bg-[#0a0f14]/75 p-3.5 text-center backdrop-blur-sm">
      <p className="font-mono text-[8.5px] font-bold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-xs font-bold text-teal-100/90">
        {value}
      </p>
      <p className="mt-0.5 text-[9.5px] text-slate-500">
        {subtext}
      </p>
    </div>
  );
}