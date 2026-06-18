import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { Topic } from "../models/Topic";
import { ChatHistory } from "../models/ChatHistory";
import { Session } from "../models/Session";
import { runTutorGraph } from "../agents/graph";
import { User } from "../models/User";
import mongoose from "mongoose";
import { createLogger } from "../config/logger";

const log = createLogger("controller:tutor");

// POST /api/tutor/chat — SSE streaming
export async function tutorChat(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { topicId, message, type, chatHistoryId, materialSessionIds } = req.body;
    const userId = req.userId!;

    log.info("Tutor chat request", {
      topicId, chatHistoryId, messageType: type,
      isOpenMode: !topicId || topicId === 'new',
      materialCount: (materialSessionIds || []).length,
    });

    if (!message?.trim()) {
      res.status(400).json({ error: "Message cannot be empty." });
      return;
    }

    // Load user (always required)
    const user = await User.findById(userId);
    if (!user) { res.status(404).json({ error: "User not found." }); return; }

    // Load topic — optional (open-mode when topicId is absent or 'new')
    const isOpenMode = !topicId || topicId === 'new';
    let topic: any = null;
    if (!isOpenMode) {
      if (!mongoose.Types.ObjectId.isValid(topicId as string)) {
        res.status(400).json({ error: `"${topicId}" is not a valid topic ID. Start a session from the Roadmap instead.` });
        return;
      }
      topic = await Topic.findById(topicId);
      if (!topic) {
        log.warn("Topic not found", { topicId, userId });
        res.status(404).json({ error: "Topic not found. It may have been deleted. Please start a new session." });
        return;
      }
    }

    // Load chat history from MongoDB → inject into LangGraph state
    let chatHistory: Array<{ role: string; content: string }> = [];
    if (chatHistoryId) {
      const chat = await ChatHistory.findById(chatHistoryId);
      if (chat) {
        chatHistory = chat.messages.map((m) => ({ role: m.role, content: m.content }));
      }
    }
    log.debug("Chat history loaded", { chatHistoryId, messageCount: chatHistory.length });

    // Set up SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    // Resolve material namespaces from the selected session IDs
    let materialNamespaces: string[] = [];
    if (materialSessionIds && materialSessionIds.length > 0) {
      const validIds = (materialSessionIds as string[]).filter((id) => mongoose.Types.ObjectId.isValid(id));
      const materialSessions = await Session.find({ _id: { $in: validIds }, userId });
      materialNamespaces = materialSessions.map((s) => s.pineconeNamespace);
      log.debug("Material namespaces resolved", { count: materialNamespaces.length, namespaces: materialNamespaces });
    }

    // Run LangGraph tutor graph
    const result = await runTutorGraph({
      userId,
      topicId: isOpenMode ? "" : topicId,
      topicName: topic?.name || "General Study",
      message,
      messageType: (type as "teach" | "doubt") || "teach",
      explanationLevel: user.explanationLevel,
      masteryScore: topic?.masteryScore ?? 50,
      chatHistory,
      sessionId: topic?.sessionId?.toString() || "",
      materialNamespaces,
      currentDateTime: new Date().toISOString(),
    });

    // Stream the response token by token (simulate word-by-word)
    const words = result.explanation.split(" ");
    for (const word of words) {
      res.write(`data: ${JSON.stringify({ token: word + " " })}\n\n`);
      await new Promise((r) => setTimeout(r, 30)); // ~30ms per word
    }

    // Send the full structured result
    res.write(`data: ${JSON.stringify({
      done: true,
      checkpointQuestion: result.checkpointQuestion,
      doubtPrompt: result.doubtPrompt,
      nextAction: result.nextAction,
      explanationMode: result.explanationMode,
    })}\n\n`);
    res.write("data: [DONE]\n\n");

    // Save message to ChatHistory
    // If no chatHistoryId was supplied (open-mode lazy creation), auto-create one
    let resolvedChatId = chatHistoryId;
    if (!resolvedChatId) {
      const autoChat = await ChatHistory.create({
        userId,
        section: "other",
        title: message.length > 40 ? message.slice(0, 40) + "…" : message,
        messages: [],
      });
      resolvedChatId = autoChat._id.toString();
      log.info("Auto-created chat (no chatHistoryId supplied)", { newChatId: resolvedChatId, userId });
      // Let the client know so it can store the ID for subsequent messages
      res.write(`data: ${JSON.stringify({ chatHistoryId: resolvedChatId })}\n\n`);
    }

    await ChatHistory.findByIdAndUpdate(resolvedChatId, {
      $push: {
        messages: [
          { role: "user", content: message, timestamp: new Date() },
          { role: "assistant", content: result.explanation, timestamp: new Date() },
        ],
      },
    });
    log.debug("Messages saved to chat history", { chatId: resolvedChatId });

    // Update topic status to "learning" (only in topic mode)
    if (topic && topic.status === "unstarted") {
      await Topic.findByIdAndUpdate(topicId, { status: "learning", lastStudiedAt: new Date() });
      log.info("Topic status updated to learning", { topicId, topicName: topic.name });
    }

    // Update user studyDays for heatmap
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await User.findByIdAndUpdate(userId, { $addToSet: { studyDays: today } });

    log.info("Tutor chat complete", { chatId: resolvedChatId, topicId, nextAction: result.nextAction });
    res.end();
  } catch (err) {
    next(err);
  }
}

// POST /api/tutor/open — open-mode session (Core Feature #3)
export async function tutorOpen(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { inputType, content, sessionName } = req.body;
    const userId = req.userId!;
    log.info("Tutor open session", { inputType, sessionName });

    // For "notes" inputType: create session + ingest text on-the-fly
    if (inputType === "notes") {
      const { ingestText } = await import("../pipelines/ingest");
      const { Session } = await import("../models/Session");
      const mongoose = await import("mongoose");

      const session = await Session.create({
        userId,
        name: sessionName || "Open Notes Session",
        inputMethod: "notes",
        pineconeNamespace: `${userId}_${new mongoose.Types.ObjectId()}`,
      });

      const result = await ingestText(content, userId, session._id.toString());
      log.info("Open notes session created", { sessionId: session._id, topicCount: result.topics.length });
      res.json({ sessionId: session._id, topics: result.topics, roadmapNodes: result.roadmapNodes });
    } else {
      // For "topic": create minimal session, no RAG needed
      const { Session } = await import("../models/Session");
      const { Topic } = await import("../models/Topic");
      const mongoose = await import("mongoose");

      const session = await Session.create({
        userId,
        name: content,
        inputMethod: "topic",
        pineconeNamespace: `${userId}_${new mongoose.Types.ObjectId()}`,
      });
      const topic = await Topic.create({
        sessionId: session._id,
        userId,
        name: content,
        difficulty: "medium",
        estimatedMinutes: 30,
      });
      log.info("Open topic session created", { sessionId: session._id, topicId: topic._id, topicName: content });
      res.json({ sessionId: session._id, topicId: topic._id, topics: [topic] });
    }
  } catch (err) {
    next(err);
  }
}

// POST /api/tutor/rating
export async function tutorRating(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { topicId, selfRatingAfter } = req.body;
    await Topic.findByIdAndUpdate(topicId, { selfRatingAfter });
    log.info("Self-rating saved", { topicId, selfRatingAfter });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
