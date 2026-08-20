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

  const anchors: Array<{
    text: string;
    tokenIndex: number;
  }> = [];

  for (
    let index = 0;
    index < quoteTokens.length;
    index += 1
  ) {
    const windowTokens =
      quoteTokens.slice(
        index,
        index + 5,
      );

    if (windowTokens.length < 5) {
      break;
    }

    const windowAnchor =
      windowTokens.join(" ");

    if (
      !anchors.some(
        (anchor) =>
          anchor.text ===
          windowAnchor,
      )
    ) {
      anchors.push({
        text: windowAnchor,
        tokenIndex: index,
      });
    }
  }

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
          anchor.text,
          searchFrom,
        );

      if (index === -1) {
        break;
      }

      let forwardCursor = index;

      let forwardMatched = 0;

      for (
        let tokenIndex =
          anchor.tokenIndex;
        tokenIndex <
        quoteTokens.length;
        tokenIndex += 1
      ) {
        const token =
          quoteTokens[
            tokenIndex
          ];

        const endIndex =
          forwardCursor +
          token.length;

        if (
          normalizedFull.slice(
            forwardCursor,
            endIndex,
          ) === token
        ) {
          forwardMatched += 1;
          forwardCursor =
            endIndex + 1;
        } else {
          break;
        }
      }

      let backwardCursor =
        index;

      let backwardMatched = 0;

      for (
        let tokenIndex =
          anchor.tokenIndex - 1;
        tokenIndex >= 0;
        tokenIndex -= 1
      ) {
        const token =
          quoteTokens[
            tokenIndex
          ];

        const startIndex =
          backwardCursor -
          token.length -
          1;

        if (
          startIndex < 0 ||
          normalizedFull.slice(
            startIndex,
            backwardCursor - 1,
          ) !== token
        ) {
          break;
        }

        backwardMatched += 1;
        backwardCursor =
          startIndex;
      }

      const matched =
        5 +
        forwardMatched +
        backwardMatched;

      if (
        !best ||
        matched > best.score
      ) {
        best = {
          start:
            backwardCursor,
          end:
            forwardCursor,
          score: matched,
        };
      }

      searchFrom = index + 1;
    }
  }

  if (!best || best.score < 5) {
    return null;
  }

  return {
    start: best.start,
    end: best.end,
  };
}

/*
  Normalizing the full paper text costs O(length) per idea. All
  ideas in a document share the same extractedText, so memoize
  the normalized result per text and keep only a few around.
*/
const NORMALIZE_CACHE_LIMIT = 3;

const normalizeCache = new Map<
  string,
  {
    normalized: string;
    mapping: number[];
  }
>();

function getNormalized(
  text: string,
): {
  normalized: string;
  mapping: number[];
} {
  let entry =
    normalizeCache.get(text);

  if (!entry) {
    entry = normalizeText(text);

    normalizeCache.set(
      text,
      entry,
    );

    if (
      normalizeCache.size >
      NORMALIZE_CACHE_LIMIT
    ) {
      const oldest =
        normalizeCache.keys()
          .next().value;

      if (
        typeof oldest ===
        "string"
      ) {
        normalizeCache.delete(
          oldest,
        );
      }
    }
  }

  return entry;
}

export function findQuoteInText(
  quote: string,
  fullText: string,
): QuoteMatch {
  const { normalized, mapping } =
    getNormalized(fullText);

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