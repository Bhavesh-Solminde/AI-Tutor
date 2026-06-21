import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { env } from "../config/env";
import { createLogger } from "../config/logger";

const log = createLogger("pipeline:topicExtractor");

const topicSchema = z.object({
  topics: z.array(
    z.object({
      name: z.string().describe("Short, specific topic name — 2 to 6 words max"),
      difficulty: z.enum(["easy", "medium", "hard"]),
      estimatedMinutes: z.number().int().min(5).max(120),
      topicType: z.enum(["theory", "numerical", "mixed"]).describe(
        "theory = conceptual/definitional, numerical = requires solving problems/calculations, mixed = both"
      ),
    })
  ),
  edges: z
    .array(
      z.object({
        from: z
          .string()
          .describe("Name of the prerequisite topic — MUST exactly match a name in the topics array"),
        to: z
          .string()
          .describe("Name of the dependent topic — MUST exactly match a name in the topics array"),
      })
    )
    .describe(
      "Prerequisite edges: 'from' must be studied before 'to'. All names must exactly match topic names above."
    ),
});

/**
 * Extracts granular study topics (30+) from raw educational text using o4-mini.
 * Uses the full text (up to 60k chars) for complete coverage.
 *
 * Upgraded from gpt-4o (max 20 topics, 8k chars) to o4-mini (30–60 topics, full text)
 * because node creation is a one-time operation and accuracy is critical.
 */
export async function extractTopicsFromText(rawText: string): Promise<{
  topics: Array<{ name: string; difficulty: "easy" | "medium" | "hard"; estimatedMinutes: number; topicType: "theory" | "numerical" | "mixed" }>;
  edges: Array<{ from: string; to: string }>;
}> {

  // Use up to 60k chars — enough for any syllabus/PDF without hitting context limits
  const fullText = rawText.slice(0, 60_000);
  const charCount = fullText.length;

  log.info("extractTopicsFromText started", { charCount, model: "gpt-4.1" });

  // gpt-4.1: fastest + most capable for structured extraction
  // - Much faster than o4-mini (no reasoning overhead, responds in ~10-15s)
  // - 1M token context window — handles any syllabus
  // - Excellent instruction-following for structured output
  // - Still far smarter than gpt-4o for granular topic detection
  const model = new ChatOpenAI({
    model: "gpt-4.1",
    temperature: 0.2,
    apiKey: env.OPENAI_API_KEY,
  });

  const structuredModel = model.withStructuredOutput(topicSchema);

  const systemPrompt = `You are an expert curriculum designer and educational content analyst.

Your task is to extract a COMPREHENSIVE, GRANULAR list of study topics from the provided educational material to build a learning roadmap.

## CRITICAL RULES:
1. Extract EVERY distinct concept, algorithm, technique, and sub-topic — aim for 30 to 60 nodes.
2. Work at the SUBTOPIC level, NOT the chapter level. For example:
   - ❌ "CPU Scheduling" (too broad — a whole unit)
   - ✅ "Round Robin Scheduling", "FCFS Scheduling", "Priority Scheduling", "SRTF Algorithm" (granular ✓)
3. Each topic node should represent approximately 15–45 minutes of focused study.
4. Expand every section, sub-section, algorithm, data structure, and named concept into its own node.
5. Include both theoretical concepts AND practical problem-solving topics (e.g. "Banker's Algorithm Numericals").
6. For each topic, classify topicType:
   - "theory" = reading, memorization, conceptual understanding
   - "numerical" = solving problems, calculations, algorithm tracing
   - "mixed" = requires both theory understanding and problem-solving
   Numerical topics need ~1.5x more study time than theory topics of the same difficulty.
7. Assign difficulty honestly:
   - easy: definitional, introductory, or conceptual (e.g., "What is an OS?")
   - medium: requires understanding relationships or moderate math (e.g., "TLB and Effective Access Time")
   - hard: requires heavy calculation, proofs, or advanced design (e.g., "Banker's Algorithm", "Page Replacement Numericals")
7. estimatedMinutes should reflect depth: easy = 10–20 min, medium = 20–40 min, hard = 30–60 min.
8. Use concise, exam-ready topic names (2–6 words). These become node labels on the roadmap.
9. Preserve the logical order of topics as they appear in the material.
10. Do NOT merge related topics together — keep them separate nodes.
11. PREREQUISITE EDGES: For each topic, identify which other topics in YOUR list must be understood first.
    - Use the EXACT topic names you defined above (copy-paste — no paraphrasing).
    - Build a realistic DAG, NOT a linear chain. Most topics should have 0–2 prerequisites.
    - Foundational/intro topics ("What is an OS?", "Introduction to...") must have NO prerequisites.
    - When in doubt, omit the edge rather than creating a wrong dependency.`;

  const userPrompt = `Analyze this educational material thoroughly and extract ALL granular study topics for a complete learning roadmap.

Remember: aim for 30–60 nodes, working at the subtopic/concept level (not chapter level).

--- EDUCATIONAL MATERIAL START ---
${fullText}
--- EDUCATIONAL MATERIAL END ---

Now extract every distinct learnable concept as a separate topic node.`;

  const result = await structuredModel.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);

  log.info("extractTopicsFromText complete", {
    topicCount: result.topics.length,
    edgeCount: result.edges.length,
    topicNames: result.topics.map((t) => t.name),
  });

  return { topics: result.topics, edges: result.edges };
}
