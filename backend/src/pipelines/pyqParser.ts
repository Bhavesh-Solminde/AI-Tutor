import { ChatOpenAI } from "@langchain/openai";
import { env } from "../config/env";
import { createLogger } from "../config/logger";

const log = createLogger("pipeline:pyqParser");

/**
 * PYQ (Previous Year Questions) frequency analyzer.
 * Uses GPT-4o json_object mode (not withStructuredOutput) because the output
 * is a dynamic Record<string, number> — OpenAI's strict schema mode cannot
 * express `additionalProperties` in the `required` array, causing a 400 error.
 *
 * Edge cases handled:
 *  1. Wrapped response  — GPT sometimes nests result: { "topicFrequencies": {...} }
 *  2. Float counts      — rounded to nearest integer
 *  3. String "0"        — filtered out (0-frequency topics are useless)
 *  4. Topic name drift  — fuzzy match maps GPT-returned names → exact topic names
 *  5. JSON.parse fail   — caught, returns {} (caller degrades gracefully)
 *
 * Returns {} on any failure — caller still marks pyqUploaded: true so roadmap
 * generation continues without PYQ weighting.
 */
export async function analyzePYQ(
  pyqText: string,
  topicNames: string[]
): Promise<Record<string, number>> {
  if (!topicNames || topicNames.length === 0) {
    log.warn("analyzePYQ called with no topic names — skipping LLM call");
    return {};
  }

  try {
    const model = new ChatOpenAI({
      model: "gpt-4o",
      temperature: 0.1,
      apiKey: env.OPENAI_API_KEY,
      timeout: 30_000,
      modelKwargs: { response_format: { type: "json_object" } },
    });

    const topicList = topicNames.join(", ");
    const truncatedText = pyqText.slice(0, 12000);

    log.info("analyzePYQ started", { topicCount: topicNames.length, textLength: truncatedText.length });

    const response = await model.invoke([
      {
        role: "system",
        content: `You are analyzing Previous Year Exam Questions (PYQ) to count how many questions relate to each topic.

Known topics: ${topicList}

For each question in the text, identify which topic it belongs to (from the known topics list) and count frequencies.

Return a flat JSON object:
- keys = exact topic names from the known topics list above
- values = integer counts (how many questions relate to that topic)
- omit topics with 0 questions
- do NOT wrap in any outer key like "topicFrequencies" or "result"

Example: {"Linear Regression": 3, "Neural Networks": 5}`,
      },
      {
        role: "user",
        content: `Analyze these previous year questions and count topic frequencies:\n\n${truncatedText}`,
      },
    ]);

    const raw =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    let parsed = JSON.parse(raw);

    // ── Edge case 1: Wrapped response ─────────────────────────────────────────
    // GPT sometimes returns { "topicFrequencies": { "Neural Networks": 5 } }
    // Detect: single key whose value is a plain object → unwrap it.
    const keys = Object.keys(parsed);
    if (
      keys.length === 1 &&
      parsed[keys[0]] !== null &&
      typeof parsed[keys[0]] === "object" &&
      !Array.isArray(parsed[keys[0]])
    ) {
      log.warn("analyzePYQ: unwrapping nested response", { wrapperKey: keys[0] });
      parsed = parsed[keys[0]];
    }

    // ── Build fuzzy lookup: normalised topic name → exact topic name ──────────
    // Edge case 4: GPT may return "Neural Network" instead of "Neural Networks"
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const exactByNorm = new Map<string, string>(
      topicNames.map((t) => [normalize(t), t])
    );

    // ── Extract & validate frequencies ───────────────────────────────────────
    const frequencies: Record<string, number> = {};

    for (const [rawKey, rawValue] of Object.entries(parsed)) {
      // Edge cases 2 + 3: parse value, round floats, reject 0 / negative
      let count: number;
      if (typeof rawValue === "number") {
        count = Math.round(rawValue);
      } else if (typeof rawValue === "string" && rawValue.trim() !== "") {
        count = Math.round(Number(rawValue));
      } else {
        continue; // non-numeric — skip
      }
      if (!isFinite(count) || count <= 0) continue;

      // Edge case 4: map GPT key → exact topic name via normalised lookup
      const normKey = normalize(rawKey);
      const exactKey = exactByNorm.get(normKey) ?? rawKey; // fallback to raw if no match

      frequencies[exactKey] = (frequencies[exactKey] ?? 0) + count;
    }

    log.info("analyzePYQ complete", {
      topicsFound: Object.keys(frequencies).length,
      topicsMatched: Object.keys(frequencies).filter((k) => topicNames.includes(k)).length,
    });
    return frequencies;
  } catch (err: any) {
    log.error("analyzePYQ failed — returning empty frequencies", {
      error: err?.message ?? String(err),
    });
    return {};
  }
}
