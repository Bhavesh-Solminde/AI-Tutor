import { Router } from "express";
import { getProgress, updateProgress, getRoadmap } from "../controllers/progress.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/:userId", authMiddleware as any, getProgress as any);
router.post("/update", authMiddleware as any, updateProgress as any);

export default router;
