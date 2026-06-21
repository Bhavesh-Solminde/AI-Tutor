import { Router } from "express";
import { getRoadmap } from "../controllers/progress.controller";
import { createSession, getSessionTopics, getSessionMaterials, getUserSessions, deleteSession } from "../controllers/session.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// POST /api/sessions
router.post("/", authMiddleware as any, createSession as any);

// GET /api/sessions/user — must be before /:sessionId to avoid param shadowing
router.get("/user", authMiddleware as any, getUserSessions as any);

// GET /api/sessions/:id/topics — polled by frontend after async upload
router.get("/:id/topics", authMiddleware as any, getSessionTopics as any);

// GET /api/sessions/:id/materials
router.get("/:id/materials", authMiddleware as any, getSessionMaterials as any);

// DELETE /api/sessions/:id — soft-delete + archive topics
router.delete("/:id", authMiddleware as any, deleteSession as any);

// GET /api/sessions/:sessionId — roadmap (catch-all, must be last)
router.get("/:sessionId", authMiddleware as any, getRoadmap as any);

export default router;
