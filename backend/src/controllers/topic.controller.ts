import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { Topic } from "../models/Topic";
import { User } from "../models/User";
import mongoose from "mongoose";
import { createLogger } from "../config/logger";

const log = createLogger("controller:topic");

// POST /api/topics/baseline
export async function saveBaseline(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { ratings, explanationLevel } = req.body;
    // ratings: [{ topicId, selfRating }]
    const updates = ratings.map(({ topicId, selfRating }: any) =>
      Topic.findByIdAndUpdate(topicId, { selfRatingBefore: selfRating, masteryScore: selfRating * 10 })
    );
    await Promise.all(updates);

    // Mark user as onboarded and save explanation level
    const userUpdate: Record<string, any> = { onboarded: true };
    if (explanationLevel) userUpdate.explanationLevel = explanationLevel;
    const user = await User.findByIdAndUpdate(req.userId, userUpdate, { new: true }).select("-passwordHash");

    log.info("Baseline ratings saved", { userId: req.userId, ratingCount: ratings.length, explanationLevel });
    res.json({ success: true, updated: ratings.length, user });
  } catch (err) {
    next(err);
  }
}
// GET /api/topics/:topicId — fetch a single topic by id
export async function getTopicById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const topicId = req.params.topicId as string;
    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      log.warn("Invalid topicId format", { topicId });
      res.status(400).json({ error: `"${topicId}" is not a valid topic ID.` });
      return;
    }
    const topic = await Topic.findOne({ _id: topicId, userId: req.userId });
    if (!topic) {
      log.warn("Topic not found", { topicId, userId: req.userId });
      res.status(404).json({ error: "Topic not found." }); return;
    }
    log.debug("Topic fetched", { topicId, topicName: topic.name });
    res.json({ topic });
  } catch (err) {
    next(err);
  }
}
