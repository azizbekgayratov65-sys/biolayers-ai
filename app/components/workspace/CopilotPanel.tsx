"use client";

import type { Dispatch, SetStateAction } from "react";
import { AnimatePresence, motion } from "framer-motion";

import type { EntityData } from "../../lib/buildGraphFromText";

export type CopilotMode =
  | "explain"
  | "mechanism"
  | "hypothesis"
  | "limitations"
  | "simplify"
  | "custom";

export type CopilotCitation = {
  pmid: string;
  title: string;
  support: string;
};

export type CopilotMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  title?: string;
  keyPoints?: string[];
  limitations?: string[];
  followUpQuestions?: string[];
  citations?: CopilotCitation[];
};

type CopilotPanelProps = {
  demoMode: boolean;
  copilotOpen: boolean;
  setCopilotOpen: Dispatch<SetStateAction<boolean>>;
  copilotMode: CopilotMode;
  setCopilotMode: Dispatch<SetStateAction<CopilotMode>>;
  copilotQuestion: string;
  setCopilotQuestion: Dispatch<SetStateAction<string>>;
  copilotLoading: boolean;
  copilotError: string;
  setCopilotError: Dispatch<SetStateAction<string>>;
  copilotMessages: CopilotMessage[];
  selectedEntity: EntityData;
  relatedConnectionCount: number;
  pubMedPaperCount: number;
  askCopilot: (
    requestedMode?: CopilotMode,
    questionOverride?: string,
  ) => Promise<void>;
};

