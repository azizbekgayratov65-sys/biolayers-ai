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
    <section className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl">
      <div className="border-b border-slate-800/70 px-6 py-5">
        <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-400/80">
          BYOK Documentation
        </div>
        <h2 className="mt-1 text-xl font-serif font-bold tracking-tight text-white">
          How to Obtain a Gemini API Key
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
          Follow these quick steps to generate your free personal Gemini API key from Google AI Studio. The entire setup takes less than two minutes.
        </p>
      </div>

      <div className="space-y-5 px-6 py-6">
        <ol className="space-y-4">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10 font-mono text-xs font-bold text-emerald-300">
                {index + 1}
              </span>
              <div>
                <div className="text-sm font-semibold text-slate-200">
                  {step.title}
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
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
          className="group flex h-11 min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <ExternalLink className="h-4 w-4" />
          Open Google AI Studio
        </a>

        <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
            <ShieldAlert className="h-4 w-4" />
            Key Privacy & Hygiene
          </div>
          <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-400">
            <li>• Never share your Gemini API key publicly or commit it to GitHub.</li>
            <li>• The key belongs exclusively to your Google account and accesses your own quota.</li>
            <li>• Free tier keys in Google AI Studio offer generous rate limits for academic research.</li>
            <li>• BioLayers encrypts and saves your key using AES-256-GCM, utilizing it strictly for your own requests.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}