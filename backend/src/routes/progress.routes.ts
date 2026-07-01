import { Router } from "express";
import { getProgress, updateProgress, getRoadmap, getRecommendations } from "../controllers/progress.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Specific routes before parameterised /:userId
router.get("/recommendations", authMiddleware as any, getRecommendations as any);
router.get("/:userId", authMiddleware as any, getProgress as any);
router.post("/update", authMiddleware as any, updateProgress as any);

export default router;
