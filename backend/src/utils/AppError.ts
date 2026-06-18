import { v4 as uuidv4 } from 'uuid';

/**
 * Base operational error — always shows a user-friendly message.
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code: string;
  requestId: string;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    this.requestId = uuidv4();
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  fields: Record<string, string>;
  constructor(message: string, fields: Record<string, string> = {}) {
    super(message, 400, 'VALIDATION_ERROR');
    this.fields = fields;
  }
}

export class AuthError extends AppError {
  constructor(message = 'Authentication required. Please sign in.') {
    super(message, 401, 'AUTH_ERROR');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You don't have permission to perform this action.") {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found.`, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  retryAfter: number;
  constructor(retryAfter = 60) {
    super(`Too many requests. Please wait ${retryAfter} seconds and try again.`, 429, 'RATE_LIMIT');
    this.retryAfter = retryAfter;
  }
}

export class ExternalServiceError extends AppError {
  service: string;
  constructor(service: string, detail?: string) {
    const messages: Record<string, string> = {
      openai: 'AI service is temporarily unavailable. Please try again in a moment.',
      pinecone: 'Vector search service is unavailable. Your data is safe — try again shortly.',
      cloudinary: 'File storage service is unavailable. Please try again.',
      mongodb: 'Database is temporarily unreachable. Please try again.',
    };
    super(messages[service.toLowerCase()] || `${service} service is unavailable.`, 502, 'EXTERNAL_SERVICE_ERROR');
    this.service = service;
    if (detail && process.env.NODE_ENV !== 'production') {
      this.message += ` (${detail})`;
    }
  }
}

export class FileError extends AppError {
  constructor(message: string) {
    super(message, 400, 'FILE_ERROR');
  }
}
