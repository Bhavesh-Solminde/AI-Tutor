import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { AgentStateType } from "../state";
import { env } from "../../config/env";
import { createLogger } from "../../config/logger";
import { type AgentLogFn } from "../../utils/agentLogger";

const log = createLogger("agent:gradeNode");

const gradeSchema = z.object({
  classification: z.enum(["UNDERSTOOD", "CONFUSED", "PARTIAL", "DOUBT"]),
  reasoning: z.string(),
});

/**
 * Grade node — LLM classifier that reads the student's response to the
 * checkpoint question and decides the next graph step.
 *
 * This is the node that makes the graph a genuine multi-step agentic loop:
 * - UNDERSTOOD → END (move on)
 * - CONFUSED   → tutorNode with simpler explanation
 * - PARTIAL    → tutorNode with deeper step-by-step breakdown
 * - DOUBT      → doubtNode to answer their specific question
 *
 * Temperature 0.1: near-deterministic classification, not creative generation.
 * Uses withStructuredOutput so the enum is enforced — no JSON parsing needed.
 */
export async function gradeNode(
  state: AgentStateType,
  emit?: AgentLogFn
): Promise<Partial<AgentStateType>> {
  const studentSnippet = state.message.length > 80
    ? state.message.slice(0, 80) + "..."
    : state.message;
  emit?.("GRADE_NODE", `Student response received: "${studentSnippet}"`, "info");
  emit?.("GRADE_NODE", `Grading response...`, "info");
  const model = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0.1,
    apiKey: env.OPENAI_API_KEY,
  });

  const structuredModel = model.withStructuredOutput(gradeSchema);

  const result = await structuredModel.invoke([
    {
      role: "system",
      content: `You are a student understanding classifier for an AI tutoring system.

Given the tutor's last explanation, the checkpoint question posed, and the student's response,
classify the student's understanding level into exactly one of:

UNDERSTOOD — Student correctly answers the checkpoint question, confirms they understand,
             or gives a response that demonstrates comprehension of the concept.
CONFUSED   — Student says they don't understand, gives a clearly wrong answer, asks you
             to "explain again", or their response shows fundamental misunderstanding.
PARTIAL    — Student gets part of it right but has clear gaps. They may answer half the
             question correctly or show understanding of the concept but miss key details.
DOUBT      — Student asks a specific follow-up question about the material (not a request
             to re-explain, but a genuine new question about the concept).

Classification rules:
- First message in a session (student initiates learning) → always UNDERSTOOD (no checkpoint yet)
- Short affirmative responses ("yes", "ok", "got it", "understood") → UNDERSTOOD
- When in doubt between UNDERSTOOD and PARTIAL → choose PARTIAL (conservative)
- "I don't get it" / "explain again" / "I'm confused" → CONFUSED
- A specific "why does X happen?" or "what about Y?" → DOUBT`,
    },
    {
      role: "user",
      content: `Tutor's last explanation (first 600 chars):
${(state.explanation ?? "").slice(0, 600)}

Checkpoint question asked:
${state.checkpointQuestion ?? "(none — this is likely the first message)"}

Student's response:
${state.message}

Classify now.`,
    },
  ]);

  log.info("Grade classification complete", {
    classification: result.classification,
    reasoning: result.reasoning,
    loopCount: state.loopCount,
  });

  // Emit the verdict — this is the money moment
  const currentLoop = state.loopCount ?? 0;
  const nextAttempt = currentLoop + 1;
  const loopCapHit = nextAttempt >= 3; // graph.ts caps at loopCount >= 3

  const classificationMessages: Record<string, { msg: string; logType: "success" | "warn" | "info" }> = {
    UNDERSTOOD: { msg: `Classification \u2192 UNDERSTOOD \u2713 \u00b7 advancing curriculum`, logType: "success" },
    CONFUSED: {
      msg: loopCapHit
        ? `Classification \u2192 CONFUSED \u00b7 loop cap reached (3/3) \u00b7 ending session`
        : `Classification \u2192 CONFUSED \u00b7 re-routing to simpler explanation mode`,
      logType: "warn",
    },
    PARTIAL: {
      msg: loopCapHit
        ? `Classification \u2192 PARTIAL \u00b7 loop cap reached (3/3) \u00b7 ending session`
        : `Classification \u2192 PARTIAL \u00b7 missing context \u00b7 re-routing to step_by_step mode (attempt ${nextAttempt}/3)`,
      logType: "warn",
    },
    DOUBT: { msg: `Classification \u2192 DOUBT \u00b7 student has a specific question \u00b7 routing to doubtNode`, logType: "info" },
  };
  const verdict = classificationMessages[result.classification];
  if (verdict) {
    emit?.("GRADE_NODE", verdict.msg, verdict.logType);
  }
  // Map classification to the nextAction and explanationMode that tutorNode will use
  // on the next loop iteration
  const actionMap: Record<
    string,
    { nextAction: AgentStateType["nextAction"]; explanationMode: AgentStateType["explanationMode"] }
  > = {
    UNDERSTOOD: { nextAction: "CONTINUE",      explanationMode: "standard"    },
    CONFUSED:   { nextAction: "GO_SIMPLER",    explanationMode: "simpler"     },
    PARTIAL:    { nextAction: "GO_DEEPER",     explanationMode: "step_by_step" },
    DOUBT:      { nextAction: "ANSWER_DOUBT",  explanationMode: "standard"    },
  };

  const mapped = actionMap[result.classification] ?? actionMap["UNDERSTOOD"];

  return {
    nextAction: mapped.nextAction,
    explanationMode: mapped.explanationMode,
    gradeClassification: result.classification as AgentStateType["gradeClassification"],
    gradeReasoning: result.reasoning,
  };
}
