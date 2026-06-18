import { Router } from "express";
import passport from "passport";
import { z } from "zod";
import { register, login, googleCallback, githubCallback, getMe } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { authRateLimiter } from "../middleware/rateLimiter";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Email/password
router.post("/register", authRateLimiter, validate(registerSchema), register);
router.post("/login", authRateLimiter, validate(loginSchema), login);

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get("/google/callback", googleCallback);

// GitHub OAuth
router.get("/github", passport.authenticate("github", { scope: ["user:email"], session: false }));
router.get("/github/callback", githubCallback);

// Get current user
router.get("/me", authMiddleware as any, getMe as any);

// Update current user profile (explanationLevel, name, etc.)
router.patch("/me", authMiddleware as any, async (req: any, res, next) => {
  try {
    const { User } = await import("../models/User");
    const allowed = ["name", "explanationLevel"];
    const updates: Record<string, any> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select("-password");
    if (!user) { res.status(404).json({ error: "User not found." }); return; }
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

export default router;
