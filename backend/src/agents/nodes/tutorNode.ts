import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { AgentStateType } from "../state";
import { TUTOR_SYSTEM_PROMPT } from "../prompts/tutorPrompt";
import {
  retrieveContextByNamespace,
  retrieveFromMultipleNamespaces,
  retrieveFromAllUserSessions,
} from "../../pipelines/retriever";
import { env } from "../../config/env";
import { createLogger } from "../../config/logger";
import { emitLog, type AgentLogFn } from "../../utils/agentLogger";

const log = createLogger("agent:tutorNode");

/**
 * Tutor node — Tool-calling ReAct agent.
 *
 * Previous behaviour: RAG retrieval was hardcoded BEFORE the LLM call.
 * New behaviour: The LLM decides WHEN and WHAT to search via tools.
 *
 * Tools available to the LLM:
 *   1. search_uploaded_materials — queries Pinecone (student's notes/PDF)
 *   2. search_web               — queries Tavily for real-world examples
 *
 * The LLM runs a ReAct loop (Reason → Act → Observe → Reason…) up to
 * maxToolCalls times, then produces its final structured JSON response.
 *
 * IMPORTANT: response_format: json_object is INCOMPATIBLE with tool calling
 * in OpenAI's API. We omit it here and parse JSON from the final text response
 * using the same 3-strategy parser used in the original tutorNode.
 *
 * The loopCount field is incremented each time tutorNode runs so gradeNode
 * can enforce the 3-loop safety cap.
 */
