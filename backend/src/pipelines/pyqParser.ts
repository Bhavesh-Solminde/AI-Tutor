import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { env } from "../config/env";
import { createLogger } from "../config/logger";

const log = createLogger("pipeline:pyqParser");

const pyqSchema = z.object({
  topicFrequencies: z.record(z.string(), z.number()),
});

/**
 * PYQ (Previous Year Questions) frequency analyzer.
 * Maps to n8n: Progress Tracking Agent's PYQ analysis sub-flow.
 * Uses GPT-4o to classify each question by topic and count frequencies.
 *
 * Returns {} on any failure — caller handles graceful degradation.
 */
export async function analyzePYQ(
  pyqText: string,
  topicNames: string[]
): Promise<Record<string, number>> {
  // Guard: if no topics exist yet, there's nothing to classify against.
  // Return empty frequencies rather than sending a broken prompt to the LLM.
  if (!topicNames || topicNames.length === 0) {
    log.warn("analyzePYQ called with no topic names — skipping LLM call");
    return {};
  }

  try {
    const model = new ChatOpenAI({
      model: "gpt-4o",
      temperature: 0.1,
      apiKey: env.OPENAI_API_KEY,
      timeout: 30_000, // 30s — prevent indefinite hang on slow API responses
    });

    const structuredModel = model.withStructuredOutput(pyqSchema);

    const topicList = topicNames.join(", ");

    // Truncate to avoid context limit issues on very long PYQ files
    const truncatedText = pyqText.slice(0, 12000);

    log.info("analyzePYQ started", { topicCount: topicNames.length, textLength: truncatedText.length });

    const result = await structuredModel.invoke([
      {
        role: "system",
        content: `You are analyzing Previous Year Exam Questions (PYQ) to count 
how many questions relate to each topic. 

Known topics: ${topicList}

For each question in the text, identify which topic it belongs to and count frequencies.
Return a topicFrequencies object where keys are topic names and values are question counts.
Only include topics that appear in the questions.`,
      },
      {
        role: "user",
        content: `Analyze these previous year questions and count topic frequencies:\n\n${truncatedText}`,
      },
    ]);

    log.info("analyzePYQ complete", { topicsFound: Object.keys(result.topicFrequencies ?? {}).length });
    return result.topicFrequencies ?? {};
  } catch (err: any) {
    // Log and return {} — the caller will still mark pyqUploaded: true
    // but with empty frequencies, so roadmap generation is unaffected.
    log.error("analyzePYQ failed — returning empty frequencies", { error: err?.message ?? String(err) });
    return {};
  }
}
