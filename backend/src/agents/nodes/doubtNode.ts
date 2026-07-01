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

  // Detect document meta-questions so we use a meaningful RAG query instead of the
  // literal question text (which won't semantically match anything in Pinecone).
  //
  // Triggers when the message contains:
  //  - Document-related keywords (pdf, notes, file, content, material, reference…)
  //  - A file extension (.md, .pdf, .docx, .txt)
  //  - The name of one of the attached session documents (e.g. "fast-api.md")
  const DOCUMENT_KEYWORDS = /\b(pdf|document|notes|attachment|attached|material|file|reference|upload|content)\b|\.(md|pdf|docx|txt)\b/i;
  const mentionsAttachedFile = (state.materialSessionNames || []).some((name) =>
    state.message.toLowerCase().includes(name.toLowerCase().replace(/\.(md|pdf|docx|txt)$/i, ""))
  );
  const isDocumentMetaQuestion = (DOCUMENT_KEYWORDS.test(state.message) || mentionsAttachedFile) && allNamespaces.length > 0;

  // For document questions: search with "overview introduction summary" to pull
  // the opening/summary sections of the attached file instead of matching the meta-question.
  const ragQuery = isDocumentMetaQuestion
    ? `overview introduction summary ${state.topicName !== "General Study" ? state.topicName : ""}`
    : state.message;

  if (allNamespaces.length > 1) {
    ragContext = await retrieveFromMultipleNamespaces(ragQuery, allNamespaces);
  } else if (allNamespaces.length === 1) {
    ragContext = await retrieveContextByNamespace(ragQuery, allNamespaces[0]);
  } else if (state.userId) {
    ragContext = await retrieveFromAllUserSessions(ragQuery, state.userId);
  }


  // Build system prompt (chat history summary for context summary only)
  const chatHistorySummary = state.chatHistory.length > 0
    ? `The conversation so far has ${state.chatHistory.length} turns. Refer to the message history above when answering follow-up questions.`
    : "This is the start of the conversation.";

  // Build attached materials description — mirrors tutorNode logic
  let attachedMaterialsStr: string;
  if (state.materialSessionNames && state.materialSessionNames.length > 0) {
    const lines = state.materialSessionNames.map((name, i) => {
      const summary = state.materialSessionSummaries?.[i];
      if (summary) {
        return `  ${i + 1}. "${name}"\n     Topics covered:\n${summary.split("\n").map((l) => `       ${l.trim()}`).join("\n")}`;
      }
      return `  ${i + 1}. "${name}"`;
    });
    attachedMaterialsStr = `The student has attached the following documents to this session:\n${lines.join("\n")}`;
  } else if (state.sessionId && state.topicName && state.topicName !== "General Study") {
    attachedMaterialsStr = `Topic session context: "${state.topicName}" (from the student's uploaded study material for this subject).`;
  } else {
    attachedMaterialsStr = "None — no documents or notes are currently attached to this session.";
  }

  const systemPrompt = DOUBT_SYSTEM_PROMPT
    .replace("{currentDateTime}", state.currentDateTime)
    .replace("{topicName}", state.topicName)
    .replace("{explanationLevel}", state.explanationLevel)
    .replace("{ragContext}", ragContext || "No uploaded materials found. Use your knowledge.")
    .replace("{attachedMaterials}", attachedMaterialsStr)
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
