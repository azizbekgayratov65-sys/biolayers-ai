import { NextResponse } from "next/server";

import {
  GEMINI_MODEL_RANK,
  buildAiChain,
  getGeminiKeys,
  getPreferredModel,
  resolveEffectiveTarget,
} from "../../../lib/aiModels";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (getGeminiKeys().length === 0) {
    return NextResponse.json(
      {
        error:
          "GEMINI_API_KEY is missing from the server environment.",
      },
      {
        status: 503,
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  }

  try {
    const target =
      await resolveEffectiveTarget();

    const preferred =
      getPreferredModel();

    return NextResponse.json(
      {
        provider:
          target?.provider ??
          "gemini",
        model:
          target?.model ??
          preferred,
        preferred,
        fallback:
          GEMINI_MODEL_RANK[1] ??
          GEMINI_MODEL_RANK[0],
        chain: buildAiChain().map(
          (item) => ({
            provider: item.provider,
            model: item.model,
            keyIndex: item.keyIndex,
          }),
        ),
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error(
      "[mindmap] Model resolution failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Could not resolve the available AI model.",
        preferred:
          getPreferredModel(),
      },
      {
        status: 502,
        headers: {
          "Cache-Control":
            "no-store, max-age=0",
        },
      },
    );
  }
}