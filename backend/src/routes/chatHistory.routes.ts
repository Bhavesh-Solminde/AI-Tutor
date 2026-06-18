import { Router } from "express";
import { getChatHistory, getChatByTopic, getMessagesByChatId, createChat, deleteChat } from "../controllers/chatHistory.controller";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Specific routes first (before wildcard /:userId)
router.get("/by-topic/:topicId", authMiddleware as any, getChatByTopic as any);
router.get("/messages/:chatId", authMiddleware as any, getMessagesByChatId as any);
router.get("/:userId", authMiddleware as any, getChatHistory as any);
router.post("/", authMiddleware as any, createChat as any);
router.delete("/:chatId", authMiddleware as any, deleteChat as any);

export default router;
