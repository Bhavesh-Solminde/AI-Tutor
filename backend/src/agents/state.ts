import { Annotation } from "@langchain/langgraph";

/**
 * LangGraph shared state definition.
 * Replaces n8n's data-passing between workflow nodes.
 */
export const AgentState = Annotation.Root({
  // ─── Input ─────────────────────────────────────────────────────────────────
  userId: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),
  topicId: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),
  topicName: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),
  message: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),
  messageType: Annotation<"teach" | "doubt">({
    reducer: (_, next) => next,
    default: () => "teach",
  }),

  // ─── Context (loaded from MongoDB + Pinecone) ───────────────────────────────
  ragContext: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),
  chatHistory: Annotation<Array<{ role: string; content: string }>>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  explanationLevel: Annotation<"beginner" | "intermediate" | "advanced">({
    reducer: (_, next) => next,
    default: () => "beginner",
  }),
  masteryScore: Annotation<number>({
    reducer: (_, next) => next,
    default: () => 0,
  }),
  currentDateTime: Annotation<string>({
    reducer: (_, next) => next,
    default: () => new Date().toISOString(),
  }),
  sessionId: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),
  // IDs of materials the user selected in the chat's Materials modal
  materialSessionIds: Annotation<string[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),
  // Resolved Pinecone namespaces for the above sessions (filled by tutor controller)
  materialNamespaces: Annotation<string[]>({
    reducer: (_, next) => next,
    default: () => [],
  }),

  // Previous quiz score for this topic (null if first attempt) — used by quizGeneratorNode
  previousQuizScore: Annotation<number | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),

  // ─── Tutor Output ───────────────────────────────────────────────────────────
  explanation: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),
  checkpointQuestion: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "",
  }),
  doubtPrompt: Annotation<string>({
    reducer: (_, next) => next,
    default: () => "Do you have any doubts or questions before we move on?",
  }),
  nextAction: Annotation<"CONTINUE" | "GO_DEEPER" | "GO_SIMPLER" | "ANSWER_DOUBT" | "QUIZ_READY">({
    reducer: (_, next) => next,
    default: () => "CONTINUE",
  }),
  explanationMode: Annotation<"standard" | "simpler" | "analogy" | "step_by_step">({
    reducer: (_, next) => next,
    default: () => "standard",
  }),

  // ─── Quiz Output ────────────────────────────────────────────────────────────
  questions: Annotation<
    Array<{
      question: string;
      options: string[];
      correct: number;
      explanation: string;
    }>
  >({
    reducer: (_, next) => next,
    default: () => [],
  }),
  timeLimit: Annotation<number>({
    reducer: (_, next) => next,
    default: () => 600,
  }),

  // ─── Progress Output (mastery from pure code, recommendations from LLM) ────
  masteryDelta: Annotation<{ before: number; after: number }>({
    reducer: (_, next) => next,
    default: () => ({ before: 0, after: 0 }),
  }),
  nodeColorUpdate: Annotation<"unstarted" | "learning" | "mastered">({
    reducer: (_, next) => next,
    default: () => "learning",
  }),
  xpEarned: Annotation<number>({
    reducer: (_, next) => next,
    default: () => 0,
  }),
  passed: Annotation<boolean>({
    reducer: (_, next) => next,
    default: () => false,
  }),
  nextTopicRecommendation: Annotation<{
    topicId: string;
    topicName: string;
    reason: string;
  }>({
    reducer: (_, next) => next,
    default: () => ({ topicId: "", topicName: "", reason: "" }),
  }),
  studyPlanUpdate: Annotation<Record<string, string[]>>({
    reducer: (_, next) => next,
    default: () => ({}),
  }),
});

export type AgentStateType = typeof AgentState.State;