export async function tutorNode(
  state: AgentStateType,
  emit?: AgentLogFn
): Promise<Partial<AgentStateType>> {
  const loop = state.loopCount ?? 0;
  if (loop === 0) {
    emit?.("TUTOR_NODE", `Starting explanation for "${state.topicName}" (mode: standard)`, "info");
  } else {
    emit?.("TUTOR_NODE", `Re-explaining in ${state.explanationMode} mode (attempt ${loop + 1}/3)`, "info");
  }
  // ── Build namespace list for material search tool ─────────────────────────
  const allNamespaces: string[] = [];
  if (state.sessionId) {
    allNamespaces.push(`${state.userId}_${state.sessionId}`);
  }
  if (state.materialNamespaces && state.materialNamespaces.length > 0) {
    allNamespaces.push(...state.materialNamespaces);
  }

  // ── Define tools as closures (capture namespace context) ──────────────────
  const searchMaterialsTool = tool(
    async ({ query }: { query: string }): Promise<string> => {
      log.info("Tool call: search_uploaded_materials", { query });
      emit?.("TUTOR_NODE", `Searching uploaded materials: "${query}"`, "info");
      if (allNamespaces.length > 1) {
        const result = await retrieveFromMultipleNamespaces(query, allNamespaces);
        emit?.("TUTOR_NODE", `Retrieved context from ${allNamespaces.length} namespaces`, "info");
        return result;
      } else if (allNamespaces.length === 1) {
        const result = await retrieveContextByNamespace(query, allNamespaces[0]);
        emit?.("TUTOR_NODE", `Retrieved context from namespace (score ready)`, "info");
        return result;
      } else if (state.userId) {
        return await retrieveFromAllUserSessions(query, state.userId);
      }
      return "No uploaded materials available.";
    },
    {
      name: "search_uploaded_materials",
      description:
        "Search the student's uploaded PDF or notes for content about a specific concept. " +
        "ALWAYS call this first when introducing a new concept or when the student asks " +
        "something covered in their study material.",
      schema: z.object({
        query: z
          .string()
          .describe(
            "The concept, topic, or question to search for in the student's uploaded materials"
          ),
      }),
    }
  );

  const searchWebTool = tool(
    async ({ query }: { query: string }): Promise<string> => {
      log.info("Tool call: search_web", { query });
      emit?.("TUTOR_NODE", `Searching web for supplementary examples: "${query}"`, "info");
      try {
        const { TavilySearch } = await import("@langchain/tavily");
        const search = new TavilySearch({ maxResults: 3 });
        const results = await search.invoke({ query });
        return typeof results === "string" ? results : JSON.stringify(results);
      } catch (err: any) {
        log.warn("Web search failed — falling back to model knowledge", {
          error: err.message,
        });
        return "Web search is currently unavailable. Use your training knowledge.";
      }
    },
    {
      name: "search_web",
      description:
        "Search the web for supplementary examples, analogies, or real-world applications " +
        "of a concept. Use this when the student's uploaded materials don't have enough " +
        "context, or when a real-world analogy would help a beginner understand.",
      schema: z.object({
        query: z
          .string()
          .describe("Search query for finding supplementary educational content online"),
      }),
    }
  );

  const tools = [searchMaterialsTool, searchWebTool];

  // ── Build system prompt ───────────────────────────────────────────────────
  const chatHistorySummary =
    state.chatHistory.length > 0
      ? `The conversation so far has ${state.chatHistory.length} turns. Refer to the message history above when answering follow-up questions.`
      : "This is the start of the conversation.";

  // If this is a re-explanation loop, inject the gradeNode's context
  const loopContext =
    (state.loopCount ?? 0) > 0 && state.gradeClassification !== "UNDERSTOOD"
      ? `\n\nIMPORTANT — RE-EXPLANATION CONTEXT:\n` +
        `The student responded to your checkpoint question and was classified as: ${state.gradeClassification}.\n` +
        `Previous explanation mode: ${state.explanationMode}.\n` +
        (state.gradeClassification === "CONFUSED"
          ? "Switch to a SIMPLER explanation. Use a real-world analogy or everyday metaphor."
          : state.gradeClassification === "PARTIAL"
          ? "Go DEEPER with a step-by-step breakdown. Address the specific gaps in their understanding."
          : "Answer their specific doubt, then smoothly resume tutoring.")
      : "";

  const systemPrompt =
    TUTOR_SYSTEM_PROMPT.replace("{currentDateTime}", state.currentDateTime)
      .replace("{topicName}", state.topicName)
      .replace("{masteryLevel}", String(state.masteryScore))
      .replace("{explanationLevel}", state.explanationLevel)
      .replace(
        "{ragContext}",
        "You have tools to search the student's materials and the web. " +
          "Use search_uploaded_materials first for any new concept. " +
          "Use search_web for real-world analogies or examples not in the notes."
      )
      .replace("{chatHistory}", chatHistorySummary)
      .replace("{selfRatingBefore}", String(state.selfRatingBefore ?? 0))
      .replace("{learningProfile}", state.learningProfile || "No profile yet.")
      + loopContext;

  const historyMessages = state.chatHistory.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // ── ReAct loop ────────────────────────────────────────────────────────────
  // The model calls tools, we execute them and feed results back, until
  // the model produces a response with no tool calls.
  const model = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0.7,
    apiKey: env.OPENAI_API_KEY,
    // DO NOT set response_format: json_object here — it's incompatible with tools
  }).bindTools(tools);

  let messages: any[] = [
    { role: "system", content: systemPrompt },
    ...historyMessages,
    { role: "user", content: state.message },
  ];

  let ragContext = "";
  const maxToolCalls = 3; // Prevent runaway tool use
  let toolCallCount = 0;

  while (toolCallCount < maxToolCalls) {
    const response = await model.invoke(messages);

    // No tool calls → model is done reasoning, ready to respond
    if (!response.tool_calls || response.tool_calls.length === 0) {
      const rawContent = response.content as string;
      const parsed = parseJsonResponse(rawContent);
      log.info("tutorNode complete (no more tool calls)", {
        loopCount: state.loopCount,
        toolCallsMade: toolCallCount,
        nextAction: parsed.next_action,
      });
      emit?.("TUTOR_NODE", `Explanation generated · invoking GPT-4o (temp: 0.7)`, "info");
      emit?.("TUTOR_NODE", `Explanation streamed · checkpoint question generated`, "success");
      return buildOutput(state, ragContext, parsed);
    }

    // Append the AI message (which contains tool_calls) to message history
    messages.push(response);

    // Execute each tool call and append results
    for (const tc of response.tool_calls) {
      const selectedTool = tools.find((t) => t.name === tc.name);
      if (selectedTool) {
        const toolResult = await selectedTool.invoke(tc.args as any);
        const resultStr = String(toolResult);
        // Accumulate RAG context for storage in state
        ragContext += (ragContext ? "\n\n---\n\n" : "") + resultStr;
        messages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: resultStr,
        });
      }
      toolCallCount++;
    }
  }

  // ── Fallback: max tool calls reached ─────────────────────────────────────
  // Make one final call without tools so the model can respond with what it has
  log.warn("Max tool calls reached — making final non-tool call", {
    toolCallCount,
    loopCount: state.loopCount,
  });
  const finalModel = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0.7,
    apiKey: env.OPENAI_API_KEY,
    modelKwargs: { response_format: { type: "json_object" } },
  });
  const finalResponse = await finalModel.invoke(messages);
  const parsed = parseJsonResponse(finalResponse.content as string);
  return buildOutput(state, ragContext, parsed);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * 3-strategy JSON parser — same defensive approach as the original tutorNode.
 * Handles: raw JSON, JSON inside markdown fences, preamble text before JSON.
 */
function parseJsonResponse(rawContent: string): any {
  let raw = rawContent;

  // Strategy 1: strip markdown fences, extract first {...}
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

  // Strategy 2: plain parse after fence removal
  try {
    const obj = JSON.parse(raw);
    if (obj && typeof obj.explanation === "string") return obj;
  } catch {}

  // Strategy 3: treat entire response as the explanation text (graceful fallback)
  return {
    explanation: rawContent,
    checkpoint_question: "Did that make sense?",
    doubt_prompt: "Do you have any doubts or questions before we move on?",
    next_action: "CONTINUE",
    explanation_mode: "standard",
  };
}

/**
 * Builds the state update returned by tutorNode.
 * Increments loopCount so gradeNode can enforce the 3-loop cap.
 */
function buildOutput(
  state: AgentStateType,
  ragContext: string,
  parsed: any
): Partial<AgentStateType> {
  return {
    ragContext,
    explanation: parsed.explanation ?? "",
    checkpointQuestion: parsed.checkpoint_question ?? "",
    doubtPrompt:
      parsed.doubt_prompt ?? "Do you have any doubts or questions before we move on?",
    nextAction: parsed.next_action ?? "CONTINUE",
    explanationMode: parsed.explanation_mode ?? "standard",
    loopCount: (state.loopCount ?? 0) + 1, // ← gradeNode reads this for the safety cap
  };
}
