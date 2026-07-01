import { ChatOpenAI } from "@langchain/openai";
import { env } from "../config/env";
import { createLogger } from "../config/logger";

const log = createLogger("pipeline:summarizer");

/**
 * Generate a concise, structured topic summary for a document.
 *
 * Uses gpt-4o-mini (fast + cheap ~$0.0004 per call) to produce a bullet list
 * of the main topics covered. This is stored in Session.topicSummary and injected
 * directly into the AI tutor prompt — so "what topics does my document cover?" is
 * answered from structured DB data rather than unreliable Pinecone semantic search.
 *
 * Returns empty string on any failure so ingestion is never blocked.
 */
export async function generateDocumentSummary(
  rawText: string,
  fileName: string
): Promise<string> {
  if (!rawText?.trim()) return "";

  try {
    // Truncate to 8000 chars — enough to cover intro + table of contents for any document.
    // gpt-4o-mini context window is 128k but we want this to be fast and cheap.
    const truncated = rawText.slice(0, 8000);

    const model = new ChatOpenAI({
      model: "gpt-4o-mini",
      temperature: 0.1,
      apiKey: env.OPENAI_API_KEY,
      timeout: 20_000,
    });

    const response = await model.invoke([
      {
        role: "system",
        content: `You are a document analyzer. Given the text of a document, produce a concise structured summary of the main topics it covers.

Rules:
- Output a bullet list of 4–10 main topics (use "•" as bullet character)
- Each bullet should be a short phrase (5–10 words max), not a full sentence
- Focus on subject matter, not document structure (skip "Introduction", "Conclusion", etc.)
- Be specific and accurate — only list what is actually in the document
- Do NOT add any preamble, heading, or explanation. Output ONLY the bullet list.

Example output:
• FastAPI routing and path parameters
• Request body validation with Pydantic
• Dependency injection system
• OAuth2 authentication and JWT tokens
• Background tasks and async support`,
      },
      {
        role: "user",
        content: `Document name: ${fileName}\n\nDocument text (first 8000 chars):\n${truncated}`,
      },
    ]);

    const summary = typeof response.content === "string"
      ? response.content.trim()
      : "";

    if (!summary) {
      log.warn("generateDocumentSummary returned empty string", { fileName });
      return "";
    }

    log.info("Document summary generated", {
      fileName,
      bulletCount: summary.split("\n").filter((l) => l.trim().startsWith("•")).length,
    });

    return summary;
  } catch (err: any) {
    // Never block ingestion — fail silently
    log.error("generateDocumentSummary failed — continuing without summary", {
      fileName,
      error: err?.message ?? String(err),
    });
    return "";
  }
}
