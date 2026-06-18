import { Router } from "express";
import { saveBaseline, getTopicById } from "../controllers/topic.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/baseline", authMiddleware as any, saveBaseline as any);
router.get("/:topicId", authMiddleware as any, getTopicById as any);

export default router;
