import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { Topic } from "../models/Topic";
import { Session } from "../models/Session";
import { createLogger } from "../config/logger";

const log = createLogger("controller:progress");

// GET /api/progress/:userId
export async function getProgress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req.params;
    const topics = await Topic.find({ userId }).sort({ masteryScore: -1 });
    const total = topics.length;
    const mastered = topics.filter((t) => t.status === "mastered").length;
    const overallMastery = total > 0
      ? Math.round(topics.reduce((sum, t) => sum + t.masteryScore, 0) / total)
      : 0;
    log.debug("Progress fetched", { userId, total, mastered, overallMastery });
    res.json({ topics, overallMastery, mastered, total });
  } catch (err) {
    next(err);
  }
}

// POST /api/progress/update
export async function updateProgress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { topicId, masteryScore, status } = req.body;
    const topic = await Topic.findByIdAndUpdate(
      topicId,
      { masteryScore, status, lastStudiedAt: new Date() },
      { new: true }
    );
    res.json({ topic });
  } catch (err) {
    next(err);
  }
}

// GET /api/roadmap/:sessionId
export async function getRoadmap(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { sessionId } = req.params;
    const userId = req.userId!;

    let topics = await Topic.find({ sessionId });

    // If no topics found for this sessionId (e.g. stale persisted sessionId),
    // fall back to all topics for this user ordered by creation date
    if (topics.length === 0) {
      log.warn("No topics for sessionId, falling back to user topics", { sessionId, userId });
      topics = await Topic.find({ userId }).sort({ createdAt: -1 });
    }

    const nodes = topics.map((t) => ({
      id: t._id.toString(),
      label: t.name,
      status: t.status,
      position: t.roadmapPosition,
      difficulty: t.difficulty,
      estimatedMinutes: t.estimatedMinutes,
      masteryScore: t.masteryScore,
    }));

    // Build edges: sequential linear path
    const edges = topics.slice(0, -1).map((t, i) => ({
      id: `e${i}`,
      source: t._id.toString(),
      target: topics[i + 1]._id.toString(),
      type: t.status === "mastered" ? "mastered" : "default",
    }));

    const session = await Session.findById(sessionId);
    log.debug("Roadmap fetched", { sessionId, nodeCount: nodes.length, edgeCount: edges.length });
    res.json({ nodes, edges, session });
  } catch (err) {
    next(err);
  }
}
