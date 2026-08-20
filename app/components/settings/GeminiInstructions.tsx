import { ExternalLink, ShieldAlert } from "lucide-react";

const GEMINI_KEY_URL = "https://aistudio.google.com/app/apikey";

const steps = [
  {
    title: "Go to Google AI Studio",
    body: "Open the official Google AI Studio API key page.",
  },
  {
    title: "Sign in with Google",
    body: "Use the Google account that should own the API key.",
  },
  {
    title: "Create an API key",
    body: "Open the API key section and click “Create API key”.",
  },
  {
    title: "Copy the key",
    body: "Copy the full key string — it starts with “AIza” or “AQ.”.",
  },
  {
    title: "Return to BioLayers",
    body: "Open Settings → AI Settings on this site.",
  },
  {
    title: "Paste and save",
    body: "Paste the key into the field and click “Save API Key”. Your key is validated and connected.",
  },
];

/*
  Step-by-step instructions for non-technical users explaining how to
  obtain their own Gemini API key from Google.
*/
export function GeminiInstructions() {
  return (
    <section className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#070b10]/80 backdrop-blur-xl">
      <div className="border-b border-white/[0.06] px-6 py-5">
        <div className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-white/30">
          Getting your key
        </div>
        <h2 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-white">
          How to get a Gemini API key
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-white/45">
          Follow these steps to get your own free Gemini API key from
          Google. It takes about two minutes.
        </p>
      </div>

      <div className="space-y-4 px-6 py-6">
        <ol className="space-y-4">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-teal-200/12 bg-teal-300/[0.05] font-mono text-[11px] font-bold text-teal-300/70">
                {index + 1}
              </span>
              <div>
                <div className="text-sm font-semibold text-white/85">
                  {step.title}
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-white/45">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <a
          href={GEMINI_KEY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex h-11 w-full items-center justify-center gap-2 rounded-[13px] border border-teal-200/25 bg-teal-300/[0.09] text-sm font-bold text-teal-50 transition hover:border-teal-200/45 hover:bg-teal-300/[0.14]"
        >
          <ExternalLink className="h-4 w-4" />
          Get Gemini API Key
        </a>

        <div className="rounded-[16px] border border-amber-300/12 bg-amber-400/[0.04] px-4 py-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-200/90">
            <ShieldAlert className="h-4 w-4" />
            Keep your key private
          </div>
          <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-white/50">
            <li>
              • Never share your Gemini API key with other people.
            </li>
            <li>• Never commit it to GitHub or any public repository.</li>
            <li>
              • The key belongs to your Google account and unlocks access
              to your Gemini quota.
            </li>
            <li>
              • Gemini API usage may be subject to Google&apos;s current
              quotas, limits and billing rules. Review Google&apos;s current
              Gemini API pricing and usage policies before heavy use.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}