import { StateGraph, END } from "@langchain/langgraph";
import { AgentState, AgentStateType } from "./state";
import { routerNode, routeMessage } from "./nodes/router";
import { tutorNode } from "./nodes/tutorNode";
import { doubtNode } from "./nodes/doubtNode";
import { quizGeneratorNode } from "./nodes/quizGeneratorNode";
import { gradeNode } from "./nodes/gradeNode";

/**
 * Main LangGraph state graph — Agentic Teaching Loop.
 *
 * Previous architecture (2-node fan-out, not a real graph):
 *   router → (tutorNode | doubtNode | quizGeneratorNode) → END
 *
 * New architecture (genuine multi-step agentic loop):
 *   __start__ → router ──┬── tutorNode → gradeNode ──┬── UNDERSTOOD → END
 *                        │                            ├── CONFUSED   → tutorNode
 *                        │                            ├── PARTIAL    → tutorNode
 *                        │                            └── DOUBT      → doubtNode → END
 *                        ├── doubtNode → END
 *                        └── quizGeneratorNode → END
 *
 * The gradeNode is the decision point that creates the cycle.
 * Safety valve: loopCount >= 3 forces END regardless of classification.
 */

/**
 * Routing function for conditional edges out of gradeNode.
 * Called by LangGraph after gradeNode writes its output to state.
 */
function routeAfterGrade(
  state: AgentStateType
): "tutorNode" | "doubtNode" | "__end__" {
  // Hard cap: prevent infinite loops (max 3 re-explanations per user message)
  if ((state.loopCount ?? 0) >= 3) {
    return "__end__";
  }

  switch (state.gradeClassification) {
    case "CONFUSED":
    case "PARTIAL":
      return "tutorNode";   // Re-explain in simpler/deeper mode
    case "DOUBT":
      return "doubtNode";   // Answer their specific question
    case "UNDERSTOOD":
    default:
      return "__end__";     // Move on
  }
}

const workflow = new StateGraph(AgentState)
  .addNode("router", routerNode)
  .addNode("tutorNode", tutorNode as any)
  .addNode("doubtNode", doubtNode as any)
  .addNode("quizGeneratorNode", quizGeneratorNode as any)
  .addNode("gradeNode", gradeNode as any)
  // Always start at router
  .addEdge("__start__", "router")
  // Router fans out to the right specialist node
  .addConditionalEdges("router", routeMessage, {
    tutorNode: "tutorNode",
    doubtNode: "doubtNode",
    quizGeneratorNode: "quizGeneratorNode",
  })
  // After tutorNode always classify — gradeNode decides what's next
  .addEdge("tutorNode", "gradeNode")
  // gradeNode decides: loop back, switch to doubt, or finish
  .addConditionalEdges("gradeNode", routeAfterGrade, {
    tutorNode: "tutorNode",
    doubtNode: "doubtNode",
    __end__: END,
  })
  // Doubt resolves → END (response is ready)
  .addEdge("doubtNode", END)
  // Quiz generation → END
  .addEdge("quizGeneratorNode", END);

export const graph = workflow.compile();

/**
 * Run the tutor/doubt/quiz graph and return the final state.
 * Called by tutor.controller.ts for every chat message.
 */
export async function runTutorGraph(
  input: Partial<AgentStateType>
): Promise<AgentStateType> {
  const result = await graph.invoke(input as AgentStateType);
  return result as AgentStateType;
}
