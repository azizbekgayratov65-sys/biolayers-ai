"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Check,
  FileText,
  Sparkles,
} from "lucide-react";

import type {
  MindMapResponse,
} from "../lib/mindmapTypes";

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
  provider: string;
  model: string;
  preferred: string;
  fallback: string;
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
      setPhase("loading");
      setProgressSteps([]);

      console.info(
        `[mindmap] Uploading "${file.name}" (${(file.size / 1024 / 1024).toFixed(2)} MB)…`,
      );

      try {
        const formData = new FormData();
        formData.append("file", file);

        const fetchResponse =
          await fetch("/api/mindmap", {
            method: "POST",
            body: formData,
          });

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

            const event = JSON.parse(
              line,
            ) as {
              type: string;
              step?: number;
              label?: string;
              message?: string;
              ts?: number;
              error?: string;
            };

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
              throw new Error(
                event.error ||
                  event.message ||
                  "Could not generate the mind map.",
              );
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
          bg-[radial-gradient(ellipse_at_top,rgba(94,234,212,.07),transparent_62%)]
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
            </div>

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
                value="Up to 25 MB"
              />
              <CapacityCard
                label="Paper length"
                value="Up to 500,000 chars"
              />
              <CapacityCard
                label="AI model"
                value={
                  modelInfo?.model ??
                  "Checking…"
                }
              />
            </div>

            {phase === "loading" && (
              <div className="mx-auto mt-6 max-w-2xl">
                <div className="overflow-hidden rounded-2xl border border-teal-100/[0.07] bg-[#0a1b26]/70">
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
        bg-[#0a1b26]/70
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