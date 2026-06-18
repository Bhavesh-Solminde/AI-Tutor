import rateLimit from "express-rate-limit";

// AI endpoints — 20 req/min per user
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  keyGenerator: (req: any) => req.userId ?? req.ip,
  message: { error: "Too many requests. Please wait a moment and try again." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth endpoints — 10 req/min per IP (prevent brute force)
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.ip ?? "unknown",
  message: { error: "Too many auth attempts. Please wait a minute." },
  standardHeaders: true,
  legacyHeaders: false,
});
