import { Router } from "express";
import { tutorChat, tutorOpen, tutorRating } from "../controllers/tutor.controller";
import { authMiddleware } from "../middleware/auth";
import { aiRateLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/chat", authMiddleware as any, aiRateLimiter, tutorChat as any);
router.post("/open", authMiddleware as any, aiRateLimiter, tutorOpen as any);
router.post("/rating", authMiddleware as any, tutorRating as any);

router.get("/youtube/search", authMiddleware as any, async (req: any, res: any, next: any) => {
  try {
    const { topic } = req.query;
    if (!topic) {
      res.status(400).json({ error: "topic query param required" });
      return;
    }
    const { searchYouTubeVideos } = await import("../pipelines/youtubeSearch");
    const videos = await searchYouTubeVideos(topic as string);
    res.json({ videos });
  } catch (err) {
    next(err);
  }
});

export default router;
