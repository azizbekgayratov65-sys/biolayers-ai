"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Check,
  FileText,
  KeyRound,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

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
import MindMapDocument from "../components/mindmap/MindMapDocument";

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
  const [phase, setPhase] =
    useState<Phase>("upload");
  const [error, setError] =
    useState<string | null>(null);
  const [fileName, setFileName] =
    useState("");
  const [response, setResponse] =
    useState<MindMapResponse | null>(null);
  const [progressSteps, setProgressSteps] =
    useState<ProgressStep[]>([]);
  const [modelInfo, setModelInfo] =
    useState<ModelInfo | null>(null);
  const [needsKey, setNeedsKey] =
    useState(false);

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
        if (cancelled) {
          return;
        }

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
        if (cancelled) {
          return;
        }

        console.error(
          "[mindmap] Could not resolve the AI model:",
          error,
        );
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
              label:
                "Extracting text locally",
              message: `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB`,
              ts: 0,
            },
          ]);

          const extracted =
            await extractTextInBrowser(
              file,
            );

          if (
            extracted.text.trim()
              .length < 50
          ) {
            throw new Error(
              "Not enough readable text could be extracted from this PDF. It may be a scanned or image-based document. Try a text-based PDF or run OCR first.",
            );
          }

          if (
            extracted.text.length >
            MAX_TEXT_LENGTH
          ) {
            throw new Error(
              "The extracted text is longer than the current processing limit of 500,000 characters. Upload a shorter paper.",
            );
          }

          console.info(
            `[mindmap] Extracted ${extracted.text.length.toLocaleString()} characters${extracted.pages > 0 ? ` from ${extracted.pages} pages` : ""} locally.`,
          );

          fetchResponse =
            await fetch(
              "/api/mindmap",
              {
                method: "POST",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify(
                  {
                    fileName:
                      file.name,
                    text: extracted.text,
                  },
                ),
              },
            );
        } else {
          const formData =
            new FormData();
          formData.append(
            "file",
            file,
          );

          fetchResponse =
            await fetch(
              "/api/mindmap",
              {
                method: "POST",
                body: formData,
              },
            );
        }

        if (!fetchResponse.ok) {
          // The platform or server rejected the request before the
          // NDJSON stream started; surface a friendly message.
          let detail = "";

          try {
            const raw =
              await fetchResponse.text();

            for (const line of raw.split("\n")) {
              const trimmed =
                line.trim();

              if (!trimmed) {
                continue;
              }

              try {
                const event = JSON.parse(
                  trimmed,
                ) as StreamEvent;

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
            // No readable body.
          }

          if (!detail) {
            if (
              fetchResponse.status ===
              413
            ) {
              detail =
                "This paper is too large to process in one request. Try a shorter document.";
            } else if (
              fetchResponse.status ===
              401 ||
              fetchResponse.status ===
                403
            ) {
              detail =
                "Your session has expired. Sign in again and retry.";
            } else if (
              fetchResponse.status ===
              429
            ) {
              detail =
                "Too many requests — please wait a few minutes and try again.";
            } else {
              detail = `The server could not process this upload (HTTP ${fetchResponse.status}).`;
            }
          }

          throw new Error(detail);
        }

        if (!fetchResponse.body) {
          throw new Error(
            "The server returned no response stream.",
          );
        }

        const reader =
          fetchResponse.body.getReader();

        const decoder =
          new TextDecoder();

        let buffer = "";

        let result: MindMapResponse | null =
          null;

        while (true) {
          const { done, value } =
            await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(
            value,
            { stream: true },
          );

          const lines =
            buffer.split("\n");

          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (
              !line.trim()
            ) {
              continue;
            }

            let event: StreamEvent;

            try {
              event = JSON.parse(
                line,
              ) as StreamEvent;
            } catch {
              throw new Error(
                "The server returned an unexpected response while generating the mind map.",
              );
            }

            if (
              event.type ===
              "progress"
            ) {
              const entry: ProgressStep =
                {
                  step:
                    event.step ?? 0,
                  label:
                    event.label ??
                    "",
                  message:
                    event.message ??
                    "",
                  ts:
                    event.ts ?? 0,
                };

              console.info(
                `[mindmap] ${entry.label}: ${entry.message}`,
              );

              setProgressSteps(
                (current) => [
                  ...current,
                  entry,
                ],
              );
            }

            if (
              event.type === "error"
            ) {
              const streamError =
                new Error(
                  event.error ||
                    event.message ||
                    "Could not generate the mind map.",
                );

              if (
                event.code ===
                "GEMINI_KEY_REQUIRED"
              ) {
                (
                  streamError as Error & {
                    code?: string;
                  }
                ).code =
                  "GEMINI_KEY_REQUIRED";
              }

              throw streamError;
            }

            if (
              event.type === "result"
            ) {
              result = event as unknown as MindMapResponse;
              break;
            }
          }

          if (result) {
            break;
          }
        }

        if (!result) {
          throw new Error(
            "The server closed the stream without a result.",
          );
        }

        if (
          !result.mindmap ||
          !Array.isArray(
            result.mindmap.nodes,
          ) ||
          result.mindmap.nodes.length < 2
        ) {
          throw new Error(
            "The AI could not produce a usable mind map from this paper.",
          );
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

        const code =
          (
            caught as Error & {
              code?: string;
            }
          )?.code;

        if (code === "GEMINI_KEY_REQUIRED") {
          setNeedsKey(true);
        }

        console.error(
          `[mindmap] Failed: ${message}`,
        );

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
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          fixed
          inset-x-0
          top-0
          z-0
          h-[520px]
          bg-[radial-gradient(ellipse_at_top,rgba(77,141,255,.07),transparent_62%)]
        "
      />

      <div className="relative z-10 px-4 pb-8 pt-24 sm:px-6 lg:px-8">
        {phase !== "ready" && (
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-200/15 bg-teal-300/[0.05] px-3.5 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-teal-200/80">
                <Sparkles className="h-3 w-3" />
                AI Research Paper Mind Map
              </div>

              <h1
                className="
                  text-3xl
                  font-black
                  tracking-[-0.03em]
                  text-white
                  sm:text-4xl
                "
              >
                Turn a paper into a{" "}
                <span className="text-teal-300">
                  mind map
                </span>
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-400">
                Upload a research paper and BioLayers compresses it into a
                compact, interactive mind map — every idea preserved, every
                node linked back to the exact source text it came from.
              </p>

              <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-slate-500">
                <span className="font-semibold text-slate-400">Mind map</span> vs <span className="font-semibold text-slate-400">paragraph summarizer</span>: the summarizer
                simplifies your text; the mind map extracts biological relationships
                and visualizes them as an interactive knowledge graph.
              </p>
            </div>

            {needsKey && (
              <div className="mb-5 flex flex-col items-center justify-between gap-4 rounded-[20px] border border-amber-300/15 bg-amber-400/[0.05] px-5 py-4 sm:flex-row">
                <div className="flex items-start gap-3">
                  <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-amber-300/80" />
                  <div>
                    <p className="text-sm font-semibold text-amber-100">
                      Connect your Gemini API key to use AI features.
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-white/50">
                      Your key powers the AI and is stored securely with
                      your account.
                    </p>
                  </div>
                </div>

                <Link
                  href="/settings#ai"
                  className="flex h-10 shrink-0 items-center gap-2 rounded-[13px] border border-amber-300/25 bg-amber-300/[0.09] px-4 text-xs font-bold text-amber-50 transition hover:border-amber-300/45 hover:bg-amber-300/[0.14]"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  Open AI Settings
                </Link>
              </div>
            )}

            <MindMapUploader
              busy={phase === "loading"}
              error={error}
              onFileSelected={
                handleFileSelected
              }
            />

            <div
              className="
                mx-auto
                mt-6
                grid
                max-w-2xl
                gap-3
                sm:grid-cols-3
              "
            >
              <CapacityCard
                label="File size"
                value="Any size · read locally"
              />
              <CapacityCard
                label="Paper length"
                value="Up to 500,000 chars"
              />
              <CapacityCard
                label="AI model"
                value={
                  needsKey
                    ? "Connect key"
                    : (modelInfo?.model ??
                        "Checking…")
                }
              />
            </div>

            {phase === "loading" && (
              <div className="mx-auto mt-6 max-w-2xl">
                <div className="overflow-hidden rounded-2xl border border-teal-100/[0.07] bg-[#0a0f14]/70">
                  <div className="flex items-center gap-2.5 border-b border-teal-100/[0.06] px-5 py-3.5">
                    <FileText className="h-4 w-4 shrink-0 text-teal-300/80" />
                    <span className="max-w-[260px] truncate text-xs font-semibold text-slate-200">
                      {fileName}
                    </span>
                    <span className="ml-auto flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-teal-300/70">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-300" />
                      Processing
                    </span>
                  </div>

                  <ol className="divide-y divide-white/[0.03] px-5 py-2">
                    {progressSteps.map(
                      (entry, index) => {
                        const isLast =
                          index ===
                          progressSteps.length -
                            1;

                        return (
                          <li
                            key={`${entry.step}-${entry.ts}`}
                            className="flex items-start gap-3 py-2.5"
                          >
                            <span
                              className={`
                                mt-0.5
                                flex
                                h-5
                                w-5
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                border
                                font-mono
                                text-[9px]
                                font-bold

                                ${
                                  isLast
                                    ? "border-teal-300/40 bg-teal-300/10 text-teal-200"
                                    : "border-emerald-300/30 bg-emerald-300/[0.07] text-emerald-200"
                                }
                              `}
                            >
                              {isLast ? (
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-300" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </span>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline justify-between gap-3">
                                <p className="text-xs font-bold text-white">
                                  {entry.label}
                                </p>
                                <span className="shrink-0 font-mono text-[9px] text-slate-500">
                                  {(entry.ts / 1000).toFixed(2)}s
                                </span>
                              </div>
                              <p className="mt-0.5 truncate text-[11px] text-slate-400">
                                {entry.message}
                              </p>
                            </div>
                          </li>
                        );
                      },
                    )}
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}

        {phase === "ready" &&
          response && (
            <MindMapDocument
              response={response}
              onReset={reset}
            />
          )}
      </div>
    </div>
  );
}

function CapacityCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-teal-100/[0.07]
        bg-[#0a0f14]/70
        px-4
        py-3
        text-center
      "
    >
      <p className="font-mono text-[8.5px] font-bold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-teal-100/90">
        {value}
      </p>
    </div>
  );
}