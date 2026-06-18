import { Router } from "express";
import { generateQuiz, submitQuiz, getQuizHistory, getActiveQuizzes, getQuizResult } from "../controllers/quiz.controller";
import { authMiddleware } from "../middleware/auth";
import { aiRateLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/generate", authMiddleware as any, aiRateLimiter, generateQuiz as any);
router.post("/submit", authMiddleware as any, submitQuiz as any);
router.get("/history/:userId", authMiddleware as any, getQuizHistory as any);
router.get("/active/:userId", authMiddleware as any, getActiveQuizzes as any);
router.get("/result/:resultId", authMiddleware as any, getQuizResult as any);

export default router;
