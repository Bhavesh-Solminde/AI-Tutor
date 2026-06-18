import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

// ─── Log directory: backend/logs/ ──────────────────────────────────────────
const LOG_DIR = path.join(process.cwd(), "logs");

// ─── Custom dev format: coloured, human-readable ───────────────────────────
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, module: mod, ...meta }) => {
    const tag = mod ? `[${mod}]` : "";
    const metaStr = Object.keys(meta).length ? " " + JSON.stringify(meta) : "";
    return `${timestamp} ${level} ${tag} ${message}${metaStr}`;
  })
);

// ─── JSON format for files ──────────────────────────────────────────────────
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// ─── Shared daily-rotate options ───────────────────────────────────────────
const rotateOptions = {
  dirname: LOG_DIR,
  datePattern: "YYYY-MM-DD",
  maxFiles: "14d",   // auto-delete files older than 14 days
  zippedArchive: true,
};

// ─── Root logger ──────────────────────────────────────────────────────────
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transports: [
    // Console — colorized in dev, JSON in production
    new winston.transports.Console({
      format: process.env.NODE_ENV === "production" ? fileFormat : devFormat,
    }),
    // All logs → app-YYYY-MM-DD.log
    new DailyRotateFile({
      ...rotateOptions,
      filename: "app-%DATE%.log",
      level: "debug",
      format: fileFormat,
    }),
    // Errors only → error-YYYY-MM-DD.log
    new DailyRotateFile({
      ...rotateOptions,
      filename: "error-%DATE%.log",
      level: "error",
      format: fileFormat,
    }),
  ],
});

/**
 * Returns a child logger with a fixed `module` tag.
 * Usage: const log = createLogger("controller:tutor")
 */
export function createLogger(module: string): winston.Logger {
  return logger.child({ module });
}
