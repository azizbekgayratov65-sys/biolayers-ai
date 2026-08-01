"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const exampleText =
  "Cancer-associated fibroblasts promote prostate cancer bone metastasis through CXCL12 signaling and remodeling of the tumor microenvironment.";

export default function PromptBox() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  function useExample() {
    setText(exampleText);
    setError("");
  }

  function generateMap() {
    const cleanedText = text.trim();

    if (cleanedText.length < 20) {
      setError("Please paste a longer research paragraph.");
      return;
    }

    sessionStorage.setItem("biolayers-input", cleanedText);
    router.push("/explore");
  }

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
      <textarea
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setError("");
        }}
        placeholder="Paste a paragraph from a cancer research paper..."
        className="min-h-44 w-full resize-none rounded-2xl bg-slate-50 p-5 text-base leading-7 text-slate-800 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/30"
      />

      <div className="flex flex-col gap-3 px-2 pb-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={useExample}
          className="text-sm text-slate-500 transition hover:text-slate-950"
        >
          Use an example
        </button>

        <button
          type="button"
          onClick={generateMap}
          className="rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-teal-700"
        >
          Generate map →
        </button>
      </div>

      {error && (
        <p className="px-2 pb-2 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}