import { Router } from "express";
import { generateStudyPlan, getStudyPlan, markDayComplete } from "../controllers/studyplan.controller";
import { authMiddleware } from "../middleware/auth";
import { aiRateLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/generate", authMiddleware as any, aiRateLimiter, generateStudyPlan as any);
router.get("/:userId", authMiddleware as any, getStudyPlan as any);
router.patch("/day/:dayId", authMiddleware as any, markDayComplete as any);

export default router;
