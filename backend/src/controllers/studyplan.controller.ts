import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { StudyPlan } from "../models/StudyPlan";
import { Topic } from "../models/Topic";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { env } from "../config/env";
import { createLogger } from "../config/logger";
import { ValidationError } from "../utils/AppError";

const log = createLogger("controller:studyplan");

const studyPlanSchema = z.object({
  days: z.array(z.object({
    dayNumber: z.number(),
    date: z.string(),
    topicNames: z.array(z.string()),
    isMockExam: z.boolean().default(false),
  })),
});

// POST /api/studyplan/generate
export async function generateStudyPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { sessionId, examDate } = req.body;
    const userId = req.userId!;

    // Scope to the exam session's topics when sessionId is available.
    // Fall back to all user topics (non-archived) so a plan is never generated with 0 topics.
    let topics;
    if (sessionId) {
      topics = await Topic.find({ sessionId, userId, archived: { $ne: true } });
    }
    if (!topics || topics.length === 0) {
      log.warn("generateStudyPlan: no topics for sessionId, falling back to all user topics", { sessionId, userId });
      topics = await Topic.find({ userId, archived: { $ne: true } }).sort({ createdAt: -1 });
    }

    if (topics.length === 0) {
      next(new ValidationError("No topics found. Please upload a syllabus before generating a study plan."));
      return;
    }

    const daysLeft = Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    log.info("Generating study plan", { userId, sessionId, topicCount: topics.length, daysLeft });

    const model = new ChatOpenAI({ model: "gpt-4o", temperature: 0.2, apiKey: env.OPENAI_API_KEY });
    const structured = model.withStructuredOutput(studyPlanSchema);

    const topicSummary = topics.map((t) => `${t.name} (mastery: ${t.masteryScore}%, est: ${t.estimatedMinutes}min)`).join("\n");

    const result = await structured.invoke([
      { role: "system", content: "You generate day-by-day exam study plans. Assign weakest topics first. Final day = Mock Exam. Return dates as ISO strings." },
      { role: "user", content: `Exam in ${daysLeft} days (${examDate}). Topics:\n${topicSummary}\n\nGenerate the plan.` },
    ]);

    // Build day objects with real topic IDs
    const days = result.days.map((d: any) => ({
      dayNumber: d.dayNumber,
      date: new Date(d.date),
      topics: d.topicNames.map((name: string) => {
        const nameLower = name.toLowerCase().trim();
        // 1. Try exact lowercase match
        let t = topics.find((topic: typeof topics[0]) => topic.name.toLowerCase().trim() === nameLower);

        // 2. Try substring match (e.g. "CPU scheduling" in "CPU scheduling basics" or vice-versa)
        if (!t) {
          t = topics.find((topic: typeof topics[0]) => {
            const topicNameLower = topic.name.toLowerCase().trim();
            return topicNameLower.includes(nameLower) || nameLower.includes(topicNameLower);
          });
        }

        // 3. Fallback to first topic if no match
        if (!t) {
          t = topics[0];
        }

        return { topicId: t._id, topicName: t.name, estimatedMinutes: t.estimatedMinutes };
      }),
      isMockExam: d.isMockExam,
      completed: false,
    }));

    const plan = await StudyPlan.findOneAndUpdate(
      { userId, sessionId },
      { userId, sessionId, examDate: new Date(examDate), generatedAt: new Date(), days },
      { upsert: true, new: true }
    );

    log.info("Study plan generated", { userId, planId: plan._id, dayCount: days.length });
    res.json({ plan });
  } catch (err) {
    next(err);
  }
}

// GET /api/studyplan/:userId
export async function getStudyPlan(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId!;
    const plan = await StudyPlan.findOne({ userId }).sort({ createdAt: -1 });
    res.json({ plan });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/studyplan/day/:dayId
export async function markDayComplete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { dayId } = req.params;
    const { planId, score } = req.body;

    // Mark this day as completed
    const plan = await StudyPlan.findOneAndUpdate(
      { _id: planId, "days._id": dayId },
      { $set: { "days.$.completed": true } },
      { new: true }
    );

    if (!plan) {
      res.status(404).json({ error: "Study plan or day not found." });
      return;
    }

    // If score < 60%, push this day's topics to the next incomplete day
    let pushed = false;
    if (score !== undefined && score < 60) {
      const completedDay = plan.days.find((d) => d._id?.toString() === dayId);
      const nextDay = plan.days.find((d) => !d.completed && d._id?.toString() !== dayId);
      if (completedDay && nextDay) {
        // Append the weak topics to the next day (avoiding duplicates)
        const existingTopicIds = new Set(nextDay.topics.map((t) => t.topicId?.toString()));
        const newTopics = completedDay.topics.filter((t) => !existingTopicIds.has(t.topicId?.toString()));
        if (newTopics.length > 0) {
          await StudyPlan.findOneAndUpdate(
            { _id: planId, "days._id": nextDay._id },
            { $push: { "days.$.topics": { $each: newTopics } } }
          );
          pushed = true;
          log.info("Weak score — topics pushed to next day", {
            planId, fromDay: completedDay.dayNumber, toDay: nextDay.dayNumber,
            topicsPushed: newTopics.map((t) => t.topicName),
          });
        }
      }
    }

    res.json({ success: true, pushTopics: pushed });
  } catch (err) {
    next(err);
  }
}
