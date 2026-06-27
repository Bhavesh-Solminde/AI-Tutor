import { Response } from "express";

export type AgentLogNode =
  | "ROUTER"
  | "TUTOR_NODE"
  | "GRADE_NODE"
  | "DOUBT_NODE"
  | "QUIZ_NODE";

export type AgentLogType = "info" | "success" | "warn" | "error";

export type AgentLogFn = (
  node: AgentLogNode,
  message: string,
  logType?: AgentLogType
) => void;

export interface AgentLogEntry {
  type: "agent_log";
  timestamp: string;
  node: AgentLogNode;
  message: string;
  logType: AgentLogType;
}

/**
 * Writes a single agent_log SSE event to the response stream.
 * Safe to call at any point during streaming — it writes immediately.
 * If `res` is null/undefined (non-SSE callers), it's a no-op.
 */
export function emitLog(
  res: Response | null | undefined,
  node: AgentLogNode,
  message: string,
  logType: AgentLogType = "info"
): void {
  if (!res || res.writableEnded) return;
  const entry: AgentLogEntry = {
    type: "agent_log",
    timestamp: new Date().toISOString(),
    node,
    message,
    logType,
  };
  res.write(`data: ${JSON.stringify(entry)}\n\n`);
}

/**
 * Creates a bound emitter function for a specific response.
 * Pass this down through the graph nodes so they can emit without
 * holding a reference to the raw Response object.
 */
export function createEmitter(res: Response): AgentLogFn {
  return (node, message, logType = "info") => emitLog(res, node, message, logType);
}
