/* =========================================================
   QUOTE LOCATOR
   ========================================================= */

const CONTEXT_BEFORE = 360;
const CONTEXT_AFTER = 360;

export type QuoteMatch = {
  found: boolean;

  /*
    Exact span of the matched quote in the original text.
  */
  start: number;
  end: number;

  /*
    Surrounding context window (indices into the original text).
  */
  contextStart: number;
  contextEnd: number;

  contextBefore: string;
  contextAfter: string;
};

function normalizeText(
  text: string,
): {
  normalized: string;
  mapping: number[];
} {
  const normalized: string[] = [];
  const mapping: number[] = [];

  for (
    let index = 0;
    index < text.length;
    index += 1
  ) {
    const char = text[index];

    if (
      char === " " ||
      char === "\t" ||
      char === "\n" ||
      char === "\r"
    ) {
      if (
        normalized.length > 0 &&
        normalized[normalized.length - 1] !==
          " "
      ) {
        normalized.push(" ");
        mapping.push(index);
      }

      continue;
    }

    normalized.push(
      char.toLowerCase(),
    );
    mapping.push(index);
  }

  return {
    normalized: normalized.join(""),
    mapping,
  };
}

function mapIndex(
  normalizedIndex: number,
  mapping: number[],
  fallback: number,
): number {
  if (
    normalizedIndex >= 0 &&
    normalizedIndex < mapping.length
  ) {
    return mapping[normalizedIndex];
  }

  return fallback;
}

function findAnchorMatch(
  normalizedFull: string,
  normalizedQuote: string,
): {
  start: number;
  end: number;
} | null {
  const quoteTokens =
    normalizedQuote.split(" ");

  const anchors: string[] = [];

  const firstAnchor = quoteTokens
    .slice(0, Math.min(5, quoteTokens.length))
    .join(" ");

  anchors.push(firstAnchor);

  const sentences =
    normalizedQuote.split(/\.\s+/);

  sentences.forEach((sentence) => {
    const tokens =
      sentence.split(" ");

    if (tokens.length < 5) {
      return;
    }

    const sentenceAnchor =
      tokens
        .slice(0, 5)
        .join(" ");

    if (
      !anchors.includes(
        sentenceAnchor,
      )
    ) {
      anchors.push(sentenceAnchor);
    }
  });

  let best:
    | {
        start: number;
        end: number;
        score: number;
      }
    | undefined;

  for (const anchor of anchors) {
    let searchFrom = 0;

    while (true) {
      const index =
        normalizedFull.indexOf(
          anchor,
          searchFrom,
        );

      if (index === -1) {
        break;
      }

      let cursor = index;
      let matched = 0;

      for (const token of quoteTokens) {
        const endIndex =
          cursor + token.length;

        if (
          normalizedFull.slice(
            cursor,
            endIndex,
          ) === token
        ) {
          matched += 1;
          cursor = endIndex + 1;
        } else {
          break;
        }
      }

      if (
        !best ||
        matched > best.score
      ) {
        best = {
          start: index,
          end: cursor,
          score: matched,
        };
      }

      searchFrom = index + 1;
    }
  }

  if (!best || best.score < 3) {
    return null;
  }

  return {
    start: best.start,
    end: best.end,
  };
}

export function findQuoteInText(
  quote: string,
  fullText: string,
): QuoteMatch {
  const { normalized, mapping } =
    normalizeText(fullText);

  const normalizedQuote =
    quote
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();

  if (
    !normalizedQuote ||
    normalized.length === 0
  ) {
    return {
      found: false,
      start: 0,
      end: 0,
      contextStart: 0,
      contextEnd: 0,
      contextBefore: "",
      contextAfter: "",
    };
  }

  let startIndex =
    normalized.indexOf(
      normalizedQuote,
    );

  let endIndex =
    startIndex === -1
      ? -1
      : startIndex +
        normalizedQuote.length;

  if (startIndex === -1) {
    const fallback =
      findAnchorMatch(
        normalized,
        normalizedQuote,
      );

    if (fallback) {
      startIndex = fallback.start;
      endIndex = fallback.end;
    }
  }

  if (startIndex === -1) {
    return {
      found: false,
      start: 0,
      end: 0,
      contextStart: 0,
      contextEnd: 0,
      contextBefore: "",
      contextAfter: "",
    };
  }

  const start = mapIndex(
    startIndex,
    mapping,
    0,
  );

  const end = mapIndex(
    endIndex - 1,
    mapping,
    fullText.length,
  );

  const contextStart = Math.max(
    0,
    start - CONTEXT_BEFORE,
  );

  const contextEnd = Math.min(
    fullText.length,
    end + CONTEXT_AFTER,
  );

  return {
    found: true,
    start,
    end,
    contextStart,
    contextEnd,
    contextBefore:
      fullText.slice(
        contextStart,
        start,
      ),
    contextAfter:
      fullText.slice(
        end,
        contextEnd,
      ),
  };
}