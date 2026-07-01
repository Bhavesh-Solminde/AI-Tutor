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

// GET /api/progress/recommendations
export async function getRecommendations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    const allTopics = await Topic.find({ userId, archived: { $ne: true } });

    if (allTopics.length === 0) {
      res.json({ recommendations: [] });
      return;
    }

    const now = Date.now();
    // Build a quick lookup: topicName → status for prerequisite checking
    const topicStatusMap = new Map(allTopics.map((t) => [t.name, t.status]));

    const scored = allTopics
      .filter((t) => t.masteryScore < 85) // skip already-mastered topics
      .map((t) => {
        // ── Staleness (only for topics the student has actually studied) ──────
        const daysSinceStudied = t.lastStudiedAt
          ? Math.floor((now - new Date(t.lastStudiedAt).getTime()) / (1000 * 60 * 60 * 24))
          : null; // null = never studied (treated differently from "stale")
        const stalenessBonus = daysSinceStudied !== null
          ? Math.min(daysSinceStudied, 7) * 3   // max 21 pts for forgotten topics
          : 0;                                    // never-studied: no staleness bonus

        // ── Prerequisite gate ────────────────────────────────────────────────
        const unmetPrereqs = t.prerequisites.filter(
          (prereqName) => topicStatusMap.get(prereqName) !== "mastered"
        );
        const prereqsMastered = t.prerequisites.length - unmetPrereqs.length;
        const allPrereqsDone = unmetPrereqs.length === 0;
        const anyPrereqDone  = prereqsMastered > 0;

        // ── Difficulty modifier — penalty for hard/medium if not ready ───────
        // Before: hard got +10 bonus (wrong — caused "Error Backpropagation" bug)
        // After:  hard gets -30 penalty unless all prereqs are complete
        let difficultyMod = 0;
        if (t.difficulty === "hard") {
          difficultyMod = allPrereqsDone ? +5 : -30;
        } else if (t.difficulty === "medium") {
          difficultyMod = anyPrereqDone  ? +2 : -10;
        } else {
          difficultyMod = +5; // easy topics always get a small boost
        }

        // ── Readiness bonus — reward topics whose prereqs are all done ───────
        const readinessBonus = allPrereqsDone && t.prerequisites.length > 0 ? 20 : 0;

        // ── Core scoring ─────────────────────────────────────────────────────
        const masteryUrgency = (100 - t.masteryScore) * 0.4;
        const pyqBoost       = (t.pyqFrequency || 0) * 15;
        const score = masteryUrgency + pyqBoost + stalenessBonus + difficultyMod + readinessBonus;

        // ── Human-readable reason string ─────────────────────────────────────
        const reasons: string[] = [];
        if (t.masteryScore < 40)  reasons.push(`Low mastery (${t.masteryScore}%)`);
        else if (t.masteryScore < 70) reasons.push(`Moderate mastery (${t.masteryScore}%)`);
        if ((t.pyqFrequency || 0) > 0) reasons.push("High exam frequency");
        if (daysSinceStudied !== null && daysSinceStudied >= 5) reasons.push(`Not studied in ${daysSinceStudied}d`);
        if (allPrereqsDone && t.prerequisites.length > 0) reasons.push("Prerequisites complete — ready!");
        if (t.status === "unstarted" && t.prerequisites.length === 0) reasons.push("Good starting point");

        return {
          topic: {
            _id: t._id,
            name: t.name,
            difficulty: t.difficulty,
            masteryScore: t.masteryScore,
            estimatedMinutes: t.estimatedMinutes,
            status: t.status,
          },
          score,
          reason: reasons.length > 0 ? reasons.slice(0, 2).join(" · ") : "Good next step",
          // Unmet prerequisites — used by the frontend to show a warning modal
          unmetPrerequisites: unmetPrereqs,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    log.debug("Recommendations generated", { userId, count: scored.length });
    res.json({ recommendations: scored });
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

    if (topics.length === 0) {
      log.warn("No topics for sessionId — resolving most recent session", { sessionId, userId });
      const recentSession = await Session.findOne({
        userId, isReference: false, deleted: { $ne: true },
      }).sort({ createdAt: -1 });
      if (recentSession) {
        topics = await Topic.find({ sessionId: recentSession._id, archived: { $ne: true } });
        sessionId = recentSession._id.toString();
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
