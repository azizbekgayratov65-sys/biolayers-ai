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
    router.push("/mindmap");
  }

  return (
    <div className="rounded-[20px] border border-[#efe6d8]/25 bg-[#efe6d8] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
      <textarea
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setError("");
        }}
        placeholder="Paste a paragraph from a cancer research paper..."
        className="min-h-44 w-full resize-none rounded-2xl bg-[#f6f0e4] p-5 text-base leading-7 text-[#23272c] outline-none placeholder:text-[#8a8578] focus:ring-2 focus:ring-[#4d8dff]/50"
      />

      <div className="flex flex-col gap-3 px-2 pb-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={useExample}
          className="text-sm text-[#6b665c] transition hover:text-[#23272c]"
        >
          Use an example
        </button>

        <button
          type="button"
          onClick={generateMap}
          className="rounded-2xl bg-[#0b3d2a] px-6 py-3 text-sm font-semibold text-[#e7fff0] transition hover:-translate-y-0.5 hover:bg-[#005a34]"
        >
          Generate map →
        </button>
      </div>

      {error && (
        <p className="px-2 pb-2 text-sm font-medium text-[#8f1a2b]">
          {error}
        </p>
      )}
    </div>
  );
}