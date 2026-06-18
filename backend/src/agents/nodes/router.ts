import { AgentStateType } from "../state";

/**
 * Router node — determines which agent node to call next.
 * Maps to n8n's conditional routing between workflows.
 */
export function routerNode(state: AgentStateType): Partial<AgentStateType> {
  // No state modification — just routing logic used in graph.ts
  return state;
}

/**
 * Routing condition function for LangGraph edges.
 */
export function routeMessage(
  state: AgentStateType
): "tutorNode" | "doubtNode" | "quizGeneratorNode" {
  if (state.message === "QUIZ_READY" || state.nextAction === "QUIZ_READY") {
    return "quizGeneratorNode";
  }
  if (state.messageType === "doubt") {
    return "doubtNode";
  }
  return "tutorNode";
}
