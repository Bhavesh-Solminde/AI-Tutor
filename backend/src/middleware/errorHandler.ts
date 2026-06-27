import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { randomUUID } from "crypto";
import { logger } from "../config/logger";

/**
 * Translate Mongoose & JWT errors into AppErrors with specific messages.
 */
function normalizeError(err: any): AppError {
  const requestId = randomUUID();

  // Already an operational AppError — pass through
  if (err.isOperational) return err;

  // Mongoose ValidationError
  if (err.name === "ValidationError" && err.errors) {
    const fields: Record<string, string> = {};
    Object.keys(err.errors).forEach((key) => {
      fields[key] = err.errors[key].message;
    });
    const firstField = Object.keys(fields)[0];
    const e = new AppError(`Validation failed: ${err.errors[firstField]?.message}`, 400, "VALIDATION_ERROR");
    e.requestId = requestId;
    return e;
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    const e = new AppError(`Invalid ID format: "${err.value}" is not a valid identifier.`, 400, "INVALID_ID");
    e.requestId = requestId;
    return e;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    const value = err.keyValue?.[field];
    let msg = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    if (field === "email") msg = "This email is already registered. Try logging in instead.";
    const e = new AppError(msg, 409, "DUPLICATE_KEY");
    e.requestId = requestId;
    return e;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const e = new AppError("Invalid authentication token. Please sign in again.", 401, "INVALID_TOKEN");
    e.requestId = requestId;
    return e;
  }
  if (err.name === "TokenExpiredError") {
    const e = new AppError("Your session has expired. Please sign in again.", 401, "TOKEN_EXPIRED");
    e.requestId = requestId;
    return e;
  }

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    const e = new AppError("File is too large. Maximum allowed size is 10MB.", 400, "FILE_TOO_LARGE");
    e.requestId = requestId;
    return e;
  }
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    const e = new AppError("Unexpected file field. Only one file per upload is allowed.", 400, "UNEXPECTED_FILE");
    e.requestId = requestId;
    return e;
  }

  // OpenAI rate limit
  if (err.status === 429 || (err.message && err.message.includes("rate limit"))) {
    const retryAfter = err.headers?.["retry-after"] || 30;
    const e = new AppError(
      `AI service rate limit reached. Please wait ${retryAfter} seconds and try again.`,
      429,
      "AI_RATE_LIMIT"
    );
    e.requestId = requestId;
    return e;
  }

  // Generic unhandled — never show stack in production
  const e = new AppError(
    "An unexpected error occurred on our servers. Please try again in a moment.",
    500,
    "INTERNAL_ERROR"
  );
  e.requestId = requestId;
  return e;
}

/**
 * Global express error handler — must be last middleware.
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const normalized = normalizeError(err);

  // Structured error log — includes requestId for correlation with request log
  logger.error("Request error", {
    requestId: normalized.requestId,
    statusCode: normalized.statusCode,
    code: normalized.code,
    method: req.method,
    path: req.path,
    message: err.message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });

  const response: Record<string, any> = {
    error: normalized.message,
    code: normalized.code,
    requestId: normalized.requestId,
  };

  // Include validation fields if present
  if ((normalized as any).fields) {
    response.fields = (normalized as any).fields;
  }

  // Include retry-after for rate limits
  if ((normalized as any).retryAfter) {
    res.setHeader("Retry-After", String((normalized as any).retryAfter));
    response.retryAfter = (normalized as any).retryAfter;
  }

  // Stack trace only in development
  if (process.env.NODE_ENV !== "production" && err.stack) {
    response.stack = err.stack;
  }

  res.status(normalized.statusCode).json(response);
}

/**
 * Handle unhandled promise rejections globally.
 */
process.on("unhandledRejection", (reason: any) => {
  logger.error("Unhandled Promise Rejection", {
    error: reason?.message || String(reason),
    stack: reason?.stack,
  });
});

process.on("uncaughtException", (error: Error) => {
  logger.error("Uncaught Exception — exiting", {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});
