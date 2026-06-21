import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { Topic } from "../models/Topic";
import { Session } from "../models/Session";
import { createLogger } from "../config/logger";

const log = createLogger("controller:progress");

// GET /api/progress/:userId
export async function getProgress(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
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
    const { sessionId: sessionIdParam } = req.params;
    let sessionId = sessionIdParam;
    const userId = req.userId!;

    let topics = await Topic.find({ sessionId, archived: { $ne: true } });

    // Stale sessionId in persisted Zustand state — resolve by loading the user's most recent session
    if (topics.length === 0) {
      log.warn("No topics for sessionId — resolving most recent session", { sessionId, userId });
      const recentSession = await Session.findOne({
        userId, isReference: false, deleted: { $ne: true },
      }).sort({ createdAt: -1 });
      if (recentSession) {
        topics = await Topic.find({ sessionId: recentSession._id, archived: { $ne: true } });
        sessionId = recentSession._id.toString(); // reuse variable so session lookup below is correct
      }
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

    // Build edges from prerequisite relationships (dependency DAG)
    const topicNameToId = new Map(topics.map((t) => [t.name, t._id.toString()]));
    let edges: any[] = [];
    let edgeIdx = 0;

    for (const topic of topics) {
      if (topic.prerequisites?.length) {
        for (const prereqName of topic.prerequisites) {
          const sourceId = topicNameToId.get(prereqName);
          if (sourceId) {
            const sourceTopic = topics.find((t) => t._id.toString() === sourceId);
            edges.push({
              id: `e${edgeIdx++}`,
              source: sourceId,
              target: topic._id.toString(),
              sourceStatus: sourceTopic?.status ?? "unstarted",
              targetStatus: topic.status,
            });
          }
        }
      }
    }

    // Fallback: old data without prerequisites → sequential linear edges (no visual regression)
    if (edges.length === 0) {
      edges = topics.slice(0, -1).map((t, i) => ({
        id: `e${edgeIdx++}`,
        source: t._id.toString(),
        target: topics[i + 1]._id.toString(),
        sourceStatus: t.status,
        targetStatus: topics[i + 1].status,
      }));
    }

    const session = await Session.findById(sessionId);
    log.debug("Roadmap fetched", { sessionId, nodeCount: nodes.length, edgeCount: edges.length });
    res.json({ nodes, edges, session });
  } catch (err) {
    next(err);
  }
}
