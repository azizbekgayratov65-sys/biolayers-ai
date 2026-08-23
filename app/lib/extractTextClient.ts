/* =========================================================
   BROWSER-SIDE TEXT EXTRACTION

   Large PDFs cannot be uploaded through a serverless function
   (Vercel caps request bodies at ~4.5 MB), so the text is
   extracted locally with pdf.js and only the extracted text
   is sent to /api/mindmap as JSON.
   ========================================================= */

export const CLIENT_DOCX_MAX_BYTES =
  4 * 1024 * 1024;

export type ExtractedDocumentText = {
  text: string;
  pages: number;
};

function getFileExtension(
  fileName: string,
): string {
  return (
    fileName
      .toLowerCase()
      .split(".")
      .pop() ?? ""
  );
}

/**
 * True when the browser can extract the text itself,
 * meaning we can bypass the serverless upload size limit.
 */
export function isClientExtractable(
  fileName: string,
): boolean {
  return [
    "pdf",
    "txt",
    "md",
    "markdown",
    "text",
  ].includes(getFileExtension(fileName));
}

async function extractPdfText(
  file: File,
): Promise<ExtractedDocumentText> {
  try {
    const pdfjs = await import(
      "pdfjs-dist"
    );

    pdfjs.GlobalWorkerOptions.workerSrc =
      new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();

    const data = new Uint8Array(
      await file.arrayBuffer(),
    );

    const doc =
      await pdfjs.getDocument({
        data,
      }).promise;

    try {
      const pageTexts: string[] = [];

      for (
        let pageNumber = 1;
        pageNumber <= doc.numPages;
        pageNumber++
      ) {
        const page =
          await doc.getPage(pageNumber);

        const content =
          await page.getTextContent();

        let pageText = "";

        for (const item of content.items) {
          if ("str" in item) {
            pageText += item.str;

            if (item.hasEOL) {
              pageText += "\n";
            }
          }
        }

        pageTexts.push(pageText);
      }

      return {
        text: pageTexts.join("\n\n"),
        pages: pageTexts.length,
      };
    } finally {
      await doc.destroy();
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    if (/password/i.test(message)) {
      throw new Error(
        "This PDF is password-protected. Remove the password and try again.",
      );
    }

    throw new Error(
      `Could not read this PDF in your browser: ${message}`,
    );
  }
}

/**
 * Extracts plain text from PDF, TXT or Markdown files
 * entirely in the browser.
 */
export async function extractTextInBrowser(
  file: File,
): Promise<ExtractedDocumentText> {
  const extension = getFileExtension(
    file.name,
  );

  if (extension === "pdf") {
    console.info(
      "[mindmap] Extracting PDF text locally with pdf.js…",
    );

    return extractPdfText(file);
  }

  if (
    extension === "txt" ||
    extension === "md" ||
    extension === "markdown" ||
    extension === "text"
  ) {
    console.info(
      "[mindmap] Reading text file locally…",
    );

    return {
      text: await file.text(),
      pages: 0,
    };
  }

  throw new Error(
    "Unsupported file type for local extraction.",
  );
}
