import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { AgentStateType } from "../state";
import { PROGRESS_SYSTEM_PROMPT } from "../prompts/progressPrompt";
import { calculateMastery } from "../../utils/masteryCalculator";
import { env } from "../../config/env";

// Structured output schema — matches n8n "Structured Output Parser (Progress)"
const progressSchema = z.object({
  masteryScore: z.number(),
  masteryDelta: z.object({
    before: z.number(),
    after: z.number(),
  }),
  nodeColorUpdate: z.enum(["unstarted", "learning", "mastered"]),
  xpEarned: z.number(),
  passed: z.boolean(),
  nextTopicRecommendation: z.object({
    topicId: z.string(),
    topicName: z.string(),
    reason: z.string(),
  }),
  studyPlanUpdate: z.record(z.string(), z.array(z.string())),
});

export interface ProgressInput {
  quizResults: { score: number; total: number; wrongQuestions: string[] };
  selfRatingAfter: number;
  sessionDurationMinutes: number;
  estimatedMinutes?: number;
  previousMasteryScore: number;
  examDate?: string;
  allTopicMasteries: Array<{ topicId: string; topicName: string; masteryScore: number }>;
}

/**
 * Progress Tracker node.
 * Maps to n8n: "Mastery Calculator" (Code) + "Progress & Planning Agent" + "Structured Output Parser (Progress)"
 *
 * SPLIT: Pure TypeScript handles mastery math. LLM (temp 0.2) ONLY handles:
 *   1. nextTopicRecommendation
 *   2. studyPlanUpdate (if examDate set)
 */
export async function progressTrackerNode(
  state: AgentStateType & { progressInput: ProgressInput }
): Promise<Partial<AgentStateType>> {
  const input = state.progressInput;

  // ── Step 1: Pure TypeScript mastery calculation (NO LLM) ──────────────────
  // Maps to n8n "Mastery Calculator" Code node
  const { calculatedMastery, previousMastery, passed, nodeColor, xpEarned } =
    calculateMastery({
      quizResults: input.quizResults,
      selfRatingAfter: input.selfRatingAfter,
      sessionDurationMinutes: input.sessionDurationMinutes,
      estimatedMinutes: input.estimatedMinutes,
      previousMasteryScore: input.previousMasteryScore,
    });

  // ── Step 2: LLM for recommendation + study plan ONLY (temp 0.2) ───────────
  // Maps to n8n "Progress & Planning Agent"
  const model = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0.2, // matches n8n progress agent temperature
    apiKey: env.OPENAI_API_KEY,
  });

  const structuredModel = model.withStructuredOutput(progressSchema);

  // Matches n8n prompt template with pre-calculated values
  const userMessage = `Pre-calculated values (include these EXACTLY in your output):
masteryScore: ${calculatedMastery}
previousMastery: ${previousMastery}
nodeColorUpdate: ${nodeColor}
xpEarned: ${xpEarned}
passed: ${passed}

Context for recommendations:
Topic: ${state.topicName}
Wrong Questions: ${JSON.stringify(input.quizResults.wrongQuestions)}
Exam Date: ${input.examDate ?? "Not set"}
All Topic Masteries: ${JSON.stringify(input.allTopicMasteries)}

Generate the full structured response now.`;

  const result = await structuredModel.invoke([
    { role: "system", content: PROGRESS_SYSTEM_PROMPT },
    { role: "user", content: userMessage },
  ]);

  return {
    masteryDelta: { before: previousMastery, after: calculatedMastery },
    nodeColorUpdate: nodeColor,
    xpEarned,
    passed,
    nextTopicRecommendation: result.nextTopicRecommendation,
    studyPlanUpdate: result.studyPlanUpdate,
  };
}
