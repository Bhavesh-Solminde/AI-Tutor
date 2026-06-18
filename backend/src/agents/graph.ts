import { StateGraph, END } from "@langchain/langgraph";
import { AgentState, AgentStateType } from "./state";
import { routerNode, routeMessage } from "./nodes/router";
import { tutorNode } from "./nodes/tutorNode";
import { doubtNode } from "./nodes/doubtNode";
import { quizGeneratorNode } from "./nodes/quizGeneratorNode";

/**
 * Main LangGraph state graph.
 * Replaces n8n's visual workflow connections with TypeScript edges.
 *
 * n8n flow: Webhook → Agent → Format Response
 * LangGraph flow: router → (tutorNode | doubtNode | quizGeneratorNode) → END
 */
const workflow = new StateGraph(AgentState)
  .addNode("router", routerNode)
  .addNode("tutorNode", tutorNode as any)
  .addNode("doubtNode", doubtNode as any)
  .addNode("quizGeneratorNode", quizGeneratorNode as any)
  .addEdge("__start__", "router")
  .addConditionalEdges("router", routeMessage, {
    tutorNode: "tutorNode",
    doubtNode: "doubtNode",
    quizGeneratorNode: "quizGeneratorNode",
  })
  .addEdge("tutorNode", END)
  .addEdge("doubtNode", END)
  .addEdge("quizGeneratorNode", END);

export const graph = workflow.compile();

/**
 * Run the tutor/doubt graph and return the final state.
 */
export async function runTutorGraph(
  input: Partial<AgentStateType>
): Promise<AgentStateType> {
  const result = await graph.invoke(input as AgentStateType);
  return result as AgentStateType;
}
