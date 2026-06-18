import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { User } from "../models/User";
import { createLogger } from "../config/logger";

const log = createLogger("middleware:auth");

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    log.warn("Auth failed: no token", { method: req.method, path: req.path });
    res.status(401).json({ error: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId);
    if (!user) {
      log.warn("Auth failed: user not found", { userId: decoded.userId, path: req.path });
      res.status(401).json({ error: "User not found" });
      return;
    }
    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (err: any) {
    log.warn("Auth failed: invalid/expired token", {
      path: req.path,
      reason: err?.name || "unknown",
    });
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: "30d" });
}
