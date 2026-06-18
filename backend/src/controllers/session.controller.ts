import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { Session } from "../models/Session";
import { Topic } from "../models/Topic";
import { createLogger } from "../config/logger";

const log = createLogger("controller:session");

// POST /api/sessions
export async function createSession(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, inputMethod, examDate } = req.body;
    const userId = req.userId!;
    const session = await Session.create({
      userId,
      name,
      inputMethod: inputMethod || "topic",
      pineconeNamespace: `${userId}_${Date.now()}`,
      examDate,
    });
    log.info("Session created", { sessionId: session._id, name, inputMethod });
    res.status(201).json({ session });
  } catch (err) {
    next(err);
  }
}

// GET /api/sessions/:id/topics
export async function getSessionTopics(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const [session, topics] = await Promise.all([
      Session.findById(id),
      Topic.find({ sessionId: id }),
    ]);
    if (!session) {
      log.warn("Session not found", { sessionId: id });
      res.status(404).json({ error: "Session not found" }); return;
    }
    log.debug("Session topics fetched", { sessionId: id, topicCount: topics.length });
    res.json({ session, topics });
  } catch (err) {
    next(err);
  }
}

// GET /api/sessions/:id/materials — returns reference-only sessions for the MaterialsModal
export async function getSessionMaterials(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    // Only return sessions marked as reference material (uploaded via chat Materials modal)
    const sessions = await Session.find({ userId, isReference: true }).sort({ createdAt: -1 });
    const materials = sessions.map((s) => ({
      _id: s._id,
      title: s.name,
      desc: s.inputMethod === "pdf" ? "PDF document" : "Pasted notes",
      fileUrl: s.fileUrl || null,
      inputMethod: s.inputMethod,
      createdAt: s.createdAt,
    }));
    log.debug("Session materials fetched", { userId, count: materials.length });
    res.json({ materials });
  } catch (err) {
    next(err);
  }
}
