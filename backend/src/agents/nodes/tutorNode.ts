import { ChatOpenAI } from "@langchain/openai";
import { AgentStateType } from "../state";
import { TUTOR_SYSTEM_PROMPT } from "../prompts/tutorPrompt";
import { retrieveContext, retrieveContextByNamespace, retrieveFromMultipleNamespaces, retrieveFromAllUserSessions } from "../../pipelines/retriever";
import { env } from "../../config/env";

/**
 * Tutor node — RAG retrieval + GPT-4o streaming teaching.
 * Maps to n8n: "Tutor AI Agent" → "Format Tutor Response"
 * Passes chat history as real LLM message turns (not a flat string)
 * so GPT-4o has proper conversational context for follow-up questions.
 */
export async function tutorNode(
  state: AgentStateType
): Promise<Partial<AgentStateType>> {
  // 1. Retrieve RAG context — use multi-namespace if material sessions are attached
  let ragContext = "";
  const allNamespaces: string[] = [];

  if (state.sessionId) {
    allNamespaces.push(`${state.userId}_${state.sessionId}`);
  }
  if (state.materialNamespaces && state.materialNamespaces.length > 0) {
    allNamespaces.push(...state.materialNamespaces);
  }

  if (allNamespaces.length > 1) {
    ragContext = await retrieveFromMultipleNamespaces(state.message, allNamespaces);
  } else if (allNamespaces.length === 1) {
    // Use the pre-built namespace directly — avoids incorrect re-derivation
    // from userId + sessionId when sessionId is empty (open-mode with materials)
    ragContext = await retrieveContextByNamespace(state.message, allNamespaces[0]);
  } else if (state.userId) {
    // Open-mode fallback: retrieve from all active user sessions
    ragContext = await retrieveFromAllUserSessions(state.message, state.userId);
  }

  // 2. Build system prompt (chat history summary for context summary only)
  const chatHistorySummary = state.chatHistory.length > 0
    ? `The conversation so far has ${state.chatHistory.length} turns. Refer to the message history above when answering follow-up questions.`
    : "This is the start of the conversation.";

  const systemPrompt = TUTOR_SYSTEM_PROMPT
    .replace("{currentDateTime}", state.currentDateTime)
    .replace("{topicName}", state.topicName)
    .replace("{masteryLevel}", String(state.masteryScore))
    .replace("{explanationLevel}", state.explanationLevel)
    .replace("{ragContext}", ragContext || "No uploaded materials found. Use your knowledge.")
    .replace("{chatHistory}", chatHistorySummary);

  // 3. Build messages array with full conversation history as real turns
  //    This gives GPT-4o proper context for follow-up questions like "what did you just explain?"
  const historyMessages = state.chatHistory.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // 4. Call GPT-4o (temp 0.7 — matches n8n OpenAI Chat Model)
  const model = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0.7,
    apiKey: env.OPENAI_API_KEY,
    modelKwargs: {
      response_format: { type: "json_object" },
    },
  });

  const response = await model.invoke([
    { role: "system", content: systemPrompt },
    ...historyMessages,               // full conversation as real turns
    { role: "user", content: state.message },
  ]);

  // 5. Parse structured JSON output (maps to n8n "Format Tutor Response" Code node)
  //    Robust: handles preamble text, offset fences, and inline JSON extraction
  let parsed: any;
  const rawContent = response.content as string;

  const tryParse = (): any | null => {
    let raw = rawContent;

    // Strategy 1: strip all markdown fences anywhere in the string
    raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim();

    // Strategy 2: extract the first JSON object { ... }
    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const candidate = raw.slice(firstBrace, lastBrace + 1);
      try {
        const obj = JSON.parse(candidate);
        if (obj && typeof obj.explanation === "string") return obj;
      } catch {}
    }

    // Strategy 3: plain parse after fence removal
    try {
      const obj = JSON.parse(raw);
      if (obj && typeof obj.explanation === "string") return obj;
    } catch {}

    return null;
  };

  const result = tryParse();
  if (result) {
    parsed = result;
  } else {
    // Final fallback: treat the whole content as the explanation text
    parsed = {
      explanation: rawContent,
      checkpoint_question: "Did that make sense?",
      doubt_prompt: "Do you have any doubts or questions before we move on?",
      next_action: "CONTINUE",
      explanation_mode: "standard",
    };
  }

  return {
    ragContext,
    explanation: parsed.explanation ?? "",
    checkpointQuestion: parsed.checkpoint_question ?? "",
    doubtPrompt: parsed.doubt_prompt ?? "Do you have any doubts or questions before we move on?",
    nextAction: parsed.next_action ?? "CONTINUE",
    explanationMode: parsed.explanation_mode ?? "standard",
  };
}
