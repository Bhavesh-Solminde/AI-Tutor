import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { ChatHistory } from "../models/ChatHistory";
import { createLogger } from "../config/logger";

const log = createLogger("controller:chatHistory");

// GET /api/chat-history/:userId
export async function getChatHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req.params;
    log.info("Fetching chat history", { userId });

    const chats = await ChatHistory.find({ userId: req.params.userId }).sort({ updatedAt: -1 });
    const grouped = { exam: [] as any[], roadmap: [] as any[], other: [] as any[] };
    chats.forEach((c) => { if (grouped[c.section]) grouped[c.section].push(c); });

    log.info("Chat history fetched", {
      userId,
      examCount: grouped.exam.length,
      roadmapCount: grouped.roadmap.length,
      otherCount: grouped.other.length,
    });

    res.json({ chatHistory: grouped });
  } catch (err) {
    next(err);
  }
}

// GET /api/chat-history/by-topic/:topicId — find existing chat for a topic
export async function getChatByTopic(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { topicId } = req.params;
    const chat = await ChatHistory.findOne({
      userId: req.userId,
      topicId,
    }).sort({ updatedAt: -1 });

    log.debug("getChatByTopic", { topicId, found: !!chat, chatId: chat?._id });
    res.json({ chat: chat || null });
  } catch (err) {
    next(err);
  }
}

// GET /api/chat-history/messages/:chatId — fetch all messages for a chat (to restore UI)
export async function getMessagesByChatId(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { chatId } = req.params;
    const chat = await ChatHistory.findOne({
      _id: chatId,
      userId: req.userId, // security: only owner can read
    });
    if (!chat) {
      log.warn("getMessagesByChatId: chat not found or unauthorized", { chatId, userId: req.userId });
      res.json({ messages: [] });
      return;
    }

    log.debug("Messages fetched", { chatId, messageCount: chat.messages.length });
    res.json({ messages: chat.messages, title: chat.title });
  } catch (err) {
    next(err);
  }
}

// POST /api/chat-history — findOrCreate: if a chat already exists for this userId+topicId, return it
export async function createChat(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { sessionId, topicId, section, title } = req.body;

    // If a topicId is supplied, reuse the existing chat to avoid duplicates
    // (React StrictMode / double-click can fire this twice concurrently)
    if (topicId) {
      const existing = await ChatHistory.findOne({ userId: req.userId, topicId });
      if (existing) {
        log.info("Returning existing chat (findOrCreate)", { chatId: existing._id, topicId, section });
        res.status(200).json({ chat: existing });
        return;
      }
    }

    const chat = await ChatHistory.create({
      userId: req.userId,
      sessionId,
      topicId,
      section: section || "other",
      title: title || "New Chat",
      messages: [],
    });

    log.info("New chat created", { chatId: chat._id, topicId, section: chat.section, title: chat.title });
    res.status(201).json({ chat });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/chat-history/:chatId
export async function deleteChat(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { chatId } = req.params;
    await ChatHistory.findByIdAndDelete(chatId);
    log.info("Chat deleted", { chatId });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
