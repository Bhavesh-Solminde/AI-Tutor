import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { AgentStateType } from "../state";
import { QUIZ_SYSTEM_PROMPT } from "../prompts/quizPrompt";
import { env } from "../../config/env";

// Zod schema matching n8n Structured Output Parser JSON schema
const quizSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()).length(4),
        correct: z.number().int().min(0).max(3),
        explanation: z.string(),
      })
    )
    .length(10),
  timeLimit: z.number().default(600),
});

/**
 * Quiz Generator node.
 * Maps to n8n: "Quiz Generator Agent" + "Structured Output Parser"
 * Uses GPT-4o at temp 0.5 (matches n8n "OpenAI Model (Quiz)").
 * Uses withStructuredOutput() to enforce exactly 10 MCQs.
 */
export async function quizGeneratorNode(
  state: AgentStateType
): Promise<Partial<AgentStateType>> {
  const model = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0.5, // matches n8n quiz agent temperature
    apiKey: env.OPENAI_API_KEY,
  });

  const structuredModel = model.withStructuredOutput(quizSchema);

  // Matches n8n prompt template: "Topic: {{ $json.body.topicName }}\nConcepts Covered: ..."
  const userMessage = `Topic: ${state.topicName}
Concepts Covered: ${state.explanation || "Concepts from this topic"}
User Mastery Level: ${state.masteryScore}
Previous Quiz Score: null

Generate the quiz now.`;

  const result = await structuredModel.invoke([
    { role: "system", content: QUIZ_SYSTEM_PROMPT },
    { role: "user", content: userMessage },
  ]);

  return {
    questions: result.questions,
    timeLimit: result.timeLimit ?? 600,
  };
}
