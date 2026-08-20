"use client";

import {
  useCallback,
  useRef,
  useState,
} from "react";
import {
  FileUp,
  Loader2,
  Sparkles,
} from "lucide-react";

const ACCEPTED =
  ".pdf,.txt,.md,.markdown,.text,.docx";

type MindMapUploaderProps = {
  busy: boolean;
  error: string | null;
  onFileSelected: (file: File) => void;
};

export default function MindMapUploader({
  busy,
  error,
  onFileSelected,
}: MindMapUploaderProps) {
  const inputRef =
    useRef<HTMLInputElement | null>(null);

  const [dragging, setDragging] =
    useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];

      if (!file) {
        return;
      }

      onFileSelected(file);
    },
    [onFileSelected],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setDragging(false);
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles],
  );

  return (
    <div
      className={`
        relative
        mx-auto
        w-full
        max-w-2xl
        rounded-[24px]
        border
        bg-[#0a0f14]/70
        p-1
        transition-colors
        duration-200

        ${
          dragging
            ? "border-teal-200/40"
            : "border-teal-100/[0.08]"
        }
      `}
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -top-10
          left-1/2
          h-40
          w-72
          -translate-x-1/2
          rounded-full
          bg-teal-400/[0.06]
          blur-[80px]
        "
      />

      <button
        type="button"
        disabled={busy}
        onClick={() =>
          inputRef.current?.click()
        }
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => {
          setDragging(false);
        }}
        onDrop={handleDrop}
        className={`
          group
          relative
          flex
          w-full
          flex-col
          items-center
          justify-center
          gap-3
          rounded-[18px]
          border
          border-dashed
          px-6
          py-14
          text-center
          transition
          duration-300

          ${
            dragging
              ? "border-teal-300/50 bg-teal-300/[0.06]"
              : "border-white/[0.10] hover:border-teal-200/30 hover:bg-teal-300/[0.03]"
          }

          ${
            busy
              ? "cursor-wait opacity-70"
              : "cursor-pointer"
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="sr-only"
          disabled={busy}
          onChange={(event) => {
            handleFiles(
              event.target.files,
            );
            event.target.value = "";
          }}
        />

        <div
          className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            border
            border-teal-200/20
            bg-teal-300/[0.07]
            transition
            duration-300
            group-hover:scale-105
            group-hover:border-teal-200/35
          "
        >
          {busy ? (
            <Loader2 className="h-6 w-6 animate-spin text-teal-300" />
          ) : (
            <FileUp className="h-6 w-6 text-teal-300" />
          )}
        </div>

        <div>
          <p className="text-base font-bold tracking-[-0.01em] text-white">
            {busy
              ? "Reading and mapping your paper…"
              : "Drop your research paper here"}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            or click to browse — PDF, TXT,
            Markdown or DOCX · up to 25 MB
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {["PDF", "TXT", "MD", "DOCX"].map(
            (format) => (
              <span
                key={format}
                className="
                  rounded-full
                  border
                  border-teal-100/[0.08]
                  bg-white/[0.03]
                  px-2.5
                  py-1
                  font-mono
                  text-[9px]
                  font-bold
                  tracking-[0.12em]
                  text-teal-100/60
                "
              >
                {format}
              </span>
            ),
          )}
        </div>
      </button>

      {error && (
        <div className="mt-3 rounded-xl border border-rose-300/15 bg-rose-300/[0.06] px-4 py-3 text-center text-xs font-medium text-rose-200">
          {error}
        </div>
      )}

      <div className="mt-4 flex items-center justify-center gap-2 pb-2 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
        <Sparkles className="h-3 w-3 text-teal-300/70" />
        AI mind map · no ideas lost
      </div>
    </div>
  );
}