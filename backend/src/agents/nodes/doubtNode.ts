import { ChatOpenAI } from "@langchain/openai";
import { AgentStateType } from "../state";
import { DOUBT_SYSTEM_PROMPT } from "../prompts/tutorPrompt";
import { retrieveContext, retrieveContextByNamespace, retrieveFromMultipleNamespaces, retrieveFromAllUserSessions } from "../../pipelines/retriever";
import { env } from "../../config/env";

/**
 * Doubt node — handles freeform student questions (ANSWER_DOUBT mode).
 * Same guardrails as tutor node. Answers then resumes normal flow.
 * Maps to n8n: same "Tutor AI Agent" but with messageType = "doubt".
 */
export async function doubtNode(
  state: AgentStateType
): Promise<Partial<AgentStateType>> {
  // Retrieve RAG context — multi-namespace if material sessions are attached
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
    ragContext = await retrieveContextByNamespace(state.message, allNamespaces[0]);
  } else if (state.userId) {
    // Open-mode fallback: retrieve from all active user sessions
    ragContext = await retrieveFromAllUserSessions(state.message, state.userId);
  }

  // Build system prompt (chat history summary for context summary only)
  const chatHistorySummary = state.chatHistory.length > 0
    ? `The conversation so far has ${state.chatHistory.length} turns. Refer to the message history above when answering follow-up questions.`
    : "This is the start of the conversation.";

  const systemPrompt = DOUBT_SYSTEM_PROMPT
    .replace("{currentDateTime}", state.currentDateTime)
    .replace("{topicName}", state.topicName)
    .replace("{explanationLevel}", state.explanationLevel)
    .replace("{ragContext}", ragContext || "No uploaded materials found. Use your knowledge.")
    .replace("{chatHistory}", chatHistorySummary);

  // Build messages array with full conversation history as real turns
  const historyMessages = state.chatHistory.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

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
    ...historyMessages,
    { role: "user", content: state.message },
  ]);

  // Robust JSON parsing (same 3-strategy approach as tutorNode)
  let parsed: any;
  const rawContent = response.content as string;

  const tryParse = (): any | null => {
    let raw = rawContent;
    raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim();

    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const candidate = raw.slice(firstBrace, lastBrace + 1);
      try {
        const obj = JSON.parse(candidate);
        if (obj && typeof obj.explanation === "string") return obj;
      } catch {}
    }

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
    parsed = {
      explanation: rawContent,
      checkpoint_question: "Does that clear up your doubt?",
      doubt_prompt: "Any other questions before we continue?",
      next_action: "CONTINUE",
      explanation_mode: "standard",
    };
  }

  return {
    ragContext,
    explanation: parsed.explanation ?? "",
    checkpointQuestion: parsed.checkpoint_question ?? "",
    doubtPrompt: parsed.doubt_prompt ?? "Any other questions?",
    nextAction: parsed.next_action ?? "CONTINUE",
    explanationMode: parsed.explanation_mode ?? "standard",
  };
}
