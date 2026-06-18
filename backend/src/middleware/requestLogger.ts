import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { createLogger } from "../config/logger";

const log = createLogger("http");

/**
 * Express middleware that replaces Morgan.
 * - Assigns a unique requestId to every request (attached to req for downstream use)
 * - Logs incoming request: method, path, userId, body keys (NOT values)
 * - Logs outgoing response: status code, duration
 * - Skips /health endpoint to reduce noise
 */
export function requestLogger(req: Request & { requestId?: string }, res: Response, next: NextFunction): void {
  // Skip health checks
  if (req.path === "/health") {
    next();
    return;
  }

  const requestId = uuidv4();
  (req as any).requestId = requestId;

  const start = Date.now();

  // Extract userId from Authorization header (JWT) if present — no decoding needed, just the first 8 chars
  const authHeader = req.headers.authorization;
  const tokenHint = authHeader?.startsWith("Bearer ") ? authHeader.slice(7, 15) + "…" : "none";

  // Log body keys only (never values) — protects passwords / tokens
  const bodyKeys = req.body && typeof req.body === "object" ? Object.keys(req.body) : [];

  log.info(`→ ${req.method} ${req.path}`, {
    requestId,
    tokenHint,
    bodyKeys,
    ip: req.ip,
  });

  // Hook into response finish to log the result
  res.on("finish", () => {
    const durationMs = Date.now() - start;
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
    log[level](`← ${req.method} ${req.path} ${res.statusCode}`, {
      requestId,
      statusCode: res.statusCode,
      durationMs,
    });
  });

  next();
}
