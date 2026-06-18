import { Router } from "express";
import { tutorChat, tutorOpen, tutorRating } from "../controllers/tutor.controller";
import { authMiddleware } from "../middleware/auth";
import { aiRateLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/chat", authMiddleware as any, aiRateLimiter, tutorChat as any);
router.post("/open", authMiddleware as any, aiRateLimiter, tutorOpen as any);
router.post("/rating", authMiddleware as any, tutorRating as any);

export default router;