export default function CopilotPanel({
  demoMode,
  copilotOpen,
  setCopilotOpen,
  copilotMode,
  setCopilotMode,
  copilotQuestion,
  setCopilotQuestion,
  copilotLoading,
  copilotError,
  setCopilotError,
  copilotMessages,
  selectedEntity,
  relatedConnectionCount,
  pubMedPaperCount,
  askCopilot,
}: CopilotPanelProps) {
  return (
    <>
        <button
          type="button"
          onClick={() =>
            setCopilotOpen(true)
          }
          className={`fixed bottom-5 right-5 z-[80] items-center gap-2 rounded-full ${demoMode ? "hidden" : "hidden lg:flex"} border border-teal-200/[0.16] bg-[linear-gradient(135deg,rgba(141,178,255,.94),rgba(161,92,255,.9))] px-4 py-3 text-[11px] font-extrabold text-[#04070a] shadow-[0_16px_48px_rgba(77,141,255,.2)] transition duration-300 hover:-translate-y-1`}
        >
          <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_10px_white]" />
          Copilot
        </button>

        <AnimatePresence>
          {copilotOpen && (
            <>
              <motion.button
                type="button"
                aria-label="Close BioLayers Copilot"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                onClick={() =>
                  setCopilotOpen(false)
                }
                className="fixed inset-0 z-[90] bg-[#030507]/55 backdrop-blur-[5px]"
              />

              <motion.aside
                initial={{
                  opacity: 0,
                  x: 60,
                  scale: 0.98,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  x: 60,
                  scale: 0.98,
                }}
                transition={{
                  duration: 0.35,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="fixed bottom-0 right-0 top-0 z-[100] flex w-full flex-col border-l border-teal-100/[0.08] bg-[#070b10]/97 shadow-[-30px_0_100px_rgba(1,8,15,.48)] backdrop-blur-3xl sm:w-[540px]"
              >
                <div className="flex items-start justify-between border-b border-teal-100/[0.065] px-5 py-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-teal-300">
                      BioLayers Copilot
                    </p>

                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                      {selectedEntity.label}
                    </h2>

                    <p className="mt-1 text-xs capitalize text-slate-400">
                      {selectedEntity.type} ·{" "}
                      {relatedConnectionCount} direct links ·{" "}
                      {pubMedPaperCount} papers
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setCopilotOpen(false)
                    }
                    className="rounded-[12px] border border-white/10 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
                  >
                    Close
                  </button>
                </div>

                <div className="border-b border-teal-100/[0.065] px-5 py-4">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {(
                      [
                        [
                          "explain",
                          "Explain",
                        ],
                        [
                          "mechanism",
                          "Mechanism",
                        ],
                        [
                          "hypothesis",
                          "Hypothesis",
                        ],
                        [
                          "limitations",
                          "Limits",
                        ],
                        [
                          "simplify",
                          "Simplify",
                        ],
                      ] as Array<
                        [
                          CopilotMode,
                          string,
                        ]
                      >
                    ).map(
                      ([mode, label]) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => {
                            setCopilotMode(
                              mode,
                            );
                            void askCopilot(
                              mode,
                            );
                          }}
                          disabled={
                            copilotLoading
                          }
                          className={`rounded-[13px] border px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] transition ${
                            copilotMode ===
                            mode
                              ? "border-teal-200/25 bg-teal-200/[0.09] text-violet-200"
                              : "border-teal-100/[0.065] bg-white/[0.018] text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          {label}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-5">
                  {copilotMessages.length ===
                    0 &&
                    !copilotLoading && (
                      <div className="rounded-[24px] border border-teal-100/[0.065] bg-[linear-gradient(145deg,rgba(161,92,255,.07),rgba(34,211,238,.035))] p-5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                          Grounded context
                        </p>

                        <p className="mt-3 text-sm leading-7 text-slate-400">
                          Copilot will use the selected entity, the research paragraph, direct graph relationships and the loaded PubMed metadata.
                        </p>

                        <div className="mt-5 grid grid-cols-3 gap-2">
                          <CopilotContextMetric
                            label="Links"
                            value={String(
                              relatedConnectionCount,
                            )}
                          />
                          <CopilotContextMetric
                            label="Papers"
                            value={String(
                              pubMedPaperCount,
                            )}
                          />
                          <CopilotContextMetric
                            label="Mode"
                            value="AI"
                          />
                        </div>
                      </div>
                    )}

                  <div className="space-y-4">
                    {copilotMessages.map(
                      (message) =>
                        message.role ===
                        "user" ? (
                          <div
                            key={message.id}
                            className="ml-auto max-w-[86%] rounded-[20px] rounded-br-[6px] bg-gradient-to-r from-[#57ffa0] to-[#4d8dff] px-4 py-3 text-sm leading-6 text-slate-950 shadow-[0_12px_30px_rgba(161,92,255,.16)]"
                          >
                            {
                              message.content
                            }
                          </div>
                        ) : (
                          <div
                            key={message.id}
                            className="rounded-[22px] border border-teal-100/[0.065] bg-[#0a0f14]/52 p-5"
                          >
                            {message.title && (
                              <h3 className="text-lg font-semibold tracking-[-0.025em] text-white">
                                {
                                  message.title
                                }
                              </h3>
                            )}

                            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                              {
                                message.content
                              }
                            </p>

                            {message.keyPoints &&
                              message
                                .keyPoints
                                .length >
                                0 && (
                                <div className="mt-5">
                                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                                    Key points
                                  </p>

                                  <div className="mt-3 space-y-2">
                                    {message.keyPoints.map(
                                      (
                                        point,
                                        index,
                                      ) => (
                                        <div
                                          key={`${message.id}-point-${index}`}
                                          className="flex gap-3 rounded-[14px] border border-teal-100/[0.045] bg-black/[0.10] p-3"
                                        >
                                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300 shadow-[0_0_8px_#a15cff]" />
                                          <p className="text-[11px] leading-5 text-slate-400">
                                            {
                                              point
                                            }
                                          </p>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}

                            {message.limitations &&
                              message
                                .limitations
                                .length >
                                0 && (
                                <div className="mt-5 rounded-[16px] border border-amber-300/12 bg-amber-300/[0.035] p-4">
                                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">
                                    Limitations
                                  </p>

                                  <div className="mt-3 space-y-2">
                                    {message.limitations.map(
                                      (
                                        limitation,
                                        index,
                                      ) => (
                                        <p
                                          key={`${message.id}-limitation-${index}`}
                                          className="text-[11px] leading-5 text-amber-100/65"
                                        >
                                          •{" "}
                                          {
                                            limitation
                                          }
                                        </p>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}

                            {message.citations &&
                              message
                                .citations
                                .length >
                                0 && (
                                <div className="mt-5">
                                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">
                                    Supplied PubMed references
                                  </p>

                                  <div className="mt-3 space-y-2">
                                    {message.citations.map(
                                      (
                                        citation,
                                      ) => (
                                        <a
                                          key={`${message.id}-${citation.pmid}`}
                                          href={`https://pubmed.ncbi.nlm.nih.gov/${citation.pmid}/`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="block rounded-[14px] border border-teal-100/[0.045] bg-black/[0.10] p-3 transition hover:border-teal-200/20 hover:bg-teal-200/[0.035]"
                                        >
                                          <p className="font-mono text-[9px] text-teal-300/70">
                                            PMID{" "}
                                            {
                                              citation.pmid
                                            }
                                          </p>

                                          <p className="mt-1 text-xs font-semibold leading-5 text-slate-300">
                                            {
                                              citation.title
                                            }
                                          </p>

                                          <p className="mt-2 text-[11px] leading-5 text-slate-400">
                                            {
                                              citation.support
                                            }
                                          </p>
                                        </a>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}

                            {message.followUpQuestions &&
                              message
                                .followUpQuestions
                                .length >
                                0 && (
                                <div className="mt-5 flex flex-wrap gap-2">
                                  {message.followUpQuestions.map(
                                    (
                                      question,
                                      index,
                                    ) => (
                                      <button
                                        key={`${message.id}-follow-${index}`}
                                        type="button"
                                        onClick={() => {
                                          setCopilotMode(
                                            "custom",
                                          );
                                          setCopilotQuestion(
                                            question,
                                          );
                                          void askCopilot(
                                            "custom",
                                            question,
                                          );
                                        }}
                                        disabled={
                                          copilotLoading
                                        }
                                        className="rounded-full border border-cyan-300/12 bg-cyan-300/[0.035] px-3 py-2 text-[10px] font-semibold text-cyan-200/75 transition hover:bg-cyan-300/[0.08] disabled:opacity-40"
                                      >
                                        {
                                          question
                                        }
                                      </button>
                                    ),
                                  )}
                                </div>
                              )}
                          </div>
                        ),
                    )}
                  </div>

                  {copilotLoading && (
                    <div className="mt-4 rounded-[22px] border border-teal-200/12 bg-teal-200/[0.035] p-5">
                      <div className="flex items-center gap-3">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-teal-200 shadow-[0_0_12px_#c4b5fd]" />
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-200">
                          Copilot is reasoning
                        </p>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="h-2.5 w-full animate-pulse rounded-full bg-white/[0.06]" />
                        <div className="h-2.5 w-5/6 animate-pulse rounded-full bg-white/[0.05]" />
                        <div className="h-2.5 w-3/5 animate-pulse rounded-full bg-white/[0.05]" />
                      </div>
                    </div>
                  )}

                  {copilotError && (
                    <div className="mt-4 rounded-[18px] border border-rose-300/15 bg-rose-300/[0.04] p-4">
                      <p className="text-[11px] leading-5 text-rose-200">
                        {
                          copilotError
                        }
                      </p>
                    </div>
                  )}
                </div>

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void askCopilot(
                      "custom",
                    );
                  }}
                  className="border-t border-teal-100/[0.065] p-4"
                >
                  <div className="rounded-[20px] border border-white/[0.1] bg-black/[0.12] p-2">
                    <textarea
                      value={copilotQuestion}
                      onChange={(event) => {
                        setCopilotQuestion(
                          event.target
                            .value,
                        );
                        setCopilotMode(
                          "custom",
                        );
                        setCopilotError(
                          "",
                        );
                      }}
                      placeholder={`Ask about ${selectedEntity.label}...`}
                      rows={3}
                      className="w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 text-white outline-none placeholder:text-slate-400"
                    />

                    <div className="flex items-center justify-between gap-3 px-2 pb-1">
                      <p className="text-[9px] text-slate-400">
                        Grounded in graph + PubMed
                      </p>

                      <button
                        type="submit"
                        disabled={
                          copilotLoading
                        }
                        className="rounded-[13px] bg-gradient-to-r from-teal-200 via-cyan-200 to-sky-300 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {copilotLoading
                          ? "Thinking..."
                          : "Ask"}
                      </button>
                    </div>
                  </div>
                </form>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
    </>
  );
}

function CopilotContextMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[14px] border border-teal-100/[0.055] bg-black/[0.10] px-3 py-3 text-center">
      <p className="text-base font-semibold text-white">
        {value}
      </p>
      <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
    </div>
  );
}