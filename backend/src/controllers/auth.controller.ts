import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import passport from "passport";
import { User } from "../models/User";
import { generateToken } from "../middleware/auth";
import { AuthRequest } from "../types";
import { env } from "../config/env";
import { createLogger } from "../config/logger";
import { registerSchema, loginSchema, formatZodErrors } from "../utils/authValidation";
import { z } from "zod";

const log = createLogger("controller:auth");

// POST /api/auth/register
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Validate input
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      const fieldErrors = formatZodErrors(parsed.error);
      const firstMessage = Object.values(fieldErrors)[0];
      res.status(422).json({ error: firstMessage, fieldErrors });
      return;
    }

    const { email, password, name } = parsed.data;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      log.warn("Registration: email already exists", { email });
      res.status(409).json({
        error: "An account with this email already exists. Try logging in instead.",
        fieldErrors: { email: "An account with this email already exists." },
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      name: name.trim(),
      authProvider: "local",
    });

    const token = generateToken(user._id.toString());
    log.info("New user registered", { userId: user._id, email });
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        onboarded: user.onboarded,
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  // Validate input format first
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    const fieldErrors = formatZodErrors(parsed.error);
    const firstMessage = Object.values(fieldErrors)[0];
    res.status(422).json({ error: firstMessage, fieldErrors });
    return;
  }

  passport.authenticate("local", { session: false }, (err: any, user: any, info: any) => {
    if (err) return next(err);
    if (!user) {
      log.warn("Login failed: invalid credentials", { email: req.body?.email });
      // Never reveal which field is wrong — generic message for security
      res.status(401).json({
        error: "Incorrect email or password. Please try again.",
        fieldErrors: {
          email: " ", // trigger field highlight without message
          password: "Incorrect email or password.",
        },
      });
      return;
    }
    const token = generateToken(user._id.toString());
    log.info("User logged in", { userId: user._id, email: user.email });
    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        onboarded: user.onboarded,
      },
    });
  })(req, res, next);
}

// GET /api/auth/google — handled by passport middleware in routes
// GET /api/auth/google/callback
export function googleCallback(req: Request, res: Response, next: NextFunction): void {
  passport.authenticate("google", { session: false }, (err: any, user: any) => {
    if (err || !user) {
      log.warn("Google OAuth callback failed", { error: err?.message });
      res.redirect(`${env.FRONTEND_URL}/auth/callback/google?error=auth_failed`);
      return;
    }
    const token = generateToken(user._id.toString());
    log.info("Google OAuth login", { userId: user._id, email: user.email });
    res.redirect(`${env.FRONTEND_URL}/auth/callback/google?token=${token}`);
  })(req, res, next);
}

// GET /api/auth/github/callback
export function githubCallback(req: Request, res: Response, next: NextFunction): void {
  passport.authenticate("github", { session: false }, (err: any, user: any) => {
    if (err || !user) {
      log.warn("GitHub OAuth callback failed", { error: err?.message });
      res.redirect(`${env.FRONTEND_URL}/auth/callback/github?error=auth_failed`);
      return;
    }
    const token = generateToken(user._id.toString());
    log.info("GitHub OAuth login", { userId: user._id, email: user.email });
    res.redirect(`${env.FRONTEND_URL}/auth/callback/github?token=${token}`);
  })(req, res, next);
}

// GET /api/auth/me
export async function getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    res.json({ user });
  } catch (err) {
    next(err);
  }
}
