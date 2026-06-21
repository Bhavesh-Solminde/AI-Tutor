import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { ChatHistory } from "../models/ChatHistory";
import { createLogger } from "../config/logger";

const log = createLogger("controller:chatHistory");

// GET /api/chat-history/:userId
export async function getChatHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    log.info("Fetching chat history", { userId });

    const chats = await ChatHistory.find({ userId }).sort({ updatedAt: -1 });
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
    const userId = req.userId!;

    // If a topicId is supplied, use atomic findOneAndUpdate to avoid duplicate creation
    // from React StrictMode / double-click concurrent requests
    if (topicId) {
      const chat = await ChatHistory.findOneAndUpdate(
        { userId, topicId },
        {
          $setOnInsert: {
            userId,
            sessionId,
            topicId,
            section: section || "other",
            title: title || "New Chat",
            messages: [],
          },
        },
        { upsert: true, new: true }
      );
      const isNew = !chat.createdAt || (Date.now() - chat.createdAt.getTime()) < 1000;
      log.info(isNew ? "New chat created (atomic)" : "Returning existing chat (atomic)", {
        chatId: chat._id, topicId, section: chat.section,
      });
      res.status(isNew ? 201 : 200).json({ chat });
      return;
    }

    // No topicId — always create a new chat (e.g. open-mode)
    const chat = await ChatHistory.create({
      userId,
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
    const userId = req.userId!;
    const deleted = await ChatHistory.findOneAndDelete({ _id: chatId, userId });
    if (!deleted) {
      log.warn("deleteChat: not found or unauthorized", { chatId, userId });
      res.status(404).json({ error: "Chat not found." });
      return;
    }
    log.info("Chat deleted", { chatId, userId });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
